"use client";

import { useEffect, useState } from "react";
import { generateVideo } from "@/lib/muapi/client";
import { getVideoModelById, i2vModels, t2vModels } from "@/lib/muapi/models";
import type { JobResult, VideoMode } from "@/lib/muapi/types";
import { useMuapiJob } from "@/hooks/useMuapiJob";
import { AspectRatioSelector } from "./AspectRatioSelector";
import { DurationSelector } from "./DurationSelector";
import { FileUpload } from "./FileUpload";
import { ModelSelector } from "./ModelSelector";
import { PromptBox } from "./PromptBox";
import { VideoResult } from "./VideoResult";
import { Alert, PillGroup, Segmented, Spinner } from "./ui";

const DEFAULT_MODEL = t2vModels[0];

export function VideoPanel({
  apiKey,
  hasKey,
  onOpenSettings,
  onRefreshBalance,
  onVideoGenerated,
}: {
  apiKey: string;
  hasKey: boolean;
  onOpenSettings: () => void;
  onRefreshBalance: () => void;
  onVideoGenerated: (url: string) => void;
}) {
  const [mode, setMode] = useState<VideoMode>("t2v");
  const [model, setModel] = useState(DEFAULT_MODEL.id);
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_MODEL.aspectRatios[0]);
  const [duration, setDuration] = useState<number | null>(DEFAULT_MODEL.durations?.[0] ?? null);
  const [resolution, setResolution] = useState<string | null>(DEFAULT_MODEL.resolutions?.[0] ?? null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [results, setResults] = useState<{ url: string; caption: string }[]>([]);

  const models = mode === "t2v" ? t2vModels : i2vModels;
  const modelInfo = getVideoModelById(model) ?? models[0];
  const job = useMuapiJob<JobResult>();

  // Reset dependent selectors to the model's defaults whenever the model changes.
  useEffect(() => {
    const info = getVideoModelById(model);
    if (!info) return;
    setAspectRatio(info.aspectRatios[0]);
    setDuration(info.durations?.[0] ?? null);
    setResolution(info.resolutions?.[0] ?? null);
  }, [model]);

  function changeMode(next: VideoMode) {
    if (next === mode) return;
    setMode(next);
    setModel((next === "t2v" ? t2vModels : i2vModels)[0].id);
    setLocalError(null);
  }

  async function generate() {
    setLocalError(null);
    if (!hasKey) {
      onOpenSettings();
      return;
    }
    if (mode === "i2v" && !imageUrl) {
      setLocalError("Sube una imagen inicial para el modo imagen→vídeo.");
      return;
    }
    if (mode === "t2v" && !prompt.trim()) {
      setLocalError("Escribe un prompt para generar el vídeo.");
      return;
    }

    const res = await job.run(() =>
      generateVideo(apiKey, {
        model,
        prompt: prompt.trim() || undefined,
        aspect_ratio: aspectRatio,
        duration: duration ?? undefined,
        resolution: resolution ?? undefined,
        image_url: mode === "i2v" ? imageUrl ?? undefined : undefined,
        onRequestId: job.setRequestId,
      }),
    );

    if (res?.url) {
      setResults((prev) => [{ url: res.url as string, caption: `${modelInfo.name} · ${aspectRatio}` }, ...prev]);
      onVideoGenerated(res.url);
      onRefreshBalance();
    } else if (res && !res.url) {
      setLocalError("La generación terminó pero no devolvió ningún vídeo. Prueba otro modelo.");
    }
  }

  const errorAction =
    job.error?.action === "settings"
      ? { label: "Abrir Settings", onClick: onOpenSettings }
      : job.error?.action === "topup"
        ? { label: "Ir a muapi.ai", onClick: () => window.open("https://muapi.ai", "_blank") }
        : undefined;

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      {/* Controls */}
      <div className="space-y-4 lg:col-span-2">
        <div className="card space-y-4 p-4">
          <Segmented
            options={[
              { value: "t2v", label: "Texto → Vídeo" },
              { value: "i2v", label: "Imagen → Vídeo" },
            ]}
            value={mode}
            onChange={(v) => changeMode(v as VideoMode)}
          />

          <ModelSelector label="Modelo de vídeo" models={models} value={model} onChange={setModel} />

          {mode === "i2v" && (
            <FileUpload
              apiKey={apiKey}
              accept="image/*"
              kind="image"
              value={imageUrl}
              onChange={setImageUrl}
              label="Imagen inicial"
              hint="Solo es el input del vídeo — no una galería de imágenes."
            />
          )}

          <PromptBox
            label={mode === "i2v" ? "Prompt (movimiento / acción)" : "Prompt"}
            value={prompt}
            onChange={setPrompt}
            placeholder={
              mode === "i2v"
                ? "Describe cómo debe moverse la escena…"
                : "Un plano cinematográfico de una ciudad de noche con reflejos de neón…"
            }
            rows={4}
          />

          <AspectRatioSelector options={modelInfo.aspectRatios} value={aspectRatio} onChange={setAspectRatio} />

          {modelInfo.durations && duration !== null && (
            <DurationSelector options={modelInfo.durations} value={duration} onChange={setDuration} />
          )}

          {modelInfo.resolutions && resolution !== null && (
            <div>
              <label className="label">Resolución</label>
              <PillGroup
                options={modelInfo.resolutions.map((r) => ({ value: r, label: r }))}
                value={resolution}
                onChange={setResolution}
              />
            </div>
          )}

          <button onClick={generate} disabled={job.isRunning} className="btn-primary w-full">
            {job.isRunning ? (
              <>
                <Spinner className="h-4 w-4" /> Generando…
              </>
            ) : (
              "Generar vídeo"
            )}
          </button>

          {!hasKey && (
            <Alert variant="info" action={{ label: "Abrir Settings", onClick: onOpenSettings }}>
              Añade tu API Key de MuAPI para empezar a generar.
            </Alert>
          )}
          {localError && <Alert variant="warning">{localError}</Alert>}
          {job.error && (
            <Alert variant="error" title={job.error.title} action={errorAction}>
              {job.error.message}
            </Alert>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4 lg:col-span-3">
        {job.isRunning && (
          <div className="card flex flex-col items-center justify-center gap-3 p-10 text-center">
            <Spinner className="h-7 w-7 text-brand-400" />
            <p className="text-sm font-medium text-neutral-200">Generando vídeo…</p>
            <p className="max-w-xs text-xs text-neutral-500">
              La generación de vídeo puede tardar entre 1 y 3 minutos. No cierres esta pestaña.
            </p>
            {job.requestId && (
              <p className="font-mono text-[0.7rem] text-neutral-600">id: {job.requestId}</p>
            )}
          </div>
        )}

        {!job.isRunning && results.length === 0 && (
          <div className="card flex flex-col items-center justify-center gap-2 p-10 text-center text-neutral-500">
            <span className="text-3xl">🎬</span>
            <p className="text-sm">Tus vídeos aparecerán aquí.</p>
          </div>
        )}

        {results.map((r, i) => (
          <VideoResult key={`${r.url}-${i}`} url={r.url} caption={r.caption} />
        ))}
      </div>
    </div>
  );
}
