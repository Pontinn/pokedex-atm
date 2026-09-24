// Tela "detail" (placeholder de F1.4). O agente dono desta tela substitui SO este arquivo e o CSS da pasta.
import "./detail.css";
import type { ScreenProps } from "../../components/ScreenRouter";
import { ScreenPlaceholder } from "../ScreenPlaceholder";

export function DetailScreen(_props: ScreenProps) {
  return <ScreenPlaceholder titleKey="nav.dex" screen="detail" />;
}
