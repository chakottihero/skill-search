import Link from "next/link";
import type { Metadata } from "next";
import MarketEmailForm from "@/components/MarketEmailForm";

export const metadata: Metadata = {
  title: "Skills Market — Skills Research",
  description: "AIスキルの出品・販売プラットフォーム",
};

const FEATURES = [
  {
    icon: "🛒",
    title: "購入する",
    desc: "厳選されたAIスキルを即座に入手。すぐに使えるSKILL.mdで作業効率を大幅アップ。",
  },
  {
    icon: "💰",
    title: "販売する",
    desc: "あなたのAIスキルを世界中の開発者に販売。副収入の新しいかたちを。",
  },
  {
    icon: "📂",
    title: "ジャンル別",
    desc: "コードレビュー・テスト・ドキュメントなどカテゴリ別に整理。目的のスキルをすぐ発見。",
  },
  {
    icon: "⭐",
    title: "レビュー",
    desc: "実際に使ったユーザーの評価でスキルの品質を確認。安心して購入できます。",
  },
];

const STEPS = [
  {
    num: "01",
    title: "アカウント作成",
    desc: "メールアドレスで無料登録。数分で完了します。",
  },
  {
    num: "02",
    title: "スキルをアップロード",
    desc: "SKILL.md ファイルと説明文・価格を設定するだけ。",
  },
  {
    num: "03",
    title: "販売開始",
    desc: "審査通過後すぐに公開。購入者に自動配信されます。",
  },
];

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
          </span>
          準備中 — 近日公開
        </div>
        <h1 className="font-orbitron mb-3 text-4xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 sm:text-5xl">
          Skills Market
        </h1>
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
          AIスキルの出品・販売プラットフォーム
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-400 dark:text-gray-500">
          SKILL.md 形式のAIエージェントスキルを売買できるマーケットプレイスを開発中です。<br />
          事前登録いただいた方には優先的にご案内します。
        </p>
      </div>

      {/* Feature cards */}
      <div className="mb-12 grid grid-cols-2 gap-4">
        {FEATURES.map(({ icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/5"
          >
            <div className="mb-2 text-2xl">{icon}</div>
            <div className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">{title}</div>
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{desc}</p>
          </div>
        ))}
      </div>

      {/* Email registration */}
      <div className="mb-14 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-500/20 dark:bg-indigo-500/5">
        <h2 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">
          公開通知を受け取る
        </h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          リリース時にいち早くお知らせします。スパムは送りません。
        </p>
        <MarketEmailForm />
      </div>

      {/* Seller steps */}
      <div className="mb-14">
        <h2 className="mb-6 text-center text-lg font-semibold text-gray-900 dark:text-white">
          出品の流れ
        </h2>
        <ol className="space-y-4">
          {STEPS.map(({ num, title, desc }) => (
            <li key={num} className="flex gap-4">
              <span className="font-orbitron flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                {num}
              </span>
              <div className="pt-1.5">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</div>
                <div className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{desc}</div>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400">
          販売手数料は売上の <strong>10%</strong> のみ。残り90%はそのままあなたの収益になります。
        </p>
      </div>

      {/* Footer link */}
      <div className="border-t border-gray-200 pt-8 text-center dark:border-white/10">
        <Link
          href="/"
          className="text-sm text-indigo-500 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Skills Research で無料スキルを検索する →
        </Link>
      </div>
    </div>
  );
}
