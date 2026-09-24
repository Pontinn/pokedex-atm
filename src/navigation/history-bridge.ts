// Ponte com o historico do navegador (F1.3; prototipo app.js:1242-1250): popstate (botao fisico do Android,
// gesto, botao Voltar do navegador) e Alt+Seta esquerda chamam goBack(true). O Voltar do proprio app chama
// history.back() e marca o popstate resultante para ser ignorado.
import { consumeIgnoredPop, useNavigationStore } from "./navigation-store";

export function installHistoryBridge(target: Window = window): () => void {
  try {
    target.history.replaceState({ pontindex: useNavigationStore.getState().current.id }, "");
  } catch {
    // history indisponivel: a pilha interna continua funcionando
  }

  const onPopState = () => {
    if (consumeIgnoredPop()) return;
    useNavigationStore.getState().goBack(true);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "ArrowLeft" || !event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    // Evita a navegacao nativa do navegador e passa pelo mesmo caminho do popstate (sem voltar duas vezes)
    event.preventDefault();
    try {
      target.history.back();
    } catch {
      useNavigationStore.getState().goBack(true);
    }
  };

  target.addEventListener("popstate", onPopState);
  target.addEventListener("keydown", onKeyDown);
  return () => {
    target.removeEventListener("popstate", onPopState);
    target.removeEventListener("keydown", onKeyDown);
  };
}
