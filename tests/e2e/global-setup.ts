// Aquecimento do dev server (so com PW_DEV=1): o Vite transforma cada modulo no 1o acesso, e com a maquina
// ocupada o 1o page.goto passava de 30 s. Carrega a pagina uma vez (timeout largo) antes dos testes.
// Nao e espera fixa: termina assim que o evento "load" chega.
import { chromium, type FullConfig } from "@playwright/test";

export default async function globalSetup(config: FullConfig): Promise<void> {
  if (process.env.PW_DEV !== "1") return;
  const baseURL = config.projects[0]?.use.baseURL;
  if (!baseURL) return;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(baseURL, { waitUntil: "load", timeout: 180_000 });
  } finally {
    await browser.close();
  }
}
