// Moldura da textura de item (.it-tile, style.css:902-924). Sem textura ou 404 -> icone de pacote.
import { useState } from "react";
import { Package } from "./Icon";

/**
 * URL da textura do item. O dataset grava `ItemInfo.texture` como `assets/items/<ns>/<nome>.png` (relativo a raiz
 * do site): vira `/assets/items/...`. Caminho ja absoluto (`/...`) passa direto; caminho curto (`<ns>/<nome>.png`,
 * legado) recebe `/assets/items/`.
 */
export function itemTextureUrl(texture: string | null | undefined): string | null {
  if (!texture) return null;
  if (texture.startsWith("/")) return texture;
  if (texture.startsWith("assets/")) return `/${texture}`;
  return `/assets/items/${texture}`;
}

export function ItemTile({ texture, size = 40 }: { texture: string | null | undefined; size?: number }) {
  const [failed, setFailed] = useState(false);
  const src = itemTextureUrl(texture);
  return (
    <span className="it-tile" style={{ width: size, height: size }} aria-hidden="true">
      {src && !failed ? <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} /> : <Package />}
    </span>
  );
}
