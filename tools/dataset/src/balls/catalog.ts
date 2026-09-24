// B4.3: catalogo das Pokebolas. Ids = basenames dos PNGs em assets/cobblemon/textures/item/poke_balls/
// (exclui a subpasta models/); 48 hoje, verificado contra data-source/atm-1.3.0 (SPEC 5.1.1 passo 1).
import type { LocalizedText } from "../../../../src/data/types";
import type { LangTable } from "../context";
import type { SourceReader } from "../source-reader";

export const BALL_TEXTURE_PREFIX = "assets/cobblemon/textures/item/poke_balls/";

/** Basenames (sem .png) das texturas diretamente sob poke_balls/, ordenados; nunca inclui models/. */
export function collectBallIds(reader: SourceReader): string[] {
  const jar = reader.jar("cobblemon");
  const entries = reader.readJar(jar, [BALL_TEXTURE_PREFIX]);
  const ids = new Set<string>();
  for (const entryPath of entries.keys()) {
    if (!entryPath.startsWith(BALL_TEXTURE_PREFIX) || !entryPath.endsWith(".png")) continue;
    const rest = entryPath.slice(BALL_TEXTURE_PREFIX.length);
    if (rest.includes("/")) continue; // models/<id>.png fica de fora
    ids.add(rest.slice(0, -".png".length));
  }
  return [...ids].sort();
}

export interface BallCatalogEntry {
  id: string;
  itemId: string;
  name: LocalizedText;
  effect: LocalizedText;
}

/**
 * name/effect (tooltip) do lang do Cobblemon (item.cobblemon.<id> / .tooltip). Falha alto e claro
 * se faltar: uma bola com textura mas sem lang seria um dado incompleto, nunca adivinhado.
 */
export function buildBallCatalog(ids: readonly string[], lang: LangTable): BallCatalogEntry[] {
  return ids.map((id) => {
    const itemId = `cobblemon:${id}`;
    const nameKey = `item.cobblemon.${id}`;
    const tooltipKey = `item.cobblemon.${id}.tooltip`;
    const name = lang.text(nameKey);
    const effect = lang.text(tooltipKey);
    if (!name || !effect) {
      throw new Error(`E_BALL_LANG_MISSING: lang ausente para a bola "${id}" (${nameKey} / ${tooltipKey})`);
    }
    return { id, itemId, name, effect };
  });
}
