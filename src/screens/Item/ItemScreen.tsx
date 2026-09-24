// Tela "item" (placeholder de F1.4). O agente dono desta tela substitui SO este arquivo e o CSS da pasta.
import "./item.css";
import type { ScreenProps } from "../../components/ScreenRouter";
import { ScreenPlaceholder } from "../ScreenPlaceholder";

export function ItemScreen(_props: ScreenProps) {
  return <ScreenPlaceholder titleKey="nav.items" screen="item" />;
}
