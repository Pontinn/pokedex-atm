// useT (F1.2): traducao da interface pelo uiLanguage da store de preferencias, com interpolacao {nome}.
import { useCallback } from "react";
import type { LocalizedText } from "../data/types";
import type { UiLanguage } from "../storage/types";
import { usePreferencesStore } from "../state/preferences-store";
import { MESSAGES, type MessageKey } from "./messages";

export type TranslationVars = Record<string, string | number>;
/** Chave conhecida ou montada em runtime (ex. `rarity.${r}`); chaves ausentes sao tratadas em translate. */
export type TranslationKey = MessageKey | (string & {});
export type TranslateFn = (key: TranslationKey, vars?: TranslationVars) => string;

export class MissingMessageError extends Error {
  constructor(readonly key: string) {
    super(`[i18n] missing message key "${key}"`);
    this.name = "MissingMessageError";
  }
}

export function hasMessage(key: string): key is MessageKey {
  return Object.prototype.hasOwnProperty.call(MESSAGES, key);
}

export function interpolate(text: string, vars?: TranslationVars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
  );
}

/** Chave ausente: lanca em dev (o teste falha); em producao devolve a propria chave (nunca vazio). */
export function translate(lang: UiLanguage, key: TranslationKey, vars?: TranslationVars): string {
  if (!hasMessage(key)) {
    if (import.meta.env.DEV) throw new MissingMessageError(key);
    return key;
  }
  return interpolate(MESSAGES[key][lang], vars);
}

export function useT(): TranslateFn {
  const lang = usePreferencesStore((s) => s.uiLanguage);
  return useCallback<TranslateFn>((key, vars) => translate(lang, key, vars), [lang]);
}

/** Nome de jogo no idioma pedido para qualquer objeto do dataset com {pt,en} (fallback para o outro idioma). */
export function gameName(entity: { name: LocalizedText } | LocalizedText, lang: UiLanguage): string {
  const text: LocalizedText = "name" in entity ? entity.name : entity;
  const other: UiLanguage = lang === "pt" ? "en" : "pt";
  return text[lang] || text[other];
}

/** Par de termos: principal no idioma pedido e o secundario (outro idioma) quando diferente (prototipo termPair()). */
export function termPair(text: LocalizedText, lang: UiLanguage): { primary: string; secondary: string | null } {
  const primary = gameName(text, lang);
  const secondary = gameName(text, lang === "pt" ? "en" : "pt");
  return { primary, secondary: secondary && secondary !== primary ? secondary : null };
}
