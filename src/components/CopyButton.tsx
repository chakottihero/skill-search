"use client";

import { useState } from "react";

export default function CopyButton({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-500/50 dark:hover:text-indigo-400"
    >
      <code className="max-w-xs truncate font-mono text-gray-500 dark:text-gray-400">{command}</code>
      <span className="shrink-0 text-gray-400">
        {copied ? "✓ コピー済み" : "インストール"}
      </span>
    </button>
  );
}
