// item-descriptions D5: textura de item animada do Minecraft (<textura>.png.mcmeta com "animation") e uma
// tira de quadros; o site publica so UM quadro: o que animation.frames[0] aponta (numero ou {index}), padrao 0.
// Tamanho do quadro como no Minecraft: animation.width/height quando existem; senao quadrado de lado
// min(largura, altura) da imagem (tira vertical 16x160 -> 16x16). Quadros em grade, da esquerda para a direita.
import { parseJsonStrict } from "../jar-reader";

export interface TextureAnimation {
  frameIndex: number;
  frameWidth: number | null;
  frameHeight: number | null;
}

export interface FrameRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const positiveInt = (v: unknown): number | null => (typeof v === "number" && Number.isInteger(v) && v > 0 ? v : null);

/** Le o .png.mcmeta; null quando nao ha secao "animation" (textura estatica, publicada como esta). */
export function parseTextureAnimation(bytes: Uint8Array, where: string): TextureAnimation | null {
  const meta = parseJsonStrict<unknown>(bytes, where);
  if (!isObject(meta) || !isObject(meta.animation)) return null;
  const animation = meta.animation;
  let frameIndex = 0;
  if (Array.isArray(animation.frames) && animation.frames.length > 0) {
    const first: unknown = animation.frames[0];
    const index = isObject(first) ? first.index : first;
    if (typeof index === "number" && Number.isInteger(index) && index >= 0) frameIndex = index;
  }
  return { frameIndex, frameWidth: positiveInt(animation.width), frameHeight: positiveInt(animation.height) };
}

/** Retangulo do quadro escolhido; lanca erro se ele nao couber na imagem. */
export function frameRect(imageWidth: number, imageHeight: number, animation: TextureAnimation, where: string): FrameRect {
  const side = Math.min(imageWidth, imageHeight);
  const width = animation.frameWidth ?? (animation.frameHeight === null ? side : imageWidth);
  const height = animation.frameHeight ?? (animation.frameWidth === null ? side : imageHeight);
  const columns = Math.floor(imageWidth / width);
  const rows = Math.floor(imageHeight / height);
  if (columns < 1 || rows < 1 || animation.frameIndex >= columns * rows) {
    throw new Error(`E_MEDIA_CORRUPT: ${where}: quadro ${animation.frameIndex} (${width}x${height}) fora da imagem ${imageWidth}x${imageHeight}`);
  }
  return {
    left: (animation.frameIndex % columns) * width,
    top: Math.floor(animation.frameIndex / columns) * height,
    width,
    height,
  };
}

export async function loadSharp(): Promise<typeof import("sharp")> {
  try {
    return (await import("sharp")).default as unknown as typeof import("sharp");
  } catch (error) {
    throw new Error(`sharp indisponivel para esta plataforma; rode "npm rebuild sharp". Causa: ${String(error)}`);
  }
}

/** PNG so com o quadro escolhido (recorte sem redimensionar, pixel art intacta). */
export async function extractAnimationFrame(png: Uint8Array, animation: TextureAnimation, where: string): Promise<Uint8Array> {
  const sharp = await loadSharp();
  const image = sharp(png);
  const { width, height } = await image.metadata();
  if (!width || !height) throw new Error(`E_MEDIA_CORRUPT: ${where}: PNG sem dimensoes`);
  const rect = frameRect(width, height, animation, where);
  return new Uint8Array(await image.extract(rect).png().toBuffer());
}
