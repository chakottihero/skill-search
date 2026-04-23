import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "スキルサーチ",
  description: "AIエージェントスキルを検索するプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body
        className={`${notoSansJP.className} min-h-full flex flex-col bg-[#0a0a0a] text-white antialiased`}
      >
        <header className="border-b border-white/10 px-6 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <Link href="/" className="text-xl font-bold text-green-400 tracking-tight">
              スキルサーチ
            </Link>
            <nav className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/" className="hover:text-white transition-colors">
                ホーム
              </Link>
              <Link href="/categories" className="hover:text-white transition-colors">
                カテゴリ
              </Link>
              <Link
                href="/submit"
                className="rounded-full border border-green-500 px-4 py-1.5 text-green-400 hover:bg-green-500 hover:text-black transition-colors"
              >
                出品する
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-white/10 px-6 py-6 text-center text-sm text-gray-600">
          © 2026 スキルサーチ. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
