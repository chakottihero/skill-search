/**
 * Extended crawler — supplements the base crawl.ts with:
 *   Source 1: GitHub Code Search (additional/overlapping queries)
 *   Source 2: Extra registry repos not in the base KNOWN_REGISTRIES
 *   Source 3: GitHub Topics "skill-md", "claude-skills", "agent-skills"
 *
 * Always runs in update mode: loads existing skills.json and adds new ones only.
 */
import {
  sleep,
  crawlRepoTree,
  processSkillRef,
  skillKey,
  rawUrlToPath,
} from "../src/lib/github-crawler";
import type { SkillRef } from "../src/lib/github-crawler";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import type { Skill, CrawlResult } from "../src/lib/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");

config({ path: join(PROJECT_ROOT, ".env.local") });

const GITHUB_API = "https://api.github.com";
const DATA_DIR = join(PROJECT_ROOT, "data");
const SKILLS_PATH = join(DATA_DIR, "skills.json");
const LOG_PATH = join(DATA_DIR, "crawl-log.json");

// ── Source 1: Additional search queries ──────────────────────────────────────
// (base crawl.ts already runs most of these; extended adds the plain search
//  plus any query not yet covered, and ingests in update mode so dups skip)
const EXTRA_SEARCH_QUERIES = [
  'filename:SKILL.md path:".claude/skills"',
  'filename:SKILL.md path:".cursor/skills"',
  'filename:SKILL.md path:".codex/skills"',
  'filename:SKILL.md path:"agent-skills"',
  "filename:SKILL.md",
];

// ── Source 2: Additional registry repos ──────────────────────────────────────
const EXTRA_REGISTRIES = [
  "github/awesome-copilot",
  "VoltAgent/awesome-openclaw-skills",
  "daymade/claude-code-skills",
  "antfu/skills",
  "skillsmd/skills.md",
];

// Already crawled by base crawler (skip from topic results to avoid double-fetching)
const BASE_REGISTRIES = new Set([
  "anthropics/skills",
  "openclaw/skills",
  "vercel-labs/skills",
  "VoltAgent/awesome-agent-skills",
  "alirezarezvani/claude-skills",
  "proficientlyjobs/proficiently-claude-skills",
  "majiayu000/claude-skill-registry",
  ...EXTRA_REGISTRIES,
]);

// ── Source 3: GitHub Topics ───────────────────────────────────────────────────
const TOPICS = ["skill-md", "claude-skills", "agent-skills"];

// ── Rate limit state (independent from github-crawler module) ─────────────────
let searchRemaining = 30;
let searchReset = 0;

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function buildHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  const h: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

async function githubFetch<T>(url: string, retries = 2): Promise<T> {
  const res = await fetch(url, { headers: buildHeaders() });

  const rem = res.headers.get("X-RateLimit-Remaining");
  const rst = res.headers.get("X-RateLimit-Reset");
  const resource = res.headers.get("X-RateLimit-Resource") ?? "core";
  if (rem !== null && rst !== null) {
    const remN = parseInt(rem);
    const rstN = parseInt(rst);
    if (resource === "search") {
      searchRemaining = remN;
      searchReset = rstN;
    }
    if (remN <= 5) {
      const waitMs = Math.max(rstN * 1000 - Date.now() + 2000, 60000);
      console.log(
        `  ⚠ Rate limit low [${resource}:${remN}]. Waiting ${Math.ceil(waitMs / 1000)}s...`
      );
      await sleep(waitMs);
    }
  }

  if ((res.status === 403 || res.status === 429) && retries > 0) {
    const retryAfter = res.headers.get("Retry-After");
    const rstHeader = res.headers.get("X-RateLimit-Reset");
    let waitMs = 60000;
    if (retryAfter) waitMs = parseInt(retryAfter) * 1000;
    else if (rstHeader)
      waitMs = Math.max(parseInt(rstHeader) * 1000 - Date.now() + 2000, 60000);
    console.log(`  ⚠ HTTP ${res.status}. Retry in ${Math.ceil(waitMs / 1000)}s...`);
    await sleep(waitMs);
    return githubFetch<T>(url, retries - 1);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

// ─── Code search ──────────────────────────────────────────────────────────────

interface SearchCodeItem {
  sha: string;
  path: string;
  html_url: string;
  repository: { full_name: string; html_url: string };
  download_url: string | null;
}
interface SearchCodeResponse {
  total_count: number;
  items: SearchCodeItem[];
}

async function searchWithPagination(
  query: string,
  maxPages = 10
): Promise<SkillRef[]> {
  const refs: SkillRef[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const url = `${GITHUB_API}/search/code?q=${encodeURIComponent(query)}&per_page=100&page=${page}`;
    let result: SearchCodeResponse;
    try {
      result = await githubFetch<SearchCodeResponse>(url);
    } catch (e) {
      console.error(`  Search error (page ${page}): ${e}`);
      break;
    }
    if (page === 1)
      console.log(`  Total on GitHub: ${result.total_count.toLocaleString()}`);

    for (const item of result.items) {
      refs.push({
        sha: item.sha,
        path: item.path,
        repoFullName: item.repository.full_name,
        repoHtmlUrl: item.repository.html_url,
        rawUrl:
          item.download_url ??
          `https://raw.githubusercontent.com/${item.repository.full_name}/HEAD/${item.path}`,
      });
    }

    if (result.items.length < 100 || refs.length >= 1000) break;
    await sleep(3000); // Search API: ~10 req/min authenticated
  }
  return refs;
}

// ─── Topic search ─────────────────────────────────────────────────────────────

interface RepoSearchItem {
  full_name: string;
  html_url: string;
}
interface RepoSearchResponse {
  total_count: number;
  items: RepoSearchItem[];
}

async function searchReposByTopic(
  topic: string,
  maxPages = 3
): Promise<string[]> {
  const repos: string[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const url = `${GITHUB_API}/search/repositories?q=topic:${encodeURIComponent(topic)}&per_page=100&page=${page}`;
    let result: RepoSearchResponse;
    try {
      result = await githubFetch<RepoSearchResponse>(url);
    } catch (e) {
      console.error(`  Topic "${topic}" error (page ${page}): ${e}`);
      break;
    }
    if (page === 1)
      console.log(`  Topic "${topic}": ${result.total_count} repos`);
    repos.push(...result.items.map((r) => r.full_name));
    if (result.items.length < 100) break;
    await sleep(3000);
  }
  return repos;
}

// ─── Log helper ───────────────────────────────────────────────────────────────

interface LogEntry {
  runAt: string;
  mode: string;
  totalAfter: number;
  added: number;
  skipped: number;
  errors: number;
  durationSeconds: number;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.GITHUB_TOKEN) {
    console.warn("⚠ GITHUB_TOKEN not set — search rate limit: 10 req/min.");
  }

  const startTime = Date.now();
  console.log("\nSKILL.md Extended Crawler");
  console.log("=".repeat(50));

  if (!existsSync(SKILLS_PATH)) {
    console.error("No skills.json found. Run npm run crawl first.");
    process.exit(1);
  }

  const existing = JSON.parse(readFileSync(SKILLS_PATH, "utf-8")) as CrawlResult;
  const skills: Skill[] = [...(existing.skills ?? [])];
  console.log(`\nLoaded ${skills.length} existing skills.`);

  // Dedup state
  const existingKeys = new Set(
    skills.map((s) => skillKey(s.repoUrl, rawUrlToPath(s.rawUrl)))
  );
  const seenShas = new Set(skills.map((s) => s.id));

  let added = 0;
  let skipped = 0;
  let errors = 0;
  let total = 0;

  async function ingest(ref: SkillRef): Promise<void> {
    if (seenShas.has(ref.sha)) {
      skipped++;
      return;
    }
    seenShas.add(ref.sha);

    const key = skillKey(ref.repoHtmlUrl, ref.path);
    if (existingKeys.has(key)) {
      skipped++;
      return;
    }

    const skill = await processSkillRef(ref);
    total++;
    if (!skill) {
      errors++;
      return;
    }

    skills.push(skill);
    existingKeys.add(key);
    added++;
    process.stdout.write(
      `\r  processed: ${total}  added: ${added}  errors: ${errors}   `
    );
  }

  // ── Phase 1: Code search ────────────────────────────────────────────────────
  console.log("\n=== Phase 1: Code search ===");
  for (const query of EXTRA_SEARCH_QUERIES) {
    console.log(`\nQuery: ${query}`);
    let refs: SkillRef[];
    try {
      refs = await searchWithPagination(query);
      console.log(`  Fetched ${refs.length} refs`);
    } catch (e) {
      console.error(`  Failed: ${e}`);
      errors++;
      continue;
    }
    for (const ref of refs) {
      await ingest(ref);
      await sleep(200);
    }
    console.log();
    await sleep(3000); // polite pause between queries
  }

  // ── Phase 2: Extra registries ───────────────────────────────────────────────
  console.log("\n=== Phase 2: Extra registries ===");
  for (const repoName of EXTRA_REGISTRIES) {
    console.log(`\nRepository: ${repoName}`);
    let refs: SkillRef[];
    try {
      refs = await crawlRepoTree(repoName);
    } catch (e) {
      console.warn(`  Failed: ${e}`);
      errors++;
      continue;
    }
    for (const ref of refs) {
      await ingest(ref);
      await sleep(200);
    }
    if (refs.length > 0) console.log();
    await sleep(1500);
  }

  // ── Phase 3: GitHub Topics ──────────────────────────────────────────────────
  console.log("\n=== Phase 3: GitHub Topics ===");
  const topicRepos = new Set<string>();
  for (const topic of TOPICS) {
    console.log(`\nTopic: ${topic}`);
    let repos: string[];
    try {
      repos = await searchReposByTopic(topic);
    } catch (e) {
      console.error(`  Failed: ${e}`);
      errors++;
      continue;
    }
    repos.forEach((r) => topicRepos.add(r));
    await sleep(3000);
  }

  const newRepos = [...topicRepos].filter((r) => !BASE_REGISTRIES.has(r));
  console.log(
    `\n  ${topicRepos.size} topic repos found, ${newRepos.length} new to crawl`
  );

  let repoIdx = 0;
  for (const repoName of newRepos) {
    repoIdx++;
    let refs: SkillRef[];
    try {
      refs = await crawlRepoTree(repoName);
    } catch (e) {
      errors++;
      continue;
    }
    if (refs.length === 0) continue;
    console.log(
      `\n  [${repoIdx}/${newRepos.length}] ${repoName}: ${refs.length} skills`
    );
    for (const ref of refs) {
      await ingest(ref);
      await sleep(200);
    }
    console.log();
    await sleep(1500);
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  const result: CrawlResult = {
    crawledAt: new Date().toISOString(),
    total: skills.length,
    errors,
    skills,
  };

  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(SKILLS_PATH, JSON.stringify(result, null, 2), "utf-8");

  // Append log entry
  let log: LogEntry[] = [];
  if (existsSync(LOG_PATH)) {
    try {
      log = JSON.parse(readFileSync(LOG_PATH, "utf-8")) as LogEntry[];
    } catch {
      log = [];
    }
  }
  const durationSeconds = Math.round((Date.now() - startTime) / 1000);
  log.push({
    runAt: result.crawledAt,
    mode: "extended",
    totalAfter: result.total,
    added,
    skipped,
    errors,
    durationSeconds,
  });
  if (log.length > 100) log = log.slice(-100);
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), "utf-8");

  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  console.log("\n" + "=".repeat(50));
  console.log(`Done in ${mins}m ${secs}s`);
  console.log(`  Total skills : ${skills.length}`);
  console.log(`  Added        : ${added}`);
  console.log(`  Skipped      : ${skipped}`);
  console.log(`  Errors       : ${errors}`);
  console.log(`  Saved to     : ${SKILLS_PATH}`);
}

main().catch((e) => {
  console.error("\nCrawl failed:", e);
  process.exit(1);
});
