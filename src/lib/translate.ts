export function detectLanguage(text: string): "ja" | "zh" | "en" | "other" {
  const jaRegex = /[぀-ゟ゠-ヿ]/;
  const zhRegex = /[一-鿿]/;
  if (jaRegex.test(text)) return "ja";
  if (zhRegex.test(text) && !jaRegex.test(text)) return "zh";
  if (/^[\x00-\x7F\s]+$/.test(text)) return "en";
  return "other";
}

export function getCacheKey(text: string, targetLang: string): string {
  return `tr2_${targetLang}_${simpleHash(text)}`;
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
  const langReverseMap: Record<string, string> = { ja: "ja", en: "en", "zh-CN": "zh" };
  const targetLang = langReverseMap[tl] || tl;
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang }),
    });
    if (!res.ok) return text;
    const data = await res.json();
    return data.translated ?? text;
  } catch (error) {
    console.error("Translation failed:", error);
    return text;
  }
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  const LIMIT = 1000;
  if (text.length <= LIMIT) return translateSingle(text, targetLang);

  // Split into sentence-level chunks ≤LIMIT chars
  const sentences = text.match(/[^。.!?！？\n]+[。.!?！？\n]*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if ((current + s).length > LIMIT) {
      if (current) chunks.push(current.trim());
      // Single sentence longer than LIMIT: hard-split at char boundary
      if (s.length > LIMIT) {
        for (let i = 0; i < s.length; i += LIMIT) {
          chunks.push(s.slice(i, i + LIMIT).trim());
        }
        current = "";
      } else {
        current = s;
      }
    } else {
      current += s;
    }
  }
  if (current) chunks.push(current.trim());

  const results = await Promise.all(chunks.filter(Boolean).map((c) => translateSingle(c, targetLang)));
  return results.join("");
}

export async function translateLongText(
  text: string,
  targetLang: string,
  onProgress?: (progress: string) => void
): Promise<string> {
  const CONCURRENCY = 5;

  // Protect code blocks from translation
  const codeBlocks: string[] = [];
  const protectedText = text.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_${codeBlocks.length - 1}__`;
  });

  const paragraphs = protectedText.split(/\n\n+/);

  const isSkippable = (p: string) =>
    p.trim() === "" ||
    p.startsWith("__CODE_") ||
    p.startsWith("|") ||
    /^https?:\/\//.test(p);

  const translatableIndices = paragraphs
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => !isSkippable(p))
    .map(({ i }) => i);

  const results: string[] = [...paragraphs];

  for (let i = 0; i < translatableIndices.length; i += CONCURRENCY) {
    const batch = translatableIndices.slice(i, i + CONCURRENCY);
    onProgress?.(
      `(${i + 1}〜${Math.min(i + CONCURRENCY, translatableIndices.length)}/${translatableIndices.length}段落)`
    );

    await Promise.all(
      batch.map(async (idx) => {
        try {
          results[idx] = await translateText(paragraphs[idx], targetLang);
        } catch {
          results[idx] = paragraphs[idx];
        }
      })
    );

    if (i + CONCURRENCY < translatableIndices.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  let result = results.join("\n\n");

  codeBlocks.forEach((block, i) => {
    result = result.replace(`__CODE_${i}__`, block);
  });

  return result;
}
