/**
 * MuAPI access layer (single source of truth for all API calls).
 *
 * Runs in the browser and talks to our own Next.js proxy at `/api/muapi/*`,
 * which forwards to `https://api.muapi.ai/api/v1/*`. The user's key is read from
 * localStorage by the caller and passed in here as `apiKey`; we send it in the
 * `x-api-key` header. The key is NEVER persisted server-side — the proxy only
 * relays it in-memory per request.
 *
 * MuAPI is asynchronous: POST an endpoint -> get a `request_id` -> poll
 * `predictions/{id}/result` until `completed`.
 */

import { MissingKeyError, MuapiError } from "./errors";
import { getTtsModelById } from "./models";
import type {
  BalanceResponse,
  JobResult,
  PredictionResult,
  SubmitResponse,
  UploadResponse,
} from "./types";

/** Same-origin proxy base. The proxy maps this to https://api.muapi.ai/api/v1. */
const BASE = "/api/muapi";

type Json = Record<string, unknown>;

function authHeaders(apiKey: string): HeadersInit {
  return { "Content-Type": "application/json", "x-api-key": apiKey };
}

async function readError(response: Response): Promise<never> {
  let text = "";
  try {
    text = await response.text();
  } catch {
    /* ignore */
  }
  throw new MuapiError(
    text ? text.slice(0, 300) : `${response.status} ${response.statusText}`,
    response.status,
  );
}

/** Poll a submitted job until it completes (or fails / times out). */
async function pollForResult(
  requestId: string,
  apiKey: string,
  { maxAttempts = 900, interval = 2000 }: { maxAttempts?: number; interval?: number } = {},
): Promise<PredictionResult> {
  const url = `${BASE}/predictions/${requestId}/result`;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, interval));
    let response: Response;
    try {
      response = await fetch(url, { headers: authHeaders(apiKey) });
    } catch {
      if (attempt === maxAttempts) throw new MuapiError("Network error while polling result.");
      continue;
    }
    if (!response.ok) {
      // Transient upstream errors: keep polling. Auth/credit errors: stop now.
      if (response.status >= 500) continue;
      await readError(response);
    }
    const data = (await response.json()) as PredictionResult;
    const status = (data.status || "").toLowerCase();
    if (status === "completed" || status === "succeeded" || status === "success") return data;
    if (status === "failed" || status === "error") {
      throw new MuapiError(data.error ? String(data.error) : "La generación falló.");
    }
    // otherwise: still processing -> keep polling
  }
  throw new MuapiError("La generación tardó demasiado (timeout).");
}

function extractUrl(result: PredictionResult): string | null {
  if (Array.isArray(result.outputs) && result.outputs.length > 0) return result.outputs[0];
  if (typeof result.url === "string") return result.url;
  if (result.output && typeof result.output.url === "string") return result.output.url;
  return null;
}

/** Submit a job to an endpoint and poll until it produces a media URL. */
async function submitAndPoll(
  endpoint: string,
  payload: Json,
  apiKey: string,
  opts: { onRequestId?: (id: string) => void; maxAttempts?: number } = {},
): Promise<JobResult> {
  if (!apiKey) throw new MissingKeyError();

  let response: Response;
  try {
    response = await fetch(`${BASE}/${endpoint}`, {
      method: "POST",
      headers: authHeaders(apiKey),
      body: JSON.stringify(payload),
    });
  } catch {
    throw new MuapiError("No se pudo conectar con MuAPI. Revisa tu conexión.");
  }
  if (!response.ok) await readError(response);

  const submit = (await response.json()) as SubmitResponse;
  const requestId = submit.request_id || submit.id;

  // Some endpoints may answer synchronously (no request_id).
  if (!requestId) {
    const raw = submit as PredictionResult;
    return { url: extractUrl(raw), raw };
  }

  opts.onRequestId?.(String(requestId));
  const result = await pollForResult(String(requestId), apiKey, { maxAttempts: opts.maxAttempts });
  return { url: extractUrl(result), raw: result };
}

/* ── Public API ─────────────────────────────────────────────────────────── */

export interface GenerateVideoParams {
  model: string;
  prompt?: string;
  aspect_ratio?: string;
  duration?: number;
  resolution?: string;
  /** Uploaded image URL for image→video (i2v). */
  image_url?: string;
  onRequestId?: (id: string) => void;
}

export async function generateVideo(apiKey: string, params: GenerateVideoParams): Promise<JobResult> {
  const payload: Json = {};
  if (params.prompt) payload.prompt = params.prompt;
  if (params.aspect_ratio) payload.aspect_ratio = params.aspect_ratio;
  if (params.duration) payload.duration = params.duration;
  if (params.resolution) payload.resolution = params.resolution;
  if (params.image_url) payload.image_url = params.image_url;
  return submitAndPoll(params.model, payload, apiKey, {
    onRequestId: params.onRequestId,
    maxAttempts: 900,
  });
}

export interface GenerateVoiceParams {
  model: string;
  text: string;
  voice: string;
  onRequestId?: (id: string) => void;
}

export async function generateVoice(apiKey: string, params: GenerateVoiceParams): Promise<JobResult> {
  const model = getTtsModelById(params.model);
  const textField = model?.textField || "prompt";
  const voiceField = model?.voiceField || "voice_id";
  const payload: Json = {
    [textField]: params.text,
    [voiceField]: params.voice,
  };
  return submitAndPoll(params.model, payload, apiKey, {
    onRequestId: params.onRequestId,
    maxAttempts: 300,
  });
}

export interface CloneVoiceParams {
  model: string;
  audio_url: string;
  custom_voice_id?: string;
  /** Optional preview text spoken back with the cloned voice. */
  preview_text?: string;
  onRequestId?: (id: string) => void;
}

export async function cloneVoice(apiKey: string, params: CloneVoiceParams): Promise<JobResult> {
  const payload: Json = { audio_url: params.audio_url };
  if (params.custom_voice_id) payload.custom_voice_id = params.custom_voice_id;
  if (params.preview_text) payload.prompt = params.preview_text;
  return submitAndPoll(params.model, payload, apiKey, {
    onRequestId: params.onRequestId,
    maxAttempts: 300,
  });
}

export interface CombineParams {
  model: string;
  video_url: string;
  audio_url: string;
  onRequestId?: (id: string) => void;
}

/**
 * Combine a generated voice with a video clip via a MuAPI lip-sync endpoint
 * (video + audio -> lip-synced video). This is the "attach audio to video" step
 * toward final assembly.
 */
export async function combineVoiceAndVideo(apiKey: string, params: CombineParams): Promise<JobResult> {
  const payload: Json = { video_url: params.video_url, audio_url: params.audio_url };
  return submitAndPoll(params.model, payload, apiKey, {
    onRequestId: params.onRequestId,
    maxAttempts: 900,
  });
}

/**
 * Upload a file (image for i2v, or an audio sample for voice cloning / combine)
 * and return its hosted URL. Uses multipart/form-data, so we do NOT set a JSON
 * Content-Type here.
 */
export async function uploadFile(
  apiKey: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  if (!apiKey) throw new MissingKeyError();

  return new Promise<string>((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE}/upload_file`);
    xhr.setRequestHeader("x-api-key", apiKey);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as UploadResponse;
          const fileUrl = data.url || data.file_url || data.data?.url;
          if (fileUrl) resolve(fileUrl);
          else reject(new MuapiError("La subida no devolvió ninguna URL."));
        } catch {
          reject(new MuapiError("No se pudo interpretar la respuesta de subida."));
        }
      } else {
        reject(new MuapiError(xhr.responseText?.slice(0, 200) || "Fallo al subir el archivo.", xhr.status));
      }
    };
    xhr.onerror = () => reject(new MuapiError("Error de red durante la subida."));
    xhr.send(form);
  });
}

/** Fetch the account balance in USD. Returns null if the shape is unexpected. */
export async function getBalance(apiKey: string): Promise<number | null> {
  if (!apiKey) throw new MissingKeyError();
  let response: Response;
  try {
    response = await fetch(`${BASE}/account/balance`, { headers: authHeaders(apiKey) });
  } catch {
    throw new MuapiError("No se pudo conectar con MuAPI.");
  }
  if (!response.ok) await readError(response);
  const data = (await response.json()) as BalanceResponse;
  return typeof data.balance === "number" ? data.balance : null;
}
