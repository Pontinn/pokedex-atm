// Sprite 96px local da especie (/assets/sprites/<dex>.png, B3.3). Sem sprite (custom 9901/9902) ou 404 ->
// silhueta da pokebola (placeholder RF-16), nunca imagem quebrada. Funciona offline (asset local, precache).
import { memo, useState } from "react";
import pokeballUrl from "../../assets/pokeball.webp";
import type { SpeciesSummary } from "../../data/types";

export function spriteUrl(dex: number): string {
  return `/assets/sprites/${dex}.png`;
}

export function formatDex(dex: number): string {
  return `#${String(dex).padStart(4, "0")}`;
}

export const SpeciesSprite = memo(function SpeciesSprite({
  species,
  className,
  size = 96,
}: {
  species: Pick<SpeciesSummary, "dex" | "hasSprite">;
  className?: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  if (!species.hasSprite || failed) {
    return <img className={`sprite-fallback ${className ?? ""}`.trim()} src={pokeballUrl} alt="" width={size} height={size} />;
  }
  return (
    <img
      className={className}
      src={spriteUrl(species.dex)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
});
