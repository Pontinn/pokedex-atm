// Registro do service worker gerado pelo vite-plugin-pwa (F1.4) e captura do beforeinstallprompt (RF-103).
// So em producao: no dev o sw.js nao existe. O botao "Instalar app" (F10/F12) chama promptInstall().
import { setInstallPromptAvailable } from "../platform/web";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function registerServiceWorker(): void {
  if (typeof window === "undefined") return;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    setInstallPromptAvailable(true);
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    setInstallPromptAvailable(false);
  });
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((err: unknown) => {
      console.warn("[pwa] service worker registration failed", err);
    });
  });
}

/** Mostra o prompt de instalacao guardado. false = nao havia prompt. */
export async function promptInstall(): Promise<boolean> {
  const prompt = deferredPrompt;
  if (!prompt) return false;
  deferredPrompt = null;
  setInstallPromptAvailable(false);
  await prompt.prompt();
  const choice = await prompt.userChoice;
  return choice.outcome === "accepted";
}
