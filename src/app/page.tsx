"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import type { CategoryStat } from "@/lib/search";
import type { Skill } from "@/lib/types";

const T = {
  ja: {
    placeholder: "Search skills...",
    searchBtn: "スキル検索",
    luckyBtn: "おまかせ検索",
    popularCats: "人気カテゴリ",
    recentSkills: "最近追加されたスキル",
    totalLabel: "件のスキル",
    viewAll: "すべて表示 →",
    viewCategories: "カテゴリ一覧 →",
    marketBanner: "スキルを売買しませんか？",
    marketSub: "Skills Market で出品・購入",
    marketCta: "マーケットへ →",
  },
  en: {
    placeholder: "Search skills...",
    searchBtn: "Search Skills",
    luckyBtn: "I'm Feeling Lucky",
    popularCats: "Popular Categories",
    recentSkills: "Recently Added",
    totalLabel: "skills indexed",
    viewAll: "View all →",
    viewCategories: "Browse categories →",
    marketBanner: "Want to buy or sell skills?",
    marketSub: "List or purchase on Skills Market",
    marketCta: "Go to Market →",
  },
  zh: {
    placeholder: "Search skills...",
    searchBtn: "搜索技能",
    luckyBtn: "手气不错",
    popularCats: "热门分类",
    recentSkills: "最近添加",
    totalLabel: "个技能",
    viewAll: "查看全部 →",
    viewCategories: "浏览分类 →",
    marketBanner: "想要买卖技能？",
    marketSub: "在 Skills Market 上架或购买",
    marketCta: "前往市场 →",
  },
};

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { lang } = useLanguage();
  const t = T[lang];
  const inputRef = useRef<HTMLInputElement>(null);

  const [totalSkills, setTotalSkills] = useState<number | null>(null);
  const [topCategories, setTopCategories] = useState<CategoryStat[]>([]);
  const [recentSkills, setRecentSkills] = useState<Skill[]>([]);

  useEffect(() => {
    fetch("/api/home-stats")
      .then((r) => r.json())
      .then((data: { total: number; categories: CategoryStat[]; recent: Skill[] }) => {
        setTotalSkills(data.total);
        setTopCategories(data.categories.slice(0, 5));
        setRecentSkills(data.recent.slice(0, 10));
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleLucky = () => {
    router.push(`/search?q=${encodeURIComponent(query.trim() || "claude")}&sort=stars`);
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        {/* Logo + total */}
        <div className="text-center">
          <h1 className="whitespace-nowrap leading-none text-indigo-600 dark:text-indigo-400">
            <span className="font-orbitron font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
              Skills{" "}
            </span>
            <span className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              リサーチ
            </span>
          </h1>
          <p className="mt-4 text-base text-gray-400 tracking-[0.2em] sm:text-lg md:text-xl">
            Skills Research
          </p>
          {totalSkills !== null && (
            <p className="mt-3 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {totalSkills.toLocaleString()}{" "}
              <span className="text-base font-normal text-gray-400">{t.totalLabel}</span>
            </p>
          )}
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex w-full flex-col items-center gap-5">
          <div className="relative w-full">
            <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </span>
            <input
              ref={inputRef}
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

        {/* Market banner */}
        <a
          href="https://skills-market-seven.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white transition-opacity hover:opacity-90"
        >
          <div>
            <div className="font-semibold">{t.marketBanner}</div>
            <div className="text-sm text-white/80">{t.marketSub}</div>
          </div>
          <span className="flex-shrink-0 text-sm font-medium">{t.marketCta}</span>
        </a>

        {/* Popular categories */}
        {topCategories.length > 0 && (
          <div className="w-full">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.popularCats}</h2>
              <Link href="/categories" className="text-xs text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400">
                {t.viewCategories}
              </Link>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {topCategories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/search?category=${encodeURIComponent(cat.name)}`}
                  className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 px-2 py-3 text-center transition-all hover:border-indigo-300 hover:bg-indigo-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/5"
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-1">{cat.name}</span>
                  <span className="text-[10px] text-gray-400">{cat.count.toLocaleString()}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recently added */}
        {recentSkills.length > 0 && (
          <div className="w-full">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.recentSkills}</h2>
              <Link href="/search?sort=updatedAt" className="text-xs text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400">
                {t.viewAll}
              </Link>
            </div>
            <div className="space-y-1">
              {recentSkills.slice(0, 5).map((skill) => (
                <Link
                  key={skill.id}
                  href={`/skills/${skill.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <span className="truncate text-sm text-indigo-600 dark:text-indigo-400">{skill.name}</span>
                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    {skill.category && (
                      <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] text-gray-400 dark:border-white/10 dark:bg-white/5">
                        {skill.category}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">★{skill.stars}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
