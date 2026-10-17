// Modelo puro da pagina Naturezas (natures): deriva grade 5 x 5, grupos por status e rotulos de src/domain/natures.ts.
// Nao duplica a tabela do dominio: tudo vem de NATURES.
import type { LocalizedText } from "../../data/types";
import { NATURES, getNature, type BattleStatKey, type Nature } from "../../domain/natures";
import type { MessageKey } from "../../i18n/messages";
import type { UiStateMap } from "../../navigation/types";

export type NaturesUi = UiStateMap["natures"];

/** Ordem de exibicao dos 5 status (mesma da ficha: Ataque, Defesa, At. Esp., Def. Esp., Velocidade). */
export const BATTLE_STATS: readonly BattleStatKey[] = ["attack", "defence", "specialAttack", "specialDefence", "speed"];

/** Rotulo de cada status (chaves de core.ts). Mapa proprio: a pagina nao importa da ficha. */
export const STAT_LABEL = {
  attack: "stat.atk",
  defence: "stat.def",
  specialAttack: "stat.spa",
  specialDefence: "stat.spd",
  speed: "stat.spe",
} as const satisfies Record<BattleStatKey, MessageKey>;

/** Sinais sempre junto da cor (temas preto e branco e acessibilidade). */
export const UP_SIGN = "+10%";
export const DOWN_SIGN = "-10%";
export const PLUS = "+";
export const MINUS = "-";

export interface NatureCell {
  up: BattleStatKey;
  down: BattleStatKey;
  nature: Nature;
  neutral: boolean;
}
export interface NatureRow {
  up: BattleStatKey;
  cells: NatureCell[];
}
export interface StatGroups {
  stat: BattleStatKey;
  raise: Nature[];
  lower: Nature[];
}

export function isNeutral(n: Nature): boolean {
  return n.up === null || n.up === n.down;
}

export const NEUTRAL_NATURES: readonly Nature[] = NATURES.filter(isNeutral);

export function isNatureId(v: unknown): v is string {
  return typeof v === "string" && getNature(v) !== undefined;
}

export function isBattleStat(v: unknown): v is BattleStatKey {
  return typeof v === "string" && (BATTLE_STATS as readonly string[]).includes(v);
}

export function natureName(n: Nature, lang: keyof LocalizedText): string {
  return n.name[lang];
}

/**
 * Status "dono" de cada natureza neutra, para a diagonal da grade. O dominio lista as 25 em 5 blocos de 5
 * (cada bloco = um status que aumenta, com a neutra dentro dele): a neutra herda o `up` dos vizinhos do bloco.
 */
export function neutralStat(n: Nature): BattleStatKey {
  const start = Math.floor(NATURES.indexOf(n) / 5) * 5;
  const owner = NATURES.slice(start, start + 5).find((x) => !isNeutral(x))?.up;
  if (!owner) throw new Error(`natures: bloco sem status para ${n.id}`);
  return owner;
}

/** Grade 5 x 5: linha = status que aumenta, coluna = status que diminui; diagonal = a neutra do status. */
export function natureGrid(): NatureRow[] {
  return BATTLE_STATS.map((up) => ({
    up,
    cells: BATTLE_STATS.map((down) => {
      const nature =
        up === down ? NEUTRAL_NATURES.find((n) => neutralStat(n) === up) : NATURES.find((n) => n.up === up && n.down === down);
      if (!nature) throw new Error(`natures: celula vazia ${up}/${down}`);
      return { up, down, nature, neutral: up === down };
    }),
  }));
}

/** As 4 naturezas que aumentam e as 4 que diminuem o status, na ordem dos status (BATTLE_STATS). */
export function statGroups(stat: BattleStatKey): StatGroups {
  const pos = (s: BattleStatKey | null) => (s === null ? -1 : BATTLE_STATS.indexOf(s));
  return {
    stat,
    raise: NATURES.filter((n) => !isNeutral(n) && n.up === stat).sort((a, b) => pos(a.down) - pos(b.down)),
    lower: NATURES.filter((n) => !isNeutral(n) && n.down === stat).sort((a, b) => pos(a.up) - pos(b.up)),
  };
}
