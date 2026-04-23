import Link from "next/link";
import { getAllCategories } from "@/lib/search";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "カテゴリ — Skills Research",
};

const CATEGORY_ICONS: Record<string, string> = {
  コードレビュー: "🔍",
  自動化: "⚡",
  テスト: "🧪",
  ドキュメント: "📄",
  "Git・PR": "🌿",
  デバッグ: "🐛",
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();
  const total = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">カテゴリ</h1>
        <p className="mt-2 text-gray-400 dark:text-gray-500">
          {categories.length} カテゴリ・{total.toLocaleString()} 件のタグ付きスキル
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="py-20 text-center text-gray-400 dark:text-gray-500">
          <p>カテゴリデータがありません。</p>
          <code className="mt-4 inline-block rounded border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-indigo-400">
            npm run crawl
          </code>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ name, count }) => (
            <Link
              key={name}
              href={`/search?q=${encodeURIComponent(name)}`}
              className="group flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 transition-all hover:border-indigo-300 hover:bg-indigo-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/5"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {CATEGORY_ICONS[name] ?? "📦"}
                </span>
                <div>
                  <div className="font-medium text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                    {name}
                  </div>
                  <div className="text-sm text-gray-400 dark:text-gray-500">
                    {count.toLocaleString()} 件
                  </div>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-300 transition-colors group-hover:text-indigo-500 dark:text-gray-600 dark:group-hover:text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <Link
          href="/search?q="
          className="text-sm text-gray-400 transition-colors hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400"
        >
          すべてのスキルを表示 →
        </Link>
      </div>
    </div>
  );
}
