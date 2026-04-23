import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { findSkillById } from "@/lib/search";
import CopyButton from "@/components/CopyButton";
import DescriptionToggle from "@/components/DescriptionToggle";
import type { Metadata } from "next";
import type { Components } from "react-markdown";

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

const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-3 mt-6 text-2xl font-bold text-gray-900 dark:text-white">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-5 border-b border-gray-200 pb-1 text-xl font-semibold text-gray-900 dark:border-white/10 dark:text-white">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-4 text-lg font-medium text-gray-700 dark:text-gray-200">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="my-2 leading-relaxed text-gray-600 dark:text-gray-300">{children}</p>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="text-indigo-600 hover:underline dark:text-indigo-400">
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="my-2 ml-5 list-disc space-y-1 text-gray-600 dark:text-gray-300">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 ml-5 list-decimal space-y-1 text-gray-600 dark:text-gray-300">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-4 border-indigo-300 pl-4 italic text-gray-500 dark:border-indigo-500/40 dark:text-gray-400">
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.startsWith("language-");
    if (isBlock) {
      return (
        <code className={`${className} block overflow-x-auto`} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-indigo-600 dark:bg-white/10 dark:text-indigo-300"
        {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-6 border-gray-200 dark:border-white/10" />,
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm text-gray-600 dark:text-gray-300">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-medium text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-200 px-3 py-2 dark:border-white/10">{children}</td>
  ),
};

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

      <article className="text-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {fullContent}
        </ReactMarkdown>
      </article>

      <div className="mt-10 flex gap-4 border-t border-gray-200 pt-6 dark:border-white/10">
        <a href={skill.repoUrl} target="_blank" rel="noopener noreferrer"
          className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-white/10 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400">
          GitHub で開く
        </a>
        <a href={skill.rawUrl} target="_blank" rel="noopener noreferrer"
          className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 dark:border-white/10 dark:text-gray-400 dark:hover:border-white/30 dark:hover:text-white">
          Raw を見る
        </a>
      </div>
    </div>
  );
}
