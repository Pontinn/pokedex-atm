// @vitest-environment node
// T1.1 (type-chart): frases de intuicao (RF-23, RF-24) e textos exatos do modulo i18n da pagina (SPEC 5.3).
// HINT_RELATIONS e HINT_TEXTS sao dado de teste copiado do PRD RF-23; cada relacao e conferida contra o dominio,
// entao mudar TYPE_CHART derruba a frase desatualizada (CA-20).
import { describe, expect, it } from "vitest";
import type { TypeId } from "../../../src/data/types";
import { TYPE_IDS, singleMultiplier } from "../../../src/domain/type-chart";
import { MESSAGES, MESSAGE_MODULES } from "../../../src/i18n/messages";
import { TYPES_PAGE_MESSAGES } from "../../../src/i18n/messages/types-page";
import { HINT_KEYS } from "../../../src/screens/Types/types-model";

const HINT_RELATIONS: Record<TypeId, [TypeId, TypeId, 0 | 2][]> = {
  normal: [["normal", "ghost", 0], ["fighting", "normal", 2]],
  fire: [["fire", "grass", 2], ["fire", "ice", 2], ["water", "fire", 2]],
  water: [["water", "fire", 2], ["grass", "water", 2]],
  electric: [["electric", "water", 2], ["electric", "flying", 2], ["electric", "ground", 0]],
  grass: [["grass", "water", 2], ["grass", "ground", 2], ["fire", "grass", 2]],
  ice: [["ice", "dragon", 2], ["fire", "ice", 2]],
  fighting: [["fighting", "normal", 2], ["psychic", "fighting", 2]],
  poison: [["poison", "grass", 2], ["poison", "fairy", 2], ["poison", "steel", 0]],
  ground: [["ground", "electric", 2], ["ground", "fire", 2], ["water", "ground", 2]],
  flying: [["flying", "grass", 2], ["flying", "bug", 2], ["electric", "flying", 2]],
  psychic: [["psychic", "fighting", 2], ["psychic", "poison", 2], ["bug", "psychic", 2]],
  bug: [["bug", "grass", 2], ["bug", "psychic", 2], ["fire", "bug", 2]],
  rock: [["rock", "fire", 2], ["rock", "flying", 2], ["water", "rock", 2]],
  ghost: [["ghost", "psychic", 2], ["ghost", "normal", 0]],
  dragon: [["dragon", "dragon", 2], ["ice", "dragon", 2], ["fairy", "dragon", 2]],
  dark: [["dark", "psychic", 2], ["dark", "ghost", 2], ["fighting", "dark", 2]],
  steel: [["steel", "ice", 2], ["steel", "rock", 2], ["steel", "fairy", 2], ["fire", "steel", 2]],
  fairy: [["fairy", "dragon", 2], ["poison", "fairy", 2]],
};

const HINT_TEXTS: Record<TypeId, { pt: string; en: string }> = {
  normal: { pt: "Normal não acerta Fantasma, e Lutador vence Normal", en: "Normal can't hit Ghost, and Fighting beats Normal" },
  fire: { pt: "Fogo queima Planta e Gelo, mas Água apaga Fogo", en: "Fire burns Grass and Ice, but Water puts out Fire" },
  water: { pt: "Água apaga Fogo, mas Planta bebe Água", en: "Water puts out Fire, but Grass drinks Water" },
  electric: { pt: "Elétrico vence Água e Voador, mas não afeta Terra", en: "Electric beats Water and Flying, but can't hit Ground" },
  grass: { pt: "Planta vence Água e Terra, mas Fogo queima Planta", en: "Grass beats Water and Ground, but Fire burns Grass" },
  ice: { pt: "Gelo congela Dragão, mas Fogo derrete Gelo", en: "Ice freezes Dragon, but Fire melts Ice" },
  fighting: { pt: "Lutador vence Normal, mas Psíquico vence Lutador", en: "Fighting beats Normal, but Psychic beats Fighting" },
  poison: { pt: "Veneno vence Planta e Fada, mas não afeta Aço", en: "Poison beats Grass and Fairy, but can't hit Steel" },
  ground: { pt: "Terra vence Elétrico e Fogo, mas Água vence Terra", en: "Ground beats Electric and Fire, but Water beats Ground" },
  flying: { pt: "Voador vence Planta e Inseto, mas Elétrico vence Voador", en: "Flying beats Grass and Bug, but Electric beats Flying" },
  psychic: { pt: "Psíquico vence Lutador e Veneno, mas Inseto vence Psíquico", en: "Psychic beats Fighting and Poison, but Bug beats Psychic" },
  bug: { pt: "Inseto vence Planta e Psíquico, mas Fogo vence Inseto", en: "Bug beats Grass and Psychic, but Fire beats Bug" },
  rock: { pt: "Pedra vence Fogo e Voador, mas Água vence Pedra", en: "Rock beats Fire and Flying, but Water beats Rock" },
  ghost: { pt: "Fantasma vence Psíquico, mas não afeta Normal", en: "Ghost beats Psychic, but can't hit Normal" },
  dragon: { pt: "Dragão vence Dragão, mas Gelo e Fada vencem Dragão", en: "Dragon beats Dragon, but Ice and Fairy beat Dragon" },
  dark: { pt: "Sombrio vence Psíquico e Fantasma, mas Lutador vence Sombrio", en: "Dark beats Psychic and Ghost, but Fighting beats Dark" },
  steel: { pt: "Aço vence Gelo, Pedra e Fada, mas Fogo vence Aço", en: "Steel beats Ice, Rock and Fairy, but Fire beats Steel" },
  fairy: { pt: "Fada vence Dragão, mas Veneno vence Fada", en: "Fairy beats Dragon, but Poison beats Fairy" },
};

/** SPEC 5.3: as 45 chaves de F1.1 e as 5 [COULD] de F4.1, PT e EN exatos. */
const PAGE_TEXTS: Record<string, { pt: string; en: string }> = {
  "nav.types": { pt: "Tipos", en: "Types" },
  "nav.typesSub": { pt: "Quem vence quem", en: "Who beats whom" },
  "types.viewLabel": { pt: "Visão", en: "View" },
  "types.viewByType": { pt: "Por tipo", en: "By type" },
  "types.viewChart": { pt: "Tabela completa", en: "Full chart" },
  "types.tabLabel": { pt: "Ponto de vista", en: "Point of view" },
  "types.tabAttack": { pt: "Atacando", en: "Attacking" },
  "types.tabDefend": { pt: "Defendendo", en: "Defending" },
  "types.pickLabel": { pt: "Os 18 tipos", en: "The 18 types" },
  "types.pick": { pt: "Escolha um tipo", en: "Pick a type" },
  "types.legendTitle": { pt: "Legenda", en: "Legend" },
  "types.legend2": { pt: "x2 = causa o dobro de dano", en: "x2 = deals double damage" },
  "types.legendHalf": { pt: "x1/2 = causa metade do dano", en: "x1/2 = deals half damage" },
  "types.legend0": { pt: "x0 = não afeta", en: "x0 = has no effect" },
  "types.legendBands": {
    pt: "Nas faixas: verde = vantagem para o tipo escolhido, laranja = desvantagem, cinza = não afeta",
    en: "In the bands: green = advantage for the chosen type, orange = disadvantage, gray = no effect",
  },
  "types.legendTable": {
    pt: "Na tabela: a linha ataca a coluna; verde = vantagem de quem ataca, laranja = desvantagem de quem ataca, cinza = não afeta",
    en: "In the table: the row attacks the column; green = advantage for the attacker, orange = disadvantage for the attacker, gray = no effect",
  },
  "types.atk2": { pt: "Forte contra (x2)", en: "Strong against (x2)" },
  "types.atkHalf": { pt: "Pouco efetivo contra (x1/2)", en: "Not very effective against (x1/2)" },
  "types.atk0": { pt: "Não afeta (x0)", en: "No effect on (x0)" },
  "types.def2": { pt: "Fraco contra (recebe x2)", en: "Weak to (takes x2)" },
  "types.defHalf": { pt: "Resiste a (recebe x1/2)", en: "Resists (takes x1/2)" },
  "types.def0": { pt: "Imune a (x0)", en: "Immune to (x0)" },
  "types.none": { pt: "nenhum", en: "none" },
  "types.matrixCaption": { pt: "Linhas = quem ataca, colunas = quem defende", en: "Rows = attacker, columns = defender" },
  "types.rowHeader": { pt: "{type} ataca (linha)", en: "{type} attacks (row)" },
  "types.colHeader": { pt: "{type} defende (coluna)", en: "{type} defends (column)" },
  "types.cellLabel": { pt: "{atk} contra {def}: {mult}", en: "{atk} against {def}: {mult}" },
  "types.legend4": { pt: "x4 = causa o quádruplo de dano", en: "x4 = deals quadruple damage" },
  "types.legendQuarter": { pt: "x1/4 = causa um quarto do dano", en: "x1/4 = deals a quarter of the damage" },
  "types.def4": { pt: "Muito fraco contra (recebe x4)", en: "Very weak to (takes x4)" },
  "types.defQuarter": { pt: "Resiste muito a (recebe x1/4)", en: "Strongly resists (takes x1/4)" },
  "types.secondLabel": { pt: "Segundo tipo", en: "Second type" },
};

describe("type-chart intuition hints", () => {
  it("cites 49 relations, all present in the domain chart", () => {
    expect(Object.keys(HINT_RELATIONS)).toEqual([...TYPE_IDS]);
    const all = Object.values(HINT_RELATIONS).flat();
    expect(all).toHaveLength(49);
    for (const [atk, def, m] of all) expect(singleMultiplier(atk, def), `${atk}>${def}`).toBe(m);
  });

  it("maps every type to its hint key with the exact PT/EN text and at most 12 words", () => {
    expect(Object.keys(HINT_KEYS)).toEqual([...TYPE_IDS]);
    for (const type of TYPE_IDS) {
      const msg = MESSAGES[HINT_KEYS[type]];
      expect(msg).toEqual(HINT_TEXTS[type]);
      expect(msg.pt.split(/s+/).length).toBeLessThanOrEqual(12);
      expect(msg.en.split(/s+/).length).toBeLessThanOrEqual(12);
    }
  });
});

describe("type-chart page messages", () => {
  it("has exactly the 50 keys of SPEC 5.3 with the exact PT and EN texts", () => {
    const hintKeys = TYPE_IDS.map((t) => HINT_KEYS[t]);
    expect(Object.keys(TYPES_PAGE_MESSAGES).sort()).toEqual([...Object.keys(PAGE_TEXTS), ...hintKeys].sort());
    for (const [key, text] of Object.entries(PAGE_TEXTS)) expect(MESSAGES[key as keyof typeof MESSAGES], key).toEqual(text);
  });

  it("never uses the em dash and is registered as the types module", () => {
    const emDash = String.fromCharCode(0x2014);
    for (const msg of Object.values(TYPES_PAGE_MESSAGES)) {
      expect(msg.pt).not.toContain(emDash);
      expect(msg.en).not.toContain(emDash);
    }
    expect(MESSAGE_MODULES.types).toBe(TYPES_PAGE_MESSAGES);
  });
});
