// Termo de jogo com o secundario em <small> (prototipo termPair(), app.js:665).
import type { LocalizedText } from "../data/types";
import type { UiLanguage } from "../storage/types";
import { termPair } from "./useT";

export interface TermPairProps {
  text: LocalizedText;
  lang: UiLanguage;
}

export function TermPair({ text, lang }: TermPairProps) {
  const { primary, secondary } = termPair(text, lang);
  return (
    <>
      {primary}
      {secondary ? <small>{secondary}</small> : null}
    </>
  );
}
