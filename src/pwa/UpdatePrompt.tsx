// Aviso "Nova versao disponivel: Atualizar" (F12.1). Aparece quando um SW novo fica em espera; "Atualizar" ativa o
// SW novo e recarrega; "X" esconde ate a proxima sessao (o SW novo assume sozinho quando todas as abas fecharem).
// Renderizado dentro do ToastHost, empilhado com os toasts (nunca sobreposto).
import { X } from "../components/Icon";
import { useT } from "../i18n/useT";
import { applyPwaUpdate, usePwaUpdateStore } from "./update-store";

export function useUpdatePromptVisible(): boolean {
  return usePwaUpdateStore((s) => s.waiting !== null && !s.dismissed);
}

export function UpdatePrompt() {
  const t = useT();
  const visible = useUpdatePromptVisible();
  const dismiss = usePwaUpdateStore((s) => s.dismiss);
  if (!visible) return null;
  return (
    <div className="toast toast-info pwa-update" role="status">
      <span className="toast-text">{t("pwa.updateAvailable")}</span>
      {/* data-silent: sem o som de clique. A pagina recarrega logo em seguida, e o fetch do click.ogg (1o clique
          da sessao) caia no SW antigo enquanto ele parava para o novo ativar: o SW antigo reiniciava e a ativacao
          nunca terminava (F1, provado: com o som desligado 6/6 recarregam, com som 4/6). */}
      <button type="button" className="toast-action" data-silent onClick={applyPwaUpdate}>
        {t("pwa.update")}
      </button>
      <button type="button" className="toast-close" aria-label={t("shell.close")} onClick={dismiss}>
        <X />
      </button>
    </div>
  );
}
