// B3.4 passo 1: assets/cobblemon/sounds/pokemon/<dir>/<arquivo>.ogg -> assets/cries/<nome>.ogg.
// Quando o arquivo e exatamente "<dir>_cry.ogg" (o caso comum, 1025 no snapshot), o nome de saida e o
// slug ("<dir>.ogg"). Formas/variantes tem sufixo extra no nome do arquivo dentro da MESMA pasta do slug
// base (ex. "archen/archen_quirk1_cry.ogg", "braviary/braviary_hisuian_cry.ogg"): 47 casos no snapshot,
// totalizando 1072 arquivos = a contagem do SPEC. Esses sao mantidos com o nome original (nao renomeados).
// Todos os jars sao verificados (o namespace de som e sempre "cobblemon", inclusive nos jars de addon, que
// trazem cries alternativos/adicionais na MESMA estrutura de pasta); quando dois jars trazem o mesmo nome
// de saida, o jar lido por ultimo (ordem de REQUIRED_JARS: addons depois do Cobblemon base) vence, no
// mesmo espirito de "addon vence" usado no merge de especies.
import type { PipelineContext } from "../context";
import { writeFileAtomic } from "../lib/fs-atomic";

const CRY_ENTRY = /^assets\/cobblemon\/sounds\/pokemon\/([^/]+)\/([^/]+)\.ogg$/;
const CRY_PREFIX = "assets/cobblemon/sounds/pokemon/";

export interface CriesResult {
  files: number;
  bytes: number;
}

export function extractCries(ctx: PipelineContext): CriesResult {
  const byOutputName = new Map<string, Uint8Array>();
  for (const jar of ctx.reader.listJars()) {
    const entries = ctx.reader.readJar(jar, [CRY_PREFIX]);
    for (const [entryPath, data] of entries) {
      const match = CRY_ENTRY.exec(entryPath);
      if (!match) continue;
      const [, dir, base] = match as unknown as [string, string, string];
      const outputName = base === `${dir}_cry` ? dir : base;
      if (data.byteLength === 0) throw new Error(`E_MEDIA_CORRUPT: ${jar.fileName}!${entryPath} tem 0 bytes`);
      byOutputName.set(outputName, data);
    }
  }
  let bytes = 0;
  for (const [name, data] of byOutputName) {
    bytes += writeFileAtomic(ctx.assetPath("cries", `${name}.ogg`), data);
  }
  return { files: byOutputName.size, bytes };
}
