"use client";

import { useState } from "react";
import { cloneVoice, combineVoiceAndVideo, generateVoice } from "@/lib/muapi/client";
import type { ErrorAction } from "@/lib/muapi/errors";
import { getTtsModelById, lipSyncModels, ttsModels, voiceCloneModels } from "@/lib/muapi/models";
import type { JobResult } from "@/lib/muapi/types";
import { useMuapiJob } from "@/hooks/useMuapiJob";
import { AudioResult } from "./AudioResult";
import { FileUpload } from "./FileUpload";
import { ModelSelector } from "./ModelSelector";
import { PromptBox } from "./PromptBox";
import { VideoResult } from "./VideoResult";
import { VoiceSelector } from "./VoiceSelector";
import { Alert, Segmented, Select, Spinner } from "./ui";

type Section = "tts" | "clone" | "combine";

function alertActionFor(action: ErrorAction | undefined, onOpenSettings: () => void) {
  if (action === "settings") return { label: "Abrir Settings", onClick: onOpenSettings };
  if (action === "topup") return { label: "Ir a muapi.ai", onClick: () => window.open("https://muapi.ai", "_blank") };
  return undefined;
}

export function VoicePanel({
  apiKey,
  hasKey,
  onOpenSettings,
  onRefreshBalance,
  lastVideoUrl,
  lastAudioUrl,
  onAudioGenerated,
}: {
  apiKey: string;
  hasKey: boolean;
  onOpenSettings: () => void;
  onRefreshBalance: () => void;
  lastVideoUrl: string | null;
  lastAudioUrl: string | null;
  onAudioGenerated: (url: string) => void;
}) {
  const [section, setSection] = useState<Section>("tts");

  return (
    <div className="space-y-5">
      <div className="flex justify-center">
        <Segmented
          options={[
            { value: "tts", label: "Texto → Voz" },
            { value: "clone", label: "Clonar voz" },
            { value: "combine", label: "Combinar con vídeo" },
          ]}
          value={section}
          onChange={(v) => setSection(v as Section)}
        />
      </div>

      {section === "tts" && (
        <TtsSection
          apiKey={apiKey}
          hasKey={hasKey}
          onOpenSettings={onOpenSettings}
          onRefreshBalance={onRefreshBalance}
          onAudioGenerated={onAudioGenerated}
        />
      )}
      {section === "clone" && (
        <CloneSection apiKey={apiKey} hasKey={hasKey} onOpenSettings={onOpenSettings} onRefreshBalance={onRefreshBalance} />
      )}
      {section === "combine" && (
        <CombineSection
          apiKey={apiKey}
          hasKey={hasKey}
          onOpenSettings={onOpenSettings}
          onRefreshBalance={onRefreshBalance}
          lastVideoUrl={lastVideoUrl}
          lastAudioUrl={lastAudioUrl}
        />
      )}
    </div>
  );
}

/* ── Text → Speech ──────────────────────────────────────────────────────── */

function TtsSection({
  apiKey,
  hasKey,
  onOpenSettings,
  onRefreshBalance,
  onAudioGenerated,
}: {
  apiKey: string;
  hasKey: boolean;
  onOpenSettings: () => void;
  onRefreshBalance: () => void;
  onAudioGenerated: (url: string) => void;
}) {
  const [model, setModel] = useState(ttsModels[0].id);
  const [systemVoice, setSystemVoice] = useState(ttsModels[0].voices[0].value);
  const [useCloned, setUseCloned] = useState(false);
  const [clonedVoiceId, setClonedVoiceId] = useState("");
  const [text, setText] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [results, setResults] = useState<{ url: string; caption: string }[]>([]);

  const modelInfo = getTtsModelById(model) ?? ttsModels[0];
  const job = useMuapiJob<JobResult>();

  async function generate() {
    setLocalError(null);
    if (!hasKey) return onOpenSettings();
    if (!text.trim()) {
      setLocalError("Escribe el texto que quieres convertir en voz.");
      return;
    }
    const voice = useCloned ? clonedVoiceId.trim() : systemVoice;
    if (useCloned && !voice) {
      setLocalError("Introduce el voice_id de tu voz clonada.");
      return;
    }

    const res = await job.run(() =>
      generateVoice(apiKey, { model, text: text.trim(), voice, onRequestId: job.setRequestId }),
    );
    if (res?.url) {
      setResults((prev) => [{ url: res.url as string, caption: `${modelInfo.name} · ${voice}` }, ...prev]);
      onAudioGenerated(res.url);
      onRefreshBalance();
    } else if (res && !res.url) {
      setLocalError("La generación terminó pero no devolvió audio. Prueba otra voz o modelo.");
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <div className="card space-y-4 p-4">
          <ModelSelector label="Modelo de voz (TTS)" models={ttsModels} value={model} onChange={setModel} />

          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={useCloned}
              onChange={(e) => setUseCloned(e.target.checked)}
              className="h-4 w-4 accent-brand-400"
            />
            Usar una voz clonada (voice_id)
          </label>

          {useCloned ? (
            <div>
              <label className="label">voice_id clonado</label>
              <input
                value={clonedVoiceId}
                onChange={(e) => setClonedVoiceId(e.target.value)}
                placeholder="El voice_id que obtuviste en “Clonar voz”"
                className="field font-mono"
              />
            </div>
          ) : (
            <VoiceSelector voices={modelInfo.voices} value={systemVoice} onChange={setSystemVoice} />
          )}

          <PromptBox
            label="Texto"
            value={text}
            onChange={setText}
            placeholder="Escribe aquí lo que quieres que diga la voz…"
            rows={5}
            maxLength={5000}
          />

          <button onClick={generate} disabled={job.isRunning} className="btn-primary w-full">
            {job.isRunning ? (
              <>
                <Spinner className="h-4 w-4" /> Generando voz…
              </>
            ) : (
              "Generar voz"
            )}
          </button>

          {!hasKey && (
            <Alert variant="info" action={{ label: "Abrir Settings", onClick: onOpenSettings }}>
              Añade tu API Key de MuAPI para generar voz.
            </Alert>
          )}
          {localError && <Alert variant="warning">{localError}</Alert>}
          {job.error && (
            <Alert variant="error" title={job.error.title} action={alertActionFor(job.error.action, onOpenSettings)}>
              {job.error.message}
            </Alert>
          )}
        </div>
      </div>

      <div className="space-y-4 lg:col-span-3">
        {job.isRunning && (
          <div className="card flex flex-col items-center justify-center gap-3 p-10 text-center">
            <Spinner className="h-7 w-7 text-brand-400" />
            <p className="text-sm text-neutral-200">Sintetizando la voz…</p>
          </div>
        )}
        {!job.isRunning && results.length === 0 && (
          <div className="card flex flex-col items-center justify-center gap-2 p-10 text-center text-neutral-500">
            <span className="text-3xl">🎙️</span>
            <p className="text-sm">Tu audio aparecerá aquí.</p>
          </div>
        )}
        {results.map((r, i) => (
          <AudioResult key={`${r.url}-${i}`} url={r.url} caption={r.caption} />
        ))}
      </div>
    </div>
  );
}

/* ── Voice cloning (prepared) ───────────────────────────────────────────── */

function CloneSection({
  apiKey,
  hasKey,
  onOpenSettings,
  onRefreshBalance,
}: {
  apiKey: string;
  hasKey: boolean;
  onOpenSettings: () => void;
  onRefreshBalance: () => void;
}) {
  const [model, setModel] = useState(voiceCloneModels[0].id);
  const [sampleUrl, setSampleUrl] = useState<string | null>(null);
  const [customVoiceId, setCustomVoiceId] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const job = useMuapiJob<JobResult>();
  const needsVoiceId = model === "minimax-voice-clone";

  function suggestId() {
    setCustomVoiceId(`voice${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`);
  }

  async function clone() {
    setLocalError(null);
    if (!hasKey) return onOpenSettings();
    if (!sampleUrl) {
      setLocalError("Sube una muestra de audio (unos 10 segundos, voz limpia).");
      return;
    }
    if (needsVoiceId && !/^[A-Za-z][A-Za-z0-9]{7,}$/.test(customVoiceId)) {
      setLocalError("El voice_id debe empezar por una letra y tener 8+ caracteres alfanuméricos.");
      return;
    }
    const res = await job.run(() =>
      cloneVoice(apiKey, {
        model,
        audio_url: sampleUrl,
        custom_voice_id: needsVoiceId ? customVoiceId : undefined,
        preview_text: previewText.trim() || undefined,
        onRequestId: job.setRequestId,
      }),
    );
    if (res) onRefreshBalance();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <div className="card space-y-4 p-4">
          <ModelSelector label="Modelo de clonación" models={voiceCloneModels} value={model} onChange={setModel} />

          <FileUpload
            apiKey={apiKey}
            accept="audio/*"
            kind="audio"
            value={sampleUrl}
            onChange={setSampleUrl}
            label="Muestra de audio"
            hint="~10 s de voz limpia, sin ruido ni música de fondo."
          />

          {needsVoiceId && (
            <div>
              <label className="label">voice_id personalizado</label>
              <div className="flex gap-2">
                <input
                  value={customVoiceId}
                  onChange={(e) => setCustomVoiceId(e.target.value)}
                  placeholder="p. ej. voice12345678"
                  className="field font-mono"
                />
                <button onClick={suggestId} className="btn-ghost shrink-0 !px-3" type="button">
                  Generar
                </button>
              </div>
              <p className="mt-1.5 text-xs text-neutral-500">
                Empieza por letra, 8+ caracteres alfanuméricos. Lo reutilizarás en Texto→Voz.
              </p>
            </div>
          )}

          <PromptBox
            label="Texto de previsualización (opcional)"
            value={previewText}
            onChange={setPreviewText}
            placeholder="Frase que se leerá con la voz clonada para previsualizar…"
            rows={3}
          />

          <button onClick={clone} disabled={job.isRunning} className="btn-primary w-full">
            {job.isRunning ? (
              <>
                <Spinner className="h-4 w-4" /> Clonando…
              </>
            ) : (
              "Clonar voz"
            )}
          </button>

          {!hasKey && (
            <Alert variant="info" action={{ label: "Abrir Settings", onClick: onOpenSettings }}>
              Añade tu API Key de MuAPI para clonar voz.
            </Alert>
          )}
          {localError && <Alert variant="warning">{localError}</Alert>}
          {job.error && (
            <Alert variant="error" title={job.error.title} action={alertActionFor(job.error.action, onOpenSettings)}>
              {job.error.message}
            </Alert>
          )}
        </div>
      </div>

      <div className="space-y-4 lg:col-span-3">
        {job.status === "success" ? (
          <div className="card space-y-3 p-4">
            <Alert variant="success" title="Voz clonada">
              {needsVoiceId ? (
                <>
                  Usa este <strong>voice_id</strong> en Texto→Voz (marca “Usar una voz clonada”):
                  <code className="mt-1 block rounded bg-black/40 px-2 py-1 font-mono text-brand-200">
                    {customVoiceId}
                  </code>
                </>
              ) : (
                "Tu voz clonada está lista para usarse en la generación."
              )}
            </Alert>
            {job.result?.url && <AudioResult url={job.result.url} caption="Previsualización de la voz clonada" />}
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center gap-2 p-10 text-center text-neutral-500">
            <span className="text-3xl">🧬</span>
            <p className="max-w-xs text-sm">
              Sube una muestra y clona una voz. Obtendrás un <code>voice_id</code> reutilizable para el
              text-to-speech.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Combine voice + video (lip-sync) ───────────────────────────────────── */

function CombineSection({
  apiKey,
  hasKey,
  onOpenSettings,
  onRefreshBalance,
  lastVideoUrl,
  lastAudioUrl,
}: {
  apiKey: string;
  hasKey: boolean;
  onOpenSettings: () => void;
  onRefreshBalance: () => void;
  lastVideoUrl: string | null;
  lastAudioUrl: string | null;
}) {
  const [model, setModel] = useState(lipSyncModels[0].id);
  const [videoMode, setVideoMode] = useState<"last" | "upload">(lastVideoUrl ? "last" : "upload");
  const [audioMode, setAudioMode] = useState<"last" | "upload">(lastAudioUrl ? "last" : "upload");
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [uploadedAudio, setUploadedAudio] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const job = useMuapiJob<JobResult>();

  const videoUrl = videoMode === "last" ? lastVideoUrl : uploadedVideo;
  const audioUrl = audioMode === "last" ? lastAudioUrl : uploadedAudio;

  async function combine() {
    setLocalError(null);
    if (!hasKey) return onOpenSettings();
    if (!videoUrl) {
      setLocalError("Elige o sube un vídeo.");
      return;
    }
    if (!audioUrl) {
      setLocalError("Elige o sube una pista de audio/voz.");
      return;
    }
    const res = await job.run(() =>
      combineVoiceAndVideo(apiKey, { model, video_url: videoUrl, audio_url: audioUrl, onRequestId: job.setRequestId }),
    );
    if (res) onRefreshBalance();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <div className="card space-y-4 p-4">
          <p className="text-xs leading-relaxed text-neutral-400">
            Adjunta una voz a un clip de vídeo mediante <strong>lip-sync</strong> (sincronización labial).
            Ideal cuando el vídeo muestra a una persona hablando.
          </p>

          <ModelSelector label="Modelo de lip-sync" models={lipSyncModels} value={model} onChange={setModel} />

          {/* Video source */}
          <div>
            <label className="label">Vídeo</label>
            <div className="mb-2">
              <Segmented
                size="sm"
                options={[
                  { value: "last", label: "Último generado" },
                  { value: "upload", label: "Subir" },
                ]}
                value={videoMode}
                onChange={(v) => setVideoMode(v as "last" | "upload")}
              />
            </div>
            {videoMode === "last" ? (
              lastVideoUrl ? (
                <video src={lastVideoUrl} controls className="max-h-40 w-full rounded-lg bg-black" />
              ) : (
                <p className="text-xs text-neutral-500">Aún no has generado ningún vídeo. Sube uno.</p>
              )
            ) : (
              <FileUpload apiKey={apiKey} accept="video/*" kind="video" value={uploadedVideo} onChange={setUploadedVideo} label="" />
            )}
          </div>

          {/* Audio source */}
          <div>
            <label className="label">Voz / audio</label>
            <div className="mb-2">
              <Segmented
                size="sm"
                options={[
                  { value: "last", label: "Última voz" },
                  { value: "upload", label: "Subir" },
                ]}
                value={audioMode}
                onChange={(v) => setAudioMode(v as "last" | "upload")}
              />
            </div>
            {audioMode === "last" ? (
              lastAudioUrl ? (
                <audio src={lastAudioUrl} controls className="w-full" />
              ) : (
                <p className="text-xs text-neutral-500">Aún no has generado voz. Súbela.</p>
              )
            ) : (
              <FileUpload apiKey={apiKey} accept="audio/*" kind="audio" value={uploadedAudio} onChange={setUploadedAudio} label="" />
            )}
          </div>

          <button onClick={combine} disabled={job.isRunning} className="btn-primary w-full">
            {job.isRunning ? (
              <>
                <Spinner className="h-4 w-4" /> Combinando…
              </>
            ) : (
              "Combinar voz + vídeo"
            )}
          </button>

          {!hasKey && (
            <Alert variant="info" action={{ label: "Abrir Settings", onClick: onOpenSettings }}>
              Añade tu API Key de MuAPI para combinar.
            </Alert>
          )}
          {localError && <Alert variant="warning">{localError}</Alert>}
          {job.error && (
            <Alert variant="error" title={job.error.title} action={alertActionFor(job.error.action, onOpenSettings)}>
              {job.error.message}
            </Alert>
          )}
        </div>
      </div>

      <div className="space-y-4 lg:col-span-3">
        {job.isRunning && (
          <div className="card flex flex-col items-center justify-center gap-3 p-10 text-center">
            <Spinner className="h-7 w-7 text-brand-400" />
            <p className="text-sm text-neutral-200">Sincronizando voz y vídeo…</p>
            <p className="max-w-xs text-xs text-neutral-500">El lip-sync puede tardar varios minutos.</p>
          </div>
        )}
        {!job.isRunning && !job.result?.url && (
          <div className="card flex flex-col items-center justify-center gap-2 p-10 text-center text-neutral-500">
            <span className="text-3xl">🎞️</span>
            <p className="max-w-xs text-sm">El vídeo con la voz combinada aparecerá aquí.</p>
          </div>
        )}
        {job.result?.url && <VideoResult url={job.result.url} caption="Vídeo + voz combinados" />}
      </div>
    </div>
  );
}
