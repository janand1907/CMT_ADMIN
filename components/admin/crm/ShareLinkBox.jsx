"use client";

import { useState } from "react";

export function ShareLinkBox({ url }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-2">
      <p className="break-all rounded-lg border border-gray-100 bg-gray-50/60 p-2 text-xs text-gray-600">{url}</p>
      <button type="button" onClick={copy} className="text-xs font-medium text-primary-700 hover:underline">
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
