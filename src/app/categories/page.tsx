import { getCategoryStats, getAllSkills } from "@/lib/search";
import CategoryDisplay from "./CategoryDisplay";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "カテゴリ — Skills Research",
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
