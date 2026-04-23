import Link from "next/link";
import type { Skill } from "@/lib/types";
import CopyButton from "./CopyButton";

const TOOL_KEYWORDS: { label: string; keywords: string[] }[] = [
  { label: "Claude Code", keywords: ["claude code", "claude", ".claude"] },
  { label: "Cursor", keywords: ["cursor"] },
  { label: "Codex", keywords: ["codex"] },
  { label: "Copilot", keywords: ["copilot"] },
];

function detectTools(skill: Skill): string[] {
  const text = `${skill.name} ${skill.description ?? ""} ${skill.content ?? ""} ${skill.rawUrl}`.toLowerCase();
  const found = TOOL_KEYWORDS.filter(({ keywords }) =>
    keywords.some((kw) => text.includes(kw))
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

export default function SkillCard({ skill }: { skill: Skill }) {
  const tools = detectTools(skill);

  return (
    <article className="py-6">
      <Link
        href={`/skills/${skill.id}`}
        className="text-lg font-bold text-indigo-600 hover:underline dark:text-indigo-400"
      >
        {skill.name}
      </Link>

      <a
        href={skill.repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-0.5 block truncate text-xs text-gray-400 transition-colors hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-500"
      >
        {skill.repoUrl}
      </a>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        {skill.description || skill.content || "説明なし"}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          {skill.stars.toLocaleString()}
        </span>
        <span>更新: {formatDate(skill.updatedAt)}</span>

        {tools.map((tool) => (
          <span
            key={tool}
            className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400"
          >
            {tool}
          </span>
        ))}

        {skill.categories.map((cat) => (
          <span
            key={cat}
            className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
          >
            {cat}
          </span>
        ))}

        {skill.language === "ja" && (
          <span className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400">
            日本語
          </span>
        )}
        {skill.language === "en" && (
          <span className="rounded border border-sky-200 bg-sky-50 px-2 py-0.5 text-sky-600 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-400">
            English
          </span>
        )}
      </div>

      {skill.installCommand && (
        <div className="mt-3">
          <CopyButton command={skill.installCommand} />
        </div>
      )}
    </article>
  );
}
