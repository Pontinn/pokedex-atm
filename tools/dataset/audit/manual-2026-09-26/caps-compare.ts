// Comparacao FINAL: sequencia de cap calculada a mao (trainers.mjs, so cru) x computeSeriesCap do app.
// Uso: npx tsx tools/dataset/audit/manual-2026-09-26/caps-compare.ts <saida-do-trainers.mjs.json>
import fs from "node:fs";
import path from "node:path";
import { computeSeriesCap } from "../../../../src/domain/level-cap";

const ROOT = process.cwd();
const cur = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/current.json"), "utf8")).datasetVersion;
const PUB = path.join(ROOT, "public/data", cur);
const own = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const series = JSON.parse(fs.readFileSync(path.join(PUB, "series.json"), "utf8"));
const cfg = own.summary.config;

let mismatches = 0;
for (const s of series) {
  if (s.special) continue;
  const all = JSON.parse(fs.readFileSync(path.join(PUB, s.trainersFile), "utf8")).trainers;
  const key = all.filter((t: { optional: boolean }) => !t.optional);
  const steps = own.caps[s.id] as { cap: number; next: string | null; defeatedSnapshot?: string[]; defeatedCount: number }[];
  const appSeq: number[] = [];
  const defeatedAll = new Set<string>();
  for (const st of steps) {
    const defeated = new Set(st.defeatedSnapshot ?? [...defeatedAll]);
    const r = computeSeriesCap({ keyTrainers: key, allTrainers: all, defeated, config: cfg, mode: "series" });
    appSeq.push(r.cap);
    if (r.cap !== st.cap) {
      mismatches++;
      console.log(`MISMATCH ${s.id} passo ${st.defeatedCount}: manual=${st.cap} app=${r.cap}`);
    }
    if (st.next) defeatedAll.add(st.next);
  }
  // mesma conta seguindo a ordem publicada keyTrainerIds
  const byOrder: number[] = [];
  const d2 = new Set<string>();
  for (let i = 0; i <= s.keyTrainerIds.length; i++) {
    byOrder.push(computeSeriesCap({ keyTrainers: key, allTrainers: all, defeated: d2, config: cfg, mode: "series" }).cap);
    if (i < s.keyTrainerIds.length) d2.add(s.keyTrainerIds[i]);
  }
  console.log(`${s.id} manual: ${steps.map((x) => x.cap).join(", ")}`);
  console.log(`${s.id} app   : ${appSeq.join(", ")}`);
  console.log(`${s.id} app na ordem keyTrainerIds publicada: ${byOrder.join(", ")}`);
  console.log(`${s.id} ordem manual: ${steps.filter((x) => x.next).map((x) => x.next).join(" > ")}`);
}
console.log(`mismatches=${mismatches}`);
