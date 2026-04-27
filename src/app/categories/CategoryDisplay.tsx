"use client";

import { useState } from "react";
import Link from "next/link";
import type { CategoryStat } from "@/lib/search";

const MARKET_CATEGORY: Record<string, string> = {
  "開発ツール": "dev-tools",
  "Web開発": "web-dev",
  "データ・分析": "data-analytics",
  "DevOps": "devops",
  "AI・機械学習": "ai-ml",
  "ドキュメント": "docs",
  "ビジネス・業務": "business",
  "ユーティリティ": "utility",
  "セキュリティ": "security",
  "クリエイティブ": "creative",
  "学習・教育": "education",
  "モバイル": "mobile",
  "言語・フレームワーク": "lang-framework",
  "法律・コンプライアンス": "legal",
  "金融・経済": "finance",
  "医療・ヘルスケア": "medical",
  "化学・生命科学": "bio-science",
  "数学・物理": "math-physics",
  "その他": "other",
};

export default function CategoryDisplay({
  stats,
  totalSkills,
}: {
  stats: CategoryStat[];
  totalSkills: number;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (stats.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400 dark:text-gray-500">
        <p>カテゴリデータがありません。</p>
        <code className="mt-4 inline-block rounded border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-indigo-400">
          npm run categorize
        </code>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">カテゴリ</h1>
        <p className="mt-2 text-gray-400 dark:text-gray-500">
          {stats.length} カテゴリ・{totalSkills.toLocaleString()} 件のスキル
        </p>
      </div>

      <div className="space-y-2">
        {stats.map((cat) => (
          <div
            key={cat.name}
            className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10"
          >
            <div className="flex w-full items-center bg-gray-50 dark:bg-white/5">
              <button
                onClick={() => setExpanded(expanded === cat.name ? null : cat.name)}
                className="flex flex-1 items-center justify-between px-5 py-4 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-500/5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">{cat.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 dark:text-white">{cat.name}</div>
                    <div className="text-sm text-gray-400 dark:text-gray-500">
                      {cat.count.toLocaleString()} 件 · {cat.subcategories.length} サブカテゴリ
                    </div>
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 text-gray-400 transition-transform ${expanded === cat.name ? "rotate-90" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {MARKET_CATEGORY[cat.name] && (
                <a
                  href={`https://skills-market-seven.vercel.app/skills?category=${MARKET_CATEGORY[cat.name]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 px-4 py-1.5 mr-3 rounded-lg border border-purple-200 text-xs text-purple-600 transition-colors hover:bg-purple-50 dark:border-purple-500/30 dark:text-purple-400 dark:hover:bg-purple-500/10 whitespace-nowrap"
                >
                  売買 →
                </a>
              )}
            </div>

            {expanded === cat.name && (
              <div className="grid gap-1 bg-white p-3 sm:grid-cols-2 lg:grid-cols-3 dark:bg-gray-900/30">
                {cat.subcategories.map((sub) => (
                  <Link
                    key={sub.name}
                    href={`/search?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub.name)}`}
                    className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                  >
                    <span className="text-gray-700 dark:text-gray-300">{sub.name}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {sub.count.toLocaleString()}
                    </span>
                  </Link>
                ))}
                <Link
                  href={`/search?category=${encodeURIComponent(cat.name)}`}
                  className="flex items-center justify-between rounded-lg bg-indigo-50/50 px-4 py-2.5 text-sm text-indigo-500 transition-colors hover:bg-indigo-50 dark:bg-indigo-500/5 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                >
                  <span>すべて表示</span>
                  <span className="text-xs">{cat.count.toLocaleString()}</span>
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/search"
          className="text-sm text-gray-400 transition-colors hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400"
        >
          すべてのスキルを表示 →
        </Link>
      </div>
    </>
  );
}
