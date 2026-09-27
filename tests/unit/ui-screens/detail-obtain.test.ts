// Auditoria S2 (SPEC 5.1.5, F5.1 passo 3): "Como obter" nao diz "sem rota" quando a especie nasce no mundo.
import { describe, expect, it } from "vitest";
import type { ObtainRoute } from "../../../src/data/types";
import { CORE_MESSAGES } from "../../../src/i18n/messages/core";
import { isWildOnly } from "../../../src/screens/Detail/WherePanel";

describe("ObtainPanel wildOnly (audit S2)", () => {
  const none: ObtainRoute[] = [{ kind: "none" }];

  it("Magby (dex 240): obtain only none + 3 spawns -> points to Where to find", () => {
    expect(isWildOnly(none, 3)).toBe(true);
  });

  it("only none without spawns keeps the 'no confirmed route' text", () => {
    expect(isWildOnly(none, 0)).toBe(false);
  });

  it("any real route disables wildOnly", () => {
    const breeding: ObtainRoute[] = [{ kind: "breeding", eggGroups: ["monster"] }];
    expect(isWildOnly(breeding, 5)).toBe(false);
  });

  it("copy in PT and EN", () => {
    expect(CORE_MESSAGES["obtain.wildOnly"]).toEqual({
      pt: "Nasce no mundo: veja Onde encontrar",
      en: "Spawns in the wild: see Where to find",
    });
  });
});
