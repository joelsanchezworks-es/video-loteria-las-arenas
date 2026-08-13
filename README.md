# Open Generative AI 🎬🎙️

> Alternativa **gratuita y open-source** a Higgsfield AI para generar **vídeo** y
> **voz/audio con IA** desde una sola interfaz. Sin módulo de imágenes como
> función independiente: el sistema se centra en **vídeo + voz**.

Construido sobre **Next.js 15** con el modelo **BYOK** ("Bring Your Own Key"):
la app no incluye ninguna clave; cada usuario pone la suya de
[MuAPI](https://muapi.ai) y paga su propio consumo.

La integración con MuAPI (endpoints, slugs de modelos, TTS, clonación de voz y
lip-sync) está basada en el proyecto open-source
[anil-matcha/open-generative-ai](https://github.com/anil-matcha/open-generative-ai),
que usa el mismo backend.

---

## ✨ Qué hace

- **Vídeo** (módulo principal)
  - Texto → vídeo y Imagen → vídeo (la imagen es solo el _input_ del vídeo, no una galería).
  - Selector de modelo (Veo 3, Kling, Seedance, Hailuo, Wan, PixVerse, Runway…), aspecto (9:16, 16:9, 1:1, 4:3, 3:4), duración y resolución.
  - Galería de resultados con reproductor y descarga.
- **Voz / Audio IA**
  - Texto → voz (TTS) con selector de voz.
  - Clonación de voz (subes una muestra → obtienes un `voice_id` reutilizable en TTS).
  - **Combinar voz + vídeo** mediante **lip-sync** (sincronización labial) — paso hacia el montaje final.
- **Settings** — pega tu API Key, comprueba estado de conexión y saldo.

Todo desde `/studio` (la raíz `/` redirige automáticamente).

---

## 🧱 Stack

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 15 (App Router) + React 19 |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS (modo oscuro por defecto) |
| Backend de generación | [MuAPI](https://muapi.ai) (externo) |
| Gestor de paquetes | npm |
| Despliegue | Vercel |

No hay base de datos ni backend propio: toda la generación va contra MuAPI a
través de un _route handler_ que actúa de proxy (para evitar CORS) **sin
almacenar nunca la clave**.

---

## 🔑 Modelo BYOK ("Bring Your Own Key")

Esta app **no incluye ninguna clave**:

- Cada usuario introduce **su propia API Key de MuAPI**.
- La key se guarda **solo en el navegador** (`localStorage`, bajo la clave `muapi_key`).
- Nunca se guarda en el servidor, ni en variables de entorno, ni en el repositorio.
- En cada llamada la key viaja por el header `x-api-key` a nuestras rutas
  `/api/muapi/*`, que la **reenvían a MuAPI y no la persisten** (sin logs, sin
  cookies, sin disco).

> ⚠️ **Nunca** subas una API Key al repositorio ni la escribas en el código.
> La app está diseñada para que la key viva solo en el navegador del usuario.

### Cómo obtener la API Key

1. Entra en [muapi.ai](https://muapi.ai) e inicia sesión.
2. Asegúrate de tener **saldo > 0**.
3. Ve a **API Keys** → crea o usa una key con el checkbox **“Sandbox” DESMARCADO** (Producción).
   - Las keys **Sandbox** no consumen créditos pero solo devuelven datos falsos (mock) → dan error en producción.
   - MuAPI solo muestra la key completa **una vez** al crearla: guárdala en un sitio seguro.
4. Abre la app → **⚙️ Settings** → pega la key → **Save**. El indicador de arriba
   a la derecha pasará de `$---` a tu **saldo real** (ej. `$10`).

---

## 🛠️ Ejecutar en local

```bash
# 1. Instalar dependencias
npm install

# 2. Arrancar en desarrollo
npm run dev
```

Abre `http://localhost:3000` (redirige a `/studio`). Si el puerto está ocupado:

```bash
npm run dev -- -p 3002
```

Luego ve a **Settings** y conecta tu API Key de MuAPI.

### Scripts

| Script | Acción |
|--------|--------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | Linter (ESLint) |

No hay que configurar ninguna variable de entorno con claves: el modelo BYOK
hace que la key la ponga cada usuario desde el navegador. (`.env.example` solo
documenta una variable **opcional y no sensible** para sobreescribir la URL base
de MuAPI.)

---

## 📡 Endpoints de MuAPI que usa la app

Base: `https://api.muapi.ai/api/v1` · Autenticación: header `x-api-key` ·
Patrón asíncrono (enviar → sondear resultado).

| Función | Método · Endpoint | Notas |
|---------|-------------------|-------|
| Saldo | `GET /account/balance` | Devuelve `{ balance }` (USD) |
| Enviar job (vídeo/voz/…) | `POST /{modelo}` | Devuelve `{ request_id }` |
| Sondear resultado | `GET /predictions/{id}/result` | `status` → `completed`; media en `outputs[0]` |
| Subir archivo | `POST /upload_file` (multipart) | Devuelve `{ url }` — para imagen→vídeo y muestras de audio |
| Texto → vídeo | `POST /{slug}` | p. ej. `veo3-fast-text-to-video`, `kling-v2.6-pro-t2v`, `seedance-pro-t2v` |
| Imagen → vídeo | `POST /{slug}` + `image_url` | p. ej. `seedance-pro-i2v`, `kling-v2.1-master-i2v` |
| Texto → voz (TTS) | `POST /minimax-speech-2.6-hd` | Campos `prompt` (texto) + `voice_id` |
| Clonar voz | `POST /minimax-voice-clone` | `audio_url` + `custom_voice_id` → `voice_id` |
| Combinar voz+vídeo (lip-sync) | `POST /{slug}` + `video_url` + `audio_url` | p. ej. `sync-lipsync`, `latentsync-video`, `creatify-lipsync` |

La capa de acceso está centralizada en [`lib/muapi/client.ts`](lib/muapi/client.ts)
y el catálogo de modelos en [`lib/muapi/models.ts`](lib/muapi/models.ts) (fácil de
ampliar: MuAPI ofrece 100+ modelos de vídeo).

---

## 🧯 Errores típicos

| Síntoma | Causa | Solución |
|---------|-------|----------|
| Arriba dcha pone **`$---`** | La key no está en Settings | Pega tu API Key en ⚙️ Settings → Save |
| **403 / “Insufficient credits”** | Sin saldo o key Sandbox | Recarga saldo en muapi.ai y usa una key de **Producción** |
| Genera datos falsos / mock | Estás usando una key **Sandbox** | Crea una key con “Sandbox” desmarcado |
| “API Key inválida” | Key incorrecta o caducada | Revisa/regenera la key en muapi.ai |

---

## 📦 Despliegue en Vercel

Proyecto estándar de Next.js, desplegable directamente:

```bash
vercel          # preview
vercel --prod   # producción
```

No hay que configurar variables de entorno con claves de MuAPI: cada usuario
pone la suya desde el navegador (BYOK).

---

## 🗂️ Estructura del proyecto

```
app/
  layout.tsx                 · layout raíz (modo oscuro)
  page.tsx                   · "/" → redirige a /studio
  studio/page.tsx            · studio con pestañas Vídeo / Voz / Settings
  api/muapi/[...path]/route.ts · proxy BYOK → api.muapi.ai (no persiste la key)
components/                  · Header, BalanceBadge, SettingsModal/Form,
                               ModelSelector, PromptBox, FileUpload,
                               Aspect/Duration/VoiceSelector, Video/AudioResult,
                               VideoPanel, VoicePanel, ui.tsx
hooks/                       · useApiKey, useBalance, useMuapiJob
lib/muapi/                   · client.ts, models.ts, types.ts, errors.ts
lib/utils.ts                 · helpers (cn, formatUsd, downloadUrl)
```

---

## ⚠️ TODOs / a confirmar con tu cuenta de MuAPI

La integración usa endpoints y slugs reales del proyecto de referencia, pero
conviene validarlos con tu propia key de Producción:

- **Catálogo de voces del TTS**: se incluye una selección curada de voces del
  sistema de MiniMax. La lista completa (100+ voces, multi-idioma) está en
  `muapi.ai/playground/minimax-voice-clone`. Amplía `minimaxVoices` en
  `lib/muapi/models.ts` si quieres más (por ejemplo voces en español).
- **Otros modelos de TTS** (ElevenLabs, Gemini): añadidos como comentario en
  `lib/muapi/models.ts`; confirma los nombres exactos de sus campos de entrada
  antes de exponerlos en la UI.
- **Enums por modelo** (aspecto/duración/resolución): son un subconjunto seguro;
  cada modelo de MuAPI puede admitir más o menos opciones. Si un valor no está
  soportado, MuAPI responde con un error visible en la UI.
- **Modelos de vídeo**: se expone una selección curada; puedes añadir cualquiera
  de los 100+ slugs de MuAPI en `t2vModels` / `i2vModels`.

---

## 📄 Licencia

[MIT](LICENSE). Proyecto derivado de
[anil-matcha/open-generative-ai](https://github.com/anil-matcha/open-generative-ai).
