// B3.4 passo 2: copia os 20 sons de UI (SFX_NAMES, fonte unica em src/audio/sfx-names.ts) do jar do
// Cobblemon para assets/sfx/<name>.ogg. Arquivo ausente = erro (nunca falha em silencio).
import { SFX_NAMES, type SfxName } from "../../../../src/audio/sfx-names";
import type { PipelineContext } from "../context";
import { writeFileAtomic } from "../lib/fs-atomic";

const PREFIXES = [
  "assets/cobblemon/sounds/poke_ball/",
  "assets/cobblemon/sounds/item/pokedex/",
  "assets/cobblemon/sounds/gui/",
  "assets/cobblemon/sounds/evolution/",
  "assets/cobblemon/sounds/shiny/",
];

export interface SfxResult {
  files: number;
  bytes: number;
}

export function extractSfx(ctx: PipelineContext): SfxResult {
  const cobblemon = ctx.reader.jar("cobblemon");
  const entries = ctx.reader.readJar(cobblemon, PREFIXES);

  const shinyFiles = [...entries.keys()]
    .filter((p) => p.startsWith("assets/cobblemon/sounds/shiny/") && p.endsWith(".ogg"))
    .sort();
  const firstShiny = shinyFiles[0];
  if (!firstShiny) throw new Error("E_MEDIA_MISSING: nenhum arquivo em assets/cobblemon/sounds/shiny/");

  const sourceFor: Record<SfxName, string> = {
    poke_ball_throw_1: "assets/cobblemon/sounds/poke_ball/poke_ball_throw_1.ogg",
    poke_ball_shake_1: "assets/cobblemon/sounds/poke_ball/poke_ball_shake_1.ogg",
    poke_ball_shake_2: "assets/cobblemon/sounds/poke_ball/poke_ball_shake_2.ogg",
    poke_ball_shake_3: "assets/cobblemon/sounds/poke_ball/poke_ball_shake_3.ogg",
    poke_ball_shake_critical: "assets/cobblemon/sounds/poke_ball/poke_ball_shake_critical.ogg",
    poke_ball_open: "assets/cobblemon/sounds/poke_ball/poke_ball_open.ogg",
    poke_ball_shut: "assets/cobblemon/sounds/poke_ball/poke_ball_shut.ogg",
    poke_ball_capture_succeeded: "assets/cobblemon/sounds/poke_ball/poke_ball_capture_succeeded.ogg",
    pokedex_open: "assets/cobblemon/sounds/item/pokedex/pokedex_open.ogg",
    pokedex_close: "assets/cobblemon/sounds/item/pokedex/pokedex_close.ogg",
    pokedex_click: "assets/cobblemon/sounds/item/pokedex/pokedex_click.ogg",
    pokedex_click_short: "assets/cobblemon/sounds/item/pokedex/pokedex_click_short.ogg",
    pokedex_scan_open: "assets/cobblemon/sounds/item/pokedex/pokedex_scan_open.ogg",
    click: "assets/cobblemon/sounds/gui/click.ogg",
    levelup: "assets/cobblemon/sounds/gui/levelup.ogg",
    levelup_start: "assets/cobblemon/sounds/gui/levelup_start.ogg",
    evolution_notification: "assets/cobblemon/sounds/evolution/evolution_notification.ogg",
    evolution_ui: "assets/cobblemon/sounds/evolution/evolution_ui.ogg",
    evolution_full: "assets/cobblemon/sounds/evolution/evolution_full.ogg",
    shiny: firstShiny,
  };

  let bytes = 0;
  for (const name of SFX_NAMES) {
    const rel = sourceFor[name];
    const data = entries.get(rel);
    if (!data) throw new Error(`E_MEDIA_MISSING: sfx ausente na fonte: ${rel}`);
    if (data.byteLength === 0) throw new Error(`E_MEDIA_CORRUPT: ${rel} tem 0 bytes`);
    bytes += writeFileAtomic(ctx.assetPath("sfx", `${name}.ogg`), data);
  }
  return { files: SFX_NAMES.length, bytes };
}
