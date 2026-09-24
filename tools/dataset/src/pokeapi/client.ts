// B3.1: cliente PokeAPI com cache em disco, timeout e backoff exponencial.
// Le do cache antes de qualquer rede; --offline usa SO o cache (cache-miss = falha explicita).
// Nunca prossegue com dados parciais: falha de rede sem cache lanca PokeapiError.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

export const POKEAPI_BASE = "https://pokeapi.co/api/v2";
const USER_AGENT = "pontindex-dataset";
const TIMEOUT_MS = 20_000;
const MAX_CONCURRENCY = 6;
/** 1s, 2s, 4s, 8s, 16s: 5 retries apos a tentativa inicial (SPEC B3.1/regras build). */
export const DEFAULT_BACKOFF_MS = [1000, 2000, 4000, 8000, 16000] as const;

export class PokeapiError extends Error {
  readonly code = "E_POKEAPI_UNAVAILABLE" as const;
  constructor(url: string, cause?: unknown) {
    super(`E_POKEAPI_UNAVAILABLE: sem rede e sem cache para ${url}${cause ? ` (${String(cause)})` : ""}`);
    this.name = "PokeapiError";
  }
}

export function isPokeapiError(error: unknown): error is PokeapiError {
  return error instanceof PokeapiError;
}

function sha1(input: string): string {
  return createHash("sha1").update(input).digest("hex");
}

/** Fila com concorrencia maxima (SPEC: 6). */
function createLimiter(max: number) {
  let active = 0;
  const queue: (() => void)[] = [];
  const pump = () => {
    if (active >= max || queue.length === 0) return;
    active++;
    const job = queue.shift();
    job?.();
  };
  return function limit<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push(() => {
        fn()
          .then(resolve, reject)
          .finally(() => {
            active--;
            pump();
          });
      });
      pump();
    });
  };
}

export interface PokeapiClientOptions {
  /** cache de JSON (pasta propria, ex. ctx.cacheDir("pokeapi")) */
  cacheDir: string;
  /** cache de binarios (sprites); padrao = cacheDir/binary */
  binaryCacheDir?: string;
  /** --offline: so cache, nunca faz rede */
  offline: boolean;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  /** ms de espera por tentativa de retry (sobrescrito em teste para nao esperar de verdade) */
  backoffMs?: readonly number[];
  maxConcurrency?: number;
}

export interface PokeapiClient {
  /** null quando o recurso nao existe (404), sem retry. Lanca PokeapiError se offline e sem cache, ou apos esgotar os retries. */
  getJson<T = unknown>(pathOrUrl: string): Promise<T | null>;
  /** binario (sprites): sempre precisa existir; 404 lanca erro. */
  getBinary(url: string): Promise<Uint8Array>;
}

function resolveUrl(pathOrUrl: string, baseUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${baseUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

function extFromUrl(url: string): string {
  try {
    const ext = path.extname(new URL(url).pathname);
    return ext || ".bin";
  } catch {
    return ".bin";
  }
}

export function createPokeapiClient(options: PokeapiClientOptions): PokeapiClient {
  const baseUrl = options.baseUrl ?? POKEAPI_BASE;
  const fetchImpl = options.fetchImpl ?? fetch;
  const backoff = options.backoffMs ?? DEFAULT_BACKOFF_MS;
  const limit = createLimiter(options.maxConcurrency ?? MAX_CONCURRENCY);
  const jsonCacheDir = options.cacheDir;
  const binCacheDir = options.binaryCacheDir ?? path.join(options.cacheDir, "binary");
  mkdirSync(jsonCacheDir, { recursive: true });

  /** null = 404 (sem retry); lanca apos esgotar os retries em erro/429/5xx. */
  async function fetchWithRetry(url: string): Promise<Response | null> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= backoff.length; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetchImpl(url, { headers: { "User-Agent": USER_AGENT }, signal: controller.signal });
        if (res.status === 404) return null;
        if (res.status === 429 || res.status >= 500) {
          lastError = new Error(`HTTP ${res.status} de ${url}`);
        } else if (!res.ok) {
          throw new Error(`HTTP ${res.status} ao buscar ${url}`);
        } else {
          return res;
        }
      } catch (error) {
        lastError = error;
      } finally {
        clearTimeout(timer);
      }
      if (attempt < backoff.length) {
        await new Promise((resolve) => setTimeout(resolve, backoff[attempt]));
      }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  return {
    async getJson<T>(pathOrUrl: string): Promise<T | null> {
      const url = resolveUrl(pathOrUrl, baseUrl);
      const file = path.join(jsonCacheDir, `${sha1(url)}.json`);
      if (existsSync(file)) {
        try {
          return JSON.parse(readFileSync(file, "utf8")) as T;
        } catch {
          rmSync(file, { force: true }); // cache corrompido: apaga e refaz
        }
      }
      if (options.offline) throw new PokeapiError(url);
      return limit(async () => {
        let res: Response | null;
        try {
          res = await fetchWithRetry(url);
        } catch (error) {
          throw new PokeapiError(url, error);
        }
        if (res === null) return null; // 404: recurso inexistente, sem cache negativo
        const data = (await res.json()) as T;
        writeFileSync(file, JSON.stringify(data));
        return data;
      });
    },
    async getBinary(url: string): Promise<Uint8Array> {
      const file = path.join(binCacheDir, `${sha1(url)}${extFromUrl(url)}`);
      if (existsSync(file)) {
        try {
          const data = readFileSync(file);
          if (data.byteLength > 0) return new Uint8Array(data);
          rmSync(file, { force: true });
        } catch {
          rmSync(file, { force: true });
        }
      }
      if (options.offline) throw new PokeapiError(url);
      return limit(async () => {
        let res: Response | null;
        try {
          res = await fetchWithRetry(url);
        } catch (error) {
          throw new PokeapiError(url, error);
        }
        if (res === null) throw new PokeapiError(url, "404");
        const buf = new Uint8Array(await res.arrayBuffer());
        mkdirSync(path.dirname(file), { recursive: true });
        writeFileSync(file, buf);
        return buf;
      });
    },
  };
}
