// Tela "dex" (placeholder de F1.4). O agente dono desta tela substitui SO este arquivo e o CSS da pasta.
import "./dex.css";
import type { ScreenProps } from "../../components/ScreenRouter";
import { ScreenPlaceholder } from "../ScreenPlaceholder";

export function DexScreen(_props: ScreenProps) {
  return <ScreenPlaceholder titleKey="nav.dex" screen="dex" />;
}
