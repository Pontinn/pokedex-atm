// T1: casos de borda de tests/unit/sync/sync.test.ts (multi-frame, SPEC 5.4.2): sessionId invalido, capacidade
// insuficiente, status() apos um codigo unico (sem frame), e variantes invalidas do cabecalho PDXF.
import { describe, expect, it } from "vitest";
import { FrameCollector, splitFrames } from "../../../src/sync/frames";

describe("splitFrames erros", () => {
  it("sessionId fora do padrao [0-9a-z]{6} lanca RangeError", () => {
    expect(() => splitFrames("x".repeat(2000), 900, "AAAAAA")).toThrow(RangeError);
    expect(() => splitFrames("x".repeat(2000), 900, "abc")).toThrow(/invalid sessionId/);
  });

  it("capacidade insuficiente para o cabecalho lanca RangeError", () => {
    expect(() => splitFrames("x".repeat(50), 5, "abcdef")).toThrow(/capacity too small/);
  });
});

describe("FrameCollector.status() e frames invalidos", () => {
  it("apos um codigo unico (sem PDXF.), status() reporta complete via o campo whole", () => {
    const collector = new FrameCollector();
    collector.add("PDX1.abcXYZ");
    expect(collector.status()).toEqual({ complete: true, received: 1, total: 1, sessionId: null });
  });

  it("frame sem nenhum ponto apos o prefixo -> invalidFrame", () => {
    const collector = new FrameCollector();
    expect(collector.add("PDXF.semponto").error).toBe("invalidFrame");
  });

  it("frame sem o segundo ponto (falta session/chunk) -> invalidFrame", () => {
    const collector = new FrameCollector();
    expect(collector.add("PDXF.1/2.semsegundoponto").error).toBe("invalidFrame");
  });

  it("total 0 ou index 0 (fora de 1-based) -> invalidFrame", () => {
    const collector = new FrameCollector();
    expect(collector.add("PDXF.1/0.abcdef.AAA").error).toBe("invalidFrame");
    expect(collector.add("PDXF.0/5.abcdef.AAA").error).toBe("invalidFrame");
    expect(collector.add("PDXF.6/5.abcdef.AAA").error).toBe("invalidFrame");
  });

  it("chunk vazio -> invalidFrame", () => {
    const collector = new FrameCollector();
    expect(collector.add("PDXF.1/2.abcdef.").error).toBe("invalidFrame");
  });
});
