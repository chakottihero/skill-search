import Link from "next/link";
import { getAllCategories } from "@/lib/search";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "カテゴリ — スキルサーチ",
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
        <h1 className="text-3xl font-bold text-white">カテゴリ</h1>
        <p className="mt-2 text-gray-500">
          {categories.length} カテゴリ・{total.toLocaleString()} 件のタグ付きスキル
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          <p>カテゴリデータがありません。</p>
          <code className="mt-4 inline-block rounded border border-white/10 bg-white/5 px-4 py-2 text-sm text-green-400">
            npm run crawl
          </code>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ name, count }) => (
            <Link
              key={name}
              href={`/search?q=${encodeURIComponent(name)}`}
              className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 transition-all hover:border-green-500/50 hover:bg-green-500/5"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {CATEGORY_ICONS[name] ?? "📦"}
                </span>
                <div>
                  <div className="font-medium text-white group-hover:text-green-400 transition-colors">
                    {name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {count.toLocaleString()} 件
                  </div>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-600 group-hover:text-green-500 transition-colors"
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

      {/* All skills link */}
      <div className="mt-10 text-center">
        <Link
          href="/search?q="
          className="text-sm text-gray-500 hover:text-green-400 transition-colors"
        >
          すべてのスキルを表示 →
        </Link>
      </div>
    </div>
  );
}
