// Registro do service worker gerado pelo vite-plugin-pwa (F1.4) e captura do beforeinstallprompt (RF-103).
// So em producao: no dev o sw.js nao existe. O botao "Instalar app" (F10/F12) chama promptInstall().
import { setInstallPromptAvailable } from "../platform/web";
import { usePwaUpdateStore } from "./update-store";

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
  // o boot e assincrono (storage antes): o "load" pode ja ter disparado quando chegamos aqui
  if (document.readyState === "complete") void register();
  else window.addEventListener("load", () => void register(), { once: true });
}

/** Registra o SW e avisa o UpdatePrompt quando uma versao nova fica em espera (F12.1). */
async function register(): Promise<void> {
  let reg: ServiceWorkerRegistration | undefined;
  try {
    reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch (err: unknown) {
    // http sem TLS, modo privado etc.: o app segue funcionando, so sem cache offline
    console.warn("[pwa] service worker registration failed", err);
    return;
  }
  // navegador com SW bloqueado por politica (ex.: Playwright serviceWorkers "block") resolve sem registro
  if (!reg) return;
  const registration = reg;
  const { setWaiting } = usePwaUpdateStore.getState();
  // primeira instalacao (sem controller) nao e "atualizacao": nada a avisar
  if (registration.waiting && navigator.serviceWorker.controller) setWaiting(registration.waiting);
  const track = (installing: ServiceWorker | null) => {
    installing?.addEventListener("statechange", () => {
      if (installing.state === "installed" && navigator.serviceWorker.controller) setWaiting(installing);
    });
  };
  track(registration.installing);
  registration.addEventListener("updatefound", () => track(registration.installing));
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
