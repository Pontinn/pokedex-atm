// Icone de tipo (prototipo typeIcon(), app.js:675): circulo na cor do tipo com o SVG branco.
// Os SVG sao importados como URL pelo Vite (nunca caminho relativo ../tipos).
import type { TypeId } from "../data/types";

const TYPE_ICON_URLS = import.meta.glob<string>("../assets/types/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

export function typeIconUrl(type: TypeId): string {
  return TYPE_ICON_URLS[`../assets/types/${type}.svg`] ?? "";
}

export interface TypeIconProps {
  type: TypeId;
  className?: string;
}

export function TypeIcon({ type, className }: TypeIconProps) {
  return (
    <span className={`ti t-${type}${className ? ` ${className}` : ""}`} aria-hidden="true">
      <img src={typeIconUrl(type)} alt="" />
    </span>
  );
}
