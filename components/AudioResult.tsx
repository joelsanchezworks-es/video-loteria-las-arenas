"use client";

import type { ReactNode } from "react";
import { downloadUrl } from "@/lib/utils";

export function AudioResult({
  url,
  caption,
  actions,
}: {
  url: string;
  caption?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="card p-3">
      <audio src={url} controls className="w-full" />
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="truncate text-xs text-neutral-500">{caption || "Audio"}</span>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          <button
            onClick={() => downloadUrl(url, "open-generative-ai-audio.mp3")}
            className="btn-ghost !px-3 !py-1.5 text-xs"
          >
            ⬇ Descargar
          </button>
        </div>
      </div>
    </div>
  );
}
