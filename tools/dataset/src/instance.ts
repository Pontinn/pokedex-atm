// Deteccao do modo da fonte (regra UNICA de SPEC 5.1.1 / 5b.2) e metadados do pack.
// O modo NUNCA e decidido por manifest.json/MANIFEST.json (no NTFS os dois nomes abrem o mesmo arquivo):
// so por fs.statSync(mods/<jar>) dos 7 jars obrigatorios.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import TOML from "@iarna/toml";
import type { DatasetSource, PackInfo } from "../../../src/data/types";
import type { SourceInfo, SourceMode } from "./context";
import { PipelineError } from "./lib/errors";
import { DirSourceReader, MODS_TOML, REQUIRED_JARS, ZipSourceReader, type JarRef, type SourceReader } from "./source-reader";

export const EXPECTED_PACK_VERSION = "1.3.0";

export interface DetectedSource {
  mode: SourceMode;
  jars: JarRef[];
}

/** Localiza os 7 jars obrigatorios por prefixo e decide o modo por statSync. */
export function detectSourceMode(root: string): DetectedSource {
  const modsDir = path.join(root, "mods");
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    throw new PipelineError("E_INSTANCE_NOT_FOUND", "fonte de dados inexistente", root);
  }
  if (!existsSync(modsDir) || !statSync(modsDir).isDirectory()) {
    throw new PipelineError("E_INSTANCE_NOT_FOUND", "fonte sem pasta mods/", modsDir);
  }
  const entries = readdirSync(modsDir);
  const jars: JarRef[] = [];
  const kinds = new Set<SourceMode>();
  for (const spec of REQUIRED_JARS) {
    const matches = entries.filter((name) => name.startsWith(spec.prefix)).sort();
    if (matches.length === 0) throw new PipelineError("E_JAR_MISSING", spec.prefix, modsDir);
    if (matches.length > 1) {
      throw new PipelineError(
        "E_JAR_DUPLICATE",
        `mais de um jar com o prefixo ${spec.prefix}; limpe mods/`,
        matches.join(", "),
      );
    }
    const fileName = matches[0] as string;
    const full = path.join(modsDir, fileName);
    const st = statSync(full);
    if (st.isDirectory()) kinds.add("snapshot");
    else if (st.isFile()) kinds.add("instance");
    else throw new PipelineError("E_SOURCE_MODE_UNKNOWN", "entrada de mods/ nao e arquivo nem diretorio", full);
    jars.push({ id: spec.id, fileName, path: full });
  }
  if (kinds.size !== 1) {
    throw new PipelineError(
      "E_SOURCE_MODE_UNKNOWN",
      "os 7 jars obrigatorios misturam diretorios (snapshot) e arquivos (instancia real)",
      modsDir,
    );
  }
  const mode = [...kinds][0] as SourceMode;
  return { mode, jars };
}

export function createReader(root: string, detected: DetectedSource): SourceReader {
  return detected.mode === "snapshot" ? new DirSourceReader(root, detected.jars) : new ZipSourceReader(root, detected.jars);
}

const decoder = new TextDecoder();

function readJsonFile(file: string): Record<string, unknown> {
  try {
    const text = readFileSync(file, "utf8");
    return JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text) as Record<string, unknown>;
  } catch (error) {
    throw new PipelineError("E_SOURCE_MODE_UNKNOWN", "arquivo de metadados ilegivel", `${file}: ${String(error)}`);
  }
}

/** Metadados do pack conforme o modo JA decidido. */
export function readPackMetadata(
  root: string,
  mode: SourceMode,
  warn: (code: string, message: string) => void,
): { name: string; version: string; minecraftFromManifest: string | null } {
  if (mode === "snapshot") {
    const file = path.join(root, "MANIFEST.json");
    if (!existsSync(file)) throw new PipelineError("E_SOURCE_MODE_UNKNOWN", "snapshot sem MANIFEST.json", file);
    const manifest = readJsonFile(file);
    if (typeof manifest.source !== "string" || typeof manifest.files_per_jar !== "object" || manifest.files_per_jar === null) {
      throw new PipelineError("E_SOURCE_MODE_UNKNOWN", "MANIFEST.json do snapshot sem source/files_per_jar", file);
    }
    const match = /^(.*?)\s+(\d+\.\d+\.\d+)\b/.exec(manifest.source);
    if (!match) throw new PipelineError("E_SOURCE_MODE_UNKNOWN", "MANIFEST.json: source sem nome/versao do pack", file);
    const name = (match[1] as string).trim();
    const version = match[2] as string;
    const folder = /^atm-(\d+\.\d+\.\d+)$/.exec(path.basename(path.resolve(root)));
    if (folder && folder[1] !== version) {
      warn("W_PACK_FOLDER_MISMATCH", `pasta ${path.basename(root)} diverge da versao do MANIFEST.json (${version})`);
    }
    return { name, version, minecraftFromManifest: null };
  }
  const file = path.join(root, "manifest.json");
  if (!existsSync(file)) throw new PipelineError("E_SOURCE_MODE_UNKNOWN", "instancia sem manifest.json do CurseForge", file);
  const manifest = readJsonFile(file);
  if (typeof manifest.name !== "string" || typeof manifest.version !== "string") {
    throw new PipelineError("E_SOURCE_MODE_UNKNOWN", "manifest.json da instancia sem name/version", file);
  }
  const minecraft = manifest.minecraft as { version?: unknown } | undefined;
  return {
    name: manifest.name,
    version: manifest.version,
    minecraftFromManifest: typeof minecraft?.version === "string" ? minecraft.version : null,
  };
}

interface ModsToml {
  mods?: { modId?: string; version?: string }[];
  dependencies?: Record<string, { modId?: string; versionRange?: string }[]>;
}

/** cobblemonVersion e minecraft do META-INF/neoforge.mods.toml do jar do Cobblemon (mesmo arquivo nos dois modos). */
export function readCobblemonVersions(reader: SourceReader): { cobblemonVersion: string; minecraft: string } {
  const ref = reader.jar("cobblemon");
  const entries = reader.readJar(ref, []);
  const bytes = entries.get(MODS_TOML);
  if (!bytes) throw new PipelineError("E_SNAPSHOT_INCOMPLETE", `${MODS_TOML} do Cobblemon ausente`, ref.path);
  let toml: ModsToml;
  try {
    toml = TOML.parse(decoder.decode(bytes)) as ModsToml;
  } catch (error) {
    throw new PipelineError("E_JAR_UNREADABLE", `${MODS_TOML} invalido`, `${ref.path}: ${String(error)}`);
  }
  const mod = toml.mods?.find((m) => m.modId === "cobblemon") ?? toml.mods?.[0];
  const fullVersion = mod?.version;
  if (!fullVersion) throw new PipelineError("E_SNAPSHOT_INCOMPLETE", "versao do Cobblemon ausente no toml", ref.path);
  const deps = toml.dependencies?.cobblemon ?? Object.values(toml.dependencies ?? {}).flat();
  const mc = deps.find((d) => d.modId === "minecraft")?.versionRange;
  if (!mc) throw new PipelineError("E_SNAPSHOT_INCOMPLETE", "dependencia minecraft ausente no toml", ref.path);
  const minecraft = (mc.replace(/[[\]()]/g, "").split(",")[0] ?? "").trim();
  return { cobblemonVersion: fullVersion.split("+")[0] as string, minecraft };
}

function statSource(full: string, label: string): DatasetSource {
  const st = statSync(full);
  if (st.isFile()) return { file: label, sizeBytes: st.size, mtime: st.mtime.toISOString() };
  let size = 0;
  let mtime = 0;
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(p);
      else if (entry.isFile()) {
        const s = statSync(p);
        size += s.size;
        mtime = Math.max(mtime, s.mtimeMs);
      }
    }
  };
  visit(full);
  return { file: label, sizeBytes: size, mtime: new Date(mtime).toISOString() };
}

/** Fingerprint das entradas lidas (jars, kubejs/data, kubejs/assets, config, metadados). */
export function collectSources(root: string, mode: SourceMode, jars: JarRef[]): DatasetSource[] {
  const out: DatasetSource[] = jars.map((j) => statSource(j.path, `mods/${j.fileName}`));
  for (const rel of ["kubejs/data", "kubejs/assets", "config/rctmod-server.toml", mode === "snapshot" ? "MANIFEST.json" : "manifest.json"]) {
    const full = path.join(root, rel);
    if (existsSync(full)) out.push(statSource(full, rel));
  }
  return out;
}

/** Detecta o modo, cria o leitor e le os metadados do pack. */
export function openSource(
  root: string,
  warn: (code: string, message: string) => void,
): { reader: SourceReader; info: SourceInfo } {
  const detected = detectSourceMode(root);
  const reader = createReader(root, detected);
  const meta = readPackMetadata(root, detected.mode, warn);
  const versions = readCobblemonVersions(reader);
  if (meta.minecraftFromManifest && meta.minecraftFromManifest !== versions.minecraft) {
    warn(
      "W_MINECRAFT_MISMATCH",
      `manifest.json diz minecraft ${meta.minecraftFromManifest}, o toml do Cobblemon diz ${versions.minecraft} (vale o toml)`,
    );
  }
  if (meta.version !== EXPECTED_PACK_VERSION) {
    warn("W_PACK_VERSION", `versao do pack ${meta.version} diferente de ${EXPECTED_PACK_VERSION} (prossegue)`);
  }
  const pack: PackInfo = { name: meta.name, version: meta.version, minecraft: versions.minecraft };
  return {
    reader,
    info: {
      root,
      mode: detected.mode,
      pack,
      cobblemonVersion: versions.cobblemonVersion,
      sources: collectSources(root, detected.mode, detected.jars),
    },
  };
}
