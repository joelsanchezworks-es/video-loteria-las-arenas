"use client";

import { useEffect, useState } from "react";
import type { BalanceStatus } from "@/hooks/useBalance";
import { formatUsd } from "@/lib/utils";
import { Alert, Spinner } from "./ui";

/**
 * The reusable Settings content: paste + save the MuAPI key, see connection
 * status and balance, and read the Production-vs-Sandbox help. Used both in the
 * Settings modal and the Settings tab.
 */
export function SettingsForm({
  currentKey,
  onSave,
  balance,
  status,
  onRefresh,
  onClose,
}: {
  currentKey: string;
  onSave: (key: string) => void;
  balance: number | null;
  status: BalanceStatus;
  onRefresh: () => void;
  onClose?: () => void;
}) {
  const [value, setValue] = useState(currentKey);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => setValue(currentKey), [currentKey]);

  function handleSave() {
    onSave(value);
    onRefresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="label">API Key de MuAPI</label>
        <div className="flex gap-2">
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Pega aquí tu key de Producción…"
            className="field font-mono"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            onClick={() => setShow((s) => !s)}
            className="btn-ghost shrink-0 !px-3"
            title={show ? "Ocultar" : "Mostrar"}
            type="button"
          >
            {show ? "Ocultar" : "Ver"}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-neutral-500">
          Se guarda <strong>solo en tu navegador</strong> (localStorage). Nunca se envía a
          nuestro servidor ni se guarda en el repositorio.
        </p>
      </div>

      {/* Connection status */}
      <ConnectionStatus hasKey={currentKey.length > 0} status={status} balance={balance} />

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onRefresh}
          className="text-xs font-semibold text-neutral-400 transition hover:text-neutral-200"
          type="button"
        >
          ↻ Recomprobar saldo
        </button>
        <div className="flex gap-2">
          {onClose && (
            <button onClick={onClose} className="btn-ghost" type="button">
              Cerrar
            </button>
          )}
          <button onClick={handleSave} className="btn-primary" type="button">
            {saved ? "Guardado ✓" : "Guardar"}
          </button>
        </div>
      </div>

      <Alert variant="warning" title="Usa una key de Producción (no Sandbox)">
        <ul className="ml-4 list-disc space-y-1">
          <li>Las keys <strong>Sandbox</strong> no consumen créditos pero devuelven datos falsos (mock).</li>
          <li>Crea la key con el checkbox <strong>“Sandbox” desmarcado</strong> y con saldo &gt; 0.</li>
          <li>MuAPI solo muestra la key completa <strong>una vez</strong> al crearla: guárdala bien.</li>
        </ul>
        <a
          href="https://muapi.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block font-semibold text-brand-200 underline underline-offset-2"
        >
          Abrir muapi.ai → API Keys
        </a>
      </Alert>
    </div>
  );
}

function ConnectionStatus({
  hasKey,
  status,
  balance,
}: {
  hasKey: boolean;
  status: BalanceStatus;
  balance: number | null;
}) {
  if (!hasKey) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-400">
        Sin conectar — añade tu API Key para empezar.
      </div>
    );
  }
  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-300">
        <Spinner className="h-4 w-4" /> Comprobando conexión…
      </div>
    );
  }
  if (status === "error") {
    return (
      <Alert variant="error" title="No se pudo validar la key">
        Revisa que sea una key de Producción válida de muapi.ai.
      </Alert>
    );
  }
  if (status === "ok" && (balance === null || balance <= 0)) {
    return (
      <Alert variant="warning" title={`Conectado · saldo ${formatUsd(balance)}`}>
        Tu saldo es 0. Recarga en muapi.ai para poder generar.
      </Alert>
    );
  }
  if (status === "ok") {
    return (
      <Alert variant="success" title={`Conectado · saldo ${formatUsd(balance)}`}>
        Todo listo para generar.
      </Alert>
    );
  }
  return null;
}
