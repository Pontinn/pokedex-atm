// Metadados visuais dos temas (F1.1): amostras do ThemeGrid e aplicacao do tema no <html>.
// ThemeId/THEME_IDS vem do contrato congelado src/styles/themes.ts (so importado aqui).
import { THEME_IDS, type ThemeId } from "./themes";

export interface ThemeMeta {
  /** cor principal da amostra (carcaca), prototipo app.js:434-441 */
  p1: string;
  /** cor secundaria da amostra */
  p2: string;
  /** chave i18n do nome do tema */
  labelKey: string;
  /** chave i18n do subtitulo ("Vermelho & Azul") */
  subKey: string;
}

export const DEFAULT_THEME: ThemeId = "classic";

export const THEMES: Record<ThemeId, ThemeMeta> = {
  classic: { p1: "#DC0A2D", p2: "#2A75BB", labelKey: "theme.classic", subKey: "theme.classicSub" },
  black: { p1: "#17171C", p2: "#F5C518", labelKey: "theme.black", subKey: "theme.blackSub" },
  green: { p1: "#2F8F5B", p2: "#F2E8CF", labelKey: "theme.green", subKey: "theme.greenSub" },
  blue: { p1: "#1F5FBF", p2: "#C6CCD6", labelKey: "theme.blue", subKey: "theme.blueSub" },
  purple: { p1: "#6A3FC9", p2: "#FF6FB1", labelKey: "theme.purple", subKey: "theme.purpleSub" },
  white: { p1: "#F7F7FA", p2: "#DC0A2D", labelKey: "theme.white", subKey: "theme.whiteSub" },
  orange: { p1: "#F0762B", p2: "#1E2A4A", labelKey: "theme.orange", subKey: "theme.orangeSub" },
};

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && (THEME_IDS as readonly string[]).includes(value);
}

/** Normaliza um id de tema: desconhecido vira "classic" (com aviso). */
export function normalizeThemeId(themeId: string): ThemeId {
  if (isThemeId(themeId)) return themeId;
  console.warn(`[theme] unknown theme id "${themeId}", falling back to "${DEFAULT_THEME}"`);
  return DEFAULT_THEME;
}

/**
 * Aplica o tema no <html> (data-theme). Troca instantanea: tudo deriva das variaveis CSS,
 * inclusive as barras de rolagem. Nao conhece a store de preferencias (F1.2 chama esta funcao).
 */
export function applyTheme(themeId: string, root: HTMLElement = document.documentElement): ThemeId {
  const id = normalizeThemeId(themeId);
  root.dataset.theme = id;
  return id;
}
