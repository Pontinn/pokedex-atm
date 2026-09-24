// Uso: tsx tools/dataset/audit/run.ts [datasetDir|current.json] [--src <snapshot>] [--expected-only]
// Constroi o esperado a partir do snapshot cru e, se houver dataset publicado, compara e grava AUDIT_REPORT.md (pt-BR).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildExpected } from "./expected";
import { compare, resolveDatasetDir, type CompareResult, type Divergence } from "./compare";
import { MANUAL_SAMPLE } from "./sample";
import { DEFAULT_SRC } from "./raw";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SEV_ORDER = ["WRONG DATA", "MISSING", "EXTRA", "SPEC x JOGO", "SEM ORDEM", "COSMETIC"] as const;

function mdEsc(s: string, max = 400): string {
  const t = s.length > max ? s.slice(0, max) + "..." : s;
  return t.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

export function renderReport(res: CompareResult | null, notes: string[], expectedSummary: string, manualSection: string): string {
  const lines: string[] = [];
  lines.push("# Relatorio de auditoria do dataset (A1)", "");
  lines.push(`Gerado em ${new Date().toISOString()} por \`tools/dataset/audit/run.ts\` (esperado derivado SO do snapshot cru, sem ler \`tools/dataset/src\`).`, "");
  lines.push("## Resumo", "");
  lines.push(expectedSummary, "");
  if (!res) {
    lines.push("Dataset publicado ainda nao existe: comparacao pendente.", "");
  } else {
    const by = new Map<string, Divergence[]>();
    for (const d of res.divergences) by.set(d.severity, [...(by.get(d.severity) ?? []), d]);
    lines.push(`- Dataset comparado: \`${path.relative(process.cwd(), res.datasetDir)}\``);
    lines.push(`- Especies com ficha conferida: ${res.speciesChecked}`);
    lines.push(`- Verificacoes individuais: ${res.checks}`);
    for (const s of SEV_ORDER) lines.push(`- ${s}: ${(by.get(s) ?? []).length}`);
    lines.push("");
    lines.push("Legenda: WRONG DATA = valor diferente do cru; MISSING = ausente no publicado; EXTRA = sobra no publicado; SPEC x JOGO = o pipeline seguiu a SPEC ao pe da letra mas o jogo se comporta diferente; SEM ORDEM = colisao de arquivo entre jars sem ordem de carga declarada (indeterminavel pelo snapshot); COSMETIC = texto/ordem/rotulo sem efeito no dado.", "");
    for (const s of SEV_ORDER) {
      const list = by.get(s) ?? [];
      if (!list.length) continue;
      lines.push(`## ${s} (${list.length})`, "");
      // agrupa por campo para leitura
      const byField = new Map<string, Divergence[]>();
      for (const d of list) byField.set(d.field.replace(/^(spawn|evolution|form) \S+ /, "$1 * "), [...(byField.get(d.field.replace(/^(spawn|evolution|form) \S+ /, "$1 * ")) ?? []), d]);
      for (const [f, ds] of [...byField.entries()].sort((a, b) => b[1].length - a[1].length)) {
        lines.push(`### ${f} (${ds.length})`, "");
        lines.push("| Escopo | Esperado (cru) | Publicado | Evidencia crua | Arquivo publicado | Causa provavel |", "|---|---|---|---|---|---|");
        for (const d of ds.slice(0, 60)) lines.push(`| ${mdEsc(d.scope)} | ${mdEsc(d.expected, 250)} | ${mdEsc(d.actual, 250)} | ${mdEsc(d.evidence, 250)} | ${mdEsc(d.published)} | ${mdEsc(d.cause ?? "")} |`);
        if (ds.length > 60) lines.push(`| ... mais ${ds.length - 60} | | | | | |`);
        lines.push("");
      }
    }
  }
  lines.push("## Achados estruturais do snapshot (independem do pipeline)", "");
  for (const n of notes) lines.push(`- ${mdEsc(n, 3000)}`);
  lines.push("");
  lines.push("## Amostra manual (50 especies)", "");
  lines.push("| Dex | Slug | Motivo |", "|---|---|---|");
  for (const s of MANUAL_SAMPLE) lines.push(`| ${s.dex} | ${s.slug} | ${s.reason} |`);
  lines.push("");
  if (manualSection) lines.push(manualSection, "");
  return lines.join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  const srcIdx = args.indexOf("--src");
  const src = srcIdx >= 0 ? args[srcIdx + 1]! : DEFAULT_SRC;
  const positional = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--src");
  const exp = buildExpected(src);
  const spawnGame = [...exp.species.values()].reduce((n, s) => n + s.spawns.length, 0);
  const spawnAll = [...exp.species.values()].reduce((n, s) => n + s.spawnsAll.length, 0);
  const summary = [
    `- Esperado: ${exp.species.size} especies, ${spawnAll} entradas de spawn lidas (${spawnGame} valem no jogo), ${exp.fossilRoutes.length} rotas de fossil, ${exp.balls.length} bolas, series ${exp.series.map((s) => `${s.id}=${s.keyTrainers.length}`).join(", ")}, levelCap ${JSON.stringify(exp.levelCap)}.`,
  ].join("\n");
  let res: CompareResult | null = null;
  if (!args.includes("--expected-only")) {
    try {
      const dir = resolveDatasetDir(positional[0]);
      if (fs.existsSync(path.join(dir, "dataset-manifest.json"))) res = compare(exp, dir);
    } catch (e) {
      console.error(`audit: dataset nao encontrado (${(e as Error).message})`);
    }
  }
  const manualFile = path.join(HERE, "manual-check.md");
  const manual = fs.existsSync(manualFile) ? fs.readFileSync(manualFile, "utf8") : "";
  const md = renderReport(res, exp.notes, summary, manual);
  fs.writeFileSync(path.join(HERE, "AUDIT_REPORT.md"), md, "utf8");
  console.log(summary);
  if (res) {
    const c: Record<string, number> = {};
    for (const d of res.divergences) c[d.severity] = (c[d.severity] ?? 0) + 1;
    console.log(`checks ${res.checks}, especies ${res.speciesChecked}, divergencias`, c);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) void main();
