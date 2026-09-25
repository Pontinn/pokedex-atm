// Estado do fluxo "Nova versao disponivel" (F12.1). registerType "prompt": o SW novo fica em espera ate o
// usuario aceitar; ai mandamos SKIP_WAITING e recarregamos quando ele assume o controle.
import { create } from "zustand";

interface PwaUpdateState {
  /** SW novo instalado e esperando (so existe quando ja havia um SW controlando a pagina) */
  waiting: ServiceWorker | null;
  /** usuario fechou o aviso nesta sessao */
  dismissed: boolean;
  setWaiting(sw: ServiceWorker | null): void;
  dismiss(): void;
}

export const usePwaUpdateStore = create<PwaUpdateState>()((set) => ({
  waiting: null,
  dismissed: false,
  setWaiting: (waiting) => set({ waiting, dismissed: false }),
  dismiss: () => set({ dismissed: true }),
}));

let reloading = false;

/** Ativa o SW em espera e recarrega a pagina uma unica vez quando ele assumir o controle. */
export function applyPwaUpdate(): void {
  const waiting = usePwaUpdateStore.getState().waiting;
  if (!waiting || typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });
  waiting.postMessage({ type: "SKIP_WAITING" });
}
