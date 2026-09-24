import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/fonts";
import "./styles/tokens.css";
import "./styles/types.generated.css";
import "./styles/themes.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/shell.css";
import "./styles/mobile.css";
import { App } from "./App";
import { bootApp } from "./boot";

// Preferencias hidratadas antes de createRoot (F1.4 passo 5): data-theme, lang e reduce-motion ja no <html>.
void bootApp().finally(() => {
  const rootElement = document.getElementById("root");
  if (!rootElement) return;
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
