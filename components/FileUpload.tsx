"use client";

import { useRef, useState } from "react";
import { uploadFile } from "@/lib/muapi/client";
import { toFriendlyError } from "@/lib/muapi/errors";
import { Spinner } from "./ui";

type MediaKind = "image" | "video" | "audio";

/**
 * Uploads a single file to MuAPI's `upload_file` endpoint and reports back the
 * hosted URL via `onChange`. Used for the image→video input and for attaching a
 * video/audio in the combine (lip-sync) step. This is an INPUT, not a gallery.
 */
export function FileUpload({
  apiKey,
  accept,
  kind,
  value,
  onChange,
  label,
  hint,
}: {
  apiKey: string;
  accept: string;
  kind: MediaKind;
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const previewSrc = value || localPreview;

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError(null);
    setLocalPreview(URL.createObjectURL(file));
    setUploading(true);
    setProgress(0);
    try {
      const url = await uploadFile(apiKey, file, setProgress);
      onChange(url);
    } catch (err) {
      setError(toFriendlyError(err).message);
      onChange(null);
      setLocalPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function clear() {
    setLocalPreview(null);
    onChange(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label className="label">{label}</label>

      {previewSrc ? (
        <div className="card overflow-hidden p-2">
          {kind === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewSrc} alt="Vista previa" className="max-h-56 w-full rounded-lg object-contain" />
          )}
          {kind === "video" && (
            <video src={previewSrc} controls className="max-h-56 w-full rounded-lg bg-black" />
          )}
          {kind === "audio" && <audio src={previewSrc} controls className="w-full" />}

          <div className="mt-2 flex items-center justify-between px-1">
            <span className="text-xs text-neutral-500">
              {uploading ? `Subiendo… ${progress}%` : value ? "Subido ✓" : "Procesando…"}
            </span>
            <button
              onClick={clear}
              className="text-xs font-semibold text-neutral-400 transition hover:text-red-300"
            >
              Quitar
            </button>
          </div>
          {uploading && (
            <div className="mx-1 mt-1 h-1 overflow-hidden rounded bg-white/10">
              <div className="h-full bg-brand-400 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-8 text-center text-sm text-neutral-400 transition hover:border-brand-400/40 hover:bg-white/[0.05] disabled:opacity-50"
        >
          {uploading ? (
            <Spinner />
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 16V4m0 0 4 4m-4-4L8 8" />
              <path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
            </svg>
          )}
          <span>{uploading ? `Subiendo… ${progress}%` : "Haz clic para subir un archivo"}</span>
          {hint && <span className="text-xs text-neutral-600">{hint}</span>}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="mt-1.5 text-xs text-red-300">{error}</p>}
    </div>
  );
}
