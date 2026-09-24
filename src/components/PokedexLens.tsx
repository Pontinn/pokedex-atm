// Lente + LEDs do "aparelho" Pokedex (style.css:175-189 do prototipo).
export function PokedexLens({ size }: { size: "sm" | "md" | "lg" }) {
  return (
    <>
      <div className={`lens lens-${size}`} aria-hidden="true">
        <span />
      </div>
      <div className="leds" aria-hidden="true">
        <i className="led led-red" />
        <i className="led led-yellow" />
        <i className="led led-green" />
      </div>
    </>
  );
}
