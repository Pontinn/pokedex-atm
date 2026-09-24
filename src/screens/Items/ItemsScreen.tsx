// Tela "items" (placeholder de F1.4). O agente dono desta tela substitui SO este arquivo e o CSS da pasta.
import "./items.css";
import type { ScreenProps } from "../../components/ScreenRouter";
import { ScreenPlaceholder } from "../ScreenPlaceholder";

export function ItemsScreen(_props: ScreenProps) {
  return <ScreenPlaceholder titleKey="nav.items" screen="items" />;
}
