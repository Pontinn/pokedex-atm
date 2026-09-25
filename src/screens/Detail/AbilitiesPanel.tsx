// Habilidades (F4.2; porta abilitiesHTML app.js:851-856, style.css:568-572): nome no idioma dos termos do card +
// <small> no outro idioma + tag "Oculta" + descricao no idioma da interface. Id ausente em abilities.json -> id
// humanizado e console.warn (o build deveria ter falhado).
import { memo, useEffect, useState, type CSSProperties } from "react";
import { InlineError } from "../../components/InlineError";
import { Skeleton } from "../../components/Skeleton";
import { TermsToggle } from "../../components/TermsToggle";
import type { AbilitiesFile, AbilityRef } from "../../data/types";
import { loadAbilities } from "../../data/loaders";
import { useT } from "../../i18n/useT";
import { usePreferencesStore, useTermsLanguage } from "../../state/preferences-store";

export function humanizeId(id: string): string {
  return id
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** abilities.json carregado uma vez (cache do loader). */
export function useAbilities(): { data: AbilitiesFile | null; error: boolean; retry(): void } {
  const [state, setState] = useState<{ data: AbilitiesFile | null; error: boolean; attempt: number }>({ data: null, error: false, attempt: 0 });
  useEffect(() => {
    let alive = true;
    loadAbilities().then(
      (data) => alive && setState((s) => ({ ...s, data, error: false })),
      (err: unknown) => {
        console.warn("[detail] loadAbilities failed", err);
        if (alive) setState((s) => ({ ...s, error: true }));
      },
    );
    return () => {
      alive = false;
    };
  }, [state.attempt]);
  return { data: state.data, error: state.error, retry: () => setState((s) => ({ ...s, error: false, attempt: s.attempt + 1 })) };
}

const AbilityList = memo(function AbilityList({ abilities }: { abilities: readonly AbilityRef[] }) {
  const t = useT();
  const termsLang = useTermsLanguage("abilities");
  const uiLang = usePreferencesStore((s) => s.uiLanguage);
  const { data, error, retry } = useAbilities();
  if (error) return <InlineError onRetry={retry} />;
  if (!data) return <Skeleton height={64} />;
  const other = termsLang === "pt" ? "en" : "pt";
  return (
    <div className="abilities">
      {abilities.map((ref) => {
        const info = data[ref.id];
        if (!info) console.warn(`[detail] ability "${ref.id}" missing in abilities.json`);
        const main = info ? info.name[termsLang] || info.name.en : humanizeId(ref.id);
        const alt = info ? info.name[other] : "";
        return (
          <div className="ability" key={`${ref.id}-${ref.hidden ? "h" : "n"}`} data-ability={ref.id}>
            <div className="ab-name">
              <span>{main}</span>
              {ref.hidden ? <span className="tag">{t("detail.hidden")}</span> : null}
              {alt && alt !== main ? <small className="ab-en">{alt}</small> : null}
            </div>
            {info ? <div className="ab-desc">{info.description[uiLang] || info.description.en}</div> : null}
          </div>
        );
      })}
    </div>
  );
});

export const AbilitiesPanel = memo(function AbilitiesPanel({ abilities }: { abilities: readonly AbilityRef[] }) {
  const t = useT();
  return (
    <div className="panel abilities-panel" id="abilities-panel" style={{ "--i": 4 } as CSSProperties}>
      <div className="panel-head">
        <h3>{t("detail.abilities")}</h3>
        <TermsToggle cardKey="abilities" />
      </div>
      <AbilityList abilities={abilities} />
    </div>
  );
});
