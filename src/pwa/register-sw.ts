// Registro do service worker gerado pelo vite-plugin-pwa (F1.4) e captura do beforeinstallprompt (RF-103).
// So em producao: no dev o sw.js nao existe. O botao "Instalar app" (F10/F12) chama promptInstall().
// Atualizacao automatica (F12.1, revisado 2026-09-28): o SW novo ativa sozinho (skipWaiting + clientsClaim no
// vite.config.ts) e a pagina recarrega UMA vez quando ele assume o controle. Sem botao, sem aviso.
import { setInstallPromptAvailable } from "../platform/web";
import { installChunkReload } from "./chunk-reload";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

// controller com que a pagina nasceu, lido no import (o boot so registra o SW depois do storage)
const initialController =
  typeof navigator !== "undefined" && "serviceWorker" in navigator ? navigator.serviceWorker.controller : null;

export function registerServiceWorker(): void {
  if (typeof window === "undefined") return;
  // chunk lazy de um build antigo que ja saiu do ar: recarrega uma vez no build novo
  installChunkReload();
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
  installReloadOnUpdate(navigator.serviceWorker, initialController, () => window.location.reload());
  // o boot e assincrono (storage antes): o "load" pode ja ter disparado quando chegamos aqui
  if (document.readyState === "complete") void register();
  else window.addEventListener("load", () => void register(), { once: true });
}

/**
 * Recarrega uma unica vez quando um SW novo assume o controle desta pagina.
 * Primeira visita (a pagina nasceu sem controller): o clientsClaim do 1o SW tambem dispara controllerchange,
 * mas isso nao e atualizacao, entao nao recarrega. A trava impede um 2o reload na mesma pagina (sem loop).
 * Se a troca ja aconteceu antes deste listener existir (durante o boot), recarrega na hora.
 */
export function installReloadOnUpdate(
  sw: ServiceWorkerContainer,
  initial: ServiceWorker | null,
  reload: () => void,
): void {
  let reloading = false;
  const reloadOnce = () => {
    if (reloading) return;
    reloading = true;
    reload();
  };
  if (initial === null) {
    // 1a visita: o controllerchange do clientsClaim so marca que agora ha controller; os proximos recarregam
    let claimed = sw.controller !== null;
    sw.addEventListener("controllerchange", () => {
      if (!claimed) claimed = true;
      else reloadOnce();
    });
    return;
  }
  sw.addEventListener("controllerchange", reloadOnce);
  if (sw.controller !== initial) reloadOnce();
}

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
  // aba que fica aberta (SPA nao navega): procura versao nova quando o usuario volta para ela
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") registration.update().catch(() => undefined);
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
