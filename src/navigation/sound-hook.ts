// Gancho de som da navegacao (RF-91). Padrao no-op: a navegacao NAO importa src/audio/.
// F1.4 liga no boot: setNavigationSoundHook(() => playSfx("pokedex_click_short")).
export type NavigationSoundEvent = "navigate";
export type NavigationSoundHook = (event: NavigationSoundEvent) => void;

const noop: NavigationSoundHook = () => {};
let hook: NavigationSoundHook = noop;

export function setNavigationSoundHook(fn: NavigationSoundHook | null): void {
  hook = fn ?? noop;
}

export function navigationSound(event: NavigationSoundEvent): void {
  try {
    hook(event);
  } catch (err) {
    // som nunca quebra a navegacao
    console.warn("[navigation] sound hook failed", err);
  }
}
