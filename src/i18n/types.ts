// Nomes dos 18 tipos em PT/EN (prototipo app.js:270-277).
import type { LocalizedText, TypeId } from "../data/types";

export const TYPE_NAMES: Record<TypeId, LocalizedText> = {
  normal: { pt: "Normal", en: "Normal" },
  fire: { pt: "Fogo", en: "Fire" },
  water: { pt: "Água", en: "Water" },
  electric: { pt: "Elétrico", en: "Electric" },
  grass: { pt: "Planta", en: "Grass" },
  ice: { pt: "Gelo", en: "Ice" },
  fighting: { pt: "Lutador", en: "Fighting" },
  poison: { pt: "Veneno", en: "Poison" },
  ground: { pt: "Terra", en: "Ground" },
  flying: { pt: "Voador", en: "Flying" },
  psychic: { pt: "Psíquico", en: "Psychic" },
  bug: { pt: "Inseto", en: "Bug" },
  rock: { pt: "Pedra", en: "Rock" },
  ghost: { pt: "Fantasma", en: "Ghost" },
  dragon: { pt: "Dragão", en: "Dragon" },
  dark: { pt: "Sombrio", en: "Dark" },
  steel: { pt: "Aço", en: "Steel" },
  fairy: { pt: "Fada", en: "Fairy" },
};
