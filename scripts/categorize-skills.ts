/**
 * Classifies all skills in skills.json into category/subcategory
 * using keyword matching. Adds `category` and `subcategory` fields.
 */
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { classifySkill, CATEGORIES } from "../src/lib/categories";
import type { Skill, CrawlResult } from "../src/lib/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");
const SKILLS_PATH = join(PROJECT_ROOT, "data", "skills.json");

async function main() {
  if (!existsSync(SKILLS_PATH)) {
    console.error("skills.json not found");
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(SKILLS_PATH, "utf-8")) as CrawlResult;
  const skills = data.skills ?? [];
  console.log(`Classifying ${skills.length} skills...`);

  const categoryCounts: Record<string, Record<string, number>> = {};

  const classified = skills.map((skill: Skill) => {
    const { category, subcategory } = classifySkill(
      skill.name,
      skill.description,
      skill.content
    );
    // Count
    if (!categoryCounts[category]) categoryCounts[category] = {};
    categoryCounts[category][subcategory] =
      (categoryCounts[category][subcategory] ?? 0) + 1;

    return { ...skill, category, subcategory };
  });

  writeFileSync(
    SKILLS_PATH,
    JSON.stringify({ ...data, skills: classified }, null, 2),
    "utf-8"
  );

  console.log("\nCategory distribution:");
  const sorted = Object.entries(categoryCounts).sort(
    ([, a], [, b]) =>
      Object.values(b).reduce((s, n) => s + n, 0) -
      Object.values(a).reduce((s, n) => s + n, 0)
  );
  for (const [cat, subs] of sorted) {
    const total = Object.values(subs).reduce((s, n) => s + n, 0);
    const icon = CATEGORIES.find((c) => c.name === cat)?.icon ?? "📦";
    console.log(`\n  ${icon} ${cat}: ${total}`);
    const subSorted = Object.entries(subs).sort(([, a], [, b]) => b - a);
    for (const [sub, count] of subSorted) {
      console.log(`      ${sub}: ${count}`);
    }
  }

  console.log(`\nTotal: ${classified.length} skills classified`);
  console.log(`Saved to: ${SKILLS_PATH}`);
}

main().catch((e) => {
  console.error("Failed:", e);
  process.exit(1);
});
