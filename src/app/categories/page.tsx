import { getCategoryStats, getAllSkills } from "@/lib/search";
import CategoryDisplay from "./CategoryDisplay";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "カテゴリ一覧",
  description: "開発ツール・Web開発・AI/ML・データ分析など、カテゴリ別にAIエージェントスキルを探せます。",
  openGraph: {
    title: "カテゴリ一覧 — AI Skill Search",
    description: "開発ツール・Web開発・AI/ML・データ分析など、カテゴリ別にAIエージェントスキルを探せます。",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AI Skill Search" }],
  },
};

export default async function CategoriesPage() {
  const [stats, skills] = await Promise.all([
    getCategoryStats(),
    getAllSkills(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <CategoryDisplay stats={stats} totalSkills={skills.length} />
    </div>
  );
}
