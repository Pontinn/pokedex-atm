// Layout mobile = largura < 900 px (app.js:1072, RNF-09). Entre 900 e 1500 px e desktop normal.
import { useSyncExternalStore } from "react";

export const MOBILE_BREAKPOINT = 900;

function subscribe(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}

export function isMobileWidth(width: number): boolean {
  return width < MOBILE_BREAKPOINT;
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isMobileWidth(window.innerWidth),
    () => false,
  );
}
