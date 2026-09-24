// Tela "balls" (placeholder de F1.4). O agente dono desta tela substitui SO este arquivo e o CSS da pasta.
import "./balls.css";
import type { ScreenProps } from "../../components/ScreenRouter";
import { ScreenPlaceholder } from "../ScreenPlaceholder";

export function BallsScreen(_props: ScreenProps) {
  return <ScreenPlaceholder titleKey="nav.balls" screen="balls" />;
}
