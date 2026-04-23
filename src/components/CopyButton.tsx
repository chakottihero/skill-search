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
      className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs transition-colors hover:border-green-500/50 hover:text-green-400"
    >
      <code className="font-mono text-gray-400 truncate max-w-xs">{command}</code>
      <span className="shrink-0 text-gray-400">
        {copied ? "✓ コピー済み" : "インストール"}
      </span>
    </button>
  );
}
