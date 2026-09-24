// Contrato compartilhado (Onda 0, B1.5, congelado): ids dos temas na ordem canonica do RF-79.
// APPEND-ONLY: o indice e usado pelo codec de sincronizacao (SPEC 5.4.1). Nada de estilo aqui (ver theme-meta.ts, F1.1).
// Nomes do prototipo/UISPEC: classico, preto, verde, azul, roxo, branco, laranja.
export const THEME_IDS = ["classic", "black", "green", "blue", "purple", "white", "orange"] as const;

export type ThemeId = (typeof THEME_IDS)[number];
