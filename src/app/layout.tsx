import type { Metadata } from "next";
import { Noto_Sans_JP, Orbitron } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/lib/theme-context";
import Header from "@/components/Header";
import ClearCacheButton from "@/components/ClearCacheButton";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "Skills Research - AIエージェントスキル検索",
  description: "AIエージェントスキルを検索するプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`h-full ${orbitron.variable}`}>
      <head>
        {/* Prevent flash of unstyled content on dark mode */}
        <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('skillsearch_theme');if(t!=='light')document.documentElement.classList.add('dark')}catch(e){}` }} />
      </head>
      <body
        className={`${notoSansJP.className} min-h-full flex flex-col bg-white text-gray-900 antialiased dark:bg-[#0a0a0a] dark:text-white`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-gray-200 px-6 py-6 text-center text-sm text-gray-400 dark:border-white/10 dark:text-gray-600">
              <p>© 2026 Skills Research. All rights reserved.</p>
              <p className="mt-2">
                <ClearCacheButton />
              </p>
            </footer>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
