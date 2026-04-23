export function detectLanguage(text: string): "ja" | "zh" | "en" | "other" {
  const jaRegex = /[぀-ゟ゠-ヿ]/;
  const zhRegex = /[一-鿿]/;
  if (jaRegex.test(text)) return "ja";
  if (zhRegex.test(text) && !jaRegex.test(text)) return "zh";
  if (/^[\x00-\x7F\s]+$/.test(text)) return "en";
  return "other";
}

export function getCacheKey(text: string, targetLang: string): string {
  return `translate_${targetLang}_${text.slice(0, 50)}`;
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  const langMap: Record<string, string> = { ja: "ja", en: "en", zh: "zh-CN" };
  const tl = langMap[targetLang] || targetLang;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data[0] as any[][]).map((item) => item[0]).join("");
  } catch (error) {
    console.error("Translation failed:", error);
    return text;
  }
}
