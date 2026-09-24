// Mensagens i18n do modulo "balls". Dono: agente B (Pokebolas: ball).
// Cada agente acrescenta chaves SO no(s) proprio(s) modulo(s); o agregador e src/i18n/messages.ts.
import type { Message } from "./types";

export const BALLS_MESSAGES = {
  "ball.hint": { pt: "Multiplicadores de captura do Cobblemon", en: "Cobblemon catch multipliers" },
  "ball.all": { pt: "Todas", en: "All" },
  "ball.night": { pt: "Noite / caverna", en: "Night / cave" },
  "ball.water": { pt: "Água", en: "Water" },
  "ball.fishing": { pt: "Pesca", en: "Fishing" },
  "ball.first": { pt: "1º turno", en: "1st turn" },
  "ball.caught": { pt: "Já capturado", en: "Already caught" },
  "ball.after": { pt: "Após capturar", en: "After capture" },
  "ball.best": { pt: "Melhor Pokébola", en: "Best Poké Ball" },
  "ball.bestHint": { pt: "Top 3 para este Pokémon", en: "Top 3 for this Pokémon" },
  "ball.critical": { pt: "Captura crítica", en: "Critical capture" },
  "ball.criticalText": { pt: "{n} capturados: bônus {b}x", en: "{n} caught: {b}x bonus" },
  "ball.r.speed": { pt: "Velocidade base {v}", en: "Base Speed {v}" },
  "ball.r.night": { pt: "à noite / em cavernas", en: "at night / in caves" },
  "ball.r.first": { pt: "1º turno", en: "1st turn" },
  "ball.r.water": { pt: "tipo Água ou Inseto", en: "Water or Bug type" },
  "ball.r.caught": { pt: "já registrado na Pokédex", en: "already registered in the Pokédex" },
  "ball.r.heavy": { pt: "Pokémon pesado", en: "heavy Pokémon" },
  "ball.r.moon": { pt: "evolui por Pedra da Lua", en: "evolves with a Moon Stone" },
  "ball.r.love": { pt: "gênero oposto na batalha", en: "opposite gender in battle" },
} as const satisfies Record<string, Message>;
