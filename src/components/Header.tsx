"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage, type Lang } from "@/context/LanguageContext";
import { useTheme } from "@/lib/theme-context";
import HamburgerPanel from "./HamburgerPanel";

const T = {
  ja: { home: "ホーム", search: "検索", categories: "カテゴリ", submit: "出品・販売", submitShort: "出品・販売", themeLabel: "テーマ", light: "ライト", dark: "ダーク" },
  en: { home: "Home", search: "Search", categories: "Categories", submit: "Sell Skills", submitShort: "Sell", themeLabel: "Theme", light: "Light", dark: "Dark" },
  zh: { home: "首页", search: "搜索", categories: "分类", submit: "出售技能", submitShort: "出售", themeLabel: "主题", light: "浅色", dark: "深色" },
} as const;

const LANG_NAMES: Record<Lang, string> = { ja: "日本語", en: "English", zh: "中文" };
const LANG_SHORT: Record<Lang, string> = { ja: "JA", en: "EN", zh: "ZH" };

export default function Header() {
  const { lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const t = T[lang];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const open = () => setPanelOpen(true);
    const close = () => setPanelOpen(false);
    window.addEventListener("tutorial:open-sidebar", open);
    window.addEventListener("tutorial:close-sidebar", close);
    return () => {
      window.removeEventListener("tutorial:open-sidebar", open);
      window.removeEventListener("tutorial:close-sidebar", close);
    };
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
        {/* Row 1: ☰ | Logo | Lang + ⚙ */}
        <div className="border-b border-gray-100 px-4 py-4 dark:border-white/5 sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <button
              id="tutorial-hamburger"
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

            <div className="flex items-center gap-2">
              {/* Language switcher */}
              <div ref={langRef} className="relative">
                <button
                  id="tutorial-language"
                  onClick={() => { setLangOpen((v) => !v); setSettingsOpen(false); }}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 bg-transparent px-2 py-1 text-sm text-gray-600 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-white/15 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                >
                  <span className="hidden sm:inline">🌐 {LANG_NAMES[lang]}</span>
                  <span className="sm:hidden">🌐 {LANG_SHORT[lang]}</span>
                  <span className="text-xs text-gray-400">▾</span>
                </button>

                {langOpen && (
                  <div className="absolute right-0 top-10 z-50 w-36 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1a1a1a]">
                    {(["ja", "en", "zh"] as Lang[]).map((l) => (
                      <button
                        key={l}
                        onClick={() => { setLang(l); setLangOpen(false); }}
                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${lang === l ? "font-medium text-indigo-600 dark:text-indigo-400" : "text-gray-600 dark:text-gray-300"}`}
                      >
                        {lang === l && <span className="text-xs">✓</span>}
                        {lang !== l && <span className="w-3" />}
                        {LANG_NAMES[l]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme settings */}
              <div ref={settingsRef} className="relative">
                <button
                  onClick={() => { setSettingsOpen((v) => !v); setLangOpen(false); }}
                  className="text-2xl text-gray-400 transition-colors hover:text-gray-900 dark:text-gray-500 dark:hover:text-white"
                  aria-label="設定"
                >
                  ⚙
                </button>

                {settingsOpen && (
                  <div className="absolute right-0 top-10 z-50 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1a1a1a]">
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Nav links */}
        <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-800 sm:px-6">
          <div className="mx-auto flex max-w-6xl justify-center">
            {/* PC: gap-8 text-sm */}
            <nav id="tutorial-nav" className="hidden items-center gap-8 md:flex">
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
