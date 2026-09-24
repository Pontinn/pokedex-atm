// Multi-frame QR (SPEC 5.4.2): "PDXF.<index>/<total>.<sessionId>.<chunk>", index 1-based, 900 caracteres por QR.
import { FRAME_CAPACITY, FRAME_PREFIX } from "./types";

const SESSION_PATTERN = /^[0-9a-z]{6}$/;
const MAX_FRAMES = 999;

export function randomSessionId(): string {
  const bytes = new Uint8Array(6);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => (b % 36).toString(36)).join("");
}

/** Texto que cabe em um QR volta como [text]; senao, frames com o cabecalho contando dentro da capacidade. */
export function splitFrames(text: string, capacity: number = FRAME_CAPACITY, sessionId: string = randomSessionId()): string[] {
  if (text.length <= capacity) return [text];
  if (!SESSION_PATTERN.test(sessionId)) throw new RangeError(`invalid sessionId: ${sessionId}`);
  let total = 1;
  for (;;) {
    const header = `${FRAME_PREFIX}${total}/${total}.${sessionId}.`.length; // maior cabecalho possivel
    const chunk = capacity - header;
    if (chunk <= 0) throw new RangeError("capacity too small");
    const needed = Math.ceil(text.length / chunk);
    if (needed <= total) {
      const frames: string[] = [];
      for (let i = 0; i < needed; i++) {
        frames.push(`${FRAME_PREFIX}${i + 1}/${needed}.${sessionId}.${text.slice(i * chunk, (i + 1) * chunk)}`);
      }
      return frames;
    }
    total = needed;
  }
}

export interface FrameStatus {
  complete: boolean;
  received: number;
  total: number;
  sessionId: string | null;
  /** "otherSession": frame de outro codigo (ignorado); "invalidFrame": cabecalho ilegivel */
  error?: "otherSession" | "invalidFrame";
}

/** Recebe frames em qualquer ordem; ignora repetidos; texto sem "PDXF." e tratado como codigo inteiro. */
export class FrameCollector {
  private frames = new Map<number, string>();
  private total = 0;
  private sessionId: string | null = null;
  private whole: string | null = null;

  add(frameText: string): FrameStatus {
    const text = frameText.replace(/\s+/g, "");
    if (!text.startsWith(FRAME_PREFIX)) {
      this.reset();
      this.whole = text;
      return { complete: true, received: 1, total: 1, sessionId: null };
    }
    const parsed = parseFrame(text);
    if (!parsed) return { ...this.status(), error: "invalidFrame" };
    if (this.sessionId === null) {
      this.sessionId = parsed.sessionId;
      this.total = parsed.total;
    } else if (parsed.sessionId !== this.sessionId || parsed.total !== this.total) {
      return { ...this.status(), error: "otherSession" };
    }
    if (!this.frames.has(parsed.index)) this.frames.set(parsed.index, parsed.chunk);
    return this.status();
  }

  status(): FrameStatus {
    if (this.whole !== null) return { complete: true, received: 1, total: 1, sessionId: null };
    return {
      complete: this.total > 0 && this.frames.size === this.total,
      received: this.frames.size,
      total: this.total,
      sessionId: this.sessionId,
    };
  }

  /** Codigo inteiro ("PDX1....") ou null se ainda faltam frames. */
  assemble(): string | null {
    if (this.whole !== null) return this.whole;
    if (!this.status().complete) return null;
    let out = "";
    for (let i = 1; i <= this.total; i++) out += this.frames.get(i)!;
    return out;
  }

  reset(): void {
    this.frames.clear();
    this.total = 0;
    this.sessionId = null;
    this.whole = null;
  }
}

function parseFrame(text: string): { index: number; total: number; sessionId: string; chunk: string } | null {
  // divide so nos 3 primeiros pontos: "PDXF" . "i/n" . session . chunk
  const rest = text.slice(FRAME_PREFIX.length);
  const d1 = rest.indexOf(".");
  if (d1 < 0) return null;
  const d2 = rest.indexOf(".", d1 + 1);
  if (d2 < 0) return null;
  const m = /^(\d{1,3})\/(\d{1,3})$/.exec(rest.slice(0, d1));
  const sessionId = rest.slice(d1 + 1, d2);
  const chunk = rest.slice(d2 + 1);
  if (!m || !SESSION_PATTERN.test(sessionId) || chunk.length === 0) return null;
  const index = Number(m[1]);
  const total = Number(m[2]);
  if (total < 1 || total > MAX_FRAMES || index < 1 || index > total) return null;
  return { index, total, sessionId, chunk };
}
