// Regras de exibicao da pagina do item (F9.3), puras e testaveis com o dataset real.
import type { ItemInfo, ItemNamedRef, ItemObtainRoute, ItemQuestRef, ItemTrader, ItemUnobtainableReason, LocalizedText, SeriesInfo } from "../../data/types";
import { ITEM_MESSAGES } from "../../i18n/messages/item";
import type { TranslateFn } from "../../i18n/useT";
import { humanizeId } from "../Trainers/trainer-model";

/** Rota "sem rota" quando o item nao tem nenhuma rota conhecida (RF-69). */
export function obtainRows(item: Pick<ItemInfo, "obtain"> | null): ItemObtainRoute[] {
  const rows = (item?.obtain ?? []).filter((r) => r.kind !== "none");
  return rows.length ? rows : [{ kind: "none" }];
}

const RECIPE_LABELS: ReadonlyArray<[RegExp, LocalizedText]> = [
  [/crafting_/, { pt: "Bancada de trabalho", en: "Crafting table" }],
  [/:smelting$/, { pt: "Fornalha", en: "Furnace" }],
  [/:blasting$/, { pt: "Alto-forno", en: "Blast furnace" }],
  [/:smoking$/, { pt: "Defumador", en: "Smoker" }],
  [/:campfire_cooking$/, { pt: "Fogueira", en: "Campfire" }],
  [/:stonecutting$/, { pt: "Cortador de pedras", en: "Stonecutter" }],
  [/:smithing/, { pt: "Mesa de ferraria", en: "Smithing table" }],
  [/brewing_stand$/, { pt: "Suporte de poções", en: "Brewing stand" }],
  // spawn-bait RF-31/RF-47: nome do jogo (cobblemon.container.campfire_pot), texto so no dicionario
  [/cooking_pot/, ITEM_MESSAGES["ip.station.campfirePot"]],
];

const SMITHING_TABLE: LocalizedText = { pt: "Mesa de ferraria", en: "Smithing table" };
const ATOMIC_RECONSTRUCTOR: LocalizedText = { pt: "Reconstrutor Atômico", en: "Atomic Reconstructor" };

/**
 * Tipos de receita dos mods do pack (U7e), com o nome que o jogo mostra: o bloco da maquina quando a receita
 * roda numa maquina so, senao o titulo da categoria no JEI. Textos das lang en_us/pt_br dos jars do pack, com os
 * overrides pt_br do kubejs por cima; sem pt no jogo, o en nos dois.
 */
export const RECIPE_TYPE_LABELS: Readonly<Record<string, LocalizedText>> = {
  "actuallyadditions:color_change": ATOMIC_RECONSTRUCTOR,
  "actuallyadditions:crushing": { pt: "Triturador", en: "Crusher" },
  "actuallyadditions:laser": ATOMIC_RECONSTRUCTOR,
  "aether:freezing": { pt: "Congelador", en: "Freezer" },
  "apokinetics:frostwork": { pt: "Congelamento", en: "Frostwork" },
  "apokinetics:momentum": { pt: "Momento", en: "Momentum" },
  "apotheosis:sized_upgrade_recipe": SMITHING_TABLE,
  "apothic_enchanting:infusion": { pt: "Encantamento por Infusão", en: "Infusion Enchanting" },
  "botanypots:crop": { pt: "Vaso de Botânica", en: "Botany Pot" },
  "cobblegengalore:blockgen": { pt: "Block Generator", en: "Block Generator" },
  "create:compacting": { pt: "Compactando", en: "Compacting" },
  "create:crushing": { pt: "Roda Moedora", en: "Crushing Wheel" },
  "create:cutting": { pt: "Serra Mecânica", en: "Mechanical Saw" },
  "create:deploying": { pt: "Implantador", en: "Deployer" },
  "create:filling": { pt: "Bica", en: "Spout" },
  "create:haunting": { pt: "Assombração em massa", en: "Bulk Haunting" },
  "create:mechanical_crafting": { pt: "Fabricador Mecânico", en: "Mechanical Crafter" },
  "create:milling": { pt: "Moedor", en: "Millstone" },
  "create:mixing": { pt: "Batedeira Mecânica", en: "Mechanical Mixer" },
  "create:pressing": { pt: "Prensa Mecânica", en: "Mechanical Press" },
  "create:sequenced_assembly": { pt: "Montagem sequenciada", en: "Recipe Sequence" },
  "create:splashing": { pt: "Lavagem em massa", en: "Bulk Washing" },
  "create_aquatic_ambitions:channeling": { pt: "Canalização com Aqueduto", en: "Conduit Channeling" },
  "create_dragons_plus:ending": { pt: "Baforização em Massa", en: "Bulk Ending" },
  "create_dragons_plus:freezing": { pt: "Congelamento em Massa", en: "Bulk Freezing" },
  "enderio:alloy_smelting": { pt: "Fundição de Ligas", en: "Alloy Smelter" },
  "enderio:sag_milling": { pt: "Triturador SAG", en: "SAG Mill" },
  "enderio:tank": { pt: "Tanque de Fluido", en: "Fluid Tank" },
  "eternal_starlight:alloy": { pt: "Fornalha de Liga", en: "Alloy Furnace" },
  "eternal_starlight:drying": { pt: "Cremalheira de Secagem", en: "Drying Rack" },
  "extendedae:circuit_cutter": { pt: "Fatiador de Circuitos", en: "Circuit Slicer" },
  "farmersdelight:cutting": { pt: "Tábua de Corte", en: "Cutting Board" },
  "farmingforblockheads:market": { pt: "Mercado", en: "Market" },
  "forbidden_arcanus:clibano_combustion": { pt: "Clibano", en: "Clibano" },
  "immersiveengineering:arc_furnace": { pt: "Forno de Arco", en: "Arc Furnace" },
  "immersiveengineering:bottling_machine": { pt: "Máquina de Engarrafamento", en: "Bottling Machine" },
  "immersiveengineering:cloche": { pt: "Redoma de Jardim", en: "Garden Cloche" },
  "immersiveengineering:coke_oven": { pt: "Forno de Coque", en: "Coke Oven" },
  "immersiveengineering:crusher": { pt: "Triturador", en: "Crusher" },
  "immersiveengineering:mineral_mix": { pt: "Escavadeira", en: "Excavator" },
  "industrialforegoing:crusher": { pt: "Fábrica de Processamento de Pedra", en: "Material StoneWork Factory" },
  "industrialforegoing:laser_drill_ore": { pt: "Base de Laser de Minério", en: "Ore Laser Base" },
  "integrateddynamics:drying_basin": { pt: "Bacia de Secagem", en: "Drying Basin" },
  "integrateddynamics:mechanical_drying_basin": { pt: "Bacia de Secagem Mecânica", en: "Mechanical Drying Basin" },
  "mekanism:combining": { pt: "Combinador", en: "Combiner" },
  "mekanism:crushing": { pt: "Triturador", en: "Crusher" },
  "mekanism:enriching": { pt: "Câmara de Enriquecimento", en: "Enrichment Chamber" },
  "mekanism:injecting": { pt: "Câmara de Injeção Química", en: "Chemical Injection Chamber" },
  "mekanism:metallurgic_infusing": { pt: "Infusor Metalúrgico", en: "Metallurgic Infuser" },
  "mekanism:nucleosynthesizing": { pt: "Nucleossintetizador Antiprotônico", en: "Antiprotonic Nucleosynthesizer" },
  "mekanism:painting": { pt: "Máquina de Pintura", en: "Painting Machine" },
  "mekanism:sawing": { pt: "Serraria de Precisão", en: "Precision Sawmill" },
  "mekmm:lathe": { pt: "Torno CNC", en: "CNC Lathe" },
  "mekmm:stamper": { pt: "Estampador CNC", en: "CNC Stamper" },
  "naturesaura:altar": { pt: "Altar Natural", en: "Natural Altar" },
  "occultism:crushing": { pt: "Espírito Triturador", en: "Crusher Spirit" },
  "occultism:crystallize": { pt: "Espírito Cristalizador", en: "Crystallizer Spirit" },
  "oritech:assembler": { pt: "Montadora", en: "Assembler" },
  "oritech:atomic_forge": { pt: "Forja Atômica", en: "Atomic Forge" },
  "oritech:deep_drill": { pt: "Extrator de Rocha Matriz", en: "Bedrock Extractor" },
  "oritech:foundry": { pt: "Fundição", en: "Foundry" },
  "oritech:grinder": { pt: "Forja de Fragmentos", en: "Fragment Forge" },
  "oritech:particle_collision": { pt: "Acelerador de Partículas", en: "Particle Accelerator" },
  "oritech:pulverizer": { pt: "Pulverizador", en: "Pulverizer" },
  "oritech:refinery": { pt: "Refinaria", en: "Refinery" },
  "pneumaticcraft:assembly_drill": { pt: "Broca de Montagem", en: "Assembly Drill" },
  "pneumaticcraft:assembly_laser": { pt: "Laser de Montagem", en: "Assembly Laser" },
  "pneumaticcraft:pressure_chamber": { pt: "Câmara de Pressão", en: "Pressure Chamber" },
  "productivebees:advanced_beehive": { pt: "Colmeia Avançada", en: "Advanced Beehive" },
  "productivebees:bottler": { pt: "Engarrafador", en: "Bottler" },
  "productivebees:centrifuge": { pt: "Centrífuga", en: "Centrifuge" },
  "productivemetalworks:block_casting": { pt: "Bacia de Moldagem", en: "Casting Basin" },
  "productivemetalworks:item_casting": { pt: "Mesa de Moldagem", en: "Casting Table" },
  "pylons:harvesting": { pt: "Pilão Colhedor", en: "Harvester Pylon" },
  "railcraft:coking": { pt: "Forno de Coque", en: "Coke Oven" },
  "railcraft:crusher": { pt: "Triturador", en: "Crusher" },
  "silentgear:salvaging": { pt: "Reciclador", en: "Salvager" },
  "theurgy:incubation": { pt: "Incubadora", en: "Incubator" },
};

/** Rotulo do jogo para o tipo de receita, ou null quando nao ha rotulo conhecido. */
export function recipeTypeLabel(type: string): LocalizedText | null {
  return RECIPE_TYPE_LABELS[type] ?? RECIPE_LABELS.find(([re]) => re.test(type))?.[1] ?? null;
}

/** Tipos de receita legiveis e sem repeticao (nunca a receita em si, RF-68). */
export function recipeLabels(types: readonly string[], lang: "pt" | "en"): string[] {
  const out: string[] = [];
  for (const type of types) {
    const hit = recipeTypeLabel(type);
    const label = hit ? hit[lang] : humanizeId(type);
    if (!out.includes(label)) out.push(label);
  }
  return out;
}

/** Rotulo humano das tags de ingrediente da Panela de Fogueira (spawn-bait RF-30): nunca o id cru. */
export const INGREDIENT_TAG_KEYS: Readonly<Record<string, string>> = { "c:drinks/milk": "ip.ingredientTag.milk", "c:mushrooms": "ip.ingredientTag.mushrooms" };

export function ingredientTagLabel(tag: string, t: TranslateFn): string {
  const key = INGREDIENT_TAG_KEYS[tag];
  return key ? t(key) : t("ip.ingredientTag.any", { name: humanizeId(tag.replace(/^#/, "")) });
}

/** Nome legivel de uma tabela de loot ("ruins/gilded_chests/base" -> "Ruins: Gilded chests (base)"). */
export function lootTableLabel(table: string): string {
  const parts = table.replace(/^[a-z0-9_]+:/, "").split("/").filter(Boolean);
  const words = parts.map((p) => p.replace(/_/g, " "));
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  if (words.length === 1) return cap(words[0]!);
  const last = words[words.length - 1]!;
  const head = words.slice(0, -1).map(cap).join(": ");
  return `${head} (${last})`;
}

/** Tabelas humanizadas sem repeticao. */
export function lootLabels(tables: readonly string[]): string[] {
  return [...new Set(tables.map(lootTableLabel))];
}

/** Chance por vitoria (0..1) como porcentagem curta: 1 -> "100%", 0.125 -> "12.5%"; null quando nao calculavel. */
export function chanceLabel(chance: number | null): string | null {
  if (chance == null || !Number.isFinite(chance)) return null;
  const pct = Math.round(Math.min(Math.max(chance, 0), 1) * 1000) / 10;
  return `${pct}%`;
}

/** Titulo da serie do treinador (series.json), com fallback para o id humanizado. */
export function seriesTitle(seriesId: string, series: readonly SeriesInfo[] | null, lang: "pt" | "en"): string {
  const hit = series?.find((s) => s.id === seriesId);
  return hit ? hit.title[lang] || hit.title.en : humanizeId(seriesId);
}

/** Chave i18n do titulo de "Nao obtivel" conforme o motivo. */
export function unobtainableKey(reason: ItemUnobtainableReason | undefined): string {
  return reason ? `ip.unobtainable.${reason}` : "ip.unobtainable";
}

/** Quantos chips uma fonte de lista mostra antes do "e mais N" (U7e: diamante tem 199 tabelas de loot). */
export const OBTAIN_LIST_CAP = 12;

/** Corta a lista no limite quando fechada; `hidden` = quantos ficaram de fora (0 = nada escondido). */
export function capList<T>(list: readonly T[], expanded: boolean, cap: number = OBTAIN_LIST_CAP): { shown: readonly T[]; hidden: number } {
  if (expanded || list.length <= cap) return { shown: list, hidden: 0 };
  return { shown: list.slice(0, cap), hidden: list.length - cap };
}

/** Texto no idioma pedido, caindo para o EN quando o PT esta vazio. */
function pick(text: LocalizedText, lang: "pt" | "en"): string {
  return text[lang] || text.en;
}

/** Nome de bloco / mob / estrutura (contrato v2): nome do lang do pack, fallback id humanizado. */
export function namedRefLabel(ref: ItemNamedRef, lang: "pt" | "en"): string {
  return ref.name ? pick(ref.name, lang) || humanizeId(ref.id) : humanizeId(ref.id);
}

/** Rotulos de refs sem repeticao, na ordem do array. */
export function namedRefLabels(refs: readonly ItemNamedRef[], lang: "pt" | "en"): string[] {
  return [...new Set(refs.map((r) => namedRefLabel(r, lang)))];
}

/** Missao do FTB Quests: titulo e capitulo no idioma pedido (null quando o jogo nao tem o texto). */
export function questLabel(quest: ItemQuestRef, lang: "pt" | "en"): { title: string | null; chapter: string | null } {
  return { title: quest.title ? pick(quest.title, lang) || null : null, chapter: quest.chapter ? pick(quest.chapter, lang) || null : null };
}

/** Chave i18n do comerciante (fonte "trade"). */
export function traderKey(trader: ItemTrader): string {
  return `ip.trader.${trader}`;
}

/** Ids crus (rituais, features de worldgen) humanizados sem repeticao. */
export function idLabels(ids: readonly string[]): string[] {
  return [...new Set(ids.map(humanizeId))];
}

/** Item citado mas fora do items.json (ex. minecraft:gunpowder): pagina minima com o id humanizado. */
export function unknownItemName(id: string): LocalizedText {
  const name = humanizeId(id);
  return { pt: name, en: name };
}

/** "Efeito" em Usado em: descricao oficial de itens de cura, cozinha e berries (prototipo itemPageBodyHTML). */
export function showsEffect(item: Pick<ItemInfo, "category" | "description">): boolean {
  return item.description != null && (item.category === "medicine" || item.category === "cooking" || item.category === "berry");
}

/**
 * Pares de evolucao distintos, na ordem do dataset. O `items.json` repete o mesmo `from/to`
 * quando a especie tem rota regional (ex.: Pikachu -> Raichu de Kanto e de Alola) sem campo de forma,
 * entao cada par aparece uma vez so (sem inventar rotulo de forma).
 */
export function uniqueEvolutions(evolutions: ItemInfo["usedIn"]["evolutions"]): ItemInfo["usedIn"]["evolutions"] {
  const seen = new Set<string>();
  return evolutions.filter((e) => {
    const key = `${e.from}-${e.to}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
