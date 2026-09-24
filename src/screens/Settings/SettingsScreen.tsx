// Tela "settings" (placeholder de F1.4). O agente dono desta tela substitui SO este arquivo e o CSS da pasta.
import "./settings.css";
import type { ScreenProps } from "../../components/ScreenRouter";
import { ScreenPlaceholder } from "../ScreenPlaceholder";

export function SettingsScreen(_props: ScreenProps) {
  return <ScreenPlaceholder titleKey="nav.settings" screen="settings" />;
}
