// Abstracao unica de leitura da fonte (B2-B5). O resto do pipeline nunca sabe qual modo esta ativo.
// - DirSourceReader: snapshot (data-source/atm-1.3.0), cada mods/<jar>.jar/ e um DIRETORIO.
// - ZipSourceReader: instancia real do CurseForge, mods/<jar>.jar e um zip.
// Em ambos, readTree/readFile leem kubejs/ e config/ direto do sistema de arquivos.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { readJar as readZipJar } from "./jar-reader";
import { PipelineError } from "./lib/errors";

/** Ids estaveis dos 7 jars obrigatorios (usados como `source` em spawns/formas/merge). */
export type JarId = "cobblemon" | "allthemons" | "ccc" | "legendarymonuments" | "mega_showdown" | "zamega" | "rctmod";

export interface JarSpec {
  id: JarId;
  /** prefixo do nome do arquivo em mods/ */
  prefix: string;
}

/**
 * Ordem de leitura/merge (SPEC 5.1.1): Cobblemon base; addons em ordem alfabetica de nome de arquivo
 * (allthemons, complete-cobblemon-collection, legendarymonuments, mega_showdown, zamega); rctmod por ultimo.
 */
export const REQUIRED_JARS: readonly JarSpec[] = [
  { id: "cobblemon", prefix: "Cobblemon-neoforge-" },
  { id: "allthemons", prefix: "allthemons-" },
  { id: "ccc", prefix: "complete-cobblemon-collection-" },
  { id: "legendarymonuments", prefix: "legendarymonuments-" },
  { id: "mega_showdown", prefix: "mega_showdown-" },
  { id: "zamega", prefix: "zamega-" },
  { id: "rctmod", prefix: "rctmod-neoforge-" },
];

export interface JarRef {
  id: JarId;
  /** nome da entrada em mods/, ex. "Cobblemon-neoforge-1.7.3+1.21.1.jar" */
  fileName: string;
  /** caminho absoluto (diretorio no snapshot, arquivo zip na instancia) */
  path: string;
}

/** Prefixo sempre incluido em readJar (versoes, B2.1 passo 2). */
export const MODS_TOML = "META-INF/neoforge.mods.toml";

export interface SourceReader {
  readonly root: string;
  readonly mode: "snapshot" | "instance";
  /** os 7 jars obrigatorios, na ordem de REQUIRED_JARS */
  listJars(): JarRef[];
  jar(id: JarId): JarRef;
  /** entradas do jar (caminho interno com "/") filtradas pelos prefixos (+ META-INF/neoforge.mods.toml) */
  readJar(ref: JarRef, prefixes: readonly string[]): Map<string, Uint8Array>;
  /** arquivos sob <root>/<relDir>, chave = caminho relativo a relDir com "/"; pasta ausente -> mapa vazio */
  readTree(relDir: string): Map<string, Uint8Array>;
  /** arquivo obrigatorio sob <root>; ausente -> E_SNAPSHOT_INCOMPLETE */
  readFile(relPath: string): Uint8Array;
  exists(relPath: string): boolean;
}

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

function walk(dir: string, base: string, out: string[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, base, out);
    else if (entry.isFile()) out.push(toPosix(path.relative(base, full)));
  }
}

abstract class BaseSourceReader implements SourceReader {
  abstract readonly mode: "snapshot" | "instance";
  constructor(
    readonly root: string,
    protected readonly jars: JarRef[],
  ) {}

  listJars(): JarRef[] {
    return [...this.jars];
  }

  jar(id: JarId): JarRef {
    const ref = this.jars.find((j) => j.id === id);
    if (!ref) throw new PipelineError("E_JAR_MISSING", id);
    return ref;
  }

  abstract readJar(ref: JarRef, prefixes: readonly string[]): Map<string, Uint8Array>;

  readTree(relDir: string): Map<string, Uint8Array> {
    const dir = path.join(this.root, relDir);
    const out = new Map<string, Uint8Array>();
    if (!existsSync(dir) || !statSync(dir).isDirectory()) return out;
    const files: string[] = [];
    walk(dir, dir, files);
    for (const rel of files.sort()) out.set(rel, readFileSync(path.join(dir, rel)));
    return out;
  }

  readFile(relPath: string): Uint8Array {
    const full = path.join(this.root, relPath);
    if (!existsSync(full)) {
      throw new PipelineError(
        "E_SNAPSHOT_INCOMPLETE",
        "arquivo pedido pelo pipeline nao existe na fonte (re-extrair conforme data-source/README.md)",
        full,
      );
    }
    return readFileSync(full);
  }

  exists(relPath: string): boolean {
    return existsSync(path.join(this.root, relPath));
  }
}

export class DirSourceReader extends BaseSourceReader {
  readonly mode = "snapshot" as const;
  private readonly fileLists = new Map<string, string[]>();

  readJar(ref: JarRef, prefixes: readonly string[]): Map<string, Uint8Array> {
    let files = this.fileLists.get(ref.path);
    if (!files) {
      files = [];
      walk(ref.path, ref.path, files);
      files.sort();
      this.fileLists.set(ref.path, files);
    }
    const all = [MODS_TOML, ...prefixes];
    const out = new Map<string, Uint8Array>();
    for (const rel of files) {
      if (all.some((p) => rel.startsWith(p))) out.set(rel, readFileSync(path.join(ref.path, rel)));
    }
    return out;
  }
}

export class ZipSourceReader extends BaseSourceReader {
  readonly mode = "instance" as const;

  readJar(ref: JarRef, prefixes: readonly string[]): Map<string, Uint8Array> {
    return readZipJar(ref.path, [MODS_TOML, ...prefixes]);
  }
}
