// Motor de sons de UI (F1.4). Porta sfxEl/playRaw/sfx/pendingSfx do prototipo (design/prototipo/app.js:633-647).
// Lista de nomes: SFX_NAMES de ./sfx-names.ts (B3.4, fonte unica). playSfx respeita o toggle de som (RF-89).
// Autoplay bloqueado -> o som fica pendente e toca no proximo pointerdown. 404 -> console.warn uma vez, sem toast.
import { usePreferencesStore } from "../state/preferences-store";
import { SFX_NAMES, type SfxName } from "./sfx-names";

export const SFX_BASE = "/assets/sfx";
export const SFX_VOLUME = 0.5;

export const SFX_FILES: Readonly<Record<SfxName, string>> = Object.fromEntries(
  SFX_NAMES.map((name) => [name, `${SFX_BASE}/${name}.ogg`]),
) as Record<SfxName, string>;

export type AudioFactory = (src: string) => HTMLAudioElement;

let createAudio: AudioFactory = (src) => new Audio(src);
const elements = new Map<string, HTMLAudioElement>();
const warned = new Set<string>();
let pending: string | null = null;

/** Testes: troca a fabrica de <audio> e limpa o estado. */
export function configureAudio(factory: AudioFactory | null): void {
  createAudio = factory ?? ((src) => new Audio(src));
  elements.clear();
  warned.clear();
  pending = null;
}

function element(src: string): HTMLAudioElement {
  let el = elements.get(src);
  if (!el) {
    el = createAudio(src);
    el.preload = "auto";
    el.volume = SFX_VOLUME;
    el.addEventListener("error", () => {
      if (warned.has(src)) return;
      warned.add(src);
      console.warn(`[audio] sound not available: ${src}`);
    });
    elements.set(src, el);
  }
  return el;
}

/** Toca um arquivo sem olhar o toggle. Nunca sobrepoe o mesmo som (se ja esta tocando, nao reinicia). */
export function playSource(src: string): HTMLAudioElement {
  const el = element(src);
  if (!el.paused) return el;
  el.currentTime = 0;
  let result: Promise<void> | undefined;
  try {
    result = el.play();
  } catch {
    pending ??= src;
    return el;
  }
  if (result && typeof result.catch === "function") {
    result.catch(() => {
      // autoplay bloqueado antes do 1o gesto: fica pendente para o proximo pointerdown
      pending ??= src;
    });
  }
  return el;
}

/** Som de UI: respeita o toggle de som (RF-89). */
export function playSfx(name: SfxName): void {
  if (!usePreferencesStore.getState().soundEnabled) return;
  playSource(SFX_FILES[name]);
}

/** Som pendente (autoplay bloqueado), exposto para testes. */
export function pendingSfx(): string | null {
  return pending;
}

/** Dispara o som pendente no proximo gesto. Devolve o uninstall. */
export function installSfxUnlock(target: Document = document): () => void {
  const onPointerDown = () => {
    if (!pending) return;
    const src = pending;
    pending = null;
    if (src.startsWith(`${SFX_BASE}/`) && !usePreferencesStore.getState().soundEnabled) return;
    playSource(src);
  };
  target.addEventListener("pointerdown", onPointerDown, true);
  return () => target.removeEventListener("pointerdown", onPointerDown, true);
}

/**
 * Clique global (app.js:1324-1325): botoes tocam `click`. Elementos de navegacao (marcados com data-nav) ja
 * tocam `pokedex_click_short` pelo gancho da pilha (F1.3), entao nao tocam `click` para nao dobrar o som.
 */
export function installClickSound(target: Document = document): () => void {
  const onClick = (e: Event) => {
    const el = e.target instanceof Element ? e.target : null;
    if (!el) return;
    if (el.closest("[data-nav], [data-silent]")) return;
    if (el.closest("button, .switch, [role='button']")) playSfx("click");
  };
  target.addEventListener("click", onClick, true);
  return () => target.removeEventListener("click", onClick, true);
}
