"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "コードレビュー",
  "自動化",
  "テスト",
  "ドキュメント",
  "Git・PR",
  "デバッグ",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleCategory = (category: string) => {
    router.push(`/search?q=${encodeURIComponent(category)}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-green-400 tracking-tight mb-3">
            スキルサーチ
          </h1>
          <p className="text-gray-400 text-lg">AIエージェントスキルを検索</p>
        </div>

        <form onSubmit={handleSearch} className="w-full">
          <div className="relative flex items-center">
            <span className="absolute left-4 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="スキルを検索..."
              className="w-full rounded-full bg-white/5 border border-white/10 pl-12 pr-14 py-4 text-base text-white placeholder-gray-500 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 rounded-full bg-green-500 hover:bg-green-400 transition-colors px-4 py-2 text-sm font-medium text-black"
            >
              検索
            </button>
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-gray-300 hover:border-green-500 hover:text-green-400 transition-colors cursor-pointer"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
