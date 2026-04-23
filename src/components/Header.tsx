"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useLanguage, type Lang } from "@/context/LanguageContext";

const T = {
  ja: { home: "ホーム", categories: "カテゴリ", submit: "出品する", langLabel: "言語" },
  en: { home: "Home", categories: "Categories", submit: "Submit", langLabel: "Language" },
  zh: { home: "首页", categories: "分类", submit: "提交", langLabel: "语言" },
} as const;

const LANG_NAMES: Record<Lang, string> = { ja: "日本語", en: "English", zh: "中文" };

export default function Header() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const t = T[lang];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="border-b border-white/10 px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-xl font-bold text-green-400 tracking-tight">
          スキルサーチ
        </Link>
        <nav className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">{t.home}</Link>
          <Link href="/categories" className="hover:text-white transition-colors">{t.categories}</Link>
          <Link
            href="/submit"
            className="rounded-full border border-green-500 px-4 py-1.5 text-green-400 hover:bg-green-500 hover:text-black transition-colors"
          >
            {t.submit}
          </Link>
          <div ref={ref} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="rounded-full p-1.5 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label={t.langLabel}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            {open && (
              <div className="absolute right-0 top-9 z-50 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] shadow-2xl">
                <div className="border-b border-white/10 px-3 py-2 text-xs text-gray-500">
                  {t.langLabel}
                </div>
                {(["ja", "en", "zh"] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setOpen(false); }}
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/5 ${lang === l ? "text-green-400" : "text-gray-300"}`}
                  >
                    {LANG_NAMES[l]}
                    {lang === l && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
