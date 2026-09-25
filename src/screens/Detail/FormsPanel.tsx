// Formas (F5.2; porta formBodyHTML app.js:788-797, style.css:648-653): abas ["Normal", ...forms] em current.ui.formIndex;
// corpo com artwork da forma, tipos, "Requer:" itens clicaveis (+ addon de origem), habilidade e stats da forma (ou da
// base se null). Sem forms -> painel oculto. Mega sem item nos dados -> aviso, nunca inventar.
import { memo, type CSSProperties } from "react";
import { TermsToggle } from "../../components/TermsToggle";
import { TypeChip } from "../../components/TypeChip";
import type { SpeciesDetail } from "../../data/types";
import { useT } from "../../i18n/useT";
import { useNavigationActions, useScreenUi } from "../../navigation/useNavigation";
import { useTermsLanguage } from "../../state/preferences-store";
import { humanizeId, useAbilities } from "./AbilitiesPanel";
import { ArtworkImage } from "./ArtworkImage";
import { useItems } from "./EvolutionPanel";
import { ItemLink } from "./ItemLink";
import { StatBars } from "./StatsPanel";
import { addonText } from "./WherePanel";

function FormTabs({ names }: { names: readonly string[] }) {
  const t = useT();
  const index = useScreenUi("detail", "formIndex");
  const { updateUi } = useNavigationActions();
  return (
    <div className="tabs" id="form-tabs" role="tablist">
      {names.map((n, i) => (
        <button key={n + i} type="button" role="tab" aria-selected={i === index} className={i === index ? "active" : ""} data-ftab={i} onClick={() => updateUi<"detail">({ formIndex: i })}>
          {i === 0 ? t("form.normal") : n}
        </button>
      ))}
    </div>
  );
}

const FormBody = memo(function FormBody({ detail }: { detail: SpeciesDetail }) {
  const t = useT();
  const lang = useTermsLanguage("forms");
  const items = useItems();
  const { data: abilities } = useAbilities();
  const raw = useScreenUi("detail", "formIndex");
  const index = Math.min(Math.max(0, raw), detail.forms.length);
  const form = index > 0 ? detail.forms[index - 1] : undefined;
  const types = form?.types.length ? form.types : detail.types;
  const stats = form?.baseStats ?? detail.baseStats;
  const ability = (form?.abilities.length ? form.abilities : detail.abilities)[0];
  const abilityInfo = ability ? abilities?.[ability.id] : undefined;
  const other = lang === "pt" ? "en" : "pt";
  const artworkId = form ? form.artworkId : detail.artworkId;
  let req;
  if (!form) req = <span className="muted">{t("form.none")}</span>;
  else if (form.requiredItems.length === 0)
    req = <span className="muted">{t(/^mega/i.test(form.name) ? "form.unknownItem" : "form.noItem")}</span>;
  else
    req = (
      <>
        {form.requiredItems.map((id, i) => (
          <span key={id} className="ob-item">
            {i > 0 ? <span className="muted">{"+"}</span> : null}
            <ItemLink id={id} items={items} lang={lang} />
          </span>
        ))}
        {form.source !== "cobblemon" ? <span className="muted">{`(${addonText(form.source, t)})`}</span> : null}
      </>
    );
  return (
    <div className="forms part-in" id="form-body" key={index} data-form={form?.name ?? "normal"}>
      <ArtworkImage artworkId={artworkId} size={180} showNotice={false} className="form-art" />
      <div className="form-info">
        <div className="types">
          {types.map((type) => (
            <TypeChip key={type} type={type} lang={lang} />
          ))}
          {form?.battleOnly ? <span className="tag">{t("form.battleOnly")}</span> : null}
        </div>
        <div className="form-req">
          <span className="muted">{`${t("form.req")}:`}</span>
          {req}
        </div>
        {ability ? (
          <div className="form-ability">
            <span className="muted">{`${t("form.ability")}:`}</span> <strong>{abilityInfo ? abilityInfo.name[lang] || abilityInfo.name.en : humanizeId(ability.id)}</strong>
            {abilityInfo && abilityInfo.name[other] !== abilityInfo.name[lang] ? <span className="muted">{` (${abilityInfo.name[other]})`}</span> : null}
          </div>
        ) : null}
        <div className="show-bars">
          <StatBars stats={stats} />
        </div>
      </div>
    </div>
  );
});

export const FormsPanel = memo(function FormsPanel({ detail }: { detail: SpeciesDetail }) {
  const t = useT();
  if (detail.forms.length === 0) return null;
  return (
    <div className="panel forms-panel" id="forms-panel" style={{ "--i": 8 } as CSSProperties}>
      <div className="panel-head">
        <h3>{t("detail.forms")}</h3>
        <TermsToggle cardKey="forms" />
      </div>
      <FormTabs names={["normal", ...detail.forms.map((f) => f.name)]} />
      <FormBody detail={detail} />
    </div>
  );
});
