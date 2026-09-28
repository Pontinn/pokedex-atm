// F12.1 (revisado 2026-09-28): atualizacao automatica. installReloadOnUpdate recarrega UMA vez quando um SW novo
// assume a pagina; nunca na 1a visita (clientsClaim do 1o SW) e nunca em loop.
import { describe, expect, it, vi } from "vitest";
import { installReloadOnUpdate } from "../../../src/pwa/register-sw";

function fakeContainer(controller: ServiceWorker | null) {
  const target = new EventTarget();
  const sw = Object.assign(target, { controller }) as unknown as ServiceWorkerContainer & {
    controller: ServiceWorker | null;
  };
  const change = (next: ServiceWorker) => {
    sw.controller = next;
    target.dispatchEvent(new Event("controllerchange"));
  };
  return { sw, change };
}

const oldSw = { scriptURL: "/sw.js#old" } as ServiceWorker;
const newSw = { scriptURL: "/sw.js#new" } as ServiceWorker;
const newerSw = { scriptURL: "/sw.js#newer" } as ServiceWorker;

describe("installReloadOnUpdate", () => {
  it("pagina controlada por um SW antigo: recarrega uma vez quando o novo assume", () => {
    const { sw, change } = fakeContainer(oldSw);
    const reload = vi.fn();
    installReloadOnUpdate(sw, oldSw, reload);
    expect(reload).not.toHaveBeenCalled();
    change(newSw);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("varios controllerchange na mesma pagina: um unico reload (sem loop)", () => {
    const { sw, change } = fakeContainer(oldSw);
    const reload = vi.fn();
    installReloadOnUpdate(sw, oldSw, reload);
    change(newSw);
    change(newerSw);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("1a visita (sem controller): o clientsClaim do 1o SW NAO recarrega", () => {
    const { sw, change } = fakeContainer(null);
    const reload = vi.fn();
    installReloadOnUpdate(sw, null, reload);
    change(newSw);
    expect(reload).not.toHaveBeenCalled();
  });

  it("1a visita e depois um deploy novo com a aba aberta: recarrega uma vez", () => {
    const { sw, change } = fakeContainer(null);
    const reload = vi.fn();
    installReloadOnUpdate(sw, null, reload);
    change(newSw);
    change(newerSw);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("1a visita em que o 1o SW ja assumiu antes do listener: o proximo controllerchange e atualizacao", () => {
    const { sw, change } = fakeContainer(newSw);
    const reload = vi.fn();
    installReloadOnUpdate(sw, null, reload);
    expect(reload).not.toHaveBeenCalled();
    change(newerSw);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("o SW novo assumiu durante o boot (antes do listener): recarrega na hora, uma vez", () => {
    const { sw, change } = fakeContainer(newSw);
    const reload = vi.fn();
    installReloadOnUpdate(sw, oldSw, reload);
    expect(reload).toHaveBeenCalledTimes(1);
    change(newerSw);
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
