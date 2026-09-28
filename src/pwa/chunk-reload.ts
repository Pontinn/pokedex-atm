// Aba aberta com um build antigo (F12.1, atualizacao automatica): depois do deploy, os chunks lazy com hash antigo
// somem do servidor e do precache (cleanupOutdatedCaches). O import dinamico falha e o Vite dispara
// "vite:preloadError" (tambem quando o proprio import() rejeita). Receita da doc do Vite: recarregar a pagina,
// que ja volta no build novo. So UMA vez por janela de tempo (sessionStorage): um chunk que falta de verdade
// nunca vira loop, o erro segue para o ErrorBoundary da tela.

export const CHUNK_RELOAD_KEY = "pontindex:chunk-reload-at";
/** Outro reload automatico so depois disso (um novo deploy horas depois ainda recarrega). */
export const CHUNK_RELOAD_WINDOW_MS = 5 * 60 * 1000;

type SessionLike = Pick<Storage, "getItem" | "setItem">;

/** true = pode recarregar agora (e ja registra a tentativa). Sem sessionStorage: nunca (sem trava, poderia repetir). */
export function claimChunkReload(storage: SessionLike | null, now: number): boolean {
  if (!storage) return false;
  try {
    const last = Number(storage.getItem(CHUNK_RELOAD_KEY));
    if (Number.isFinite(last) && last > 0 && now - last >= 0 && now - last < CHUNK_RELOAD_WINDOW_MS) return false;
    storage.setItem(CHUNK_RELOAD_KEY, String(now));
    return true;
  } catch {
    return false;
  }
}

function sessionStorageOrNull(): SessionLike | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function installChunkReload(
  target: Pick<Window, "addEventListener"> = window,
  reload: () => void = () => window.location.reload(),
  storage: () => SessionLike | null = sessionStorageOrNull,
  now: () => number = Date.now,
): void {
  let reloading = false;
  target.addEventListener("vite:preloadError", () => {
    if (reloading) return;
    if (!claimChunkReload(storage(), now())) return;
    reloading = true;
    reload();
  });
}
