"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

const CATEGORIES = {
  ja: ["コードレビュー", "自動化", "テスト", "ドキュメント", "Git・PR", "デバッグ"],
  en: ["code review", "automation", "testing", "documentation", "git", "debugging"],
  zh: ["代码审查", "自动化", "测试", "文档", "git", "调试"],
};

const T = {
  ja: {
    placeholder: "Search skills...",
    searchBtn: "スキル検索",
    luckyBtn: "おまかせ検索",
  },
  en: {
    placeholder: "Search skills...",
    searchBtn: "Search Skills",
    luckyBtn: "I'm Feeling Lucky",
  },
  zh: {
    placeholder: "Search skills...",
    searchBtn: "搜索技能",
    luckyBtn: "手气不错",
  },
};

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { lang } = useLanguage();
  const t = T[lang];
  const categories = CATEGORIES[lang];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleLucky = () => {
    router.push(`/search?q=${encodeURIComponent(query.trim() || "claude")}&sort=stars`);
  };

  const handleCategory = (cat: string) => {
    setQuery((prev) => (prev.trim() ? `${prev.trim()} ${cat}` : cat));
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="font-orbitron whitespace-nowrap text-3xl font-bold text-indigo-600 tracking-tight dark:text-indigo-400 sm:text-4xl md:text-5xl lg:text-6xl">
            Skills リサーチ
          </h1>
          <p className="mt-3 text-sm text-gray-400 tracking-[0.2em] sm:text-base">
            Skills Research
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full flex-col items-center gap-5">
          <div className="relative w-full">
            <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.placeholder}
              className="h-14 w-full rounded-full border border-gray-300 bg-white pl-14 pr-6 text-base text-gray-900 placeholder-gray-400 outline-none transition-all hover:border-gray-400 focus:border-indigo-400 focus:shadow-[0_4px_24px_rgba(99,102,241,0.15)] dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:hover:border-white/20 dark:focus:border-indigo-500/40 dark:focus:shadow-[0_4px_24px_rgba(99,102,241,0.1)]"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-full border border-gray-300 bg-gray-50 px-6 py-2.5 text-sm text-gray-600 transition-all hover:border-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:border-white/15 dark:bg-white/5 dark:text-gray-300 dark:hover:border-white/30 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {t.searchBtn}
            </button>
            <button
              type="button"
              onClick={handleLucky}
              className="rounded-full border border-gray-300 bg-gray-50 px-6 py-2.5 text-sm text-gray-600 transition-all hover:border-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:border-white/15 dark:bg-white/5 dark:text-gray-300 dark:hover:border-white/30 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {t.luckyBtn}
            </button>
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategory(cat)}
              className="cursor-pointer rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm text-gray-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-indigo-500/50 dark:hover:text-indigo-400"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
