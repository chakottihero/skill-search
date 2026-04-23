import type { Skill, CrawlResult } from "./types";

const GITHUB_API = "https://api.github.com";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  コードレビュー: ["review", "レビュー", "code review"],
  自動化: ["automat", "自動", "workflow"],
  テスト: ["test", "テスト", "spec"],
  ドキュメント: ["doc", "ドキュメント", "readme"],
  "Git・PR": ["git", "pull request", "pr", "branch"],
  デバッグ: ["debug", "デバッグ", "fix", "bug"],
};

const SEARCH_QUERIES = [
  "filename:SKILL.md",
  "filename:SKILL.md path:.claude/skills",
  "filename:SKILL.md path:.cursor/skills",
  "filename:SKILL.md path:.codex/skills",
  "filename:SKILL.md path:agent-skills",
  "filename:SKILL.md path:skills",
];

const KNOWN_REGISTRIES = [
  "anthropics/skills",
  "openclaw/skills",
  "vercel-labs/skills",
  "VoltAgent/awesome-agent-skills",
  "alirezarezvani/claude-skills",
  "proficientlyjobs/proficiently-claude-skills",
  "majiayu000/claude-skill-registry",
];

// Rate limit state (tracked from response headers)
let coreRemaining = 5000;
let coreReset = 0;
let searchRemaining = 30;
let searchReset = 0;

// ─── HTTP helpers ──────────────────────────────────────────────────────────

function buildHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function githubFetch<T>(url: string, retries = 2): Promise<T> {
  const res = await fetch(url, { headers: buildHeaders() });

  // Track rate limits from headers
  const rem = res.headers.get("X-RateLimit-Remaining");
  const rst = res.headers.get("X-RateLimit-Reset");
  const resource = res.headers.get("X-RateLimit-Resource") ?? "core";
  if (rem !== null && rst !== null) {
    const remN = parseInt(rem);
    const rstN = parseInt(rst);
    if (resource === "search") { searchRemaining = remN; searchReset = rstN; }
    else { coreRemaining = remN; coreReset = rstN; }
    if (remN <= 10) {
      const waitMs = Math.max(rstN * 1000 - Date.now() + 2000, 60000);
      console.log(`  ⚠ Rate limit low [${resource}:${remN}]. Waiting ${Math.ceil(waitMs / 1000)}s...`);
      await sleep(waitMs);
    }
  }

  // Rate limited — wait and retry
  if ((res.status === 403 || res.status === 429) && retries > 0) {
    const retryAfter = res.headers.get("Retry-After");
    const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
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

// ─── Interfaces ────────────────────────────────────────────────────────────

/** Normalised pointer to a SKILL.md file, usable from both search and tree APIs */
interface SkillRef {
  sha: string;
  path: string;
  repoFullName: string;
  repoHtmlUrl: string;
  rawUrl: string;
}

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

interface RepoDetail {
  stargazers_count: number;
  updated_at: string;
}
interface TreeBlob { path: string; type: string; sha: string; }
interface RepoTree { tree: TreeBlob[]; truncated: boolean; }

// ─── Repo detail cache ─────────────────────────────────────────────────────

const repoCache = new Map<string, RepoDetail>();

async function fetchRepoDetail(fullName: string): Promise<RepoDetail> {
  if (repoCache.has(fullName)) return repoCache.get(fullName)!;
  const data = await githubFetch<RepoDetail>(`${GITHUB_API}/repos/${fullName}`);
  repoCache.set(fullName, data);
  return data;
}

// ─── Metadata extraction ───────────────────────────────────────────────────

function detectLanguage(text: string): "ja" | "en" | "unknown" {
  const jaChars = text.match(/[぀-ヿ一-鿿]/g)?.length ?? 0;
  if (jaChars > 20) return "ja";
  if (jaChars === 0 && text.length > 50) return "en";
  return "unknown";
}

function detectCategories(text: string): string[] {
  const lower = text.toLowerCase();
  return Object.entries(CATEGORY_KEYWORDS)
    .filter(([, kws]) => kws.some((kw) => lower.includes(kw)))
    .map(([cat]) => cat);
}

function parseFrontmatter(raw: string): { fields: Record<string, string>; body: string } {
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!fm) return { fields: {}, body: raw };
  const fields: Record<string, string> = {};
  for (const line of fm[1].split("\n")) {
    const m = line.match(/^(\w+):\s*"?([^"]*)"?\s*$/);
    if (m) fields[m[1]] = m[2].trim();
  }
  return { fields, body: fm[2] };
}

function extractMetadata(raw: string, repoFullName: string) {
  const { fields, body } = parseFrontmatter(raw);
  const bodyLines = body.split("\n");

  const headingLine = bodyLines.find((l) => /^#{1,2}\s/.test(l));
  const name =
    fields.name?.trim() ||
    (headingLine ? headingLine.replace(/^#+\s*/, "").trim() : "") ||
    repoFullName.split("/")[1];

  let description = fields.description?.trim() || "";
  if (!description) {
    for (const line of bodyLines) {
      const t = line.trim();
      if (!t || t.startsWith("#") || t.startsWith("```") || t === "---") continue;
      description = t.slice(0, 200);
      break;
    }
  }

  const content = body.replace(/\n+/g, " ").trim().slice(0, 300);
  const installMatch = raw.match(/```[^\n]*\n([^\n]*(?:claude|skill)[^\n]*)\n```/i);
  const installCommand = installMatch ? installMatch[1].trim() : "";

  return { name, description, content, installCommand };
}

// ─── Search with pagination ────────────────────────────────────────────────

async function searchWithPagination(query: string, maxPages = 5): Promise<SkillRef[]> {
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

    if (page === 1) {
      console.log(`  Total on GitHub: ${result.total_count.toLocaleString()}`);
    }

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

    // GitHub caps search results at 1000 total
    if (result.items.length < 100 || refs.length >= 1000) break;

    await sleep(2000); // respect search rate limit (30 req/min)
  }

  return refs;
}

// ─── Trees API ─────────────────────────────────────────────────────────────

async function crawlRepoTree(fullName: string): Promise<SkillRef[]> {
  for (const branch of ["main", "master", "HEAD"]) {
    try {
      const tree = await githubFetch<RepoTree>(
        `${GITHUB_API}/repos/${fullName}/git/trees/${branch}?recursive=1`
      );
      const skillFiles = tree.tree.filter(
        (f) => f.type === "blob" && f.path.toLowerCase().endsWith("skill.md")
      );
      if (skillFiles.length === 0) return [];
      console.log(`  ${fullName} [${branch}]: ${skillFiles.length} SKILL.md files`);
      return skillFiles.map((f) => ({
        sha: f.sha,
        path: f.path,
        repoFullName: fullName,
        repoHtmlUrl: `https://github.com/${fullName}`,
        rawUrl: `https://raw.githubusercontent.com/${fullName}/${branch}/${f.path}`,
      }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("404") || msg.includes("409") || msg.includes("Git Repository is empty")) {
        if (branch === "HEAD") console.warn(`  ${fullName}: not found or empty`);
        continue;
      }
      console.warn(`  ${fullName} (${branch}): ${msg.slice(0, 100)}`);
    }
  }
  return [];
}

// ─── Per-skill processing ──────────────────────────────────────────────────

async function processSkillRef(ref: SkillRef): Promise<Skill | null> {
  // Raw content (raw.githubusercontent.com — not counted against API rate limit)
  let rawContent: string;
  try {
    const res = await fetch(ref.rawUrl, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.warn(`  Skip ${ref.path} (raw ${res.status})`);
      return null;
    }
    rawContent = await res.text();
  } catch (e) {
    console.warn(`  Skip ${ref.path}: ${e}`);
    return null;
  }

  // Repo detail (GitHub API, cached — sleep only on cache miss)
  let repoDetail: RepoDetail = {
    stargazers_count: 0,
    updated_at: new Date().toISOString(),
  };
  try {
    if (!repoCache.has(ref.repoFullName)) await sleep(2000);
    repoDetail = await fetchRepoDetail(ref.repoFullName);
  } catch (e) {
    console.warn(`  Repo detail error ${ref.repoFullName}: ${e}`);
  }

  const meta = extractMetadata(rawContent, ref.repoFullName);
  return {
    id: ref.sha,
    name: meta.name,
    description: meta.description,
    content: meta.content,
    repoUrl: ref.repoHtmlUrl,
    rawUrl: ref.rawUrl,
    stars: repoDetail.stargazers_count,
    updatedAt: repoDetail.updated_at,
    language: detectLanguage(rawContent),
    categories: detectCategories(rawContent),
    installCommand: meta.installCommand,
  };
}

// ─── Dedup helpers ─────────────────────────────────────────────────────────

/** Stable key = repoUrl + file path within repo (branch-agnostic) */
function skillKey(repoHtmlUrl: string, filePath: string): string {
  return `${repoHtmlUrl}::${filePath}`;
}

function rawUrlToPath(rawUrl: string): string {
  const m = rawUrl.match(/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/(.+)$/);
  return m ? m[1] : rawUrl;
}

// ─── Main export ───────────────────────────────────────────────────────────

export interface CrawlStats {
  added: number;
  skipped: number;
  errors: number;
}

export async function crawlSkills(
  mode: "full" | "update" = "full",
  existing: Skill[] = [],
  maxPages = 5
): Promise<CrawlResult & CrawlStats> {
  const skills: Skill[] = mode === "update" ? [...existing] : [];

  // Keys already in existing data (branch-agnostic: repoUrl::filePath)
  const existingKeys = new Set(
    existing.map((s) => skillKey(s.repoUrl, rawUrlToPath(s.rawUrl)))
  );

  // Intra-run dedup by git blob SHA (same file content = same SHA)
  const seenShas = new Set<string>();

  let added = 0;
  let skipped = 0;
  let errors = 0;
  let total = 0;

  async function ingest(ref: SkillRef): Promise<void> {
    if (seenShas.has(ref.sha)) { skipped++; return; }
    seenShas.add(ref.sha);

    const key = skillKey(ref.repoHtmlUrl, ref.path);
    if (mode === "update" && existingKeys.has(key)) { skipped++; return; }

    const skill = await processSkillRef(ref);
    total++;
    if (!skill) { errors++; return; }

    skills.push(skill);
    existingKeys.add(key);
    added++;
    process.stdout.write(
      `\r  processed: ${total}  added: ${added}  errors: ${errors}   `
    );
  }

  // ── Phase 1: Code search ─────────────────────────────────────────────────
  console.log("\n=== Phase 1: Code search ===");
  for (const query of SEARCH_QUERIES) {
    console.log(`\nQuery: ${query}`);
    let refs: SkillRef[];
    try {
      refs = await searchWithPagination(query, maxPages);
      console.log(`  Fetched ${refs.length} refs`);
    } catch (e) {
      console.error(`  Failed: ${e}`);
      errors++;
      continue;
    }
    for (const ref of refs) {
      await ingest(ref);
      await sleep(200); // polite pause for raw.githubusercontent.com
    }
    console.log(); // newline after \r progress
    await sleep(2000);
  }

  // ── Phase 2: Known registries ────────────────────────────────────────────
  console.log("\n=== Phase 2: Known registries ===");
  for (const repoName of KNOWN_REGISTRIES) {
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
    await sleep(2000);
  }

  return {
    crawledAt: new Date().toISOString(),
    total: skills.length,
    errors,
    added,
    skipped,
    skills,
  };
}
