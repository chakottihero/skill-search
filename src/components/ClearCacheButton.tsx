"use client";

export default function ClearCacheButton() {
  const handleClear = () => {
    if (typeof window === "undefined") return;
    const keys = Object.keys(localStorage).filter(
      (k) => k.startsWith("tr_") || k.startsWith("tr2_")
    );
    keys.forEach((k) => localStorage.removeItem(k));
    alert(`翻訳キャッシュをクリアしました（${keys.length}件）。ページを再読み込みしてください。`);
  };

  return (
    <button
      onClick={handleClear}
      className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline-offset-2 hover:underline transition-colors"
    >
      翻訳キャッシュをクリア
    </button>
  );
}
