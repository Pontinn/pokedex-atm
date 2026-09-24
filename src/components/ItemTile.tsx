// Moldura da textura de item (.it-tile, style.css:902-924). Sem textura ou 404 -> icone de pacote.
import { useState } from "react";
import { Package } from "./Icon";

export function ItemTile({ texture, size = 40 }: { texture: string | null | undefined; size?: number }) {
  const [failed, setFailed] = useState(false);
  const src = texture ? `/assets/items/${texture}` : null;
  return (
    <span className="it-tile" style={{ width: size, height: size }} aria-hidden="true">
      {src && !failed ? <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} /> : <Package />}
    </span>
  );
}
