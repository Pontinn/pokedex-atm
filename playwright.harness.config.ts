import { defineConfig, devices } from "@playwright/test";

// Harness (Onda 1b): SOMENTE o dev server do Vite, que compila sob demanda os modulos da pagina de harness.
// Nada de preview nem tsc -b de todo o src/, para que codigo em andamento de outras ondas nao quebre o harness.
// Regra do projeto: headless sempre, sem slowMo, sem esperas artificiais.
export default defineConfig({
  testDir: "tests/harness",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], headless: true } }],
  webServer: {
    command: "npx vite --port 5173 --strictPort",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
