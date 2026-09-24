// Grito do Pokemon (F1.4): acao explicita, toca SEMPRE, mesmo com o som de UI desligado (RF-32/RF-89).
import { playSource } from "./sfx";

export const CRIES_BASE = "/assets/cries";

export function cryUrl(slug: string): string {
  return `${CRIES_BASE}/${encodeURIComponent(slug)}.ogg`;
}

export function playCry(slug: string): HTMLAudioElement {
  return playSource(cryUrl(slug));
}
