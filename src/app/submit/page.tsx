import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "スキルを出品する — スキルサーチ",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-3xl">
        🚀
      </div>
      <h1 className="mb-3 text-3xl font-bold text-white">スキルを出品する</h1>
      <p className="mb-2 text-lg text-gray-400">現在準備中です。近日公開予定。</p>
      <p className="mb-12 text-sm text-gray-600">
        公開通知を受け取るにはメールアドレスを登録してください。
      </p>

      <form className="mb-10 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          placeholder="your@email.com"
          className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500"
        />
        <button
          type="button"
          className="rounded-full bg-green-500 px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-green-400"
        >
          通知を受け取る
        </button>
      </form>

      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-green-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        ホームへ戻る
      </Link>
    </div>
  );
}
