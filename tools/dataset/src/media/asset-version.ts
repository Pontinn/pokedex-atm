// U3 (pwa-auto-update): cache busting dos assets referenciados pelo dataset. Os arquivos ficam em caminhos
// sem versao (public/assets/items/...), servidos com Cache-Control immutable de 1 ano e guardados CacheFirst
// pelo service worker; sem versao no caminho, uma textura que muda de bytes (ex. insignia animada que virou
// 16x16) nunca chega a quem ja tinha a antiga. Todo caminho de asset gravado no JSON ganha "?v=<sha8 dos bytes>":
// mesmos bytes = mesma query (deterministico), bytes novos = URL nova. O arquivo em disco NAO muda de nome.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { sha8 } from "../lib/hash";

export const ASSET_VERSION_PARAM = "v";
const VERSION_QUERY_RE = /\?v=[0-9a-f]{8}$/;

/** "assets/items/x.png" + bytes -> "assets/items/x.png?v=<sha8>". Caminho que ja tem query e erro de programacao. */
export function withAssetVersion(assetPath: string, bytes: Uint8Array): string {
  if (assetPath.includes("?")) throw new Error(`withAssetVersion: caminho ja tem query: ${assetPath}`);
  return `${assetPath}?${ASSET_VERSION_PARAM}=${sha8(bytes)}`;
}

/** Remove o "?v=<hash>" (para achar o arquivo em disco a partir do valor publicado). */
export function stripAssetVersion(assetPath: string): string {
  return assetPath.replace(VERSION_QUERY_RE, "");
}

/**
 * Versiona um caminho publicado ("assets/...", relativo a raiz de staging `outDir`) lendo os bytes ja escritos.
 * Arquivo ausente (ex. --skip-media) = caminho sem versao e `missing: true` (quem chama decide se avisa).
 */
export function versionStagedAsset(outDir: string, assetPath: string): { path: string; missing: boolean } {
  const abs = path.join(outDir, ...assetPath.split("/"));
  if (!existsSync(abs)) return { path: assetPath, missing: true };
  return { path: withAssetVersion(assetPath, readFileSync(abs)), missing: false };
}
