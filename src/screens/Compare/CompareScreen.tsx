// Tela "compare" (placeholder de F1.4). O agente dono desta tela substitui SO este arquivo e o CSS da pasta.
import "./compare.css";
import type { ScreenProps } from "../../components/ScreenRouter";
import { ScreenPlaceholder } from "../ScreenPlaceholder";

export function CompareScreen(_props: ScreenProps) {
  return <ScreenPlaceholder titleKey="nav.compare" screen="compare" />;
}
