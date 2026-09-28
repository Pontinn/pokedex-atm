// U8 (pwa-auto-update): nomes do jogo para o que o dataset cita e o lang do app nao traz: blocos (`blockDrop`),
// mobs (`mobDrop`), estruturas (`structurePlaced`), itens sem lang proprio (os `minecraft:*`) e o item segurado das
// notas `special`. Fonte = lang en_us/pt_br de TODO jar de `mods/` (ordem do nome do arquivo, o primeiro vence) e do
// Minecraft 1.21.1 (en_us no jar do cliente; pt_br no asset store do launcher, indice do `versions/<v>/<v>.json`).
// Esta tabela e SEPARADA de ctx.lang: ctx.lang define o catalogo (chaves item.<ns>.*), esta so da nomes.
// Precedencia de uma chave: ctx.lang (6 namespaces do app + kubejs por cima, D6) > jars > vanilla.
// en e obrigatorio para ter nome; pt cai para en; en nunca recebe texto pt (D6).
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { unzipSync } from "fflate";
import type { LocalizedText } from "../../../../src/data/types";
import type { LangTable, PipelineContext } from "../context";
import type { LangCode } from "../lang";
import { modJarPaths, parseLenient, vanillaJarPath, VANILLA_VERSION } from "./recipes";

export interface NameLang {
  en: Map<string, string>;
  pt: Map<string, string>;
}

export interface NameLangLayer {
  /** ex. "Aether-1.21.1.jar!assets/aether/lang/en_us.json", "vanilla!..." */
  origin: string;
  lang: LangCode;
  entries: Record<string, string>;
}

const LANG_RE = /^assets\/([^/]+)\/lang\/(en_us|pt_br)\.json$/;
const LANG_CODES: readonly LangCode[] = ["en_us", "pt_br"];

/** `assets/<ns>/lang/{en_us,pt_br}.json` de um jar aberto (pasta) ou zip, em ordem de caminho. */
export function readJarLangFiles(jarPath: string): { path: string; bytes: Uint8Array }[] {
  const out: { path: string; bytes: Uint8Array }[] = [];
  if (statSync(jarPath).isDirectory()) {
    const assets = path.join(jarPath, "assets");
    if (!existsSync(assets)) return out;
    for (const ns of readdirSync(assets).sort()) {
      for (const lang of LANG_CODES) {
        const rel = `assets/${ns}/lang/${lang}.json`;
        const full = path.join(jarPath, rel);
        if (existsSync(full)) out.push({ path: rel, bytes: readFileSync(full) });
      }
    }
  } else {
    const entries = unzipSync(readFileSync(jarPath), { filter: (f) => LANG_RE.test(f.name) });
    for (const [p, bytes] of Object.entries(entries)) out.push({ path: p, bytes });
  }
  return out.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

/** Arquivo pt_br.json do Minecraft: snapshot `vanilla/assets/minecraft/lang/pt_br.json`; instancia = asset store do launcher. */
export function vanillaPtBrPath(root: string, mode: "snapshot" | "instance"): string | null {
  if (mode === "snapshot") return path.join(root, "vanilla", "assets", "minecraft", "lang", "pt_br.json");
  const install = path.resolve(root, "..", "..", "Install");
  const versionJson = path.join(install, "versions", VANILLA_VERSION, `${VANILLA_VERSION}.json`);
  if (!existsSync(versionJson)) return null;
  const version = parseLenient(readFileSync(versionJson)) as { assetIndex?: { id?: unknown } } | undefined;
  const indexId = version?.assetIndex?.id;
  if (typeof indexId !== "string") return null;
  const indexFile = path.join(install, "assets", "indexes", `${indexId}.json`);
  if (!existsSync(indexFile)) return null;
  const index = parseLenient(readFileSync(indexFile)) as { objects?: Record<string, { hash?: unknown }> } | undefined;
  const hash = index?.objects?.["minecraft/lang/pt_br.json"]?.hash;
  if (typeof hash !== "string") return null;
  return path.join(install, "assets", "objects", hash.slice(0, 2), hash);
}

function toEntries(data: unknown): Record<string, string> | null {
  if (typeof data !== "object" || data === null || Array.isArray(data)) return null;
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) if (typeof v === "string") clean[k] = v;
  return clean;
}

/** Tabela de nomes: a primeira camada com a chave vence (camadas ja na ordem de precedencia). */
export function buildNameLang(layers: readonly NameLangLayer[]): NameLang {
  const out: NameLang = { en: new Map(), pt: new Map() };
  for (const layer of layers) {
    const target = layer.lang === "pt_br" ? out.pt : out.en;
    for (const [key, value] of Object.entries(layer.entries)) if (!target.has(key)) target.set(key, value);
  }
  return out;
}

/** Camadas: jars de `mods/` (ordem do nome do arquivo) e depois o vanilla. JSON invalido e pulado com aviso (o jogo nao carrega). */
export function readNameLangLayers(ctx: Pick<PipelineContext, "reader" | "report">): NameLangLayer[] {
  const layers: NameLangLayer[] = [];
  const push = (origin: string, lang: LangCode, bytes: Uint8Array) => {
    const entries = toEntries(parseLenient(bytes));
    if (!entries) {
      ctx.report.warn("W_NAME_LANG_INVALID", `lang ignorado (JSON invalido): ${origin}`, { origin });
      return;
    }
    layers.push({ origin, lang, entries });
  };
  for (const jar of modJarPaths(ctx.reader.root)) {
    for (const f of readJarLangFiles(jar.path)) push(`${jar.fileName}!${f.path}`, LANG_RE.exec(f.path)?.[2] as LangCode, f.bytes);
  }
  const vanillaJar = vanillaJarPath(ctx.reader.root, ctx.reader.mode);
  const en = existsSync(vanillaJar) ? readJarLangFiles(vanillaJar).find((f) => f.path === "assets/minecraft/lang/en_us.json") : undefined;
  if (en) push(`vanilla!${en.path}`, "en_us", en.bytes);
  else ctx.report.warn("W_NAME_LANG_VANILLA_MISSING", `lang en_us do Minecraft ${VANILLA_VERSION} nao encontrado`, { path: vanillaJar });
  const ptPath = vanillaPtBrPath(ctx.reader.root, ctx.reader.mode);
  if (ptPath && existsSync(ptPath)) push("vanilla!assets/minecraft/lang/pt_br.json", "pt_br", readFileSync(ptPath));
  else ctx.report.warn("W_NAME_LANG_VANILLA_MISSING", `lang pt_br do Minecraft ${VANILLA_VERSION} nao encontrado`, { path: ptPath });
  return layers;
}

export function loadNameLang(ctx: Pick<PipelineContext, "reader" | "report">): NameLang {
  return buildNameLang(readNameLangLayers(ctx));
}

/** Resolve nomes por chave: ctx.lang (com kubejs) vence, depois jars/vanilla. */
export type NameResolver = (key: string) => LocalizedText | null;

export function createNameResolver(lang: Pick<LangTable, "en" | "pt">, names: NameLang): NameResolver {
  return (key) => {
    const en = lang.en.get(key) ?? names.en.get(key);
    if (en === undefined || en === "") return null;
    return { pt: lang.pt.get(key) ?? names.pt.get(key) ?? en, en };
  };
}

/** Chave de lang de uma ref `<ns>:<caminho>`: `<prefixo>.<ns>.<caminho com / trocado por .>`. */
export function refLangKey(prefix: "block" | "entity" | "structure", id: string): string {
  const [ns, ...rest] = id.split(":");
  return `${prefix}.${ns}.${rest.join(":").split("/").join(".")}`;
}

/** Nome de um item: `item.<ns>.<path>`, senao `block.<ns>.<path>` (item de bloco). */
export function itemName(resolve: NameResolver, id: string): LocalizedText | null {
  const [ns, ...rest] = id.split(":");
  const p = rest.join(":");
  return resolve(`item.${ns}.${p}`) ?? resolve(`block.${ns}.${p}`);
}
