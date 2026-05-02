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

const SITE_URL = "https://search.aiskill-market.com";
const SITE_NAME = "AI Skill Search";
const OG_TITLE = "AI Skill Search - 74,000+のAIスキルを横断検索";
const OG_DESCRIPTION = "74,000件以上のAIスキルを横断検索できるプラットフォーム";
const DEFAULT_DESCRIPTION = "74,000件以上のAIエージェント向けスキルファイル（SKILL.md）を検索。Claude Code・Cursor・Copilot対応スキルを無料で探せます。";

export const metadata: Metadata = {
  title: { default: `${SITE_NAME} — AIエージェントスキル検索`, template: `%s — ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "ja_JP",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: ["/og-image.png"],
  },
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
