"use client";
import { useState, useEffect } from "react";
import { useLanguage, type Lang } from "@/context/LanguageContext";
import { detectLanguage, getCacheKey } from "@/lib/translate";

const LANG_NAMES: Record<Lang, string> = { ja: "日本語", en: "English", zh: "中文" };

export default function DescriptionToggle({
  description,
  className,
}: {
  description: string;
  className?: string;
}) {
  const { lang } = useLanguage();
  const [showTranslated, setShowTranslated] = useState(true);
  const [translatedText, setTranslatedText] = useState<string | null>(null);

  const detectedLang = detectLanguage(description);
  const needsTranslation = detectedLang !== "other" && detectedLang !== lang;

  useEffect(() => {
    if (!needsTranslation) return;
    const cacheKey = getCacheKey(description, lang);
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setTranslatedText(cached);
      return;
    }
    // Future: fetch("/api/translate", { method: "POST", body: JSON.stringify({ text: description, targetLang: lang }) })
    // For now, store original as placeholder translation
    setTranslatedText(description);
    localStorage.setItem(cacheKey, description);
  }, [description, lang, needsTranslation]);

  if (!needsTranslation) {
    return <p className={className}>{description}</p>;
  }

  const displayText = showTranslated && translatedText ? translatedText : description;
  const buttonText = showTranslated
    ? "原文に戻す"
    : `${LANG_NAMES[lang] ?? lang}に翻訳`;

  return (
    <div className="relative">
      <p className={`${className ?? ""} pr-20`}>{displayText}</p>
      <button
        onClick={() => setShowTranslated((v) => !v)}
        className="absolute right-0 top-0 cursor-pointer whitespace-nowrap text-xs text-indigo-400 hover:underline"
      >
        {buttonText}
      </button>
    </div>
  );
}
