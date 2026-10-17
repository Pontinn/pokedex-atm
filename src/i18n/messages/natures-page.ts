// Mensagens i18n do modulo "natures" (pagina Naturezas). Inclui nav.natures/nav.naturesSub para o porte ser copia de arquivo.
import type { Message } from "./types";

export const NATURES_PAGE_MESSAGES = {
  "nav.natures": { pt: "Naturezas", en: "Natures" },
  "nav.naturesSub": { pt: "O que cada uma muda", en: "What each one changes" },
  "natures.legendTitle": { pt: "Como funciona", en: "How it works" },
  "natures.legendRule": {
    pt: "Toda natureza AUMENTA um status em 10% e DIMINUI outro em 10%. HP nunca muda.",
    en: "Every nature RAISES one stat by 10% and LOWERS another by 10%. HP never changes.",
  },
  "natures.legendNeutral": { pt: "Cinco naturezas são neutras: não mudam nada.", en: "Five natures are neutral: they change nothing." },
  "natures.legendColors": {
    pt: "Verde = aumenta (+10%), laranja = diminui (-10%), cinza = neutra",
    en: "Green = raises (+10%), orange = lowers (-10%), gray = neutral",
  },
  "natures.viewLabel": { pt: "Visão", en: "View" },
  "natures.viewTable": { pt: "Tabela", en: "Table" },
  "natures.viewByStat": { pt: "Por status", en: "By stat" },
  "natures.tableCaption": { pt: "Linha = status que aumenta, coluna = status que diminui", en: "Row = stat it raises, column = stat it lowers" },
  "natures.cornerRow": { pt: "Aumenta", en: "Raises" },
  "natures.cornerCol": { pt: "Diminui", en: "Lowers" },
  "natures.rowHeader": { pt: "Aumenta {stat} (+10%)", en: "Raises {stat} (+10%)" },
  "natures.colHeader": { pt: "Diminui {stat} (-10%)", en: "Lowers {stat} (-10%)" },
  "natures.cellLabel": { pt: "{name}: aumenta {up}, diminui {down}", en: "{name}: raises {up}, lowers {down}" },
  "natures.cellNeutral": { pt: "{name}: neutra, nenhum status muda", en: "{name}: neutral, no stat changes" },
  "natures.neutralMark": { pt: "neutra", en: "neutral" },
  "natures.pick": { pt: "Toque numa natureza para ver o que ela muda", en: "Tap a nature to see what it changes" },
  "natures.chipNeutral": { pt: "Neutra: nenhum status muda", en: "Neutral: no stat changes" },
  "natures.useHint": { pt: "Boa para quem usa {up} e não depende de {down}", en: "Good for Pokémon that use {up} and don't rely on {down}" },
  "natures.useNeutral": { pt: "Não atrapalha nem ajuda: serve para qualquer Pokémon", en: "Neither helps nor hurts: fits any Pokémon" },
  "natures.statPickLabel": { pt: "Os 5 status", en: "The 5 stats" },
  "natures.statPick": { pt: "Escolha um status", en: "Pick a stat" },
  "natures.raise": { pt: "Aumentam {stat} (+10%)", en: "Raise {stat} (+10%)" },
  "natures.lower": { pt: "Diminuem {stat} (-10%)", en: "Lower {stat} (-10%)" },
  "natures.neutrals": { pt: "Neutras (nada muda)", en: "Neutral (nothing changes)" },
  "natures.focusLabel": { pt: "Natureza escolhida", en: "Chosen nature" },
} as const satisfies Record<string, Message>;
