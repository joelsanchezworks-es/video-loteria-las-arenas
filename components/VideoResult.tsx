"use client";

import type { ReactNode } from "react";
import { downloadUrl } from "@/lib/utils";

export function VideoResult({
  url,
  caption,
  actions,
}: {
  url: string;
  caption?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="card overflow-hidden">
      <video src={url} controls playsInline className="mx-auto max-h-[60vh] w-full bg-black" />
      <div className="flex items-center justify-between gap-2 p-3">
        <span className="truncate text-xs text-neutral-500">{caption || "Resultado"}</span>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          <button
            onClick={() => downloadUrl(url, "open-generative-ai-video.mp4")}
            className="btn-ghost !px-3 !py-1.5 text-xs"
          >
            ⬇ Descargar
          </button>
        </div>
      </div>
    </div>
  );
}
