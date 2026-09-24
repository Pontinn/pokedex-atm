// Tela "captured" (placeholder de F1.4). O agente dono desta tela substitui SO este arquivo e o CSS da pasta.
import "./captured.css";
import type { ScreenProps } from "../../components/ScreenRouter";
import { ScreenPlaceholder } from "../ScreenPlaceholder";

export function CapturedScreen(_props: ScreenProps) {
  return <ScreenPlaceholder titleKey="nav.captured" screen="captured" />;
}
