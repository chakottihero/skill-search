"use client";
import { useState, useEffect } from "react";
import { useLanguage, type Lang } from "@/context/LanguageContext";
import { detectLanguage, getCacheKey, translateText } from "@/lib/translate";

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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    translateText(description, lang).then((result) => {
      setTranslatedText(result);
      localStorage.setItem(cacheKey, result);
      setLoading(false);
    });
  }, [description, lang, needsTranslation]);

  if (!needsTranslation) {
    return <p className={className}>{description}</p>;
  }

  const displayText = showTranslated && translatedText ? translatedText : description;
  const buttonText = loading
    ? "翻訳中..."
    : showTranslated
    ? "原文に戻す"
    : `${LANG_NAMES[lang] ?? lang}に翻訳`;

  return (
    <div className="relative">
      <p className={`${className ?? ""} pr-20`}>{displayText}</p>
      <button
        onClick={() => !loading && setShowTranslated((v) => !v)}
        disabled={loading}
        className="absolute right-0 top-0 cursor-pointer whitespace-nowrap text-xs text-indigo-400 hover:underline disabled:opacity-50 disabled:cursor-wait"
      >
        {buttonText}
      </button>
    </div>
  );
}
