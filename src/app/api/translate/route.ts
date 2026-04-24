import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang } = await req.json();

    if (!text || !targetLang) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const langMap: Record<string, string> = { ja: "ja", en: "en", zh: "zh-CN" };
    const tl = langMap[targetLang] || targetLang;

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${tl}&dt=t&q=${encodeURIComponent(text.slice(0, 1500))}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Google Translate returned ${response.status}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await response.json()) as any[][];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const translated = (data[0] as any[][])
      .map((item) => item[0])
      .filter(Boolean)
      .join("");

    return NextResponse.json({ translated });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
