import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text, targetLang } = await req.json();
  // Future: integrate Google Translate API or similar
  // For now, return the original text as-is
  return NextResponse.json({ translatedText: text, targetLang });
}
