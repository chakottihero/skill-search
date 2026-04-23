"use client";
import Link from "next/link";
import { useEffect } from "react";

const NAV_ITEMS = [
  { icon: "🏠", label: "ホーム", desc: "スキルを検索", href: "/" },
  { icon: "🔍", label: "検索", desc: "キーワードで探す", href: "/search" },
  { icon: "📂", label: "カテゴリ", desc: "分野別に探す", href: "/categories" },
  { icon: "📤", label: "出品する", desc: "スキルを公開", href: "/submit" },
];

export default function HamburgerPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <div
        className={`fixed left-0 top-0 z-50 flex h-full w-80 flex-col border-r border-gray-200 bg-white shadow-2xl transition-transform duration-300 dark:border-white/10 dark:bg-[#111] ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
          <span className="font-orbitron text-lg font-bold text-indigo-600 dark:text-indigo-400">
            Skills Research
          </span>
          <button
            onClick={onClose}
            className="text-xl text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto px-5 py-6">
          {/* About section */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Skillsとは？
            </h2>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">AIエージェントスキルとは</h3>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Skills（SKILL.md）は、AIエージェント（Claude Code、Cursor、Codexなど）に特定の能力を追加するための設定ファイルです。プログラマーが作成したスキルをインストールすることで、AIがコードレビュー、テスト作成、ドキュメント生成などを自動で行えるようになります。
            </p>
            <Link
              href="/about"
              onClick={onClose}
              className="mt-2 inline-block text-sm text-indigo-500 hover:underline dark:text-indigo-400"
            >
              詳しく見る →
            </Link>
          </section>

          {/* Navigation */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              ナビゲーション
            </h2>
            <ul className="space-y-1">
              {NAV_ITEMS.map(({ icon, label, desc, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    <span className="text-xl">{icon}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-700 transition-colors group-hover:text-indigo-600 dark:text-gray-200 dark:group-hover:text-indigo-400">
                        {label}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{desc}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Links */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              リンク
            </h2>
            <ul className="space-y-1">
              <li>
                <a
                  href="https://github.com/chakottihero/skill-search"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  <span className="text-base">⭐</span>
                  GitHub リポジトリ
                </a>
              </li>
              <li>
                <Link
                  href="/submit"
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  <span className="text-base">✉</span>
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
