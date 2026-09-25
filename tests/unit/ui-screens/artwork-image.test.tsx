// T1: ArtworkImage (src/screens/Detail/ArtworkImage.tsx, RF-09/RF-16): onerror da imagem cai no placeholder da
// pokebola; artworkId null (especie custom) nunca tenta a rede e mostra o aviso "imagem nao vem da PokeAPI".
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ArtworkImage, artworkUrl } from "../../../src/screens/Detail/ArtworkImage";

describe("ArtworkImage", () => {
  afterEach(() => cleanup());

  it("artworkId != null: renderiza a img da PokeAPI; onError troca para o placeholder da pokebola", () => {
    const onSettled = vi.fn();
    const { container } = render(<ArtworkImage artworkId={6} onSettled={onSettled} />);
    const img = container.querySelector("img.artwork-img") as HTMLImageElement;
    expect(img.src).toBe(artworkUrl(6));
    fireEvent.error(img);
    expect(container.querySelector(".artwork-failed")).not.toBeNull();
    expect(container.querySelector(".art-placeholder")).not.toBeNull();
    expect(container.querySelector("img.artwork-img")).toBeNull();
    expect(onSettled).toHaveBeenCalledWith(false);
  });

  it("onLoad marca a fase ok (sem placeholder)", () => {
    const onSettled = vi.fn();
    const { container } = render(<ArtworkImage artworkId={25} onSettled={onSettled} />);
    const img = container.querySelector("img.artwork-img") as HTMLImageElement;
    fireEvent.load(img);
    expect(container.querySelector('[data-phase="ok"]')).not.toBeNull();
    expect(onSettled).toHaveBeenCalledWith(true);
  });

  it("artworkId == null (especie custom): nunca renderiza <img>, mostra placeholder com aviso 'notPokeapi'", () => {
    const { container } = render(<ArtworkImage artworkId={null} />);
    expect(container.querySelector("img.artwork-img")).toBeNull();
    expect(container.querySelector(".artwork-missing")).not.toBeNull();
    expect(container.textContent).toContain("Imagem não vem da PokeAPI");
  });

  it("artworkId == null com showNotice=false: placeholder sem o aviso", () => {
    const { container } = render(<ArtworkImage artworkId={null} showNotice={false} />);
    expect(container.querySelector(".art-placeholder-notice")).toBeNull();
  });

  it("shiny=true usa a url shiny e a classe is-shiny", () => {
    const { container } = render(<ArtworkImage artworkId={6} shiny />);
    const img = container.querySelector("img.artwork-img") as HTMLImageElement;
    expect(img.src).toBe(artworkUrl(6, true));
    expect(img.className).toContain("is-shiny");
  });
});
