// B3.4: fonte UNICA da lista de sons de UI. O pipeline (tools/dataset/src/media/sfx.ts) e a UI
// (F1.4, src/audio/sfx.ts) importam esta lista; nenhuma outra lista de nomes de som existe.
// Os 20 nomes foram conferidos no snapshot data-source/atm-1.3.0/ em 2026-09-24 (SPEC B3.4 passo 2).
export const SFX_NAMES = [
  // assets/cobblemon/sounds/poke_ball/
  "poke_ball_throw_1",
  "poke_ball_shake_1",
  "poke_ball_shake_2",
  "poke_ball_shake_3",
  "poke_ball_shake_critical",
  "poke_ball_open",
  "poke_ball_shut",
  "poke_ball_capture_succeeded",
  // assets/cobblemon/sounds/item/pokedex/
  "pokedex_open",
  "pokedex_close",
  "pokedex_click",
  "pokedex_click_short",
  "pokedex_scan_open",
  // assets/cobblemon/sounds/gui/
  "click",
  "levelup",
  "levelup_start",
  // assets/cobblemon/sounds/evolution/
  "evolution_notification",
  "evolution_ui",
  "evolution_full",
  // assets/cobblemon/sounds/shiny/ (primeiro arquivo em ordem alfabetica, copiado como shiny.ogg)
  "shiny",
] as const;

export type SfxName = (typeof SFX_NAMES)[number];
