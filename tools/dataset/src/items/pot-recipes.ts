// spawn-bait B1.4: ingredientes das receitas da Panela de Fogueira (RF-28/29/30/42). So a forma declarativa do JSON.
type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

export type RawIngredient = { kind: "item" | "tag"; id: string; count: number };

export interface RawPotRecipe {
  seasoningTag: string;
  ingredients: RawIngredient[];
  /** formato de ingrediente nao reconhecido (lista de alternativas etc.): receita fica sem potRecipes */
  unparsed?: boolean;
}

function ingredientOf(v: unknown): Omit<RawIngredient, "count"> | null {
  if (!isObject(v)) return null;
  if (typeof v.item === "string") return { kind: "item", id: v.item };
  if (typeof v.tag === "string") return { kind: "tag", id: v.tag };
  return null;
}

/**
 * Shaped (`key` + `pattern`): contagem = ocorrencias do simbolo no pattern, ordem = primeira ocorrencia (linha a linha).
 * Shapeless (`ingredients`): cada entrada conta 1, iguais somam, ordem da primeira ocorrencia. Formato desconhecido = null.
 */
export function parsePotIngredients(data: Record<string, unknown>): RawIngredient[] | null {
  const sequence: unknown[] = [];
  if (Array.isArray(data.pattern) && isObject(data.key)) {
    const key = data.key;
    for (const row of data.pattern) {
      if (typeof row !== "string") return null;
      for (const symbol of row) {
        if (symbol === " ") continue;
        if (!(symbol in key)) return null;
        sequence.push(key[symbol]);
      }
    }
  } else if (Array.isArray(data.ingredients)) {
    sequence.push(...data.ingredients);
  } else {
    return null;
  }
  const out = new Map<string, RawIngredient>();
  for (const raw of sequence) {
    const ing = ingredientOf(raw);
    if (!ing) return null;
    const k = `${ing.kind}|${ing.id}`;
    const prev = out.get(k);
    if (prev) prev.count += 1;
    else out.set(k, { ...ing, count: 1 });
  }
  return [...out.values()];
}

/** Receita com seasoningTag -> RawPotRecipe; ingredientes nao reconhecidos = lista vazia + unparsed. */
export function toPotRecipe(data: Record<string, unknown>): RawPotRecipe | null {
  if (typeof data.seasoningTag !== "string") return null;
  const ingredients = parsePotIngredients(data);
  return ingredients ? { seasoningTag: data.seasoningTag, ingredients } : { seasoningTag: data.seasoningTag, ingredients: [], unparsed: true };
}
