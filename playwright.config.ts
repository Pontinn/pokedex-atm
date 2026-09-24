import { defineConfig, devices } from "@playwright/test";

// App completo (Onda 3 em diante). Regra do projeto: headless sempre, sem slowMo, sem esperas artificiais
// (auto-waiting, expect.poll, toPass).
//
// Variaveis:
// - PW_PORT (padrao 4173): porta do servidor e do baseURL. Cada agente de tela usa a sua (A=4174, B=4175, C=4176).
// - PW_DEV=1: sobe o dev server do Vite (sem tsc -b, sem build completo), para rodar com codigo de outras
//   frentes ainda em andamento. Sem PW_DEV: build + preview (caminho do T1).
// Exemplo (PowerShell): $env:PW_DEV="1"; $env:PW_PORT="4174"; npx playwright test tests/e2e/home.spec.ts
const PORT = Number(process.env.PW_PORT ?? 4173);
const DEV = process.env.PW_DEV === "1";

export default defineConfig({
  testDir: "tests/e2e",
  // PW_DEV=1: aquece o dev server (1a transformacao dos modulos) antes dos testes
  globalSetup: "./tests/e2e/global-setup.ts",
  // saida separada por porta: agentes em paralelo nao apagam os resultados uns dos outros
  outputDir: `test-results/pw-${PORT}`,
  fullyParallel: true,
  // dev server compila sob demanda e divide a maquina com os outros agentes: 1 worker e tempo maior por teste
  workers: DEV ? 1 : undefined,
  timeout: DEV ? 90_000 : 30_000,
  expect: { timeout: DEV ? 20_000 : 5_000 },
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    headless: true,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], headless: true } }],
  webServer: {
    command: DEV
      ? `npx vite --port ${PORT} --strictPort`
      : `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
