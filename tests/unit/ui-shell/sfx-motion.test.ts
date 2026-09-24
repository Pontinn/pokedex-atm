// F1.4: motor de som (toggle, autoplay pendente, 404, grito), gancho de navegacao e reduzir animacoes.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { playCry } from "../../../src/audio/cries";
import { SFX_NAMES } from "../../../src/audio/sfx-names";
import { SFX_FILES, configureAudio, installSfxUnlock, pendingSfx, playSfx } from "../../../src/audio/sfx";
import { resetNavigationStore, useNavigationStore } from "../../../src/navigation/navigation-store";
import { setNavigationSoundHook } from "../../../src/navigation/sound-hook";
import { applyReduceMotion, installMotionPreference, resolveReduceMotion } from "../../../src/state/motion";
import { resetPreferencesStore, usePreferencesStore } from "../../../src/state/preferences-store";

interface FakeAudio extends EventTarget {
  src: string;
  paused: boolean;
  currentTime: number;
  preload: string;
  volume: number;
  play: ReturnType<typeof vi.fn>;
}

let played: string[] = [];
let created: FakeAudio[] = [];
let rejectPlay = false;

function fakeFactory(src: string): HTMLAudioElement {
  const el = new EventTarget() as FakeAudio;
  el.src = src;
  el.paused = true;
  el.currentTime = 0;
  el.preload = "";
  el.volume = 1;
  el.play = vi.fn(() => {
    if (rejectPlay) return Promise.reject(new Error("NotAllowedError"));
    played.push(src);
    return Promise.resolve();
  });
  created.push(el);
  return el as unknown as HTMLAudioElement;
}

beforeEach(() => {
  played = [];
  created = [];
  rejectPlay = false;
  configureAudio(fakeFactory);
  resetPreferencesStore();
  resetNavigationStore();
  setNavigationSoundHook(null);
});

afterEach(() => {
  configureAudio(null);
  setNavigationSoundHook(null);
});

describe("sfx engine", () => {
  it("maps every SFX_NAMES entry (single source, B3.4) to /assets/sfx/<name>.ogg", () => {
    expect(Object.keys(SFX_FILES).sort()).toEqual([...SFX_NAMES].sort());
    expect(SFX_FILES.pokedex_open).toBe("/assets/sfx/pokedex_open.ogg");
  });

  it("playSfx respects the sound toggle; playCry always plays (RF-32/RF-89)", () => {
    playSfx("click");
    expect(played).toEqual(["/assets/sfx/click.ogg"]);
    usePreferencesStore.setState({ soundEnabled: false });
    playSfx("click");
    playSfx("pokedex_open");
    expect(played).toEqual(["/assets/sfx/click.ogg"]);
    playCry("charizard");
    expect(played).toEqual(["/assets/sfx/click.ogg", "/assets/cries/charizard.ogg"]);
    expect(created.every((a) => a.volume === 0.5)).toBe(true);
  });

  it("blocked autoplay queues the sound and plays it on the next pointerdown", async () => {
    const uninstall = installSfxUnlock(document);
    rejectPlay = true;
    playSfx("pokedex_open");
    await Promise.resolve();
    await Promise.resolve();
    expect(pendingSfx()).toBe("/assets/sfx/pokedex_open.ogg");
    expect(played).toEqual([]);
    rejectPlay = false;
    document.dispatchEvent(new Event("pointerdown"));
    expect(played).toEqual(["/assets/sfx/pokedex_open.ogg"]);
    expect(pendingSfx()).toBeNull();
    uninstall();
  });

  it("a missing sound file warns once and never throws", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    playSfx("shiny");
    const el = created[0]!;
    el.dispatchEvent(new Event("error"));
    el.dispatchEvent(new Event("error"));
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain("shiny.ogg");
    warn.mockRestore();
  });

  it("navigate plays pokedex_click_short through the injected hook (F1.3 -> F1.4)", () => {
    setNavigationSoundHook(() => playSfx("pokedex_click_short"));
    useNavigationStore.getState().navigate("dex");
    expect(played).toEqual(["/assets/sfx/pokedex_click_short.ogg"]);
  });
});

describe("reduce motion (RF-93)", () => {
  const mm = (matches: boolean) => ((q: string) => ({ matches, media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList);

  it("null follows the system; true/false override; no matchMedia means false", () => {
    expect(resolveReduceMotion(null, mm(true))).toBe(true);
    expect(resolveReduceMotion(null, mm(false))).toBe(false);
    expect(resolveReduceMotion(false, mm(true))).toBe(false);
    expect(resolveReduceMotion(true, mm(false))).toBe(true);
    expect(resolveReduceMotion(null, undefined)).toBe(false);
  });

  it("installMotionPreference applies html.reduce-motion and follows the store", () => {
    applyReduceMotion(false);
    const uninstall = installMotionPreference(mm(false));
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(false);
    usePreferencesStore.setState({ reduceMotion: true });
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(true);
    usePreferencesStore.setState({ reduceMotion: null });
    expect(document.documentElement.classList.contains("reduce-motion")).toBe(false);
    uninstall();
  });
});
