// B2.1: deteccao do modo da fonte, leitura snapshot x zip, metadados e erros nomeados.
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { zipSync } from "fflate";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseCliArgs } from "../../../tools/dataset/src/cli";
import { resolveConfig } from "../../../tools/dataset/src/config";
import { detectSourceMode, openSource } from "../../../tools/dataset/src/instance";
import { runPipeline, selectStages } from "../../../tools/dataset/src/index";
import { PipelineError } from "../../../tools/dataset/src/lib/errors";

process.env.DATASET_QUIET = "1";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const snapshotFixture = path.join(repoRoot, "tests/fixtures/source/snapshot");
let tmp: string;

/** Converte cada mods/<jar>/ do fixture de snapshot em um zip (instancia real sintetica). */
function buildZipInstance(target: string, keepDirs: string[] = []): void {
  mkdirSync(path.join(target, "mods"), { recursive: true });
  const modsSrc = path.join(snapshotFixture, "mods");
  for (const jar of readdirSync(modsSrc)) {
    const jarDir = path.join(modsSrc, jar);
    if (keepDirs.includes(jar)) {
      cpSync(jarDir, path.join(target, "mods", jar), { recursive: true });
      continue;
    }
    const files: Record<string, Uint8Array> = {};
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walk(full);
        else files[path.relative(jarDir, full).split(path.sep).join("/")] = readFileSync(full);
      }
    };
    walk(jarDir);
    writeFileSync(path.join(target, "mods", jar), zipSync(files));
  }
  writeFileSync(
    path.join(target, "manifest.json"),
    JSON.stringify({ name: "All the Mons", version: "1.3.0", minecraft: { version: "1.21.1" } }),
  );
}

function expectCode(fn: () => unknown, code: string): void {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(PipelineError);
    expect((error as PipelineError).code).toBe(code);
    return;
  }
  throw new Error(`esperava ${code}`);
}

beforeAll(() => {
  tmp = mkdtempSync(path.join(tmpdir(), "pontindex-source-"));
});

afterAll(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe("source mode detection", () => {
  it("mods/ with only directories -> snapshot", () => {
    const detected = detectSourceMode(snapshotFixture);
    expect(detected.mode).toBe("snapshot");
    expect(detected.jars.map((j) => j.id)).toEqual([
      "cobblemon",
      "allthemons",
      "ccc",
      "legendarymonuments",
      "mega_showdown",
      "zamega",
      "rctmod",
    ]);
  });

  it("MANIFEST.json answering as manifest.json (NTFS) does not change the mode", () => {
    // no Windows os dois nomes abrem o mesmo arquivo; o modo continua vindo so do statSync dos jars
    if (process.platform === "win32") expect(existsSync(path.join(snapshotFixture, "manifest.json"))).toBe(true);
    const { info } = openSource(snapshotFixture, () => {});
    expect(info.mode).toBe("snapshot");
    expect(info.pack).toEqual({ name: "All the Mons", version: "1.3.0", minecraft: "1.21.1" });
    expect(info.cobblemonVersion).toBe("1.7.3");
  });

  it("mods/ with only zip files -> instance, same metadata and same entries", () => {
    const inst = path.join(tmp, "instance");
    buildZipInstance(inst);
    expect(statSync(path.join(inst, "mods", "allthemons-0.6.2.jar")).isFile()).toBe(true);
    const { reader, info } = openSource(inst, () => {});
    expect(info.mode).toBe("instance");
    expect(info.pack).toEqual({ name: "All the Mons", version: "1.3.0", minecraft: "1.21.1" });
    expect(info.cobblemonVersion).toBe("1.7.3");
    const zipEntries = reader.readJar(reader.jar("cobblemon"), ["data/cobblemon/species/"]);
    const snap = openSource(snapshotFixture, () => {}).reader;
    const dirEntries = snap.readJar(snap.jar("cobblemon"), ["data/cobblemon/species/"]);
    expect([...zipEntries.keys()]).toEqual([...dirEntries.keys()]);
    expect([...zipEntries.keys()]).toContain("data/cobblemon/species/generation1/bulbasaur.json");
  });

  it("mixed directories and zips -> E_SOURCE_MODE_UNKNOWN", () => {
    const mixed = path.join(tmp, "mixed");
    buildZipInstance(mixed, ["zamega-neoforge-1.7.6.jar"]);
    expectCode(() => detectSourceMode(mixed), "E_SOURCE_MODE_UNKNOWN");
  });

  it("missing jar -> E_JAR_MISSING; duplicated prefix -> E_JAR_DUPLICATE", () => {
    const missing = path.join(tmp, "missing");
    cpSync(snapshotFixture, missing, { recursive: true });
    rmSync(path.join(missing, "mods", "zamega-neoforge-1.7.6.jar"), { recursive: true });
    expectCode(() => detectSourceMode(missing), "E_JAR_MISSING");
    const dup = path.join(tmp, "dup");
    cpSync(snapshotFixture, dup, { recursive: true });
    cpSync(path.join(dup, "mods", "zamega-neoforge-1.7.6.jar"), path.join(dup, "mods", "zamega-neoforge-1.7.7.jar"), {
      recursive: true,
    });
    expectCode(() => detectSourceMode(dup), "E_JAR_DUPLICATE");
  });

  it("snapshot metadata without files_per_jar -> E_SOURCE_MODE_UNKNOWN", () => {
    const bad = path.join(tmp, "bad-manifest");
    cpSync(snapshotFixture, bad, { recursive: true });
    writeFileSync(path.join(bad, "MANIFEST.json"), JSON.stringify({ source: "All the Mons 1.3.0" }));
    expectCode(() => openSource(bad, () => {}), "E_SOURCE_MODE_UNKNOWN");
  });

  it("nonexistent source or source without mods/ -> E_INSTANCE_NOT_FOUND", () => {
    expectCode(() => detectSourceMode(path.join(tmp, "nope")), "E_INSTANCE_NOT_FOUND");
    mkdirSync(path.join(tmp, "empty"), { recursive: true });
    expectCode(() => detectSourceMode(path.join(tmp, "empty")), "E_INSTANCE_NOT_FOUND");
  });
});

describe("pipeline entry", () => {
  it("ATM_INSTANCE_DIR pointing to a missing folder fails without touching public/data", async () => {
    const dataDir = path.join(repoRoot, "public/data");
    const before = existsSync(dataDir) ? readdirSync(dataDir).sort() : [];
    const currentFile = path.join(dataDir, "current.json");
    const currentBefore = existsSync(currentFile) ? readFileSync(currentFile, "utf8") : null;
    await expect(
      runPipeline(["--only", "speciesCore", "--out", "tools/dataset/out/_base-test"], {
        ATM_INSTANCE_DIR: path.join(tmp, "does-not-exist"),
      }),
    ).rejects.toMatchObject({ code: "E_INSTANCE_NOT_FOUND" });
    const after = existsSync(dataDir) ? readdirSync(dataDir).sort() : [];
    expect(after).toEqual(before);
    expect(existsSync(currentFile) ? readFileSync(currentFile, "utf8") : null).toBe(currentBefore);
    expect(existsSync(path.join(repoRoot, "tools/dataset/out/_base-test"))).toBe(false);
  });

  it("source precedence: --instance > ATM_INSTANCE_DIR > default", () => {
    const flags = parseCliArgs([]);
    expect(resolveConfig(flags, {}, repoRoot).sourceRoot).toBe(path.join(repoRoot, "data-source/atm-1.3.0"));
    expect(resolveConfig(flags, { ATM_INSTANCE_DIR: tmp }, repoRoot).sourceOrigin).toBe("env");
    const withFlag = parseCliArgs(["--instance", snapshotFixture]);
    const cfg = resolveConfig(withFlag, { ATM_INSTANCE_DIR: tmp }, repoRoot);
    expect(cfg.sourceRoot).toBe(snapshotFixture);
    expect(cfg.sourceOrigin).toBe("flag");
  });

  it("--publish-dir defaults to the repo public/ and only accepts a folder under tools/dataset/out apart from --out", () => {
    expect(resolveConfig(parseCliArgs([]), {}, repoRoot).publicDir).toBe(path.join(repoRoot, "public"));
    const custom = resolveConfig(parseCliArgs(["--publish-dir", "tools/dataset/out/_pub"]), {}, repoRoot);
    expect(custom.publicDir).toBe(path.join(repoRoot, "tools/dataset/out/_pub"));
    expectCode(() => resolveConfig(parseCliArgs(["--publish-dir", "public"]), {}, repoRoot), "E_OUT_DIR_UNSAFE");
    expectCode(() => resolveConfig(parseCliArgs(["--publish-dir", "tools/dataset/out"]), {}, repoRoot), "E_OUT_DIR_UNSAFE");
    expectCode(
      () => resolveConfig(parseCliArgs(["--out", "tools/dataset/out/_x", "--publish-dir", "tools/dataset/out/_x/pub"]), {}, repoRoot),
      "E_OUT_DIR_UNSAFE",
    );
    expectCode(() => parseCliArgs(["--publish-dir"]), "E_CLI_ARGS");
  });

  it("--out must stay under tools/dataset/out and --only selects speciesCore + the stage", () => {
    expectCode(() => resolveConfig(parseCliArgs(["--out", "public/data"]), {}, repoRoot), "E_OUT_DIR_UNSAFE");
    expectCode(() => parseCliArgs(["--only", "nope"]), "E_CLI_ARGS");
    expect(selectStages("media").map(([n]) => n)).toEqual(["speciesCore", "media"]);
    expect(selectStages(null).map(([n]) => n)).toEqual([
      "speciesCore",
      "speciesDerive",
      "pokeapi",
      "media",
      "balls",
      "trainers",
      "items",
      "write",
    ]);
  });

  it("real snapshot data-source/atm-1.3.0 opens in snapshot mode with the pack metadata", () => {
    const { info } = openSource(path.join(repoRoot, "data-source/atm-1.3.0"), () => {});
    expect(info.mode).toBe("snapshot");
    expect(info.pack).toEqual({ name: "All the Mons", version: "1.3.0", minecraft: "1.21.1" });
    expect(info.cobblemonVersion).toBe("1.7.3");
    expect(info.sources.length).toBeGreaterThanOrEqual(9);
  }, 60_000);
});
