// Tela "sync" (placeholder de F1.4). O agente dono desta tela substitui SO este arquivo e o CSS da pasta.
import "./sync.css";
import type { ScreenProps } from "../../components/ScreenRouter";
import { ScreenPlaceholder } from "../ScreenPlaceholder";

export function SyncScreen(_props: ScreenProps) {
  return <ScreenPlaceholder titleKey="nav.sync" screen="sync" />;
}
