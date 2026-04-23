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
