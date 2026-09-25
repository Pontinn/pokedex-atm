// Item clicavel da ficha (drops, fossil, formas, melhor bola): textura (ItemTile) + nome no idioma do card; abre a
// pagina do item (RF-71). Id sem entrada no items.json -> nome humanizado.
import { memo } from "react";
import { ItemTile } from "../../components/ItemTile";
import type { ItemsFile } from "../../data/types";
import { useNavigationActions } from "../../navigation/useNavigation";
import type { UiLanguage } from "../../storage/types";

export function humanItemId(id: string): string {
  const path = id.includes(":") ? id.slice(id.indexOf(":") + 1) : id;
  return path.replace(/[_/]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function itemDisplayName(items: ItemsFile | null, id: string, lang: UiLanguage): string {
  const info = items?.[id];
  return info ? info.name[lang] || info.name.en : humanItemId(id);
}

export const ItemLink = memo(function ItemLink({
  id,
  items,
  lang,
  className = "tag tag-item it-link",
  size = 18,
}: {
  id: string;
  items: ItemsFile | null;
  lang: UiLanguage;
  className?: string;
  size?: number;
}) {
  const { navigate } = useNavigationActions();
  return (
    <button
      type="button"
      className={className}
      data-nav=""
      data-item={id}
      onClick={(e) => {
        e.stopPropagation();
        navigate("item", { itemId: id });
      }}
    >
      <ItemTile texture={items?.[id]?.texture} size={size} />
      <span>{itemDisplayName(items, id, lang)}</span>
    </button>
  );
});
