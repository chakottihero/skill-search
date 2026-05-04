import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const SITE_URL = "https://search.aiskill-market.com";
const CHUNK_SIZE = 49000;

export const dynamic = "force-static";

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

const STATIC_ENTRIES = [
  { url: SITE_URL,                 freq: "daily",   pri: "1.0" },
  { url: `${SITE_URL}/search`,     freq: "daily",   pri: "0.9" },
  { url: `${SITE_URL}/categories`, freq: "weekly",  pri: "0.8" },
  { url: `${SITE_URL}/about`,      freq: "monthly", pri: "0.5" },
];

function urlEntry(url: string, lastmod: string, freq: string, pri: string) {
  return `  <url><loc>${url}</loc><lastmod>${lastmod}</lastmod><changefreq>${freq}</changefreq><priority>${pri}</priority></url>`;
}

export function generateStaticParams() {
  const count = Math.ceil(SKILLS.length / CHUNK_SIZE);
  return [
    { id: "static.xml" },
    ...Array.from({ length: count }, (_, i) => ({ id: `skills-${i}.xml` })),
  ];
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const today = new Date().toISOString().slice(0, 10);

  let entries: string[];

  if (id === "static.xml") {
    entries = STATIC_ENTRIES.map((s) => urlEntry(s.url, today, s.freq, s.pri));
  } else {
    const match = id.match(/^skills-(\d+)\.xml$/);
    if (!match) return new NextResponse("Not Found", { status: 404 });
    const chunk = Number(match[1]);
    const start = chunk * CHUNK_SIZE;
    const slice = SKILLS.slice(start, start + CHUNK_SIZE);
    if (slice.length === 0) return new NextResponse("Not Found", { status: 404 });
    entries = slice.map((s) =>
      urlEntry(
        `${SITE_URL}/skills/${s.id}`,
        s.updatedAt ? s.updatedAt.slice(0, 10) : today,
        "monthly",
        "0.6"
      )
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
