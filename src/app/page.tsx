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
    tagline: "AIエージェントスキルを検索",
    placeholder: "スキルを検索...",
    searchBtn: "スキル検索",
    luckyBtn: "おまかせ検索",
  },
  en: {
    tagline: "Search AI agent skills",
    placeholder: "Search skills...",
    searchBtn: "Search Skills",
    luckyBtn: "I'm Feeling Lucky",
  },
  zh: {
    tagline: "搜索AI智能体技能",
    placeholder: "搜索技能...",
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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-7xl font-bold text-green-400 tracking-tight mb-4">
            スキルサーチ
          </h1>
          <p className="text-gray-400 text-lg">{t.tagline}</p>
        </div>

        <form onSubmit={handleSearch} className="w-full flex flex-col items-center gap-5">
          <div className="relative w-full">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
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
              placeholder={t.placeholder}
              className="w-full h-14 rounded-full border border-white/10 bg-white/5 pl-14 pr-6 text-base text-white placeholder-gray-500 outline-none transition-all hover:border-white/20 hover:bg-white/[0.07] focus:border-green-500/40 focus:bg-white/[0.07] focus:shadow-[0_4px_24px_rgba(16,185,129,0.12)]"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm text-gray-300 hover:border-white/30 hover:bg-white/10 hover:text-white transition-all"
            >
              {t.searchBtn}
            </button>
            <button
              type="button"
              onClick={handleLucky}
              className="rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm text-gray-300 hover:border-white/30 hover:bg-white/10 hover:text-white transition-all"
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
              className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-gray-300 hover:border-green-500/50 hover:text-green-400 transition-colors cursor-pointer"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
