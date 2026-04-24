/**
 * crawl-100k.ts — Comprehensive crawl targeting 100k+ skills
 * Sources: A=code search, B=topics, C=registries, D=README link extraction
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
const LOG_PATH = join(DATA_DIR, "crawl-100k.log");

// ── Source A: Code search queries ─────────────────────────────────────────────
const SEARCH_QUERIES = [
  'filename:SKILL.md',
  'filename:SKILL.md path:.claude',
  'filename:SKILL.md path:.cursor',
  'filename:SKILL.md path:.codex',
  'filename:SKILL.md path:skills',
  'filename:SKILL.md path:agent',
  'filename:SKILL.md path:agents',
  'filename:SKILL.md language:markdown',
  'filename:SKILL.md fork:true',
  'filename:SKILL.md stars:>0',
  'filename:SKILL.md stars:>1',
  'filename:SKILL.md stars:>5',
  'filename:SKILL.md stars:>10',
  'filename:SKILL.md stars:>50',
  'filename:skill.md',
  'SKILL.md in:path',
  'filename:SKILL.md created:>2026-01-01',
  'filename:SKILL.md created:>2025-10-01 created:<2026-01-01',
  'filename:SKILL.md created:>2025-07-01 created:<2025-10-01',
  'filename:SKILL.md created:>2025-04-01 created:<2025-07-01',
  'filename:SKILL.md created:>2025-01-01 created:<2025-04-01',
  'filename:SKILL.md created:<2025-01-01',
  'filename:SKILL.md org:anthropics',
  'filename:SKILL.md org:github',
  'filename:SKILL.md org:vercel',
  'filename:SKILL.md org:microsoft',
  'filename:SKILL.md org:google',
  'filename:SKILL.md org:meta-llama',
  'filename:SKILL.md org:openai',
  'filename:AGENTS.md',
  'filename:AGENTS.md path:.claude',
  'filename:AGENTS.md path:skills',
];

// ── Source B: GitHub Topics ───────────────────────────────────────────────────
const TOPICS = [
  "skill-md",
  "claude-skills",
  "claude-code-skills",
  "ai-skills",
  "cursor-skills",
  "codex-skills",
  "agent-skills",
  "agent-tools",
  "awesome-skills",
  "llm-skills",
  "copilot-skills",
  "ai-agent-skills",
  "claude-code",
  "cursor-rules",
  "llm-tools",
  "ai-tools",
  "mcp-tools",
];

// ── Source C: Registry repos ──────────────────────────────────────────────────
const REGISTRIES = [
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
  "aipoch/medical-research-skills",
  "PatrickJS/awesome-cursorrules",
  "pontusab/cursor-and-windsurf-rules",
];

// ── HTTP helpers ──────────────────────────────────────────────────────────────

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
    if (remN <= 3) {
      const waitMs = Math.max(rstN * 1000 - Date.now() + 3000, 60000);
      console.log(`\n  ⚠ Rate limit low [${resource}:${remN}]. Waiting ${Math.ceil(waitMs / 1000)}s...`);
      await sleep(waitMs);
    }
  }

  if ((res.status === 403 || res.status === 429) && retries > 0) {
    const retryAfter = res.headers.get("Retry-After");
    const rstHeader = res.headers.get("X-RateLimit-Reset");
    let waitMs = 60000;
    if (retryAfter) waitMs = parseInt(retryAfter) * 1000;
    else if (rstHeader) waitMs = Math.max(parseInt(rstHeader) * 1000 - Date.now() + 3000, 60000);
    console.log(`\n  ⚠ HTTP ${res.status}. Retry in ${Math.ceil(waitMs / 1000)}s...`);
    await sleep(waitMs);
    return githubFetch<T>(url, retries - 1);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

// ── Code search ───────────────────────────────────────────────────────────────

interface SearchCodeItem {
  sha: string;
  path: string;
  repository: { full_name: string; html_url: string };
  download_url: string | null;
}
interface SearchCodeResponse { total_count: number; items: SearchCodeItem[] }

async function searchCode(query: string, maxPages = 10): Promise<SkillRef[]> {
  const refs: SkillRef[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const url = `${GITHUB_API}/search/code?q=${encodeURIComponent(query)}&per_page=100&page=${page}`;
    let result: SearchCodeResponse;
    try {
      result = await githubFetch<SearchCodeResponse>(url);
    } catch (e) {
      console.error(`  Search error p${page}: ${e}`);
      break;
    }
    if (page === 1) console.log(`  Total on GitHub: ${result.total_count.toLocaleString()}`);
    for (const item of result.items) {
      refs.push({
        sha: item.sha,
        path: item.path,
        repoFullName: item.repository.full_name,
        repoHtmlUrl: item.repository.html_url,
        rawUrl: item.download_url ??
          `https://raw.githubusercontent.com/${item.repository.full_name}/HEAD/${item.path}`,
      });
    }
    if (result.items.length < 100) break;
    await sleep(3000);
  }
  return refs;
}

// ── Topic search ──────────────────────────────────────────────────────────────

interface RepoItem { full_name: string; html_url: string }
interface RepoSearchResponse { total_count: number; items: RepoItem[] }

async function searchByTopic(topic: string): Promise<string[]> {
  const repos: string[] = [];
  for (let page = 1; page <= 10; page++) {
    const url = `${GITHUB_API}/search/repositories?q=topic:${encodeURIComponent(topic)}&per_page=100&page=${page}`;
    let result: RepoSearchResponse;
    try {
      result = await githubFetch<RepoSearchResponse>(url);
    } catch (e) {
      console.error(`  Topic "${topic}" error p${page}: ${e}`);
      break;
    }
    if (page === 1) console.log(`  "${topic}": ${result.total_count} repos`);
    repos.push(...result.items.map((r) => r.full_name));
    if (result.items.length < 100) break;
    await sleep(3000);
  }
  return repos;
}

// ── README link extraction (Source D) ────────────────────────────────────────

async function extractRepoLinksFromReadme(repoFullName: string): Promise<string[]> {
  try {
    const url = `${GITHUB_API}/repos/${repoFullName}/readme`;
    const data = await githubFetch<{ download_url: string }>(url);
    const res = await fetch(data.download_url);
    if (!res.ok) return [];
    const text = await res.text();
    const matches = text.matchAll(/https?:\/\/github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/g);
    const repos = new Set<string>();
    for (const m of matches) {
      const repo = m[1].replace(/\.git$/, "").replace(/\/$/, "");
      if (!repo.includes("/") || repo.split("/").length !== 2) continue;
      repos.add(repo);
    }
    return [...repos];
  } catch {
    return [];
  }
}

// ── State & save helpers ──────────────────────────────────────────────────────

let skills: Skill[] = [];
let existingKeys: Set<string>;
let seenShas: Set<string>;
let added = 0, skipped = 0, errors = 0, processed = 0;
let lastSaveTime = Date.now();
const SAVE_INTERVAL_MS = 30 * 60 * 1000; // 30 min

function saveNow(label = "Intermediate") {
  const result: CrawlResult = {
    crawledAt: new Date().toISOString(),
    total: skills.length,
    errors,
    skills,
  };
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(SKILLS_PATH, JSON.stringify(result, null, 2), "utf-8");
  console.log(`\n  💾 ${label} save: ${skills.length} skills (added ${added} so far)`);
  lastSaveTime = Date.now();
}

function maybeSave() {
  if (Date.now() - lastSaveTime >= SAVE_INTERVAL_MS) saveNow();
}

async function ingest(ref: SkillRef): Promise<void> {
  if (seenShas.has(ref.sha)) { skipped++; return; }
  seenShas.add(ref.sha);
  const key = skillKey(ref.repoHtmlUrl, ref.path);
  if (existingKeys.has(key)) { skipped++; return; }

  const skill = await processSkillRef(ref);
  processed++;
  if (!skill) { errors++; return; }

  skills.push(skill);
  existingKeys.add(key);
  added++;
  process.stdout.write(`\r  processed: ${processed}  added: ${added}  errors: ${errors}   `);
  maybeSave();
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.GITHUB_TOKEN) console.warn("⚠ No GITHUB_TOKEN — search rate limit: 10/min");

  const startTime = Date.now();
  let lastHourLog = Date.now();
  console.log("\nSKILL.md 100k Crawler");
  console.log("=".repeat(60));

  if (!existsSync(SKILLS_PATH)) { console.error("skills.json not found"); process.exit(1); }

  const existing = JSON.parse(readFileSync(SKILLS_PATH, "utf-8")) as CrawlResult;
  skills = [...(existing.skills ?? [])];
  console.log(`Loaded ${skills.length} existing skills.\n`);

  existingKeys = new Set(skills.map((s) => skillKey(s.repoUrl, rawUrlToPath(s.rawUrl))));
  seenShas = new Set(skills.map((s) => s.id));

  const crawledRepos = new Set<string>();

  async function crawlRepo(repoFullName: string) {
    if (crawledRepos.has(repoFullName)) return;
    crawledRepos.add(repoFullName);
    let refs: SkillRef[];
    try {
      refs = await crawlRepoTree(repoFullName);
    } catch (e) {
      errors++;
      return;
    }
    if (refs.length === 0) return;
    console.log(`\n  [repo] ${repoFullName}: ${refs.length} SKILL.md files`);
    for (const ref of refs) {
      await ingest(ref);
      await sleep(200);
    }

    // Hourly log
    if (Date.now() - lastHourLog >= 3600000) {
      console.log(`\n📊 Hourly: ${skills.length} total skills (+${added} added)`);
      lastHourLog = Date.now();
    }
  }

  // ── Source A: Code Search ───────────────────────────────────────────────────
  console.log("=== Source A: Code Search ===");
  for (let qi = 0; qi < SEARCH_QUERIES.length; qi++) {
    const query = SEARCH_QUERIES[qi];
    console.log(`\n[${qi + 1}/${SEARCH_QUERIES.length}] ${query}`);
    let refs: SkillRef[];
    try {
      refs = await searchCode(query);
      console.log(`  → ${refs.length} refs`);
    } catch (e) {
      console.error(`  Failed: ${e}`);
      errors++;
      await sleep(5000);
      continue;
    }
    for (const ref of refs) {
      await ingest(ref);
      await sleep(300);
    }
    console.log();
    await sleep(3000);
  }
  saveNow("After Source A");

  // ── Source C: Registries (before topics so dedup works) ────────────────────
  console.log("\n=== Source C: Registry repos ===");
  for (const repo of REGISTRIES) {
    console.log(`\n  Registry: ${repo}`);
    await crawlRepo(repo);
    await sleep(1500);
  }
  saveNow("After Source C");

  // ── Source D: README link extraction ───────────────────────────────────────
  console.log("\n=== Source D: README link extraction ===");
  const readmeSources = REGISTRIES;
  const discoveredRepos = new Set<string>();
  for (const registryRepo of readmeSources) {
    console.log(`\n  Extracting links from ${registryRepo} README...`);
    const links = await extractRepoLinksFromReadme(registryRepo);
    console.log(`  → ${links.length} unique repos found`);
    links.forEach((r) => discoveredRepos.add(r));
    await sleep(2000);
  }
  console.log(`\n  Total discovered repos: ${discoveredRepos.size}`);
  let dIdx = 0;
  for (const repo of discoveredRepos) {
    dIdx++;
    if (dIdx % 50 === 0) console.log(`\n  [D: ${dIdx}/${discoveredRepos.size}] processing...`);
    await crawlRepo(repo);
    await sleep(1000);
  }
  saveNow("After Source D");

  // ── Source B: GitHub Topics ─────────────────────────────────────────────────
  console.log("\n=== Source B: GitHub Topics ===");
  const topicRepos = new Set<string>();
  for (const topic of TOPICS) {
    console.log(`\nTopic: ${topic}`);
    try {
      const repos = await searchByTopic(topic);
      repos.forEach((r) => topicRepos.add(r));
    } catch (e) {
      console.error(`  Failed: ${e}`);
    }
    await sleep(3000);
  }
  console.log(`\n  ${topicRepos.size} topic repos to crawl`);
  let tIdx = 0;
  for (const repo of topicRepos) {
    tIdx++;
    if (tIdx % 50 === 0) {
      console.log(`\n  [B: ${tIdx}/${topicRepos.size}] ${skills.length} total skills`);
    }
    await crawlRepo(repo);
    await sleep(1000);
  }

  // ── Final save ──────────────────────────────────────────────────────────────
  saveNow("Final");

  const durationS = Math.round((Date.now() - startTime) / 1000);
  const logLine = `${new Date().toISOString()} | Done in ${Math.floor(durationS / 60)}m${durationS % 60}s | total=${skills.length} added=${added} skipped=${skipped} errors=${errors}\n`;
  writeFileSync(LOG_PATH, logLine, { flag: "a" });

  console.log("\n" + "=".repeat(60));
  console.log(`Done in ${Math.floor(durationS / 60)}m ${durationS % 60}s`);
  console.log(`  Total skills : ${skills.length}`);
  console.log(`  Added        : ${added}`);
  console.log(`  Skipped      : ${skipped}`);
  console.log(`  Errors       : ${errors}`);
}

main().catch((e) => { console.error("Crawl failed:", e); process.exit(1); });
