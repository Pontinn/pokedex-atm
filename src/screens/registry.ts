// Registro COMPLETO das telas (F1.4; congelado depois de F1.4). Uma entrada por ScreenId de src/navigation/types.ts.
// Os agentes de tela trocam SO os proprios arquivos em src/screens/<Tela>/, nunca este registro.
// Sincronizar e lazy (qrcode, @zxing/browser e fflate ficam no chunk dela, SPEC 2.5).
import { lazy } from "react";
import type { ScreenRegistry } from "../components/ScreenRouter";
import { BallsScreen } from "./Balls/BallsScreen";
import { CapturedScreen } from "./Captured/CapturedScreen";
import { CompareScreen } from "./Compare/CompareScreen";
import { DetailScreen } from "./Detail/DetailScreen";
import { DexScreen } from "./Dex/DexScreen";
import { HomeScreen } from "./Home/HomeScreen";
import { ItemScreen } from "./Item/ItemScreen";
import { ItemsScreen } from "./Items/ItemsScreen";
import { SettingsScreen } from "./Settings/SettingsScreen";
import { TrainersScreen } from "./Trainers/TrainersScreen";

const SyncScreen = lazy(() => import("./Sync/SyncScreen").then((m) => ({ default: m.SyncScreen })));

export const SCREENS = {
  home: HomeScreen,
  dex: DexScreen,
  detail: DetailScreen,
  captured: CapturedScreen,
  compare: CompareScreen,
  trainers: TrainersScreen,
  balls: BallsScreen,
  items: ItemsScreen,
  item: ItemScreen,
  settings: SettingsScreen,
  sync: SyncScreen,
} satisfies Required<ScreenRegistry>;
