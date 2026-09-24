import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/fonts";

// Placeholder da Onda 0: substituido pelo shell real em F1.
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <h1 style={{ fontFamily: "Fredoka, system-ui, sans-serif" }}>{"Pontindex"}</h1>
    </StrictMode>,
  );
}
