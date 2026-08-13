/**
 * Error types and human-friendly (Spanish) error normalization for MuAPI calls.
 */

export class MissingKeyError extends Error {
  constructor() {
    super("No API key configured");
    this.name = "MissingKeyError";
  }
}

export class MuapiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "MuapiError";
    this.status = status;
  }
}

/** What kind of call-to-action the UI should show for an error. */
export type ErrorAction = "settings" | "topup" | null;

export interface FriendlyError {
  title: string;
  message: string;
  action: ErrorAction;
}

function looksLikeInsufficientCredits(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("insufficient") ||
    t.includes("insufficient_credits") ||
    t.includes("not enough") ||
    t.includes("saldo") ||
    t.includes("credit")
  );
}

/**
 * Turn any thrown value into a friendly, actionable message for the UI.
 * Handles the specific cases called out in the product brief:
 *   - no key            -> invite the user to Settings
 *   - 403 / insufficient -> warn about no balance or a Sandbox key
 */
export function toFriendlyError(err: unknown): FriendlyError {
  if (err instanceof MissingKeyError) {
    return {
      title: "Falta tu API Key",
      message: "Añade tu API Key de MuAPI en ⚙️ Settings para empezar a generar.",
      action: "settings",
    };
  }

  const status = err instanceof MuapiError ? err.status : undefined;
  const raw = err instanceof Error ? err.message : String(err);

  if (status === 402 || (status === 403 && looksLikeInsufficientCredits(raw)) || looksLikeInsufficientCredits(raw)) {
    return {
      title: "Sin créditos suficientes",
      message:
        "Tu cuenta no tiene saldo o estás usando una key de Sandbox. Recarga en muapi.ai y usa una key de Producción (Sandbox desmarcado).",
      action: "topup",
    };
  }

  if (status === 401 || status === 403) {
    return {
      title: "API Key inválida o no autorizada",
      message:
        "Revisa tu API Key en ⚙️ Settings. Debe ser una key de Producción de muapi.ai (no Sandbox).",
      action: "settings",
    };
  }

  if (status === 429) {
    return {
      title: "Demasiadas peticiones",
      message: "Has alcanzado el límite de peticiones. Espera unos segundos e inténtalo de nuevo.",
      action: null,
    };
  }

  return {
    title: "Algo salió mal",
    message: raw || "Error inesperado al llamar a MuAPI. Inténtalo de nuevo.",
    action: null,
  };
}
