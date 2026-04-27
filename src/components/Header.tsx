"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage, type Lang } from "@/context/LanguageContext";
import { useTheme } from "@/lib/theme-context";
import HamburgerPanel from "./HamburgerPanel";

const T = {
  ja: { home: "ホーム", search: "検索", categories: "カテゴリ", submit: "出品・販売", submitShort: "出品・販売", langLabel: "言語", themeLabel: "テーマ", light: "ライト", dark: "ダーク", market: "🛒 売買" },
  en: { home: "Home", search: "Search", categories: "Categories", submit: "Submit", submitShort: "Submit", langLabel: "Language", themeLabel: "Theme", light: "Light", dark: "Dark", market: "🛒 Market" },
  zh: { home: "首页", search: "搜索", categories: "分类", submit: "提交", submitShort: "提交", langLabel: "语言", themeLabel: "主题", light: "浅色", dark: "深色", market: "🛒 市场" },
} as const;

const LANG_NAMES: Record<Lang, string> = { ja: "日本語", en: "English", zh: "中文" };

export default function Header() {
  const { lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const t = T[lang];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navItems = [
    { href: "/", full: t.home, short: t.home },
    { href: "/search", full: t.search, short: t.search },
    { href: "/categories", full: t.categories, short: t.categories },
  ];

  return (
    <>
      <header className="bg-white dark:bg-[#0a0a0a]">
        {/* Row 1: ☰ | Logo | ⚙ */}
        <div className="border-b border-gray-100 px-4 py-4 dark:border-white/5 sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <button
              onClick={() => setPanelOpen(true)}
              className="flex-shrink-0 text-2xl text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              aria-label="メニュー"
            >
              ☰
            </button>

            <Link
              href="/"
              className="font-orbitron whitespace-nowrap text-lg font-bold text-indigo-600 tracking-tight dark:text-indigo-400 sm:text-xl"
            >
              Skills リサーチ
            </Link>

            <div ref={settingsRef} className="relative">
              <button
                onClick={() => setSettingsOpen((v) => !v)}
                className="text-2xl text-gray-400 transition-colors hover:text-gray-900 dark:text-gray-500 dark:hover:text-white"
                aria-label="設定"
              >
                ⚙
              </button>

              {settingsOpen && (
                <div className="absolute right-0 top-10 z-50 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1a1a1a]">
                  <div className="border-b border-gray-100 px-3 py-2 text-xs font-medium text-gray-400 dark:border-white/10 dark:text-gray-500">
                    {t.themeLabel}
                  </div>
                  <div className="flex gap-2 p-2">
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${theme === "light" ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5"}`}
                    >
                      ☀ {t.light}
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${theme === "dark" ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5"}`}
                    >
                      🌙 {t.dark}
                    </button>
                  </div>

                  <div className="border-t border-gray-100 px-3 py-2 text-xs font-medium text-gray-400 dark:border-white/10 dark:text-gray-500">
                    {t.langLabel}
                  </div>
                  {(["ja", "en", "zh"] as Lang[]).map((l) => (
                    <label
                      key={l}
                      className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <input
                        type="radio"
                        name="language"
                        checked={lang === l}
                        onChange={() => setLang(l)}
                        className="accent-indigo-500"
                      />
                      <span className={`text-sm ${lang === l ? "text-indigo-600 dark:text-indigo-400" : "text-gray-600 dark:text-gray-300"}`}>
                        {LANG_NAMES[l]}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Nav links */}
        <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-800 sm:px-6">
          <div className="mx-auto flex max-w-6xl justify-center">
            {/* PC: gap-8 text-sm */}
            <nav className="hidden items-center gap-8 md:flex">
              {navItems.map(({ href, full }) => (
                <Link
                  key={href}
                  href={href}
                  className={`py-2 text-sm transition-colors hover:text-indigo-400 ${isActive(href) ? "font-medium text-indigo-400" : "text-gray-400"}`}
                >
                  {full}
                </Link>
              ))}
              <a
                href="https://skills-market-seven.vercel.app"
                className="py-2 text-sm transition-colors hover:text-indigo-400 text-gray-400"
              >
                {t.submit}
              </a>
            </nav>
            {/* Mobile: gap-6 text-xs */}
            <nav className="flex items-center gap-6 md:hidden">
              {navItems.map(({ href, short }) => (
                <Link
                  key={href}
                  href={href}
                  className={`py-2 text-xs transition-colors hover:text-indigo-400 ${isActive(href) ? "font-medium text-indigo-400" : "text-gray-400"}`}
                >
                  {short}
                </Link>
              ))}
              <a
                href="https://skills-market-seven.vercel.app"
                className="py-2 text-xs transition-colors hover:text-indigo-400 text-gray-400"
              >
                {t.submitShort}
              </a>
            </nav>
          </div>
        </div>
      </header>

      <HamburgerPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}
