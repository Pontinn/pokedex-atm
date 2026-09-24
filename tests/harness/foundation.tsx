// Pagina de harness da Onda 1b (sem nenhuma tela real): monta tokens, chips, card, marca d'agua
// e a pilha de navegacao com telas ficticias rolaveis. Servida pelo dev server do Vite.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../src/styles/fonts";
import "../../src/styles/tokens.css";
import "../../src/styles/types.generated.css";
import "../../src/styles/themes.css";
import "../../src/styles/base.css";
import "../../src/styles/components.css";
import { applyTheme } from "../../src/styles/theme-meta";
import { THEME_IDS } from "../../src/styles/themes";
import { TypeChip } from "../../src/components/TypeChip";
import { Watermark } from "../../src/components/Watermark";
import { HarnessNavigation } from "./harness-navigation";

declare global {
  interface Window {
    __applyTheme: typeof applyTheme;
    __themeIds: readonly string[];
  }
}

window.__applyTheme = applyTheme;
window.__themeIds = THEME_IDS;

function Foundation() {
  return (
    <div className="app" style={{ display: "flex", height: "100vh" }}>
      <Watermark />
      <main id="main" className="main">
        <section className="card" data-testid="tokens-card">
          <div className="card-head">
            <h3>{"Tokens"}</h3>
            <span className="dex-num">{"#0006"}</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <TypeChip type="fire" lang="pt" />
            <TypeChip type="water" lang="en" size="sm" />
            <TypeChip type="electric" lang="pt" size="lg" selected />
          </div>
        </section>
        <HarnessNavigation />
      </main>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Foundation />
    </StrictMode>,
  );
}
