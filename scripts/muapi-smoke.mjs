#!/usr/bin/env node
/**
 * MuAPI end-to-end smoke test for Open Generative AI.
 *
 * Runs the SAME endpoints / slugs / payloads the app uses, straight against
 * https://api.muapi.ai — so you can confirm your key works and the integration
 * "generates for real" WITHOUT deploying or pasting your key anywhere public.
 *
 * Your key is read from the MUAPI_KEY environment variable and is never printed.
 *
 * Usage (Node 18+):
 *   MUAPI_KEY=tu_key_de_produccion node scripts/muapi-smoke.mjs           # saldo + voz
 *   MUAPI_KEY=tu_key_de_produccion node scripts/muapi-smoke.mjs --video   # + vídeo corto
 */

const KEY = process.env.MUAPI_KEY;
const BASE = (process.env.MUAPI_BASE_URL || "https://api.muapi.ai/api/v1").replace(/\/+$/, "");
const RUN_VIDEO = process.argv.includes("--video");

if (!KEY) {
  console.error("✗ Falta MUAPI_KEY.\n  Uso: MUAPI_KEY=tu_key node scripts/muapi-smoke.mjs [--video]");
  process.exit(1);
}

const HEADERS = { "Content-Type": "application/json", "x-api-key": KEY };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function poll(requestId, { max = 240, interval = 2500 } = {}) {
  for (let i = 1; i <= max; i++) {
    await sleep(interval);
    const r = await fetch(`${BASE}/predictions/${requestId}/result`, { headers: HEADERS });
    if (!r.ok) {
      if (r.status >= 500) continue;
      throw new Error(`poll ${r.status}: ${(await r.text()).slice(0, 200)}`);
    }
    const d = await r.json();
    const s = (d.status || "").toLowerCase();
    if (["completed", "succeeded", "success"].includes(s)) return d;
    if (["failed", "error"].includes(s)) throw new Error(`generación falló: ${d.error || "desconocido"}`);
    process.stdout.write(".");
  }
  throw new Error("timeout esperando el resultado");
}

async function submitAndPoll(endpoint, payload) {
  const r = await fetch(`${BASE}/${endpoint}`, { method: "POST", headers: HEADERS, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error(`POST ${endpoint} → ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const d = await r.json();
  const id = d.request_id || d.id;
  if (!id) return { url: d.outputs?.[0] || d.url || d.output?.url || null, raw: d };
  const res = await poll(id);
  return { url: res.outputs?.[0] || res.url || res.output?.url || null, raw: res };
}

const step = (m) => console.log(`\n→ ${m}`);
const ok = (m) => console.log(`✓ ${m}`);

(async () => {
  // 1) Balance — GET /account/balance
  step("Saldo (GET /account/balance)…");
  const br = await fetch(`${BASE}/account/balance`, { headers: HEADERS });
  if (!br.ok) throw new Error(`balance → ${br.status}: ${(await br.text()).slice(0, 200)}`);
  const bal = await br.json();
  ok(`Saldo: $${bal.balance ?? "?"}`);
  if ((bal.balance ?? 0) <= 0) {
    console.warn("  ⚠ Saldo 0 → las generaciones fallarán. Recarga en muapi.ai y usa una key de Producción (no Sandbox).");
  }

  // 2) Text-to-speech — POST /minimax-speech-2.6-hd  (rápido y barato)
  step("Voz (POST /minimax-speech-2.6-hd, voz en español)…");
  const tts = await submitAndPoll("minimax-speech-2.6-hd", {
    prompt: "Hola, esto es una prueba de Open Generative AI.",
    voice_id: "Spanish_Narrator",
  });
  ok(`Audio: ${tts.url}`);

  // 3) Video (opcional) — POST /seedance-lite-t2v
  if (RUN_VIDEO) {
    step("Vídeo 9:16 (POST /seedance-lite-t2v)… puede tardar 1–3 min");
    const vid = await submitAndPoll("seedance-lite-t2v", {
      prompt: "Un plano cinematográfico de una ola rompiendo al atardecer.",
      aspect_ratio: "9:16",
      duration: 5,
      resolution: "480p",
    });
    ok(`Vídeo: ${vid.url}`);
  } else {
    console.log("\n(omitido el vídeo — añade --video para probarlo también)");
  }

  console.log("\n✅ Flujo básico verificado con tu key.");
})().catch((e) => {
  console.error(`\n✗ FALLO: ${e.message}`);
  process.exit(1);
});
