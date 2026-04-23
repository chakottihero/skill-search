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

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

async function translateSingle(text: string, tl: string): Promise<string> {
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

export async function translateText(text: string, targetLang: string): Promise<string> {
  const langMap: Record<string, string> = { ja: "ja", en: "en", zh: "zh-CN" };
  return translateSingle(text, langMap[targetLang] || targetLang);
}

export async function translateLongText(
  text: string,
  targetLang: string,
  onProgress?: (current: number, total: number) => void
): Promise<string> {
  const langMap: Record<string, string> = { ja: "ja", en: "en", zh: "zh-CN" };
  const tl = langMap[targetLang] || targetLang;

  const paragraphs = text.split(/\n\n+/);
  const translatedParts: string[] = [];
  const total = paragraphs.length;

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    const trimmed = paragraph.trim();

    if (!trimmed) {
      translatedParts.push("");
      onProgress?.(i + 1, total);
      continue;
    }

    // Code blocks: preserve as-is
    if (trimmed.startsWith("```")) {
      translatedParts.push(trimmed);
      onProgress?.(i + 1, total);
      continue;
    }

    // Shell/code-like lines: preserve
    if (
      /^[\s]*[`$#>]/.test(trimmed) ||
      /^[\s]*(import |from |const |let |var |function |class |def |if |for |while |return )/.test(trimmed)
    ) {
      translatedParts.push(trimmed);
      onProgress?.(i + 1, total);
      continue;
    }

    // Tables: preserve
    if (trimmed.startsWith("|")) {
      translatedParts.push(trimmed);
      onProgress?.(i + 1, total);
      continue;
    }

    // Bare URLs: preserve
    if (/^https?:\/\//.test(trimmed)) {
      translatedParts.push(trimmed);
      onProgress?.(i + 1, total);
      continue;
    }

    // Markdown headings: translate the text, keep the # prefix
    const headingMatch = trimmed.match(/^(#{1,6}\s+)(.*)/);
    if (headingMatch) {
      const prefix = headingMatch[1];
      const headingText = headingMatch[2];
      const cacheKey = `tr_${tl}_${simpleHash(headingText)}`;
      const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
      if (cached) {
        translatedParts.push(prefix + cached);
      } else {
        const translated = await translateSingle(headingText, tl);
        if (typeof window !== "undefined") localStorage.setItem(cacheKey, translated);
        translatedParts.push(prefix + translated);
      }
      onProgress?.(i + 1, total);
      await new Promise((r) => setTimeout(r, 100));
      continue;
    }

    // Regular text ≤ 4000 chars
    if (trimmed.length <= 4000) {
      const cacheKey = `tr_${tl}_${simpleHash(trimmed)}`;
      const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
      if (cached) {
        translatedParts.push(cached);
      } else {
        const translated = await translateSingle(trimmed, tl);
        if (typeof window !== "undefined") localStorage.setItem(cacheKey, translated);
        translatedParts.push(translated);
        await new Promise((r) => setTimeout(r, 100));
      }
    } else {
      // Split long text into sentence-level chunks
      const sentences = trimmed.match(/[^。！？.!?\n]+[。！？.!?\n]?/g) ?? [trimmed];
      let chunk = "";
      const chunks: string[] = [];
      for (const s of sentences) {
        if ((chunk + s).length > 4000) {
          if (chunk) chunks.push(chunk);
          chunk = s;
        } else {
          chunk += s;
        }
      }
      if (chunk) chunks.push(chunk);

      const translatedChunks: string[] = [];
      for (const c of chunks) {
        const cacheKey = `tr_${tl}_${simpleHash(c)}`;
        const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
        if (cached) {
          translatedChunks.push(cached);
        } else {
          const translated = await translateSingle(c, tl);
          if (typeof window !== "undefined") localStorage.setItem(cacheKey, translated);
          translatedChunks.push(translated);
          await new Promise((r) => setTimeout(r, 100));
        }
      }
      translatedParts.push(translatedChunks.join(""));
    }

    onProgress?.(i + 1, total);
  }

  return translatedParts.join("\n\n");
}
