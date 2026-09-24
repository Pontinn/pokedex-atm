import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Placeholder da Onda 0: substituido pelo shell real em F1.
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <h1>{"Pontindex"}</h1>
    </StrictMode>,
  );
}
