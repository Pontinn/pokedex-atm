// Placeholder das telas ainda nao implementadas (F1.4). Cada tela troca SO o proprio arquivo
// src/screens/<Tela>/<Tela>Screen.tsx; este componente some quando nenhuma tela o usar mais.
import { EmptyState } from "../components/EmptyState";
import { useT } from "../i18n/useT";
import type { MessageKey } from "../i18n/messages";

export function ScreenPlaceholder({ titleKey, screen }: { titleKey: MessageKey; screen: string }) {
  const t = useT();
  return (
    <section className="screen-placeholder" data-placeholder={screen}>
      <h1 className="screen-placeholder-title">{t(titleKey)}</h1>
      <EmptyState />
    </section>
  );
}
