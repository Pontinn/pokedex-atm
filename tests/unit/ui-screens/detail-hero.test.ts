// F4.1: url do artwork (SPEC 5.2) e regra do selo especial (lendario prevalece sobre mitico).
import { describe, expect, it } from "vitest";
import { artworkUrl, ARTWORK_TIMEOUT_MS } from "../../../src/screens/Detail/ArtworkImage";
import { specialLabel } from "../../../src/screens/Dex/PokemonCard";

describe("hero helpers", () => {
  it("official artwork url, shiny variant and 8 s timeout", () => {
    expect(artworkUrl(6)).toBe("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png");
    expect(artworkUrl(6, true)).toBe("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/6.png");
    expect(ARTWORK_TIMEOUT_MS).toBe(8000);
  });
  it("legendary wins over mythical; regular species have no special seal", () => {
    expect(specialLabel(["legendary", "mythical"])).toBe("legendary");
    expect(specialLabel(["mythical"])).toBe("mythical");
    expect(specialLabel(["ultra_beast"])).toBeNull();
  });
});
