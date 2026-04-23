import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { findSkillById } from "@/lib/search";
import CopyButton from "@/components/CopyButton";
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
    title: `${skill.name} — スキルサーチ`,
    description: skill.description || skill.content,
  };
}

const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-6 mb-3 text-2xl font-bold text-white">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-5 mb-2 text-xl font-semibold text-white border-b border-white/10 pb-1">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-1.5 text-lg font-medium text-gray-200">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="my-2 text-gray-300 leading-relaxed">{children}</p>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="text-green-400 hover:underline">
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="my-2 ml-5 list-disc space-y-1 text-gray-300">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 ml-5 list-decimal space-y-1 text-gray-300">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-4 border-green-500/40 pl-4 text-gray-400 italic">
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
      <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-green-300"
        {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-lg bg-white/5 border border-white/10 p-4 font-mono text-sm text-gray-300">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-6 border-white/10" />,
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm text-gray-300">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-white/10 bg-white/5 px-3 py-2 text-left font-medium text-white">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-white/10 px-3 py-2">{children}</td>
  ),
};

export default async function SkillDetailPage({ params }: Props) {
  const { id } = await params;
  const skill = await findSkillById(id);
  if (!skill) notFound();

  // Fetch full markdown (cached 24h)
  let fullContent = skill.content;
  try {
    const res = await fetch(skill.rawUrl, { next: { revalidate: 86400 } });
    if (res.ok) fullContent = await res.text();
  } catch {
    // fallback to stored snippet
  }

  const tools = detectTools(
    `${skill.name} ${skill.description} ${fullContent} ${skill.rawUrl}`
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Back link */}
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        検索に戻る
      </Link>

      {/* Title */}
      <h1 className="text-3xl font-bold text-white leading-tight">{skill.name}</h1>

      {/* Repo URL */}
      <a href={skill.repoUrl} target="_blank" rel="noopener noreferrer"
        className="mt-1 block truncate text-sm text-gray-600 hover:text-gray-400 transition-colors">
        {skill.repoUrl}
      </a>

      {/* Meta row */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <span className="text-yellow-400">★</span>
          {skill.stars.toLocaleString()}
        </span>
        <span>更新: {formatDate(skill.updatedAt)}</span>

        {tools.map((t) => (
          <span key={t}
            className="rounded border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
            {t}
          </span>
        ))}
        {skill.categories.map((c) => (
          <Link key={c} href={`/search?q=${encodeURIComponent(c)}`}
            className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-gray-400 hover:border-green-500/50 hover:text-green-400 transition-colors">
            {c}
          </Link>
        ))}
        {skill.language === "ja" && (
          <span className="rounded border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs text-green-500">
            日本語
          </span>
        )}
      </div>

      {/* Description */}
      {skill.description && skill.description !== skill.content && (
        <p className="mt-4 text-gray-400 leading-relaxed">{skill.description}</p>
      )}

      {/* Install command */}
      {skill.installCommand && (
        <div className="mt-5">
          <p className="mb-1.5 text-xs text-gray-500">インストール</p>
          <CopyButton command={skill.installCommand} />
        </div>
      )}

      <hr className="my-8 border-white/10" />

      {/* Full markdown */}
      <article className="text-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {fullContent}
        </ReactMarkdown>
      </article>

      {/* Footer links */}
      <div className="mt-10 flex gap-4 border-t border-white/10 pt-6">
        <a href={skill.repoUrl} target="_blank" rel="noopener noreferrer"
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-400 hover:border-green-500 hover:text-green-400 transition-colors">
          GitHub で開く
        </a>
        <a href={skill.rawUrl} target="_blank" rel="noopener noreferrer"
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-400 hover:border-white/30 hover:text-white transition-colors">
          Raw を見る
        </a>
      </div>
    </div>
  );
}
