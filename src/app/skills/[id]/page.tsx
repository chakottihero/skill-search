import { notFound } from "next/navigation";
import Link from "next/link";
import { findSkillById, getRelatedSkills } from "@/lib/search";
import CopyButton from "@/components/CopyButton";
import DescriptionToggle from "@/components/DescriptionToggle";
import ContentTranslate from "@/components/ContentTranslate";
import RelatedSkills from "@/components/RelatedSkills";
import type { Metadata } from "next";
import { CATEGORY_MAP } from "@/lib/categories";

type Props = { params: Promise<{ id: string }> };

const TOOL_KEYWORDS: { label: string; keywords: string[] }[] = [
  { label: "Claude Code", keywords: ["claude code", "claude", ".claude"] },
  { label: "Cursor", keywords: ["cursor"] },
  { label: "Codex", keywords: ["codex"] },
  { label: "Copilot", keywords: ["copilot"] },
];

function detectTools(text: string): string[] {
  const lower = text.toLowerCase();
  const found = TOOL_KEYWORDS.filter(({ keywords }) =>
    keywords.some((kw) => lower.includes(kw))
  ).map(({ label }) => label);
  return found.length ? found : ["Claude Code"];
}

function formatDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return "今日";
  if (days < 7) return `${days}日前`;
  if (days < 30) return `${Math.floor(days / 7)}週間前`;
  if (days < 365) return `${Math.floor(days / 30)}ヶ月前`;
  return `${Math.floor(days / 365)}年前`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const skill = await findSkillById(id);
  if (!skill) return { title: "スキルが見つかりません" };
  return {
    title: `${skill.name} — Skills Research`,
    description: skill.description || skill.content,
  };
}

export default async function SkillDetailPage({ params }: Props) {
  const { id } = await params;
  const skill = await findSkillById(id);
  if (!skill) notFound();

  let fullContent = skill.content ?? "";
  try {
    const res = await fetch(skill.rawUrl, { next: { revalidate: 86400 } });
    if (res.ok) fullContent = await res.text();
  } catch {
    // fallback to stored snippet
  }

  const tools = detectTools(
    `${skill.name} ${skill.description ?? ""} ${fullContent} ${skill.rawUrl}`
  );

  const related = await getRelatedSkills(skill, 5);
  const catDef = skill.category ? CATEGORY_MAP.get(skill.category) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        検索に戻る
      </Link>

      <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">{skill.name}</h1>

      <a href={skill.repoUrl} target="_blank" rel="noopener noreferrer"
        className="mt-1 block truncate text-sm text-gray-400 transition-colors hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400">
        {skill.repoUrl}
      </a>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          {skill.stars.toLocaleString()}
        </span>
        <span>更新: {formatDate(skill.updatedAt)}</span>

        {tools.map((t) => (
          <span key={t}
            className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400">
            {t}
          </span>
        ))}

        {/* Category badge */}
        {skill.category && (
          <Link
            href={`/search?category=${encodeURIComponent(skill.category)}`}
            className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
          >
            {catDef?.icon ?? "📦"} {skill.category}
          </Link>
        )}

        {/* Subcategory badge */}
        {skill.category && skill.subcategory && (
          <Link
            href={`/search?category=${encodeURIComponent(skill.category)}&subcategory=${encodeURIComponent(skill.subcategory)}`}
            className="rounded border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs text-purple-600 transition-colors hover:bg-purple-100 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400 dark:hover:bg-purple-500/20"
          >
            {skill.subcategory}
          </Link>
        )}

        {skill.categories.map((c) => (
          <Link key={c} href={`/search?q=${encodeURIComponent(c)}`}
            className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-500 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-indigo-500/50 dark:hover:text-indigo-400">
            {c}
          </Link>
        ))}
        {skill.language === "ja" && (
          <span className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400">
            日本語
          </span>
        )}
        {skill.language === "en" && (
          <span className="rounded border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs text-sky-600 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-400">
            English
          </span>
        )}
      </div>

      {skill.description && skill.description !== skill.content && (
        <DescriptionToggle
          description={skill.description}
          className="mt-4 leading-relaxed text-gray-500 dark:text-gray-400"
        />
      )}

      {skill.installCommand && (
        <div className="mt-5">
          <p className="mb-1.5 text-xs text-gray-400 dark:text-gray-500">インストール</p>
          <CopyButton command={skill.installCommand} />
        </div>
      )}

      <hr className="my-8 border-gray-200 dark:border-white/10" />

      <ContentTranslate content={fullContent} cacheKey={skill.id} />

      <div className="mt-10 flex flex-wrap gap-4 border-t border-gray-200 pt-6 dark:border-white/10">
        <a href={skill.repoUrl} target="_blank" rel="noopener noreferrer"
          className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-white/10 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400">
          GitHub で開く
        </a>
        <a href={skill.rawUrl} target="_blank" rel="noopener noreferrer"
          className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 dark:border-white/10 dark:text-gray-400 dark:hover:border-white/30 dark:hover:text-white">
          Raw を見る
        </a>
        <a
          href="https://skills-market-seven.vercel.app/sell"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-purple-300 px-4 py-2 text-sm text-purple-500 transition-colors hover:border-purple-400 hover:text-purple-600 dark:border-purple-500/40 dark:text-purple-400 dark:hover:border-purple-400 dark:hover:text-purple-300"
        >
          マーケットで出品する →
        </a>
      </div>

      {/* Related skills */}
      {related.length > 0 && (
        <RelatedSkills
          related={related}
          category={skill.category}
          catDefIcon={catDef?.icon}
        />
      )}
    </div>
  );
}
