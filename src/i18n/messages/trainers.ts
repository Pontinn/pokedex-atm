// Mensagens i18n do modulo "trainers". Dono: agente B (Treinadores: tr, role).
// Cada agente acrescenta chaves SO no(s) proprio(s) modulo(s); o agregador e src/i18n/messages.ts.
import type { Message } from "./types";

export const TRAINERS_MESSAGES = {
  "tr.source": { pt: "Fonte: Radical Cobblemon Trainers", en: "Source: Radical Cobblemon Trainers" },
  "tr.series": { pt: "Série", en: "Series" },
  "tr.progress": { pt: "Seu progresso", en: "Your progress" },
  "tr.currentCap": { pt: "Seu cap atual", en: "Your current cap" },
  "tr.explain": { pt: "Pokémon no nível do cap não ganham EXP; derrote o próximo treinador-chave para subir o cap.", en: "Pokémon at the cap level do not gain EXP; defeat the next key trainer to raise the cap." },
  "tr.cap": { pt: "Cap", en: "Cap" },
  "tr.defeated": { pt: "Derrotado", en: "Defeated" },
  "tr.next": { pt: "Próximo", en: "Next" },
  "tr.where": { pt: "Onde", en: "Where" },
  "tr.requires": { pt: "Requer um de", en: "Requires one of" },
  "tr.team": { pt: "Time", en: "Team" },
  "tr.bag": { pt: "Mochila", en: "Bag" },
  "tr.tip": { pt: "Sugestão", en: "Tip" },
  "tr.spawnItem": { pt: "Item de spawn", en: "Spawn item" },
  "tr.spawnHow": { pt: "Clique com este item em um Trainer Spawner (bloco craftável) para spawnar este treinador onde quiser; com redstone o spawn é forçado.", en: "Use this item on a Trainer Spawner (craftable block) to spawn this trainer wherever you want; with redstone the spawn is forced." },
  "tr.done": { pt: "de", en: "of" },
  "tr.keyTrainers": { pt: "treinadores-chave derrotados", en: "key trainers defeated" },
  "role.leader": { pt: "Líder", en: "Gym Leader" },
  "role.rival": { pt: "Rival", en: "Rival" },
  "role.rocket": { pt: "Equipe Rocket", en: "Team Rocket" },
  "role.elite": { pt: "Elite Four", en: "Elite Four" },
  "role.champion": { pt: "Campeão", en: "Champion" },
} as const satisfies Record<string, Message>;
