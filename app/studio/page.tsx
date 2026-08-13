"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { SettingsForm } from "@/components/SettingsForm";
import { SettingsModal } from "@/components/SettingsModal";
import { Segmented } from "@/components/ui";
import { VideoPanel } from "@/components/VideoPanel";
import { VoicePanel } from "@/components/VoicePanel";
import { useApiKey } from "@/hooks/useApiKey";
import { useBalance } from "@/hooks/useBalance";

type Tab = "video" | "voice" | "settings";

export default function StudioPage() {
  const { apiKey, hasKey, saveKey } = useApiKey();
  const { balance, status, refresh } = useBalance(apiKey);

  const [tab, setTab] = useState<Tab>("video");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lastVideoUrl, setLastVideoUrl] = useState<string | null>(null);
  const [lastAudioUrl, setLastAudioUrl] = useState<string | null>(null);

  const openSettings = () => setSettingsOpen(true);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header balance={balance} status={status} onOpenSettings={openSettings} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <div className="mb-6 flex justify-center">
          <Segmented
            options={[
              { value: "video", label: "🎬 Vídeo" },
              { value: "voice", label: "🎙️ Voz" },
              { value: "settings", label: "⚙️ Settings" },
            ]}
            value={tab}
            onChange={(v) => setTab(v as Tab)}
          />
        </div>

        {tab === "video" && (
          <VideoPanel
            apiKey={apiKey}
            hasKey={hasKey}
            onOpenSettings={openSettings}
            onRefreshBalance={refresh}
            onVideoGenerated={setLastVideoUrl}
          />
        )}

        {tab === "voice" && (
          <VoicePanel
            apiKey={apiKey}
            hasKey={hasKey}
            onOpenSettings={openSettings}
            onRefreshBalance={refresh}
            lastVideoUrl={lastVideoUrl}
            lastAudioUrl={lastAudioUrl}
            onAudioGenerated={setLastAudioUrl}
          />
        )}

        {tab === "settings" && (
          <div className="mx-auto max-w-lg">
            <div className="card p-5">
              <SettingsForm
                currentKey={apiKey}
                onSave={saveKey}
                balance={balance}
                status={status}
                onRefresh={refresh}
              />
            </div>
          </div>
        )}
      </main>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentKey={apiKey}
        onSave={saveKey}
        balance={balance}
        status={status}
        onRefresh={refresh}
      />

      <footer className="mx-auto w-full max-w-6xl px-4 py-8 text-center text-xs text-neutral-600">
        BYOK · Tu API Key se guarda solo en tu navegador. · Hecho con Next.js · Powered by{" "}
        <a href="https://muapi.ai" target="_blank" rel="noopener noreferrer" className="underline">
          MuAPI
        </a>
        .
      </footer>
    </div>
  );
}
