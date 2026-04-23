"use client";
import { useState } from "react";
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
  const [showTranslated, setShowTranslated] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const detectedLang = detectLanguage(description);
  const needsTranslation = detectedLang !== "other" && detectedLang !== lang;

  if (!needsTranslation) {
    return <p className={className}>{description}</p>;
  }

  const handleClick = async () => {
    if (loading) return;
    if (showTranslated) {
      setShowTranslated(false);
      return;
    }
    if (translatedText) {
      setShowTranslated(true);
      return;
    }
    const cacheKey = getCacheKey(description, lang);
    const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
    if (cached) {
      setTranslatedText(cached);
      setShowTranslated(true);
      return;
    }
    setLoading(true);
    const result = await translateText(description, lang);
    setTranslatedText(result);
    if (typeof window !== "undefined") localStorage.setItem(cacheKey, result);
    setLoading(false);
    setShowTranslated(true);
  };

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
        onClick={handleClick}
        disabled={loading}
        className="absolute right-0 top-0 cursor-pointer whitespace-nowrap text-xs text-indigo-400 hover:underline disabled:opacity-50 disabled:cursor-wait"
      >
        {buttonText}
      </button>
    </div>
  );
}
