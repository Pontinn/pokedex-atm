// T1: ramos de fallback de mergeDocuments (src/sync/merge.ts) quando o incoming nao traz um doc: "merge" mantem
// o doc local intacto (captured/history/trainerProgress ausentes) e "replace" cai no DOC_DEFAULTS por doc ausente.
import { describe, expect, it } from "vitest";
import { defaultDocs } from "../../../src/storage";
import { mergeDocuments } from "../../../src/sync/merge";

describe("mergeDocuments: incoming vazio", () => {
  it("merge com incoming totalmente vazio mantem captured/historico/progresso locais", () => {
    const local = defaultDocs(0);
    local.captured.entries["6"] = { capturedAt: 1000 };
    local.history.entries = [{ dex: 6, viewedAt: 2000 }];
    local.trainerProgress.activeSeriesId = "bdsp";
    local.trainerProgress.series = { bdsp: { defeated: { roark: { at: 3000 } } } };
    const merged = mergeDocuments(local, {}, "merge");
    expect(merged.captured.entries).toEqual({ "6": { capturedAt: 1000 } });
    expect(merged.history.entries).toEqual([{ dex: 6, viewedAt: 2000 }]);
    expect(merged.trainerProgress).toEqual(local.trainerProgress);
    expect(merged.trainerProgress).not.toBe(local.trainerProgress); // clone, nao referencia
  });

  it("replace com incoming vazio usa DOC_DEFAULTS para todos os docs, exceto meta (do local)", () => {
    const local = defaultDocs(0);
    local.team.slots = [6, null, null, null, null, null];
    local.meta.datasetVersionSeen = "v-local";
    const merged = mergeDocuments(local, {}, "replace");
    const empty = defaultDocs(0);
    expect(merged.team).toEqual(empty.team);
    expect(merged.captured).toEqual(empty.captured);
    expect(merged.history).toEqual(empty.history);
    expect(merged.trainerProgress).toEqual(empty.trainerProgress);
    expect(merged.meta.datasetVersionSeen).toBe("v-local");
  });
});
