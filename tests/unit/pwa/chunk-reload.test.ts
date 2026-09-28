// F12.1 (U1b): chunk lazy de build antigo que saiu do ar -> "vite:preloadError" recarrega a pagina UMA vez; um
// chunk que falta de verdade nunca vira loop (trava no sessionStorage).
import { describe, expect, it, vi } from "vitest";
import {
  CHUNK_RELOAD_KEY,
  CHUNK_RELOAD_WINDOW_MS,
  claimChunkReload,
  installChunkReload,
} from "../../../src/pwa/chunk-reload";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
  };
}

function setup(start = 1_000_000) {
  const target = new EventTarget();
  const reload = vi.fn();
  const storage = memoryStorage();
  let clock = start;
  installChunkReload(target as unknown as Window, reload, () => storage, () => clock);
  const fail = () => target.dispatchEvent(new Event("vite:preloadError", { cancelable: true }));
  return { reload, storage, fail, advance: (ms: number) => (clock += ms) };
}

describe("installChunkReload", () => {
  it("1a falha de chunk: recarrega uma vez e registra a tentativa", () => {
    const { reload, storage, fail } = setup();
    fail();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(storage.getItem(CHUNK_RELOAD_KEY)).toBe("1000000");
  });

  it("varias falhas na mesma pagina: um unico reload", () => {
    const { reload, fail } = setup();
    fail();
    fail();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("chunk que falta de verdade: depois do reload (mesma sessao) nao recarrega de novo", () => {
    const storage = memoryStorage();
    const first = vi.fn();
    const t1 = new EventTarget();
    installChunkReload(t1 as unknown as Window, first, () => storage, () => 1_000_000);
    t1.dispatchEvent(new Event("vite:preloadError"));
    expect(first).toHaveBeenCalledTimes(1);
    // pagina nova apos o reload: mesma sessionStorage, o chunk continua faltando
    const second = vi.fn();
    const t2 = new EventTarget();
    installChunkReload(t2 as unknown as Window, second, () => storage, () => 1_002_000);
    t2.dispatchEvent(new Event("vite:preloadError"));
    expect(second).not.toHaveBeenCalled();
  });

  it("outro deploy depois da janela: volta a recarregar", () => {
    const storage = memoryStorage();
    expect(claimChunkReload(storage, 1_000_000)).toBe(true);
    expect(claimChunkReload(storage, 1_000_000 + CHUNK_RELOAD_WINDOW_MS - 1)).toBe(false);
    expect(claimChunkReload(storage, 1_000_000 + CHUNK_RELOAD_WINDOW_MS)).toBe(true);
  });

  it("sem sessionStorage (ou lancando): nunca recarrega, sem trava nao ha como evitar loop", () => {
    expect(claimChunkReload(null, 1)).toBe(false);
    const throwing = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => undefined,
    };
    expect(claimChunkReload(throwing, 1)).toBe(false);
  });
});
