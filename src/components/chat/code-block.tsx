"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CodeBlock({
  children,
  language,
}: {
  children: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-line bg-[#2a2a28]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-1.5">
        <span className="font-mono text-xs text-white/50">
          {language ?? "kod"}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          {copied ? (
            <>
              <Check size={13} /> Nusxalandi
            </>
          ) : (
            <>
              <Copy size={13} /> Nusxa olish
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3.5">
        <code className="font-mono text-[13px] leading-relaxed text-[#e6e3d8]">
          {children}
        </code>
      </pre>
    </div>
  );
}
