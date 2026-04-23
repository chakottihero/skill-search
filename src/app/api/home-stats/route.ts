import { NextResponse } from "next/server";
import { getCategoryStats, getRecentSkills, getAllSkills } from "@/lib/search";

export const revalidate = 3600;

export async function GET() {
  const [skills, categories, recent] = await Promise.all([
    getAllSkills(),
    getCategoryStats(),
    getRecentSkills(10),
  ]);
  return NextResponse.json({
    total: skills.length,
    categories,
    recent,
  });
}
