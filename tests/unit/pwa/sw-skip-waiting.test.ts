// sw-legacy-button: public/sw-skip-waiting.js (importado pelo sw.js). Aba do build antigo manda SKIP_WAITING ->
// o SW chama skipWaiting e recarrega SO a aba que mandou, uma vez; qualquer outra mensagem e ignorada.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

const CODE = readFileSync(path.resolve(import.meta.dirname, "../../../public/sw-skip-waiting.js"), "utf8");

interface FakeClient {
  id: string;
  type: string;
  url: string;
  navigate: ReturnType<typeof vi.fn>;
}

function setup(clients: FakeClient[] = [{ id: "a", type: "window", url: "https://x/dex", navigate: vi.fn() }]) {
  let listener: ((e: unknown) => void) | null = null;
  const sw = {
    addEventListener: vi.fn((type: string, fn: (e: unknown) => void) => {
      if (type === "message") listener = fn;
    }),
    skipWaiting: vi.fn(() => Promise.resolve()),
    clients: { get: vi.fn((id: string) => Promise.resolve(clients.find((c) => c.id === id))) },
  };
  new Function("self", CODE)(sw);
  const send = async (data: unknown, source: unknown = clients[0]) => {
    const pending: Promise<unknown>[] = [];
    listener!({ data, source, waitUntil: (p: Promise<unknown>) => pending.push(p) });
    await Promise.all(pending);
    return pending.length;
  };
  return { sw, clients, send };
}

describe("sw-skip-waiting.js", () => {
  it("SKIP_WAITING de uma aba: skipWaiting e recarrega essa aba na mesma URL", async () => {
    const { sw, clients, send } = setup();
    await send({ type: "SKIP_WAITING" });
    expect(sw.skipWaiting).toHaveBeenCalledTimes(1);
    expect(clients[0]!.navigate).toHaveBeenCalledExactlyOnceWith("https://x/dex");
  });

  it("duplo clique enquanto a aba recarrega: uma navegacao so", async () => {
    let finish: () => void = () => undefined;
    const client: FakeClient = {
      id: "a",
      type: "window",
      url: "https://x/",
      navigate: vi.fn(() => new Promise<void>((r) => (finish = r))),
    };
    const { send } = setup([client]);
    const first = send({ type: "SKIP_WAITING" });
    const second = send({ type: "SKIP_WAITING" });
    await vi.waitFor(() => expect(client.navigate).toHaveBeenCalledTimes(1));
    finish();
    await Promise.all([first, second]);
    expect(client.navigate).toHaveBeenCalledTimes(1);
  });

  it("ignora outras mensagens e origens que nao sao aba", async () => {
    const { sw, clients, send } = setup();
    expect(await send({ type: "OTHER" })).toBe(0);
    expect(await send(null)).toBe(0);
    expect(await send({ type: "SKIP_WAITING" }, { id: "w", type: "worker" })).toBe(0);
    expect(await send({ type: "SKIP_WAITING" }, null)).toBe(0);
    expect(sw.skipWaiting).not.toHaveBeenCalled();
    expect(clients[0]!.navigate).not.toHaveBeenCalled();
  });

  it("navigate falhando (aba nao controlada) nao quebra o SW", async () => {
    const client: FakeClient = { id: "a", type: "window", url: "https://x/", navigate: vi.fn(() => Promise.reject(new TypeError("x"))) };
    const { send } = setup([client]);
    await expect(send({ type: "SKIP_WAITING" })).resolves.toBe(1);
    // trava liberada: um clique depois tenta de novo
    await send({ type: "SKIP_WAITING" });
    expect(client.navigate).toHaveBeenCalledTimes(2);
  });
});
