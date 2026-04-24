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
  return translateSingle(text, targetLang);
}

export async function translateLongText(
  text: string,
  targetLang: string,
  onProgress?: (progress: string) => void
): Promise<string> {
  const SEPARATOR = "\n\n|||SPLIT|||\n\n";

  // Protect code blocks from translation
  const codeBlocks: string[] = [];
  const textWithPlaceholders = text.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  const paragraphs = textWithPlaceholders.split(/\n\n+/);

  // Classify each paragraph: needs translation or preserve as-is
  const needsTranslation = paragraphs.map((p) => {
    const t = p.trim();
    if (!t) return false;
    if (t.includes("__CODE_BLOCK_")) return false;
    if (t.startsWith("|")) return false;
    if (/^https?:\/\//.test(t)) return false;
    if (/^[\s]*[`$#>]/.test(t)) return false;
    if (/^[\s]*(import |from |const |let |var |function |class |def |if |for |while |return )/.test(t)) return false;
    return true;
  });

  // Pack translatable paragraphs into ≤3500-char batches joined by SEPARATOR
  const batches: { indices: number[]; batchText: string }[] = [];
  let batchIndices: number[] = [];
  let batchLength = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    if (!needsTranslation[i]) continue;
    const len = paragraphs[i].length + SEPARATOR.length;
    if (batchLength + len > 3500 && batchIndices.length > 0) {
      batches.push({ indices: batchIndices, batchText: batchIndices.map((j) => paragraphs[j]).join(SEPARATOR) });
      batchIndices = [];
      batchLength = 0;
    }
    batchIndices.push(i);
    batchLength += len;
  }
  if (batchIndices.length > 0) {
    batches.push({ indices: batchIndices, batchText: batchIndices.map((j) => paragraphs[j]).join(SEPARATOR) });
  }

  // Translate each batch (far fewer requests than per-paragraph)
  const translatedMap: Record<number, string> = {};

  for (let b = 0; b < batches.length; b++) {
    const { indices, batchText } = batches[b];
    onProgress?.(`(${b + 1}/${batches.length}バッチ翻訳中)`);

    try {
      const translated = await translateSingle(batchText, targetLang);
      const parts = translated.split(/\|\|\|SPLIT\|\|\|/);
      indices.forEach((originalIdx, partIdx) => {
        translatedMap[originalIdx] = parts[partIdx]?.trim() ?? paragraphs[originalIdx];
      });
    } catch {
      indices.forEach((originalIdx) => {
        translatedMap[originalIdx] = paragraphs[originalIdx];
      });
    }

    if (b < batches.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // Reassemble paragraphs
  let result = paragraphs
    .map((p, i) => (translatedMap[i] !== undefined ? translatedMap[i] : p))
    .join("\n\n");

  // Restore code blocks
  codeBlocks.forEach((block, i) => {
    result = result.replace(`__CODE_BLOCK_${i}__`, block);
  });

  return result;
}
