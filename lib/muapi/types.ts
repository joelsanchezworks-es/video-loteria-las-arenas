/**
 * TypeScript types for the MuAPI access layer.
 *
 * These describe both our internal model catalog and the shape of the MuAPI
 * REST responses we depend on. The response shapes were derived from the
 * open-source reference client (anil-matcha/open-generative-ai) which talks to
 * the same `https://api.muapi.ai/api/v1` backend this app proxies to.
 */

export type VideoMode = "t2v" | "i2v";

/** A single selectable option (aspect ratio, resolution, voice, etc.). */
export interface SelectOption {
  value: string;
  label: string;
}

/** A video model exposed in the Video tab. `id` is the MuAPI endpoint slug. */
export interface VideoModel {
  id: string;
  name: string;
  provider: string;
  mode: VideoMode;
  /** Supported aspect ratios (first item is the default). Omit when the model
   *  has no aspect_ratio param (e.g. many i2v models take it from the image). */
  aspectRatios?: string[];
  /** Supported durations in seconds; omit if the model has a fixed length. */
  durations?: number[];
  /** Supported output resolutions; omit if not configurable. */
  resolutions?: string[];
  /** Field MuAPI expects for the input image (i2v only): a single URL string
   *  ("image_url") or a one-element array ("images_list"). */
  imageField?: "image_url" | "images_list";
  description?: string;
}

/** A text-to-speech model exposed in the Voice tab. */
export interface TtsModel {
  id: string;
  name: string;
  provider: string;
  /** MuAPI field that carries the text to speak (e.g. "prompt"). */
  textField: string;
  /** MuAPI field that carries the chosen voice (e.g. "voice_id"). */
  voiceField: string;
  /** Curated list of built-in voices (the full list lives on muapi.ai). */
  voices: SelectOption[];
  description?: string;
}

/** A voice-cloning model (reference audio -> reusable voice id). */
export interface VoiceCloneModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

/** A lip-sync model used to combine a generated voice with a video clip. */
export interface LipSyncModel {
  id: string;
  name: string;
  provider: string;
  /** "video" = video+audio -> lip-synced video; "image" = image+audio -> talking video. */
  kind: "video" | "image";
  resolutions?: string[];
  description?: string;
}

/* ── Raw MuAPI response shapes ──────────────────────────────────────────── */

export interface SubmitResponse {
  request_id?: string;
  id?: string;
  status?: string;
  [key: string]: unknown;
}

export interface PredictionResult {
  status?: string;
  outputs?: string[];
  url?: string;
  output?: { url?: string } | null;
  error?: string;
  detail?: unknown;
  [key: string]: unknown;
}

export interface BalanceResponse {
  balance?: number;
  [key: string]: unknown;
}

export interface UploadResponse {
  url?: string;
  file_url?: string;
  data?: { url?: string };
  [key: string]: unknown;
}

/** Normalized result returned by the client after a job completes. */
export interface JobResult {
  /** URL of the produced media, or null if none was returned. */
  url: string | null;
  /** The full raw prediction payload, in case a caller needs more fields. */
  raw: PredictionResult;
}
