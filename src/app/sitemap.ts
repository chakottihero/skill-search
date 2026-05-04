import { MetadataRoute } from "next";
import { readFileSync } from "fs";
import { join } from "path";

const SITE_URL = "https://search.aiskill-market.com";
const CHUNK_SIZE = 49000;

type SkillEntry = { id: string; updatedAt?: string };

function loadSkills(): SkillEntry[] {
  try {
    const raw = readFileSync(join(process.cwd(), "data/skills-index.json"), "utf-8");
    return (JSON.parse(raw) as { skills?: SkillEntry[] }).skills ?? [];
  } catch {
    return [];
  }
}

const SKILLS = loadSkills();

export function generateSitemaps() {
  const skillChunks = Math.ceil(SKILLS.length / CHUNK_SIZE);
  return Array.from({ length: skillChunks + 1 }, (_, i) => ({ id: i }));
}

export default function sitemap({ id }: { id: number }): MetadataRoute.Sitemap {
  if (id === 0) {
    return [
      { url: SITE_URL,                 lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
      { url: `${SITE_URL}/search`,     lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
      { url: `${SITE_URL}/categories`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
      { url: `${SITE_URL}/about`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ];
  }
  const start = (id - 1) * CHUNK_SIZE;
  return SKILLS.slice(start, start + CHUNK_SIZE).map((s) => ({
    url: `${SITE_URL}/skills/${s.id}`,
    lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
}
