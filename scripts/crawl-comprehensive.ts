/**
 * Comprehensive crawler — Source A (code search) + B (topics) + C (registries) + D (README links)
 * Always runs in update mode. Saves every 30 minutes.
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
const SAVE_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

// ── Source A: Code search queries ────────────────────────────────────────────
const CODE_SEARCH_QUERIES = [
  'filename:SKILL.md path:".claude"',
  'filename:SKILL.md path:".cursor"',
  'filename:SKILL.md path:"skills"',
  "filename:AGENTS.md",
  "filename:SKILL.md language:markdown stars:>5",
  "filename:SKILL.md language:markdown stars:>1",
  "filename:SKILL.md language:markdown stars:>0",
  "filename:SKILL.md created:>2025-06-01",
  "filename:SKILL.md created:>2025-03-01 created:<2025-06-01",
  "filename:SKILL.md created:>2025-01-01 created:<2025-03-01",
  "filename:SKILL.md created:>2024-06-01 created:<2025-01-01",
  "filename:SKILL.md created:<2024-06-01",
  "filename:skill.md",
  "SKILL.md in:path",
  "filename:SKILL.md fork:true",
  "filename:SKILL.md org:vercel",
  "filename:SKILL.md org:anthropics",
  "filename:SKILL.md org:github",
];

// ── Source B: GitHub Topics ──────────────────────────────────────────────────
const TOPICS = [
  "claude-code-skills",
  "ai-skills",
  "cursor-skills",
  "codex-skills",
  "agent-tools",
  "skill-md",
  "claude-skills",
  "ai-agent-skills",
  "awesome-skills",
  "llm-skills",
  "copilot-skills",
];

// ── Source C: Registry repos ─────────────────────────────────────────────────
const REGISTRY_REPOS = [
  "openclaw/skills",
  "proficientlyjobs/proficiently-claude-skills",
  "trailofbits/skills",
  "majiayu000/claude-skill-registry",
  "vercel-labs/skills",
  "github/awesome-copilot",
  "alirezarezvani/claude-skills",
  "VoltAgent/awesome-agent-skills",
  "VoltAgent/awesome-openclaw-skills",
  "daymade/claude-code-skills",
  "antfu/skills",
  "skillsmd/skills.md",
];

// Already crawled in previous runs — skip from topic results
const KNOWN_REPOS = new Set(REGISTRY_REPOS);

// ── Rate limit state ─────────────────────────────────────────────────────────
let searchRemaining = 30;

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

async function githubFetch<T>(url: string, retries = 3): Promise<T> {
  const res = await fetch(url, { headers: buildHeaders() });

  const rem = res.headers.get("X-RateLimit-Remaining");
  const rst = res.headers.get("X-RateLimit-Reset");
  const resource = res.headers.get("X-RateLimit-Resource") ?? "core";
  if (rem !== null && rst !== null) {
    const remN = parseInt(rem);
    const rstN = parseInt(rst);
    if (resource === "search") searchRemaining = remN;
    if (remN <= 3) {
      const waitMs = Math.max(rstN * 1000 - Date.now() + 3000, 60000);
      console.log(`\n  ⚠ Rate limit [${resource}:${remN}] → waiting ${Math.ceil(waitMs / 1000)}s`);
      await sleep(waitMs);
    }
  }

  if ((res.status === 403 || res.status === 429) && retries > 0) {
    const ra = res.headers.get("Retry-After");
    const rstH = res.headers.get("X-RateLimit-Reset");
    let waitMs = 60000;
    if (ra) waitMs = parseInt(ra) * 1000;
    else if (rstH) waitMs = Math.max(parseInt(rstH) * 1000 - Date.now() + 3000, 60000);
    console.log(`\n  ⚠ HTTP ${res.status} → retry in ${Math.ceil(waitMs / 1000)}s`);
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

async function searchCode(query: string, maxPages = 10): Promise<SkillRef[]> {
  const refs: SkillRef[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const url = `${GITHUB_API}/search/code?q=${encodeURIComponent(query)}&per_page=100&page=${page}`;
    let result: SearchCodeResponse;
    try {
      result = await githubFetch<SearchCodeResponse>(url);
    } catch (e) {
      console.error(`\n  Search error (p${page}): ${e}`);
      break;
    }
    if (page === 1) console.log(`  hits: ${result.total_count.toLocaleString()}`);
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
    await sleep(3000);
  }
  return refs;
}

// ─── Topic search ─────────────────────────────────────────────────────────────

interface RepoItem {
  full_name: string;
  html_url: string;
}
interface RepoSearchResponse {
  total_count: number;
  items: RepoItem[];
}

async function searchReposByTopic(topic: string, maxPages = 3): Promise<string[]> {
  const repos: string[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const url = `${GITHUB_API}/search/repositories?q=topic:${encodeURIComponent(topic)}&per_page=100&page=${page}`;
    let result: RepoSearchResponse;
    try {
      result = await githubFetch<RepoSearchResponse>(url);
    } catch (e) {
      console.error(`\n  Topic error (${topic} p${page}): ${e}`);
      break;
    }
    if (page === 1) console.log(`  "${topic}": ${result.total_count} repos`);
    repos.push(...result.items.map((r) => r.full_name));
    if (result.items.length < 100) break;
    await sleep(3000);
  }
  return repos;
}

// ─── Source D: README link extraction ────────────────────────────────────────

const GH_REPO_URL_RE = /https?:\/\/github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/g;

async function extractLinkedRepos(repoFullName: string): Promise<string[]> {
  const found = new Set<string>();
  for (const branch of ["main", "master", "HEAD"]) {
    const url = `https://raw.githubusercontent.com/${repoFullName}/${branch}/README.md`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) continue;
      const text = await res.text();
      let m: RegExpExecArray | null;
      GH_REPO_URL_RE.lastIndex = 0;
      while ((m = GH_REPO_URL_RE.exec(text)) !== null) {
        const slug = m[1].replace(/\.git$/, "");
        if (slug !== repoFullName && !slug.includes(".")) found.add(slug);
      }
      break;
    } catch {
      continue;
    }
  }
  return [...found];
}

// ─── State & helpers ──────────────────────────────────────────────────────────

let skills: Skill[] = [];
let existingKeys: Set<string>;
let seenShas: Set<string>;
let added = 0;
let skipped = 0;
let errors = 0;
let total = 0;
let lastSaveTime = Date.now();

function saveProgress(label = "") {
  const result: CrawlResult = {
    crawledAt: new Date().toISOString(),
    total: skills.length,
    errors,
    skills,
  };
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(SKILLS_PATH, JSON.stringify(result, null, 2), "utf-8");
  if (label) console.log(`\n  💾 Mid-save [${label}]: ${skills.length} total`);
  lastSaveTime = Date.now();
}

function maybeSave(label = "") {
  if (Date.now() - lastSaveTime >= SAVE_INTERVAL_MS) saveProgress(label);
}

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
    `\r  processed: ${total}  added: ${added}  skip: ${skipped}  err: ${errors}   `
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.GITHUB_TOKEN) {
    console.warn("⚠ GITHUB_TOKEN not set — very slow without auth.");
  }
  const startTime = Date.now();
  console.log("\nComprehensive SKILL.md Crawler");
  console.log("=".repeat(60));

  if (!existsSync(SKILLS_PATH)) {
    console.error("skills.json not found. Run npm run crawl first.");
    process.exit(1);
  }

  const existing = JSON.parse(readFileSync(SKILLS_PATH, "utf-8")) as CrawlResult;
  skills = [...(existing.skills ?? [])];
  existingKeys = new Set(skills.map((s) => skillKey(s.repoUrl, rawUrlToPath(s.rawUrl))));
  seenShas = new Set(skills.map((s) => s.id));
  console.log(`\nLoaded ${skills.length} existing skills.`);

  // ── Phase A: Code search ──────────────────────────────────────────────────
  console.log("\n=== Phase A: Code Search ===");
  for (const query of CODE_SEARCH_QUERIES) {
    console.log(`\nQuery: ${query}`);
    let refs: SkillRef[];
    try {
      refs = await searchCode(query);
      console.log(`  fetched: ${refs.length}`);
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
    maybeSave(`Phase A: ${query.slice(0, 30)}`);
    await sleep(3000);
  }
  saveProgress("Phase A complete");

  // ── Phase B: Topics ───────────────────────────────────────────────────────
  console.log("\n=== Phase B: GitHub Topics ===");
  const topicRepos = new Set<string>();
  for (const topic of TOPICS) {
    console.log(`\nTopic: ${topic}`);
    try {
      const repos = await searchReposByTopic(topic);
      repos.forEach((r) => topicRepos.add(r));
    } catch (e) {
      console.error(`  Failed: ${e}`);
      errors++;
    }
    await sleep(3000);
  }

  const newTopicRepos = [...topicRepos].filter((r) => !KNOWN_REPOS.has(r));
  console.log(`\n  Topic repos: ${topicRepos.size} found, ${newTopicRepos.length} new`);

  let ri = 0;
  for (const repo of newTopicRepos) {
    ri++;
    let refs: SkillRef[];
    try {
      refs = await crawlRepoTree(repo);
    } catch (e) {
      errors++;
      continue;
    }
    if (refs.length === 0) continue;
    KNOWN_REPOS.add(repo);
    console.log(`\n  [${ri}/${newTopicRepos.length}] ${repo}: ${refs.length} skills`);
    for (const ref of refs) {
      await ingest(ref);
      await sleep(200);
    }
    console.log();
    maybeSave(`Phase B: ${repo}`);
    await sleep(1500);
  }
  saveProgress("Phase B complete");

  // ── Phase C: Registry repos ───────────────────────────────────────────────
  console.log("\n=== Phase C: Registry repos ===");
  for (const repo of REGISTRY_REPOS) {
    console.log(`\nRepo: ${repo}`);
    let refs: SkillRef[];
    try {
      refs = await crawlRepoTree(repo);
    } catch (e) {
      console.warn(`  Failed: ${e}`);
      errors++;
      continue;
    }
    console.log(`  ${refs.length} skills`);
    for (const ref of refs) {
      await ingest(ref);
      await sleep(200);
    }
    if (refs.length > 0) console.log();
    await sleep(1500);
  }
  saveProgress("Phase C complete");

  // ── Phase D: README links ─────────────────────────────────────────────────
  console.log("\n=== Phase D: README link extraction ===");
  const linkedRepos = new Set<string>();
  for (const repo of REGISTRY_REPOS) {
    console.log(`\nREADME links from: ${repo}`);
    const links = await extractLinkedRepos(repo);
    links.forEach((r) => linkedRepos.add(r));
    await sleep(500);
  }

  const newLinkedRepos = [...linkedRepos].filter((r) => !KNOWN_REPOS.has(r));
  console.log(`\n  Found ${linkedRepos.size} linked repos, ${newLinkedRepos.length} new`);

  let li = 0;
  for (const repo of newLinkedRepos) {
    li++;
    let refs: SkillRef[];
    try {
      refs = await crawlRepoTree(repo);
    } catch (e) {
      errors++;
      continue;
    }
    if (refs.length === 0) continue;
    KNOWN_REPOS.add(repo);
    console.log(`\n  [${li}/${newLinkedRepos.length}] ${repo}: ${refs.length} skills`);
    for (const ref of refs) {
      await ingest(ref);
      await sleep(200);
    }
    console.log();
    maybeSave(`Phase D: ${repo}`);
    await sleep(1500);
  }
  saveProgress("Phase D complete");

  // ── Final save & log ──────────────────────────────────────────────────────
  const durationSeconds = Math.round((Date.now() - startTime) / 1000);
  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;

  let log: object[] = [];
  if (existsSync(LOG_PATH)) {
    try { log = JSON.parse(readFileSync(LOG_PATH, "utf-8")); } catch { log = []; }
  }
  log.push({ runAt: new Date().toISOString(), mode: "comprehensive", totalAfter: skills.length, added, skipped, errors, durationSeconds });
  if (log.length > 100) log = log.slice(-100);
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), "utf-8");

  console.log("\n" + "=".repeat(60));
  console.log(`Done in ${mins}m ${secs}s`);
  console.log(`  Total skills : ${skills.length}`);
  console.log(`  Added        : ${added}`);
  console.log(`  Skipped      : ${skipped}`);
  console.log(`  Errors       : ${errors}`);
}

main().catch((e) => {
  console.error("\nCrawl failed:", e);
  process.exit(1);
});
