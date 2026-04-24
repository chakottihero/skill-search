"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { translateText, detectLanguage } from "@/lib/translate";
import type { Skill } from "@/lib/types";

export default function RelatedSkills({
  related,
  category,
  catDefIcon,
}: {
  related: Skill[];
  category?: string;
  catDefIcon?: string;
}) {
  const { lang } = useLanguage();
  const [translatedDescs, setTranslatedDescs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!related.length) return;
    const translations: Record<string, string> = {};
    Promise.all(
      related
        .filter((s) => {
          const desc = s.description?.trim();
          if (!desc || desc === "|" || desc === "||") return false;
          // Only translate if detected language differs from current UI language
          const detected = detectLanguage(desc);
          const effective = detected === "other" ? "en" : detected;
          return effective !== lang;
        })
        .map(async (s) => {
          try {
            translations[s.id] = await translateText(s.description!, lang);
          } catch {
            translations[s.id] = s.description!;
          }
        })
    ).then(() => setTranslatedDescs({ ...translations }));
  }, [related, lang]);

  return (
    <div className="mt-12">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        関連スキル
        {category && (
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({catDefIcon} {category})
          </span>
        )}
      </h2>
      <div className="space-y-2">
        {related.map((s) => {
          const desc = translatedDescs[s.id] || s.description;
          const showDesc = desc && desc.trim() && desc.trim() !== "|";
          return (
            <Link
              key={s.id}
              href={`/skills/${s.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:border-white/10 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/5"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {s.name}
                </div>
                {showDesc && (
                  <div className="mt-0.5 truncate text-xs text-gray-400 dark:text-gray-500">
                    {desc?.slice(0, 80)}
                  </div>
                )}
              </div>
              <div className="ml-4 shrink-0 text-xs text-gray-400">★{s.stars}</div>
            </Link>
          );
        })}
      </div>
      {category && (
        <div className="mt-4 text-center">
          <Link
            href={`/search?category=${encodeURIComponent(category)}`}
            className="text-sm text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {category} のスキルをもっと見る →
          </Link>
        </div>
      )}
    </div>
  );
}
