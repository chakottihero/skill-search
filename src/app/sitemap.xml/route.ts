import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const SITE_URL = "https://search.aiskill-market.com";
const CHUNK_SIZE = 49000;

export const dynamic = "force-static";

function chunkCount(): number {
  try {
    const raw = readFileSync(join(process.cwd(), "data/skills-index.json"), "utf-8");
    const skills = (JSON.parse(raw) as { skills?: unknown[] }).skills ?? [];
    return Math.ceil(skills.length / CHUNK_SIZE);
  } catch {
    return 2;
  }
}

export function GET() {
  const count = chunkCount();
  const entries = [
    `  <sitemap><loc>${SITE_URL}/sitemap/static.xml</loc></sitemap>`,
    ...Array.from({ length: count }, (_, i) =>
      `  <sitemap><loc>${SITE_URL}/sitemap/skills-${i}.xml</loc></sitemap>`
    ),
  ].join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
