// Marca d'agua (RF-119): pokebola grande girando devagar atras da interface, em monocromo pela mascara PNG
// (pokeball-mask.png, B1.4). O <img> so aparece no fallback sem suporte a mask-image (components.css).
import pokeballUrl from "../assets/pokeball.webp";

export function Watermark() {
  return (
    <div className="watermark" aria-hidden="true">
      <img src={pokeballUrl} alt="" />
    </div>
  );
}
