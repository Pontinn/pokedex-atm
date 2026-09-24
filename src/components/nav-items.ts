// Itens de navegacao do shell (index.html:35-59, 241-259 do prototipo) + Sincronizar (RF-72).
import type { LucideIcon } from "./Icon";
import { ArrowLeftRight, Backpack, CircleDot, House, List, QrCode, Settings, Swords } from "./Icon";
import type { MessageKey } from "../i18n/messages";
import type { ScreenId } from "../navigation/types";

export interface NavItemDef {
  screen: ScreenId;
  labelKey: MessageKey;
  subKey?: MessageKey;
  /** null = icone da pokebola (Capturados) */
  icon: LucideIcon | null;
}

export const SIDEBAR_ITEMS: readonly NavItemDef[] = [
  { screen: "home", labelKey: "nav.home", icon: House },
  { screen: "dex", labelKey: "nav.dex", icon: List },
  { screen: "captured", labelKey: "nav.captured", icon: null },
  { screen: "compare", labelKey: "nav.compare", icon: ArrowLeftRight },
  { screen: "trainers", labelKey: "nav.trainers", subKey: "nav.trainersSub", icon: Swords },
  { screen: "balls", labelKey: "nav.balls", subKey: "nav.ballsSub", icon: CircleDot },
  { screen: "items", labelKey: "nav.items", subKey: "nav.itemsSub", icon: Backpack },
  { screen: "sync", labelKey: "nav.sync", subKey: "nav.syncSub", icon: QrCode },
  { screen: "settings", labelKey: "nav.settings", subKey: "nav.settingsSub", icon: Settings },
];

export const TAB_SCREENS: readonly ScreenId[] = ["home", "dex", "captured", "compare"];

export const MORE_ITEMS: readonly NavItemDef[] = SIDEBAR_ITEMS.filter((i) => !TAB_SCREENS.includes(i.screen));

/** Tela que acende o item de menu (ficha -> Pokedex, item -> Itens). */
export function navOwner(screen: ScreenId): ScreenId {
  if (screen === "detail") return "dex";
  if (screen === "item") return "items";
  return screen;
}
