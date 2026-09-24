// B1.4: copia os assets de design/ para src/assets/ e gera icones PWA + mascara da marca d'agua (sharp).
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

async function loadSharp(): Promise<typeof import("sharp")> {
  try {
    return (await import("sharp")).default as unknown as typeof import("sharp");
  } catch (error) {
    throw new Error(`sharp indisponivel para esta plataforma; rode "npm rebuild sharp". Causa: ${String(error)}`);
  }
}

export async function generateIcons(root: string): Promise<string[]> {
  const sharp = await loadSharp();
  const written: string[] = [];

  // 1) Copias versionadas (o app nunca referencia design/).
  const typesSrc = path.join(root, "design/tipos/svg");
  const typesDst = path.join(root, "src/assets/types");
  mkdirSync(typesDst, { recursive: true });
  for (const file of readdirSync(typesSrc).filter((f) => f.endsWith(".svg")).sort()) {
    copyFileSync(path.join(typesSrc, file), path.join(typesDst, file));
    written.push(path.join(typesDst, file));
  }
  const pokeball = path.join(root, "src/assets/pokeball.webp");
  copyFileSync(path.join(root, "design/pokebola.webp"), pokeball);
  written.push(pokeball);

  // 2) Icones PWA.
  const iconsDir = path.join(root, "public/icons");
  mkdirSync(iconsDir, { recursive: true });
  const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
  const square = async (size: number, file: string, paddingRatio = 0, background = transparent) => {
    const inner = Math.round(size * (1 - 2 * paddingRatio));
    const img = await sharp(pokeball).resize(inner, inner, { fit: "contain", background: transparent }).png().toBuffer();
    const out = path.join(iconsDir, file);
    await sharp({ create: { width: size, height: size, channels: 4, background } })
      .composite([{ input: img, gravity: "center" }])
      .png()
      .toFile(out);
    written.push(out);
  };
  await square(192, "icon-192.png");
  await square(512, "icon-512.png");
  await square(512, "maskable-512.png", 0.2, { r: 255, g: 255, b: 255, alpha: 1 });
  await square(180, "apple-touch-icon.png", 0.08, { r: 255, g: 255, b: 255, alpha: 1 });
  await square(48, "favicon.png");

  // 3) Mascara da marca d'agua: alfa = luminancia invertida (ponderada pelo alfa original), RGB preto.
  const { data, info } = await sharp(pokeball).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const mask = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 4] ?? 0;
    const g = data[i * 4 + 1] ?? 0;
    const b = data[i * 4 + 2] ?? 0;
    const a = data[i * 4 + 3] ?? 0;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    mask[i * 4 + 3] = Math.round(((255 - lum) * a) / 255);
  }
  const maskOut = path.join(root, "src/assets/pokeball-mask.png");
  await sharp(mask, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(maskOut);
  written.push(maskOut);
  return written;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = path.resolve(import.meta.dirname, "../..");
  const files = await generateIcons(root);
  console.log(`icons: ${files.length} arquivos gerados/copiados`);
}
