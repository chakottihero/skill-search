import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/Header";

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
        <LanguageProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/10 px-6 py-6 text-center text-sm text-gray-600">
            © 2026 スキルサーチ. All rights reserved.
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
