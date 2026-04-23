import { readFile } from "fs/promises";
import { join } from "path";
import type { Skill, SearchOptions, CrawlResult } from "./types";

// globalThis cache — survives Next.js HMR module reloads in dev
const g = globalThis as typeof globalThis & {
  __skillsCache?: Skill[];
  __skillsLoadingPromise?: Promise<Skill[]> | null;
};

async function loadSkills(): Promise<Skill[]> {
  if (g.__skillsCache) return g.__skillsCache;
  if (g.__skillsLoadingPromise) return g.__skillsLoadingPromise;
  g.__skillsLoadingPromise = (async () => {
    try {
      const raw = await readFile(join(process.cwd(), "data/skills-index.json"), "utf-8");
      const data = JSON.parse(raw) as CrawlResult;
      g.__skillsCache = data.skills;
      return g.__skillsCache;
    } catch {
      return [];
    } finally {
      g.__skillsLoadingPromise = null;
    }
  })();
  return g.__skillsLoadingPromise;
}

function score(skill: Skill, tokens: string[]): number {
  const name = skill.name.toLowerCase();
  const desc = skill.description.toLowerCase();
  const content = (skill.content ?? "").toLowerCase();
  const cats = skill.categories.map((c) => c.toLowerCase()).join(" ");
  let s = 0;
  for (const t of tokens) {
    if (name.includes(t)) s += 3;
    if (desc.includes(t)) s += 2;
    if (content.includes(t)) s += 1;
    if (cats.includes(t)) s += 2;
  }
  return s;
}

function tokenize(query: string): string[] {
  return query.toLowerCase().trim().split(/\s+/).filter(Boolean);
}

export async function searchSkills(
  query: string,
  options: SearchOptions = {}
): Promise<Skill[]> {
  const skills = await loadSkills();
  const { sortBy = "relevance", language, category } = options;
  const tokens = tokenize(query);

  let results = tokens.length
    ? skills.filter((s) => score(s, tokens) > 0)
    : [...skills];

  if (language) results = results.filter((s) => s.language === language);
  if (category) results = results.filter((s) => s.categories.includes(category));

  results.sort((a, b) => {
    if (sortBy === "stars") return b.stars - a.stars;
    if (sortBy === "updatedAt")
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (!tokens.length) return b.stars - a.stars;
    return score(b, tokens) - score(a, tokens);
  });

  return results;
}

export async function findSkillById(id: string): Promise<Skill | undefined> {
  const skills = await loadSkills();
  return skills.find((s) => s.id === id);
}

export async function getAllCategories(): Promise<{ name: string; count: number }[]> {
  const skills = await loadSkills();
  const counts: Record<string, number> = {};
  for (const skill of skills) {
    for (const cat of skill.categories) {
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getAllSkills(options: SearchOptions = {}): Promise<Skill[]> {
  return searchSkills("", options);
}
