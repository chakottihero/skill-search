import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AIエージェントスキルとは",
  description: "SKILL.mdとは何か、Claude Code・Cursor・Copilotなど対応AIツールの概要と使い方を解説します。",
  openGraph: {
    title: "AIエージェントスキルとは — AI Skill Search",
    description: "SKILL.mdとは何か、Claude Code・Cursor・Copilotなど対応AIツールの概要と使い方を解説します。",
  },
};

const TOOLS = [
  { name: "Claude Code", desc: "Anthropic の AIコーディングアシスタント", color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30" },
  { name: "Cursor", desc: "AI搭載コードエディタ", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30" },
  { name: "Codex", desc: "OpenAI のコーディングモデル", color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30" },
  { name: "Copilot", desc: "GitHub の AI ペアプログラマー", color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        ホームに戻る
      </Link>

      <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
        AIエージェントスキルとは
      </h1>
      <p className="mb-10 text-gray-500 dark:text-gray-400">
        Skills（SKILL.md）の仕組みと使い方
      </p>

      {/* Section 1 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          SKILL.md の仕組み
        </h2>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
          <p className="mb-4 leading-relaxed text-gray-600 dark:text-gray-300">
            <strong className="text-gray-900 dark:text-white">SKILL.md</strong> は、AIエージェントに特定の能力を追加するための Markdown 形式の設定ファイルです。
            リポジトリの <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-indigo-600 dark:bg-white/10 dark:text-indigo-300">.claude/skills/</code> や
            <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-indigo-600 dark:bg-white/10 dark:text-indigo-300">.cursor/skills/</code> などのディレクトリに配置します。
          </p>
          <p className="leading-relaxed text-gray-600 dark:text-gray-300">
            ファイルの先頭にはYAMLフロントマターで <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-indigo-600 dark:bg-white/10 dark:text-indigo-300">name</code> と
            <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-indigo-600 dark:bg-white/10 dark:text-indigo-300">description</code> を記述し、
            本文にスキルの詳細な指示を書きます。
          </p>
        </div>

        <pre className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-sm text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
{`---
name: コードレビュー
description: プルリクエストを詳細にレビューします
---

## 役割
あなたは経験豊富なシニアエンジニアです。
コードの品質、パフォーマンス、セキュリティの
観点からレビューを行ってください。`}
        </pre>
      </section>

      {/* Section 2 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          対応ツール
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {TOOLS.map(({ name, desc, color }) => (
            <div
              key={name}
              className={`rounded-lg border px-4 py-3 ${color}`}
            >
              <div className="font-semibold">{name}</div>
              <div className="mt-0.5 text-sm opacity-80">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          インストール方法
        </h2>
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/5">
            <h3 className="mb-2 font-medium text-gray-900 dark:text-white">1. スキルを検索して選ぶ</h3>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Skills Research でキーワード検索し、目的に合ったスキルを見つけます。
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/5">
            <h3 className="mb-2 font-medium text-gray-900 dark:text-white">2. インストールコマンドを実行</h3>
            <p className="mb-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              スキルカードに表示されているコマンドをターミナルで実行します。
            </p>
            <pre className="rounded-lg bg-gray-100 p-3 font-mono text-xs text-gray-700 dark:bg-white/10 dark:text-gray-300">
              claude skills install &lt;skill-name&gt;
            </pre>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/5">
            <h3 className="mb-2 font-medium text-gray-900 dark:text-white">3. AIに指示を出す</h3>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              インストール後、対応するAIエージェントでスキル名を呼び出すだけで機能を使えます。
            </p>
          </div>
        </div>
      </section>

      <div className="flex gap-4">
        <Link
          href="/"
          className="rounded-full bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
        >
          スキルを検索する
        </Link>
        <Link
          href="/categories"
          className="rounded-full border border-gray-200 px-6 py-2.5 text-sm text-gray-500 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
        >
          カテゴリを見る
        </Link>
      </div>
    </div>
  );
}
