import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Unit/componente (Vitest). Padrao jsdom; build/dataset rodam em node (fs, fflate, Buffer).
// Metas de cobertura da T1 (SPEC Sprint T1), aplicadas com `vitest --run --coverage`.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@dataset-types": fileURLToPath(new URL("./src/data/types.ts", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify("test"),
  },
  test: {
    environment: "jsdom",
    environmentMatchGlobs: [["tests/unit/{build,dataset}/**", "node"]],
    setupFiles: ["tests/setup.ts"],
    // O teste de paridade real do dataset (tests/unit/dataset/join.test.ts, B2.5) valida ~1027 fichas contra o
    // snapshot real; sob a instrumentacao de --coverage o passo passa de 5s neste PC (T1a, 2026-09-25). O
    // padrao do Vitest (5000ms) e curto so nesse caso; os demais arquivos terminam bem abaixo disso.
    testTimeout: 20000,
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", "tests/e2e/**", "tests/harness/**"],
    coverage: {
      provider: "v8",
      include: ["src/**", "tools/dataset/src/**"],
      thresholds: {
        // Historico: a T1a (2026-09-25) baixou as linhas globais de 80% para 69% porque as telas (src/screens/**)
        // so eram cobertas pelo e2e. Na sessao de 2026-09-27 (testes RTL das telas: Detail, Trainers, Dex, Settings,
        // Sync, Item, Compare, Items em tests/unit/ui-screens/*-screen.test.tsx) o global foi a 92.40% de linhas e a meta
        // da SPEC (80%) foi restaurada. Ver HANDOFF_tests.md, secoes T1a e "2026-09-27 Cobertura das telas (RTL)".
        lines: 80,
        branches: 80,
        "src/domain/**": { lines: 95, branches: 95 },
        "src/storage/**": { lines: 90, branches: 90 },
        "src/sync/**": { lines: 90, branches: 90 },
        "tools/dataset/src/**": { lines: 80, branches: 80 },
        "src/components/**": { lines: 70, branches: 70 },
        // Historico: linhas reduzidas para 34% na T1a (34.98%, telas so no e2e); restauradas para a meta da SPEC (70%)
        // em 2026-09-27, com os testes RTL das telas (linhas 90.74%, branches 85.70%).
        "src/screens/**": { lines: 70, branches: 70 },
      },
    },
  },
});
