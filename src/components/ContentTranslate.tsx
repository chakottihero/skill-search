"use client";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { useLanguage, type Lang } from "@/context/LanguageContext";
import { detectLanguage, translateLongText } from "@/lib/translate";

const LANG_NAMES: Record<Lang, string> = { ja: "日本語", en: "English", zh: "中文" };

const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-3 mt-6 text-2xl font-bold text-gray-900 dark:text-white">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-5 border-b border-gray-200 pb-1 text-xl font-semibold text-gray-900 dark:border-white/10 dark:text-white">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-4 text-lg font-medium text-gray-700 dark:text-gray-200">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="my-2 leading-relaxed text-gray-600 dark:text-gray-300">{children}</p>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400">
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="my-2 ml-5 list-disc space-y-1 text-gray-600 dark:text-gray-300">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 ml-5 list-decimal space-y-1 text-gray-600 dark:text-gray-300">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-4 border-indigo-300 pl-4 italic text-gray-500 dark:border-indigo-500/40 dark:text-gray-400">
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.startsWith("language-");
    if (isBlock) {
      return <code className={`${className} block overflow-x-auto`} {...props}>{children}</code>;
    }
    return (
      <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-indigo-600 dark:bg-white/10 dark:text-indigo-300" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-6 border-gray-200 dark:border-white/10" />,
  strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm text-gray-600 dark:text-gray-300">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-medium text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-200 px-3 py-2 dark:border-white/10">{children}</td>
  ),
};

export default function ContentTranslate({ content }: { content: string }) {
  const { lang } = useLanguage();
  const [showTranslated, setShowTranslated] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const detectedLang = detectLanguage(content);
  const needsTranslation = detectedLang !== "other" && detectedLang !== lang;

  // Reset when language changes
  useEffect(() => {
    setTranslatedContent(null);
    setShowTranslated(false);
  }, [lang]);

  const handleTranslate = async () => {
    if (translatedContent) {
      setShowTranslated(true);
      return;
    }
    setTranslating(true);
    const result = await translateLongText(content, lang, (current, total) => {
      setProgress({ current, total });
    });
    setTranslatedContent(result);
    setTranslating(false);
    setShowTranslated(true);
  };

  const displayContent = showTranslated && translatedContent ? translatedContent : content;

  return (
    <>
      {needsTranslation && (
        <div className="mb-4 flex items-center justify-end gap-3">
          {translating ? (
            <span className="text-xs text-gray-400">
              翻訳中... {progress.total > 0 && `(${progress.current}/${progress.total})`}
            </span>
          ) : (
            <button
              onClick={showTranslated ? () => setShowTranslated(false) : handleTranslate}
              className="cursor-pointer text-xs text-indigo-400 hover:underline"
            >
              {showTranslated ? "原文に戻す" : `${LANG_NAMES[lang] ?? lang}に翻訳`}
            </button>
          )}
        </div>
      )}
      <article className="text-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {displayContent}
        </ReactMarkdown>
      </article>
    </>
  );
}
