/**
 * crawl-v2.ts — Post-dedup crawl targeting fresh skills
 * Sources: A=code search, B=topics, C=registries
 * Rate limits respected; 30-min intermediate saves; level-1 dedup inline
 */
import {
  sleep,
  crawlRepoTree,
  processSkillRef,
  skillKey,
  rawUrlToPath,
} from "../src/lib/github-crawler";
import type { SkillRef } from "../src/lib/github-crawler";
import { writeFileSync, readFileSync, existsSync } from "fs";
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

// ── Queries ───────────────────────────────────────────────────────────────────
const SEARCH_QUERIES = [
  'filename:SKILL.md',
  'filename:SKILL.md path:.claude',
  'filename:SKILL.md path:.cursor',
  'filename:SKILL.md path:.codex',
  'filename:SKILL.md path:skills',
  'filename:SKILL.md path:agent',
  'filename:SKILL.md language:markdown',
  'filename:SKILL.md fork:true',
  'filename:SKILL.md stars:>0',
  'filename:SKILL.md stars:>5',
  'filename:SKILL.md stars:>10',
  'filename:SKILL.md stars:>50',
  'filename:SKILL.md stars:>100',
  'filename:skill.md',
  'SKILL.md in:path',
  'filename:SKILL.md created:>2026-01-01',
  'filename:SKILL.md created:>2025-10-01 created:<2026-01-01',
  'filename:SKILL.md created:>2025-07-01 created:<2025-10-01',
  'filename:SKILL.md created:>2025-04-01 created:<2025-07-01',
  'filename:SKILL.md created:>2025-01-01 created:<2025-04-01',
  'filename:SKILL.md created:<2025-01-01',
  'filename:AGENTS.md',
  'filename:AGENTS.md path:.claude',
  'filename:AGENTS.md path:skills',
];

const TOPICS = [
  "skill-md", "claude-skills", "claude-code-skills", "ai-skills",
  "cursor-skills", "codex-skills", "agent-skills", "agent-tools",
  "llm-skills", "copilot-skills", "claude-code", "cursor-rules", "mcp-tools",
];

const REGISTRIES = [
  "openclaw/skills",
  "proficientlyjobs/proficiently-claude-skills",
  "trailofbits/skills",
  "majiayu000/claude-skill-registry",
  "vercel-labs/skills",
  "github/awesome-copilot",
  "alirezarezvani/claude-skills",
  "VoltAgent/awesome-agent-skills",
  "daymade/claude-code-skills",
  "antfu/skills",
  "aipoch/medical-research-skills",
  "PatrickJS/awesome-cursorrules",
  "pontusab/cursor-and-windsurf-rules",
];

// ── State ─────────────────────────────────────────────────────────────────────
let skills: Skill[] = [];
let existingKeys = new Set<string>();
let seenShas = new Set<string>();
let added = 0;
let errors = 0;
let lastSaveTime = Date.now();

function saveNow(label: string) {
  const data = JSON.parse(readFileSync(SKILLS_PATH, "utf-8")) as CrawlResult;
  data.skills = skills;
  writeFileSync(SKILLS_PATH, JSON.stringify(data, null, 2), "utf-8");
  lastSaveTime = Date.now();
  console.log(`\n  💾 ${label}: ${skills.length.toLocaleString()} skills (added ${added.toLocaleString()} so far)`);
}

function maybeSave() {
  if (Date.now() - lastSaveTime > 30 * 60 * 1000) saveNow("Intermediate save");
}

async function ingest(ref: SkillRef): Promise<void> {
  const key = skillKey(ref.repoHtmlUrl, rawUrlToPath(ref.rawUrl));
  if (existingKeys.has(key)) return;
  if (ref.sha && seenShas.has(ref.sha)) return;
  try {
    const skill = await processSkillRef(ref);
    if (!skill) return;
    // Level-1 inline dedup: exact name+desc
    const nameDescKey = `${skill.name.trim()}::${(skill.description || "").trim()}`;
    if (seenShas.has(`nd:${nameDescKey}`)) return;
    seenShas.add(`nd:${nameDescKey}`);
    existingKeys.add(key);
    if (ref.sha) seenShas.add(ref.sha);
    skills.push(skill);
    added++;
    process.stdout.write(`\r  added: ${added.toLocaleString()}  errors: ${errors}   `);
    maybeSave();
  } catch {
    errors++;
  }
}

// ── HTTP ─────────────────────────────────────────────────────────────────────
function buildHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  const h: HeadersInit = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

async function githubFetch<T>(url: string, retries = 3): Promise<T> {
  const res = await fetch(url, { headers: buildHeaders() });
  const rem = res.headers.get("X-RateLimit-Remaining");
  const rst = res.headers.get("X-RateLimit-Reset");
  const resource = res.headers.get("X-RateLimit-Resource") ?? "core";
  if (rem !== null && rst !== null) {
    const remN = parseInt(rem), rstN = parseInt(rst);
    if (remN <= 3) {
      const waitMs = Math.max(rstN * 1000 - Date.now() + 3000, 60000);
      console.log(`\n  ⚠ Rate limit low [${resource}:${remN}]. Waiting ${Math.ceil(waitMs/1000)}s...`);
      await sleep(waitMs);
    }
  }
  if ((res.status === 403 || res.status === 429) && retries > 0) {
    const retryAfter = res.headers.get("Retry-After");
    const rstHeader = res.headers.get("X-RateLimit-Reset");
    let waitMs = 60000;
    if (retryAfter) waitMs = parseInt(retryAfter) * 1000;
    else if (rstHeader) waitMs = Math.max(parseInt(rstHeader) * 1000 - Date.now() + 3000, 60000);
    console.log(`\n  ⚠ HTTP ${res.status}. Retry in ${Math.ceil(waitMs/1000)}s...`);
    await sleep(waitMs);
    return githubFetch<T>(url, retries - 1);
  }
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Code search ───────────────────────────────────────────────────────────────
interface SearchCodeItem {
  sha: string; path: string;
  repository: { full_name: string; html_url: string };
  download_url: string | null;
}
interface SearchCodeResponse { total_count: number; items: SearchCodeItem[] }

async function searchCode(query: string, maxPages = 10): Promise<SkillRef[]> {
  const refs: SkillRef[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const url = `${GITHUB_API}/search/code?q=${encodeURIComponent(query)}&per_page=100&page=${page}`;
    let result: SearchCodeResponse;
    try { result = await githubFetch<SearchCodeResponse>(url); }
    catch (e) { console.error(`  Search error p${page}: ${e}`); break; }
    if (page === 1) console.log(`  Total: ${result.total_count.toLocaleString()}`);
    for (const item of result.items) {
      refs.push({
        sha: item.sha, path: item.path,
        repoFullName: item.repository.full_name,
        repoHtmlUrl: item.repository.html_url,
        rawUrl: item.download_url ?? `https://raw.githubusercontent.com/${item.repository.full_name}/HEAD/${item.path}`,
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
  for (let page = 1; page <= 5; page++) {
    const url = `${GITHUB_API}/search/repositories?q=topic:${encodeURIComponent(topic)}&per_page=100&page=${page}`;
    let result: RepoSearchResponse;
    try { result = await githubFetch<RepoSearchResponse>(url); }
    catch (e) { console.error(`  Topic "${topic}" error p${page}: ${e}`); break; }
    if (page === 1) console.log(`  "${topic}": ${result.total_count} repos`);
    repos.push(...result.items.map((r) => r.full_name));
    if (result.items.length < 100) break;
    await sleep(3000);
  }
  return repos;
}

// ── Repo crawl ────────────────────────────────────────────────────────────────
const crawledRepos = new Set<string>();

async function crawlRepo(repoFullName: string) {
  if (crawledRepos.has(repoFullName)) return;
  crawledRepos.add(repoFullName);
  let refs: SkillRef[];
  try { refs = await crawlRepoTree(repoFullName); }
  catch { errors++; return; }
  if (refs.length === 0) return;
  // Skip repos with >3000 files (likely a registry already processed)
  if (refs.length > 3000) {
    console.log(`\n  [skip] ${repoFullName}: ${refs.length} files (too large)`);
    return;
  }
  console.log(`\n  [repo] ${repoFullName}: ${refs.length} SKILL.md files`);
  for (const ref of refs) {
    await ingest(ref);
    await sleep(200);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const startTime = Date.now();
  let lastHourLog = Date.now();
  console.log("\nSKILL.md Crawler v2");
  console.log("=".repeat(60));

  const existing = JSON.parse(readFileSync(SKILLS_PATH, "utf-8")) as CrawlResult;
  skills = [...(existing.skills ?? [])];
  console.log(`Loaded ${skills.length.toLocaleString()} existing skills.\n`);

  existingKeys = new Set(skills.map((s) => skillKey(s.repoUrl, rawUrlToPath(s.rawUrl))));
  seenShas = new Set(skills.map((s) => s.id));
  // Also seed name+desc dedup from existing
  for (const s of skills) {
    const key = `nd:${s.name.trim()}::${(s.description || "").trim()}`;
    seenShas.add(key);
  }

  // ── Source A ────────────────────────────────────────────────────────────
  console.log("=== Source A: Code Search ===");
  for (let qi = 0; qi < SEARCH_QUERIES.length; qi++) {
    const query = SEARCH_QUERIES[qi];
    console.log(`\n[${qi+1}/${SEARCH_QUERIES.length}] ${query}`);
    let refs: SkillRef[];
    try { refs = await searchCode(query); console.log(`  → ${refs.length} refs`); }
    catch (e) { console.error(`  Failed: ${e}`); errors++; await sleep(5000); continue; }
    for (const ref of refs) { await ingest(ref); await sleep(300); }
    await sleep(3000);
    if (Date.now() - lastHourLog >= 3600000) {
      console.log(`\n📊 Hourly: ${skills.length.toLocaleString()} total (+${added.toLocaleString()} added)`);
      lastHourLog = Date.now();
    }
  }
  saveNow("After Source A");

  // ── Source C ────────────────────────────────────────────────────────────
  console.log("\n=== Source C: Registry repos ===");
  for (const repo of REGISTRIES) {
    console.log(`\n  Registry: ${repo}`);
    await crawlRepo(repo);
    await sleep(1500);
  }
  saveNow("After Source C");

  // ── Source B ────────────────────────────────────────────────────────────
  console.log("\n=== Source B: GitHub Topics ===");
  const topicRepos = new Set<string>();
  for (const topic of TOPICS) {
    console.log(`\nTopic: ${topic}`);
    try { const repos = await searchByTopic(topic); repos.forEach((r) => topicRepos.add(r)); }
    catch (e) { console.error(`  Failed: ${e}`); }
    await sleep(3000);
  }
  console.log(`\n  ${topicRepos.size} topic repos to crawl`);
  let tIdx = 0;
  for (const repo of topicRepos) {
    tIdx++;
    if (tIdx % 100 === 0) console.log(`\n  [B: ${tIdx}/${topicRepos.size}] ${skills.length.toLocaleString()} total`);
    await crawlRepo(repo);
    await sleep(1000);
    if (Date.now() - lastHourLog >= 3600000) {
      console.log(`\n📊 Hourly: ${skills.length.toLocaleString()} total (+${added.toLocaleString()} added)`);
      lastHourLog = Date.now();
    }
  }
  saveNow("After Source B");

  const elapsed = Math.round((Date.now() - startTime) / 60000);
  console.log(`\n🎉 Done in ${elapsed}m. Total: ${skills.length.toLocaleString()} (+${added.toLocaleString()} added, ${errors} errors)`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
