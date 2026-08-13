/**
 * Curated MuAPI model catalog.
 *
 * Every `id` is the exact MuAPI endpoint slug (POST /api/v1/{id}). Slugs, input
 * fields and the per-model option enums (aspect ratio, duration, resolution,
 * image field) were extracted directly from the open-source reference project
 * (anil-matcha/open-generative-ai), which targets the same MuAPI backend — so
 * the UI only offers values each model actually accepts.
 *
 * This is a *curated* subset — MuAPI exposes 100+ video and many audio models.
 * Adding one is just another accurate entry here; the UI and client pick it up.
 */

import type { VideoModel, TtsModel, VoiceCloneModel, LipSyncModel, SelectOption } from "./types";

/* ── Text → Video ───────────────────────────────────────────────────────── */

export const t2vModels: VideoModel[] = [
  {
    id: "seedance-pro-t2v",
    name: "Seedance Pro",
    provider: "ByteDance",
    mode: "t2v",
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    durations: [5, 10],
    resolutions: ["480p", "720p", "1080p"],
    description: "Cinematic, prompt-faithful clips with strong motion. Great all-rounder.",
  },
  {
    id: "veo3-fast-text-to-video",
    name: "Veo 3 Fast",
    provider: "Google",
    mode: "t2v",
    aspectRatios: ["16:9", "9:16"],
    description: "Google Veo 3 (fast tier). Native audio, fixed ~8s length.",
  },
  {
    id: "veo3-text-to-video",
    name: "Veo 3",
    provider: "Google",
    mode: "t2v",
    aspectRatios: ["16:9", "9:16"],
    description: "Google Veo 3 flagship. Photoreal motion with native audio.",
  },
  {
    id: "kling-v2.6-pro-t2v",
    name: "Kling v2.6 Pro",
    provider: "Kuaishou",
    mode: "t2v",
    aspectRatios: ["16:9", "9:16", "1:1"],
    durations: [5, 10],
    description: "Excellent physics and character consistency.",
  },
  {
    id: "kling-v2.5-turbo-pro-t2v",
    name: "Kling v2.5 Turbo Pro",
    provider: "Kuaishou",
    mode: "t2v",
    aspectRatios: ["16:9", "9:16", "1:1"],
    durations: [5, 10],
    description: "Faster Kling tier, strong quality/price balance.",
  },
  {
    id: "seedance-lite-t2v",
    name: "Seedance Lite",
    provider: "ByteDance",
    mode: "t2v",
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    durations: [5, 10],
    resolutions: ["480p", "720p", "1080p"],
    description: "Cheaper, faster Seedance tier.",
  },
  {
    id: "minimax-hailuo-02-pro-t2v",
    name: "Hailuo 02 Pro",
    provider: "MiniMax",
    mode: "t2v",
    // Hailuo 02 has no aspect_ratio param; fixed 6s, 1080P output.
    durations: [6],
    resolutions: ["1080P"],
    description: "MiniMax Hailuo 02 — snappy, expressive motion (6s · 1080p).",
  },
  {
    id: "wan2.2-text-to-video",
    name: "Wan 2.2",
    provider: "Alibaba",
    mode: "t2v",
    aspectRatios: ["16:9", "9:16"],
    durations: [5, 8],
    resolutions: ["480p", "720p"],
    description: "Alibaba Wan 2.2, open-weights lineage.",
  },
  {
    id: "pixverse-v5-t2v",
    name: "PixVerse V5",
    provider: "PixVerse",
    mode: "t2v",
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    durations: [5, 8],
    resolutions: ["360p", "540p", "720p", "1080p"],
    description: "Stylized, social-ready clips.",
  },
  {
    id: "runway-text-to-video",
    name: "Runway Gen-3",
    provider: "Runway",
    mode: "t2v",
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    durations: [5, 8],
    resolutions: ["720p", "1080p"],
    description: "Runway Gen-3 Alpha.",
  },
];

/* ── Image → Video ──────────────────────────────────────────────────────── */
// Note: many i2v models have NO aspect_ratio (the aspect is taken from the
// input image). `imageField` is the exact field MuAPI expects for the image.

export const i2vModels: VideoModel[] = [
  {
    id: "seedance-pro-i2v",
    name: "Seedance Pro",
    provider: "ByteDance",
    mode: "i2v",
    imageField: "image_url",
    durations: [5, 10],
    resolutions: ["480p", "720p", "1080p"],
    description: "Animate a starting image into a cinematic clip.",
  },
  {
    id: "kling-v2.1-master-i2v",
    name: "Kling v2.1 Master",
    provider: "Kuaishou",
    mode: "i2v",
    imageField: "image_url",
    aspectRatios: ["16:9", "9:16", "1:1"],
    durations: [5, 10],
    description: "Top-tier image-to-video with strong adherence.",
  },
  {
    id: "kling-v2.5-turbo-pro-i2v",
    name: "Kling v2.5 Turbo Pro",
    provider: "Kuaishou",
    mode: "i2v",
    imageField: "image_url",
    durations: [5, 10],
    description: "Faster Kling image-to-video tier.",
  },
  {
    id: "veo3-fast-image-to-video",
    name: "Veo 3 Fast",
    provider: "Google",
    mode: "i2v",
    imageField: "images_list",
    aspectRatios: ["16:9", "9:16"],
    description: "Google Veo 3 (fast) from a starting frame, with native audio.",
  },
  {
    id: "minimax-hailuo-02-pro-i2v",
    name: "Hailuo 02 Pro",
    provider: "MiniMax",
    mode: "i2v",
    imageField: "image_url",
    durations: [6],
    resolutions: ["1080p"],
    description: "MiniMax Hailuo 02 image-to-video (6s · 1080p).",
  },
  {
    id: "seedance-lite-i2v",
    name: "Seedance Lite",
    provider: "ByteDance",
    mode: "i2v",
    imageField: "image_url",
    durations: [5, 10],
    resolutions: ["480p", "720p", "1080p"],
    description: "Cheaper, faster Seedance image-to-video.",
  },
  {
    id: "wan2.2-image-to-video",
    name: "Wan 2.2",
    provider: "Alibaba",
    mode: "i2v",
    imageField: "image_url",
    aspectRatios: ["16:9", "9:16"],
    durations: [5, 8],
    resolutions: ["480p", "720p"],
    description: "Alibaba Wan 2.2 image-to-video.",
  },
  {
    id: "pixverse-v5-i2v",
    name: "PixVerse V5",
    provider: "PixVerse",
    mode: "i2v",
    imageField: "images_list",
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    durations: [5, 8],
    resolutions: ["360p", "540p", "720p", "1080p"],
    description: "Stylized image-to-video for social formats.",
  },
  {
    id: "runway-image-to-video",
    name: "Runway Gen-3",
    provider: "Runway",
    mode: "i2v",
    imageField: "image_url",
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    durations: [5, 8],
    resolutions: ["720p", "1080p"],
    description: "Runway Gen-3 Alpha image-to-video.",
  },
];

export const videoModels: VideoModel[] = [...t2vModels, ...i2vModels];

/* ── Text → Speech (voice) ──────────────────────────────────────────────── */

/**
 * Curated subset of MiniMax system voices (the `voice_id` enum). The full list
 * (100+ voices, many languages) is available at
 * https://muapi.ai/playground/minimax-voice-clone. You can also pass a cloned
 * voice id produced by the Voice Cloning model below.
 */
const minimaxVoices: SelectOption[] = [
  // ── Español (audiencia hispana primero) ──────────────────────────────────
  { value: "Spanish_Narrator", label: "Español · Narrador" },
  { value: "Spanish_SereneWoman", label: "Español · Mujer serena" },
  { value: "Spanish_ConfidentWoman", label: "Español · Mujer segura" },
  { value: "Spanish_ThoughtfulMan", label: "Español · Hombre reflexivo" },
  { value: "Spanish_RationalMan", label: "Español · Hombre racional" },
  { value: "Spanish_CaptivatingStoryteller", label: "Español · Narrador cautivador" },
  { value: "Spanish_ElegantGirl", label: "Español · Chica elegante" },
  { value: "Spanish_Kind-heartedGirl", label: "Español · Chica amable" },
  { value: "Spanish_MaturePartner", label: "Español · Voz madura" },
  { value: "Spanish_SophisticatedLady", label: "Español · Dama sofisticada" },
  { value: "Spanish_WiseScholar", label: "Español · Erudito" },
  { value: "Spanish_DeterminedManager", label: "Español · Directivo decidido" },
  { value: "Spanish_FriendlyNeighbor", label: "Español · Vecino cercano" },
  { value: "Spanish_FunnyGuy", label: "Español · Chico gracioso" },
  // ── Multilingües / inglés ────────────────────────────────────────────────
  { value: "Wise_Woman", label: "Wise Woman" },
  { value: "Friendly_Person", label: "Friendly Person" },
  { value: "Inspirational_girl", label: "Inspirational Girl" },
  { value: "Deep_Voice_Man", label: "Deep Voice Man" },
  { value: "Calm_Woman", label: "Calm Woman" },
  { value: "Casual_Guy", label: "Casual Guy" },
  { value: "Lively_Girl", label: "Lively Girl" },
  { value: "Patient_Man", label: "Patient Man" },
  { value: "Determined_Man", label: "Determined Man" },
  { value: "Lovely_Girl", label: "Lovely Girl" },
  { value: "Elegant_Man", label: "Elegant Man" },
  { value: "English_expressive_narrator", label: "English · Expressive Narrator" },
  { value: "English_radiant_girl", label: "English · Radiant Girl" },
  { value: "English_magnetic_voiced_man", label: "English · Magnetic Man" },
  { value: "English_captivating_female1", label: "English · Captivating Female" },
  { value: "English_Upbeat_Woman", label: "English · Upbeat Woman" },
  { value: "English_Trustworth_Man", label: "English · Trustworthy Man" },
  { value: "English_CalmWoman", label: "English · Calm Woman" },
  { value: "English_Gentle-voiced_man", label: "English · Gentle Man" },
  { value: "English_Graceful_Lady", label: "English · Graceful Lady" },
  { value: "English_GentleTeacher", label: "English · Gentle Teacher" },
  { value: "English_ManWithDeepVoice", label: "English · Man With Deep Voice" },
];

export const ttsModels: TtsModel[] = [
  {
    id: "minimax-speech-2.6-hd",
    name: "MiniMax Speech HD",
    provider: "MiniMax",
    textField: "prompt",
    voiceField: "voice_id",
    voices: minimaxVoices,
    description: "Studio-quality, natural HD text-to-speech.",
  },
  {
    id: "minimax-speech-2.6-turbo",
    name: "MiniMax Speech Turbo",
    provider: "MiniMax",
    textField: "prompt",
    voiceField: "voice_id",
    voices: minimaxVoices,
    description: "Faster, lightweight text-to-speech.",
  },
  // Extensible — other MuAPI TTS endpoints you can add (confirm their exact
  // input field names on muapi.ai before wiring custom UI for them):
  //   - "elevenlabs-tts-turbo-2-5"  (ElevenLabs Turbo v2.5)
  //   - "gemini-3-1-flash-tts"      (Google Gemini Flash TTS)
  //   - "gemini-2-5-pro-tts"        (Google Gemini Pro TTS)
];

/* ── Voice cloning ──────────────────────────────────────────────────────── */

export const voiceCloneModels: VoiceCloneModel[] = [
  {
    id: "minimax-voice-clone",
    name: "MiniMax Voice Clone",
    provider: "MiniMax",
    description:
      "Clone a speaking voice from a short reference sample and reuse it as a voice id in text-to-speech.",
  },
  {
    id: "suno-voice-clone",
    name: "Suno Voice Clone (singing)",
    provider: "Suno",
    description: "Clone a singing voice for use with Suno music generation.",
  },
];

/* ── Lip-sync (combine a generated voice with a video/image) ─────────────── */

export const lipSyncModels: LipSyncModel[] = [
  // video + audio -> lip-synced video (the "attach voice to a clip" path)
  {
    id: "sync-lipsync",
    name: "Sync Lipsync",
    provider: "Sync",
    kind: "video",
    description: "Realistic lip-sync of a talking video to a new audio track.",
  },
  {
    id: "latentsync-video",
    name: "LatentSync",
    provider: "ByteDance",
    kind: "video",
    description: "High-quality audio-driven lip animation on an existing video.",
  },
  {
    id: "creatify-lipsync",
    name: "Creatify Lipsync",
    provider: "Creatify",
    kind: "video",
    description: "Fast, consistent lip-sync optimized for talking-head clips.",
  },
  {
    id: "veed-lipsync",
    name: "VEED Lipsync",
    provider: "VEED",
    kind: "video",
    description: "Lip-sync any audio onto a video with VEED's model.",
  },
];

/* ── Getters ────────────────────────────────────────────────────────────── */

export const getVideoModelById = (id: string): VideoModel | undefined =>
  videoModels.find((m) => m.id === id);

export const getTtsModelById = (id: string): TtsModel | undefined =>
  ttsModels.find((m) => m.id === id);

export const getVoiceCloneModelById = (id: string): VoiceCloneModel | undefined =>
  voiceCloneModels.find((m) => m.id === id);

export const getLipSyncModelById = (id: string): LipSyncModel | undefined =>
  lipSyncModels.find((m) => m.id === id);

/** Nice human labels for aspect ratios shown in the UI. */
export const ASPECT_RATIO_LABELS: Record<string, string> = {
  "16:9": "16:9 · Horizontal",
  "9:16": "9:16 · Vertical",
  "1:1": "1:1 · Cuadrado",
  "4:3": "4:3 · Clásico",
  "3:4": "3:4 · Retrato",
  "21:9": "21:9 · Cine",
  "9:21": "9:21 · Alto",
};
