// Plataforma web (Fase 1). A Fase 2 acrescenta electron/capacitor com a mesma forma.
export interface Platform {
  isNative: boolean;
  hasCamera(): Promise<boolean>;
  /** true quando o navegador ofereceu o prompt de instalacao (beforeinstallprompt) */
  canInstall(): boolean;
}

let installPromptAvailable = false;

/** Chamado pelo registro do PWA (src/pwa) ao receber `beforeinstallprompt`. */
export function setInstallPromptAvailable(v: boolean): void {
  installPromptAvailable = v;
}

export const webPlatform: Platform = {
  isNative: false,
  async hasCamera() {
    try {
      const devices = await navigator.mediaDevices?.enumerateDevices?.();
      return !!devices?.some((d) => d.kind === "videoinput");
    } catch {
      return false;
    }
  },
  canInstall() {
    return installPromptAvailable;
  },
};
