// Pilha de navegacao propria (F1.3, RF-01..RF-04; porta navigate/go/goBack/restore do prototipo app.js:1219-1250).
// Cada entrada guarda tela, parametros, estado de UI (abas, filtros, linhas abertas...) e o scroll de #main.
import { create } from "zustand";
import { navigationSound } from "./sound-hook";
import { defaultUi, type NavEntry, type ScreenId, type ScreenParamsMap, type UiStateMap } from "./types";

/** Limite da pilha (prototipo app.js:1223; o PRD nao fixa): o 41o push descarta o mais antigo. */
export const NAV_STACK_LIMIT = 40;
export const MAIN_SCROLL_ID = "main";

export interface NavigationState {
  stack: NavEntry[];
  current: NavEntry;
  /** scroll a reaplicar depois de uma volta (null = entrada nova, fica no topo) */
  restoredScroll: number | null;
  navigate<S extends ScreenId>(screen: S, params?: ScreenParamsMap[S], ui?: Partial<UiStateMap[S]>): void;
  go(screen: ScreenId): void;
  updateUi<S extends ScreenId = ScreenId>(patch: Partial<UiStateMap[S]>): void;
  goBack(fromPopstate?: boolean): void;
}

let nextId = 1;
/** true quando o proprio app chamou history.back() e o popstate resultante deve ser ignorado. */
let ignoreNextPop = false;

export function consumeIgnoredPop(): boolean {
  if (!ignoreNextPop) return false;
  ignoreNextPop = false;
  return true;
}

function getMain(): HTMLElement | null {
  return typeof document === "undefined" ? null : document.getElementById(MAIN_SCROLL_ID);
}

function readScroll(): number {
  return getMain()?.scrollTop ?? 0;
}

function setScroll(value: number): void {
  const main = getMain();
  if (!main) return;
  const previous = main.style.scrollBehavior;
  main.style.scrollBehavior = "auto";
  main.scrollTop = value;
  main.style.scrollBehavior = previous;
}

/** Reaplica o scroll em requestAnimationFrame duplo (depois do 1o paint da tela remontada). */
export function scheduleScrollRestore(value: number): void {
  if (typeof requestAnimationFrame === "undefined") {
    setScroll(value);
    return;
  }
  requestAnimationFrame(() => requestAnimationFrame(() => setScroll(value)));
}

function createEntry<S extends ScreenId>(screen: S, params?: ScreenParamsMap[S], ui?: Partial<UiStateMap[S]>): NavEntry<S> {
  return {
    id: nextId++,
    screen,
    params: (params ?? {}) as ScreenParamsMap[S],
    ui: { ...defaultUi(screen), ...(ui ?? {}) },
    scroll: 0,
  };
}

function pushHistory(id: number): void {
  try {
    history.pushState({ pontindex: id }, "");
  } catch {
    // pushState indisponivel (iframe restrito): a pilha interna continua funcionando
  }
}

export const useNavigationStore = create<NavigationState>()((set, get) => ({
  stack: [],
  current: createEntry("home"),
  restoredScroll: null,

  navigate(screen, params, ui) {
    const { current, stack } = get();
    const snapshot: NavEntry = { ...current, scroll: readScroll() };
    const nextStack = [...stack, snapshot];
    if (nextStack.length > NAV_STACK_LIMIT) nextStack.splice(0, nextStack.length - NAV_STACK_LIMIT);
    const entry = createEntry(screen, params, ui) as NavEntry;
    set({ stack: nextStack, current: entry, restoredScroll: null });
    pushHistory(entry.id);
    setScroll(0);
    navigationSound("navigate");
  },

  go(screen) {
    if (get().current.screen === screen) {
      setScroll(0);
      return;
    }
    get().navigate(screen);
  },

  updateUi(patch) {
    const { current } = get();
    set({ current: { ...current, ui: { ...current.ui, ...patch } as NavEntry["ui"] } });
  },

  goBack(fromPopstate = false) {
    const { stack, current } = get();
    const entry = stack[stack.length - 1];
    if (!entry) {
      // pilha vazia: botao do app vai para home; popstate (voltar do navegador na 1a tela) nao muda nada
      if (!fromPopstate && current.screen !== "home") {
        set({ current: createEntry("home"), restoredScroll: null });
        setScroll(0);
      }
      return;
    }
    if (!fromPopstate) {
      ignoreNextPop = true;
      try {
        history.back();
      } catch {
        ignoreNextPop = false;
      }
    }
    set({ stack: stack.slice(0, -1), current: entry, restoredScroll: entry.scroll });
    scheduleScrollRestore(entry.scroll);
  },
}));

/** Reaplica o scroll da entrada restaurada (ex. depois que o carregamento lazy da ficha terminou). */
export function reapplyRestoredScroll(): void {
  const value = useNavigationStore.getState().restoredScroll;
  if (value !== null) scheduleScrollRestore(value);
}

/** So para testes: volta ao estado inicial (home, pilha vazia). */
export function resetNavigationStore(): void {
  ignoreNextPop = false;
  useNavigationStore.setState({ stack: [], current: createEntry("home"), restoredScroll: null });
}
