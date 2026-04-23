import { crawlSkills } from "../src/lib/github-crawler";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";
import type { CrawlResult, Skill } from "../src/lib/types";

config({ path: join(process.cwd(), ".env.local") });

const isUpdate = process.argv.includes("--update");
const mode = isUpdate ? "update" : "full";

// Allow --pages=N override (default 5)
const pagesArg = process.argv.find((a) => a.startsWith("--pages="));
const maxPages = pagesArg ? parseInt(pagesArg.split("=")[1]) : 5;

const DATA_DIR = join(process.cwd(), "data");
const SKILLS_PATH = join(DATA_DIR, "skills.json");
const LOG_PATH = join(DATA_DIR, "crawl-log.json");

interface LogEntry {
  runAt: string;
  mode: string;
  totalAfter: number;
  added: number;
  skipped: number;
  errors: number;
  durationSeconds: number;
}

async function main() {
  if (!process.env.GITHUB_TOKEN) {
    console.warn(
      "⚠ GITHUB_TOKEN not set — rate limit will be 10 req/min (very slow)."
    );
  }

  console.log(`\nSKILL.md Crawler — mode: ${mode}, maxPages: ${maxPages}`);
  console.log("=".repeat(50));

  const startTime = Date.now();

  // Load existing skills for update / differential mode
  let existing: Skill[] = [];
  if (existsSync(SKILLS_PATH)) {
    const prev = JSON.parse(readFileSync(SKILLS_PATH, "utf-8")) as CrawlResult;
    existing = prev.skills ?? [];
    console.log(`\nLoaded ${existing.length} existing skills.`);
    if (mode === "full") {
      console.log("Full mode: discarding existing data and re-crawling.");
    }
  }

  const result = await crawlSkills(mode, existing, maxPages);

  const durationSeconds = Math.round((Date.now() - startTime) / 1000);

  // Save skills.json
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(SKILLS_PATH, JSON.stringify(result, null, 2), "utf-8");

  // Append to crawl-log.json (keep last 100 entries)
  let log: LogEntry[] = [];
  if (existsSync(LOG_PATH)) {
    try {
      log = JSON.parse(readFileSync(LOG_PATH, "utf-8")) as LogEntry[];
    } catch {
      log = [];
    }
  }
  log.push({
    runAt: result.crawledAt,
    mode,
    totalAfter: result.total,
    added: result.added,
    skipped: result.skipped,
    errors: result.errors ?? 0,
    durationSeconds,
  });
  if (log.length > 100) log = log.slice(-100);
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), "utf-8");

  // Summary
  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  console.log("\n" + "=".repeat(50));
  console.log(`Done in ${mins}m ${secs}s`);
  console.log(`  Total skills : ${result.total}`);
  console.log(`  Added        : ${result.added}`);
  console.log(`  Skipped      : ${result.skipped}`);
  console.log(`  Errors       : ${result.errors ?? 0}`);
  console.log(`  Saved to     : ${SKILLS_PATH}`);
  console.log(`  Log          : ${LOG_PATH}`);
}

main().catch((e) => {
  console.error("\nCrawl failed:", e);
  process.exit(1);
});
