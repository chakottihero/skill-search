import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "スキルを出品する — Skills Research",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-3xl dark:bg-indigo-500/10">
        🚀
      </div>
      <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">スキルを出品する</h1>
      <p className="mb-2 text-lg text-gray-500 dark:text-gray-400">現在準備中です。近日公開予定。</p>
      <p className="mb-12 text-sm text-gray-400 dark:text-gray-600">
        公開通知を受け取るにはメールアドレスを登録してください。
      </p>

      <form className="mb-10 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          placeholder="your@email.com"
          className="flex-1 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
        />
        <button
          type="button"
          className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
        >
          通知を受け取る
        </button>
      </form>

      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        ホームへ戻る
      </Link>
    </div>
  );
}
