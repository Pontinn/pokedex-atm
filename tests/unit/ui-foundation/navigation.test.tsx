import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScreenRouter, type ScreenProps } from "../../../src/components/ScreenRouter";
import { installHistoryBridge } from "../../../src/navigation/history-bridge";
import { NAV_STACK_LIMIT, resetNavigationStore, useNavigationStore } from "../../../src/navigation/navigation-store";
import { navigationSound, setNavigationSoundHook } from "../../../src/navigation/sound-hook";
import { useScreenUi } from "../../../src/navigation/useNavigation";

const nav = () => useNavigationStore.getState();

function mountMain() {
  const main = document.createElement("div");
  main.id = "main";
  document.body.appendChild(main);
  return main;
}

describe("F1.3 pilha de navegacao", () => {
  let main: HTMLElement;

  beforeEach(() => {
    resetNavigationStore();
    setNavigationSoundHook(null);
    main = mountMain();
  });
  afterEach(() => {
    main.remove();
    vi.restoreAllMocks();
  });

  it("A -> B -> C e goBack duas vezes restaura ui e scroll exatos", () => {
    nav().navigate("dex");
    nav().updateUi({ status: "caught", sort: "name" });
    main.scrollTop = 800;
    nav().navigate("detail", { dex: 6 });
    nav().updateUi({ moveTab: "tm", openMoveRows: ["flamethrower"], calcOpen: true });
    main.scrollTop = 1200;
    nav().navigate("item", { itemId: "cobblemon:fire_stone" });
    expect(nav().current.screen).toBe("item");
    expect(nav().stack).toHaveLength(3);

    nav().goBack(true);
    expect(nav().current.screen).toBe("detail");
    expect(nav().current.params).toEqual({ dex: 6 });
    expect(nav().current.ui).toMatchObject({ moveTab: "tm", openMoveRows: ["flamethrower"], calcOpen: true });
    expect(nav().current.scroll).toBe(1200);
    expect(nav().restoredScroll).toBe(1200);

    nav().goBack(true);
    expect(nav().current.screen).toBe("dex");
    expect(nav().current.ui).toMatchObject({ status: "caught", sort: "name" });
    expect(nav().current.scroll).toBe(800);
  });

  it("navigate zera o scroll de #main e cria ui padrao", () => {
    main.scrollTop = 300;
    nav().navigate("detail", { dex: 1 });
    expect(main.scrollTop).toBe(0);
    expect(nav().current.ui).toMatchObject({ moveTab: "level", openMoveRows: [] });
  });

  it(`pilha limitada a ${NAV_STACK_LIMIT}: o 41o push descarta o mais antigo`, () => {
    for (let i = 1; i <= NAV_STACK_LIMIT + 1; i++) nav().navigate("detail", { dex: i });
    const { stack } = nav();
    expect(stack).toHaveLength(NAV_STACK_LIMIT);
    // o mais antigo (home inicial) foi descartado; a base agora e a ficha #1
    expect(stack[0]!.screen).toBe("detail");
    expect(stack[0]!.params).toEqual({ dex: 1 });
    expect(stack[stack.length - 1]!.params).toEqual({ dex: NAV_STACK_LIMIT });
  });

  it("goBack com pilha vazia vai para home; popstate com pilha vazia nao muda nada", () => {
    useNavigationStore.setState({ current: { ...nav().current, screen: "settings", ui: { openCard: null } } });
    nav().goBack(true);
    expect(nav().current.screen).toBe("settings");
    nav().goBack(false);
    expect(nav().current.screen).toBe("home");
  });

  it("updateUi nao faz push", () => {
    nav().navigate("dex");
    const before = nav().stack.length;
    nav().updateUi({ status: "missing" });
    expect(nav().stack.length).toBe(before);
    expect(nav().current.ui).toMatchObject({ status: "missing" });
  });

  it("go na mesma tela so rola para o topo", () => {
    nav().navigate("balls");
    main.scrollTop = 500;
    const depth = nav().stack.length;
    nav().go("balls");
    expect(nav().stack.length).toBe(depth);
    expect(main.scrollTop).toBe(0);
    nav().go("items");
    expect(nav().stack.length).toBe(depth + 1);
  });

  it("gancho de som chamado 1 vez por navigate; padrao no-op nao lanca", () => {
    expect(() => navigationSound("navigate")).not.toThrow();
    expect(() => nav().navigate("dex")).not.toThrow();
    const spy = vi.fn();
    setNavigationSoundHook(spy);
    nav().navigate("balls");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("navigate");
    nav().updateUi({ filter: "night" });
    nav().goBack(true);
    expect(spy).toHaveBeenCalledTimes(1);
    nav().go("items");
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("gancho que lanca nao quebra a navegacao", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    setNavigationSoundHook(() => {
      throw new Error("boom");
    });
    expect(() => nav().navigate("dex")).not.toThrow();
    expect(nav().current.screen).toBe("dex");
  });

  it("popstate volta; o Voltar do app ignora o popstate que ele mesmo gera", () => {
    const uninstall = installHistoryBridge();
    nav().navigate("dex");
    nav().navigate("balls");
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(nav().current.screen).toBe("dex");

    const back = vi.spyOn(history, "back").mockImplementation(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    nav().navigate("items");
    nav().goBack(false);
    expect(back).toHaveBeenCalledTimes(1);
    // o popstate gerado pelo history.back() do app foi ignorado: so voltou uma tela
    expect(nav().current.screen).toBe("dex");
    uninstall();
  });
});

describe("F1.3 ScreenRouter", () => {
  beforeEach(() => resetNavigationStore());

  it("renderiza a tela atual, remonta com key e nao re-renderiza a tela em updateUi", () => {
    const renders: Record<string, number> = {};
    const mounts: Record<string, number> = {};
    function makeScreen(name: string) {
      return function Dummy(_props: ScreenProps) {
        renders[name] = (renders[name] ?? 0) + 1;
        return <p data-testid="screen">{name}</p>;
      };
    }
    function DetailTab() {
      const tab = useScreenUi("detail", "moveTab");
      mounts.tab = (mounts.tab ?? 0) + 1;
      return <span data-testid="tab">{tab}</span>;
    }
    const DetailScreen = makeScreen("detail");
    function Detail(props: ScreenProps) {
      return (
        <>
          <DetailScreen {...props} />
          <DetailTab />
        </>
      );
    }
    render(<ScreenRouter screens={{ home: makeScreen("home"), detail: Detail }} fallback={makeScreen("fallback")} />);
    expect(screen.getByTestId("screen").textContent).toBe("home");

    act(() => nav().navigate("detail", { dex: 6 }));
    expect(screen.getByTestId("screen").textContent).toBe("detail");
    const detailRenders = renders.detail;

    act(() => nav().updateUi({ moveTab: "tm" }));
    expect(screen.getByTestId("tab").textContent).toBe("tm");
    expect(renders.detail).toBe(detailRenders);

    act(() => nav().navigate("sync"));
    expect(screen.getByTestId("screen").textContent).toBe("fallback");

    act(() => nav().goBack(true));
    expect(screen.getByTestId("tab").textContent).toBe("tm");
  });
});
