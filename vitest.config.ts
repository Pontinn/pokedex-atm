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
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", "tests/e2e/**", "tests/harness/**"],
    coverage: {
      provider: "v8",
      include: ["src/**", "tools/dataset/src/**"],
      thresholds: {
        lines: 80,
        branches: 80,
        "src/domain/**": { lines: 95, branches: 95 },
        "src/storage/**": { lines: 90, branches: 90 },
        "src/sync/**": { lines: 90, branches: 90 },
        "tools/dataset/src/**": { lines: 80, branches: 80 },
        "src/components/**": { lines: 70, branches: 70 },
        "src/screens/**": { lines: 70, branches: 70 },
      },
    },
  },
});
