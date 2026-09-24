// Boot do app (F1.4): storage + preferencias ANTES do 1o render (sem flash de tema, RF-82), movimento reduzido,
// ganchos de som e navegacao, service worker e carga do dataset em paralelo.
import { installClickSound, installSfxUnlock, playSfx } from "./audio/sfx";
import { installHistoryBridge } from "./navigation/history-bridge";
import { setNavigationSoundHook } from "./navigation/sound-hook";
import { registerServiceWorker } from "./pwa/register-sw";
import { initAppStorage } from "./state/app-storage";
import { useDatasetStore } from "./state/dataset-store";
import { installMotionPreference } from "./state/motion";
import { hydratePreferences } from "./state/preferences-store";
import { useShellStore } from "./state/shell-store";
import { createPreferencesRepository, type StorageNotice } from "./storage";

function onStorageNotice(n: StorageNotice): void {
  const toast = useShellStore.getState().pushToast;
  if (n.kind === "readOnly") toast("error.readOnly", { tone: "error", persistent: true });
  else if (n.kind === "blocked" || n.kind === "memoryFallback") toast("error.storage", { tone: "error", persistent: true });
}

export async function bootApp(): Promise<void> {
  // dataset em paralelo com o storage: a tampa do boot so abre quando ele terminar
  void useDatasetStore.getState().load();
  const adapter = initAppStorage(onStorageNotice);
  try {
    await adapter.init();
    await hydratePreferences(createPreferencesRepository(adapter));
  } catch (err) {
    // sem storage o app segue com os padroes (tema classic, PT, som ligado) e avisa
    console.warn("[boot] storage unavailable", err);
    useShellStore.getState().pushToast("error.storage", { tone: "error", persistent: true });
  }
  installMotionPreference();
  setNavigationSoundHook(() => playSfx("pokedex_click_short"));
  installSfxUnlock();
  installClickSound();
  installHistoryBridge();
  registerServiceWorker();
}
