import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildTypeCss, TYPE_IDS } from "../../../tools/gen/type-css";

const root = path.resolve(import.meta.dirname, "../../..");
const colors = JSON.parse(readFileSync(path.join(root, "design/tipos/cores.json"), "utf8")) as Record<string, unknown>;

describe("type-css generator (B1.4)", () => {
  it("generates 18 type blocks matching the committed file", () => {
    const css = buildTypeCss(colors);
    expect(TYPE_IDS).toHaveLength(18);
    expect(css.match(/^\.t-[a-z]+ \{/gm)).toHaveLength(18);
    expect(css.match(/^\.g-[a-z]+ \{/gm)).toHaveLength(18);
    expect(css).toContain("--t-fire: #fba54c; --type-fire-a: #ff5a00; --type-fire-b: #ffd000;");
    expect(css).toContain(".t-fire { --tc: var(--t-fire); --g1: var(--type-fire-a); --g2: var(--type-fire-b); }");
    expect(css.startsWith("/* GENERATED, do not edit.")).toBe(true);
    const committed = readFileSync(path.join(root, "src/styles/types.generated.css"), "utf8").replace(/\r\n/g, "\n");
    expect(committed).toBe(css);
    expect(css).toMatchSnapshot();
  });

  it("is deterministic (idempotent)", () => {
    expect(buildTypeCss(colors)).toBe(buildTypeCss(colors));
  });

  it("fails on missing type, missing field or invalid hex", () => {
    const { fire: _fire, ...withoutFire } = colors;
    expect(() => buildTypeCss(withoutFire)).toThrow(/tipo ausente "fire"/);
    expect(() => buildTypeCss({ ...colors, fire: { base: "#fba54c", a: "#ff5a00" } })).toThrow(/campo "b"/);
    expect(() => buildTypeCss({ ...colors, fire: { base: "red", a: "#ff5a00", b: "#ffd000" } })).toThrow(/hex invalido/);
  });
});
