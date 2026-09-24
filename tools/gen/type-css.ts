// B1.4: gera src/styles/types.generated.css a partir de design/tipos/cores.json (18 tipos, campos base/a/b).
// Classes iguais ao prototipo: .t-<tipo> (style.css:305) e .g-<tipo> (style.css:431).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const TYPE_IDS = [
  "bug", "dark", "dragon", "electric", "fairy", "fighting", "fire", "flying", "ghost",
  "grass", "ground", "ice", "normal", "poison", "psychic", "rock", "steel", "water",
] as const;

export interface TypeColor {
  base: string;
  a: string;
  b: string;
}

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Valida cores.json e devolve o CSS gerado (deterministico: tipos em ordem alfabetica). */
export function buildTypeCss(colors: Record<string, unknown>): string {
  const lines: string[] = [];
  const rootVars: string[] = [];
  const rules: string[] = [];
  for (const type of TYPE_IDS) {
    const entry = colors[type] as Partial<TypeColor> | undefined;
    if (!entry) throw new Error(`cores.json: tipo ausente "${type}"`);
    for (const field of ["base", "a", "b"] as const) {
      const value = entry[field];
      if (typeof value !== "string") throw new Error(`cores.json: campo "${field}" ausente em "${type}"`);
      if (!HEX.test(value)) throw new Error(`cores.json: hex invalido em ${type}.${field}: "${value}"`);
    }
    const c = entry as TypeColor;
    rootVars.push(`  --t-${type}: ${c.base.toLowerCase()}; --type-${type}-a: ${c.a.toLowerCase()}; --type-${type}-b: ${c.b.toLowerCase()};`);
    rules.push(
      `/* ${type} */\n` +
        `.t-${type} { --tc: var(--t-${type}); --g1: var(--type-${type}-a); --g2: var(--type-${type}-b); }\n` +
        `.g-${type} { --g1: var(--type-${type}-a); --g2: var(--type-${type}-b); }`,
    );
  }
  const extra = Object.keys(colors).filter((k) => !(TYPE_IDS as readonly string[]).includes(k));
  if (extra.length > 0) throw new Error(`cores.json: tipos desconhecidos: ${extra.join(", ")}`);
  lines.push("/* GENERATED, do not edit. Fonte: design/tipos/cores.json (npm run gen:assets). */");
  lines.push(":root {", ...rootVars, "}", "", rules.join("\n\n"), "");
  return lines.join("\n");
}

export function generateTypeCss(root: string): string {
  const colors = JSON.parse(readFileSync(path.join(root, "design/tipos/cores.json"), "utf8")) as Record<string, unknown>;
  const css = buildTypeCss(colors);
  const out = path.join(root, "src/styles/types.generated.css");
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, css);
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = path.resolve(import.meta.dirname, "../..");
  const out = generateTypeCss(root);
  console.log(`type-css: ${path.relative(root, out)} (${TYPE_IDS.length} tipos)`);
}
