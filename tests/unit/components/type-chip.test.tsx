// T1: TypeChip (src/components/TypeChip.tsx) capitaliza o nome do tipo e reflete o estado selecionado/tamanho.
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TypeChip, typeName } from "../../../src/components/TypeChip";

describe("TypeChip", () => {
  it("capitaliza o nome (pt e en)", () => {
    expect(typeName("fire", "pt")).toBe("Fogo");
    expect(typeName("fire", "en")).toBe("Fire");
    expect(typeName("ground", "en")).toBe("Ground");
  });

  it("chip informativo (selected=undefined) nao tem classe .on", () => {
    const { container } = render(<TypeChip type="water" lang="pt" />);
    const chip = container.querySelector(".chip")!;
    expect(chip.className).toContain("t-water");
    expect(chip.className).not.toContain(" on");
    expect(chip.textContent).toBe("Água");
  });

  it("selected=true adiciona .on; selected=false nao adiciona (contorno, nunca opacidade)", () => {
    const { container: sel } = render(<TypeChip type="fire" lang="en" selected />);
    expect(sel.querySelector(".chip")!.className).toContain("on");
    const { container: unsel } = render(<TypeChip type="fire" lang="en" selected={false} />);
    expect(unsel.querySelector(".chip")!.className).not.toContain("on");
  });

  it("size sm/lg adiciona a classe; md (padrao) nao adiciona nada extra", () => {
    const { container: sm } = render(<TypeChip type="grass" lang="pt" size="sm" />);
    expect(sm.querySelector(".chip")!.className).toContain("sm");
    const { container: md } = render(<TypeChip type="grass" lang="pt" />);
    expect(md.querySelector(".chip")!.className.split(" ")).not.toContain("md");
  });

  it("className extra e o atributo data-type sao aplicados", () => {
    const { container } = render(<TypeChip type="electric" lang="pt" className="extra" />);
    const chip = container.querySelector(".chip")!;
    expect(chip.className).toContain("extra");
    expect(chip.getAttribute("data-type")).toBe("electric");
  });
});
