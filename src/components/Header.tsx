"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useLanguage, type Lang } from "@/context/LanguageContext";
import { useTheme } from "@/lib/theme-context";
import HamburgerPanel from "./HamburgerPanel";

const T = {
  ja: { home: "ホーム", categories: "カテゴリ", submit: "出品する", langLabel: "言語", themeLabel: "テーマ", light: "ライト", dark: "ダーク" },
  en: { home: "Home", categories: "Categories", submit: "Submit", langLabel: "Language", themeLabel: "Theme", light: "Light", dark: "Dark" },
  zh: { home: "首页", categories: "分类", submit: "提交", langLabel: "语言", themeLabel: "主题", light: "浅色", dark: "深色" },
} as const;

const LANG_NAMES: Record<Lang, string> = { ja: "日本語", en: "English", zh: "中文" };

export default function Header() {
  const { lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
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

  return (
    <>
      <header className="border-b border-gray-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-[#0a0a0a] sm:px-6">
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

          <nav className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 sm:gap-6">
            <Link href="/" className="hidden transition-colors hover:text-gray-900 dark:hover:text-white md:block">{t.home}</Link>
            <Link href="/categories" className="hidden transition-colors hover:text-gray-900 dark:hover:text-white md:block">{t.categories}</Link>
            <Link
              href="/submit"
              className="hidden rounded-full border border-indigo-500 px-4 py-1.5 text-indigo-500 transition-colors hover:bg-indigo-500 hover:text-white dark:text-indigo-400 sm:block"
            >
              {t.submit}
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
          </nav>
        </div>
      </header>

      <HamburgerPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}
