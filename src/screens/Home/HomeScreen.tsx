// Tela "home" (placeholder de F1.4). O agente dono desta tela substitui SO este arquivo e o CSS da pasta.
import "./home.css";
import type { ScreenProps } from "../../components/ScreenRouter";
import { ScreenPlaceholder } from "../ScreenPlaceholder";

export function HomeScreen(_props: ScreenProps) {
  return <ScreenPlaceholder titleKey="nav.home" screen="home" />;
}
