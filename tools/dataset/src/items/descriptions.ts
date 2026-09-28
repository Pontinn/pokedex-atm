// item-descriptions: descricao do item. Fonte 1 (jogo, sempre vence), na ordem:
//   item.<ns>.<path>.tooltip, item.<ns>.<path>.tooltip_1..N (juntadas), tooltip.<ns>.<path>.tooltip,
//   block.<ns>.<path>.tooltip. Codigos de formatacao do Minecraft (`§` + 1 caractere) sao removidos.
// Fonte 2 (curado): tools/dataset/curated/item-descriptions.json, so para itens sem texto no jogo.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { LocalizedText } from "../../../../src/data/types";
import type { LangTable } from "../context";
import { PipelineError } from "../lib/errors";

export const CURATED_DESCRIPTIONS_FILE = path.resolve(import.meta.dirname, "../../curated/item-descriptions.json");

const FORMATTING_CODE = /§./gu;
const TOOLTIP_LINE_KEY = /^(item\.[^.]+\..+)\.tooltip_(\d+)$/;
const TERMINAL_PUNCTUATION = /[.!?:;…]$/u;

/** Remove os codigos `§x` do Minecraft e normaliza espacos. */
export function stripFormattingCodes(text: string): string {
  return text.replace(FORMATTING_CODE, "").replace(/\s+/gu, " ").trim();
}

/** Junta as linhas de tooltip num texto so: separadas por espaco, com ponto final entre linhas que nao tem pontuacao. */
export function joinTooltipLines(lines: readonly string[]): string {
  const clean = lines.map(stripFormattingCodes).filter((line) => line.length > 0);
  return clean.map((line, i) => (i < clean.length - 1 && !TERMINAL_PUNCTUATION.test(line) ? `${line}.` : line)).join(" ");
}

type TooltipLineIndex = ReadonlyMap<string, readonly { n: number; key: string }[]>;

/** "item.<ns>.<path>" -> chaves tooltip_N ordenadas pelo numero (buracos na numeracao sao ignorados). */
function indexTooltipLines(lang: LangTable): TooltipLineIndex {
  const index = new Map<string, { n: number; key: string }[]>();
  const seen = new Set<string>();
  for (const map of [lang.pt, lang.en]) {
    for (const key of map.keys()) {
      if (seen.has(key)) continue;
      const match = TOOLTIP_LINE_KEY.exec(key);
      if (!match) continue;
      seen.add(key);
      const base = match[1] as string;
      const list = index.get(base) ?? [];
      list.push({ n: Number(match[2]), key });
      index.set(base, list);
    }
  }
  for (const list of index.values()) list.sort((a, b) => a.n - b.n);
  return index;
}

/** {pt, en} com o mesmo fallback do lang.text (en -> pt e pt -> en); null se os dois ficarem vazios. */
function localized(pt: string, en: string): LocalizedText | null {
  if (!pt && !en) return null;
  return { pt: pt || en, en: en || pt };
}

function singleKey(lang: LangTable, key: string): LocalizedText | null {
  return localized(stripFormattingCodes(lang.pt.get(key) ?? ""), stripFormattingCodes(lang.en.get(key) ?? ""));
}

function joinedKeys(lang: LangTable, keys: readonly string[]): LocalizedText | null {
  const pick = (map: ReadonlyMap<string, string>) => joinTooltipLines(keys.map((k) => map.get(k) ?? ""));
  return localized(pick(lang.pt), pick(lang.en));
}

export type GameDescriptionResolver = (namespace: string, itemPath: string) => LocalizedText | null;

/** Resolve a descricao do jogo; chave vazia ou so com codigos de cor conta como ausente e passa para a proxima fonte. */
export function createGameDescriptionResolver(lang: LangTable): GameDescriptionResolver {
  const lines = indexTooltipLines(lang);
  return (namespace, itemPath) => {
    const itemKey = `item.${namespace}.${itemPath}`;
    const lineKeys = lines.get(itemKey)?.map((l) => l.key) ?? [];
    return (
      singleKey(lang, `${itemKey}.tooltip`) ??
      (lineKeys.length > 0 ? joinedKeys(lang, lineKeys) : null) ??
      singleKey(lang, `tooltip.${namespace}.${itemPath}.tooltip`) ??
      singleKey(lang, `block.${namespace}.${itemPath}.tooltip`)
    );
  };
}

// ---------------------------------------------------------------------------
// Fonte 2: arquivo curado { "<ns>:<path>": { "en": string, "pt": string } }. PT e EN obrigatorios (nao vazios).
// ---------------------------------------------------------------------------

const curatedTextSchema = z.string().trim().min(1);
export const curatedDescriptionsSchema = z.record(
  z.string().regex(/^[a-z0-9_.-]+:[a-z0-9_./-]+$/, "id deve ser <namespace>:<path>"),
  z.object({ pt: curatedTextSchema, en: curatedTextSchema }).strict(),
);

export type CuratedDescriptions = ReadonlyMap<string, LocalizedText>;

/** Valida o conteudo do arquivo curado; qualquer entrada invalida derruba o pipeline (E_JSON_INVALID) com os ids na mensagem. */
export function parseCuratedDescriptions(raw: unknown, where: string): CuratedDescriptions {
  const parsed = curatedDescriptionsSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.slice(0, 20).map((i) => `${i.path.join(".") || "(raiz)"}: ${i.message}`);
    throw new PipelineError("E_JSON_INVALID", "descricoes curadas invalidas", `${where}: ${issues.join("; ")}`);
  }
  return new Map(Object.entries(parsed.data).map(([id, text]) => [id, { pt: text.pt, en: text.en }]));
}

/** Le o arquivo curado; ausente = sem descricoes curadas. */
export function loadCuratedDescriptions(file: string = CURATED_DESCRIPTIONS_FILE): CuratedDescriptions {
  if (!existsSync(file)) return new Map();
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new PipelineError("E_JSON_INVALID", "JSON invalido", `${file}: ${String(error)}`);
  }
  return parseCuratedDescriptions(raw, file);
}

export interface CuratedApplyResult<T> {
  entries: T[];
  /** ids que receberam a descricao curada */
  fromCurated: string[];
  /** ids curados ignorados porque o jogo ja tem descricao (o jogo vence) */
  shadowedByGame: string[];
  /** ids curados que nao existem no catalogo (ignorados) */
  unknownIds: string[];
}

/** Preenche com o texto curado so as entradas sem descricao do jogo; nao muda o conjunto de ids. */
export function applyCuratedDescriptions<T extends { id: string; description: LocalizedText | null }>(
  entries: readonly T[],
  curated: CuratedDescriptions,
): CuratedApplyResult<T> {
  const known = new Set(entries.map((e) => e.id));
  const fromCurated: string[] = [];
  const shadowedByGame: string[] = [];
  const out = entries.map((entry) => {
    const text = curated.get(entry.id);
    if (!text) return entry;
    if (entry.description) {
      shadowedByGame.push(entry.id);
      return entry;
    }
    fromCurated.push(entry.id);
    return { ...entry, description: { pt: text.pt, en: text.en } };
  });
  const unknownIds = [...curated.keys()].filter((id) => !known.has(id)).sort();
  return { entries: out, fromCurated, shadowedByGame, unknownIds };
}
