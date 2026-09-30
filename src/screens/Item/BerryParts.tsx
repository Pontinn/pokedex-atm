// Partes de baga da pagina do item (berry-mutations F1.3..F1.5): "Encontrada no mundo" e "Cresce melhor em" no lugar do
// "Plantavel" das bagas, dentro de .item-obtain (depois das rotas existentes).
import { Dna, Sprout, Trees } from "lucide-react";
import type { BiomeLabels, ItemInfo } from "../../data/types";
import { useT } from "../../i18n/useT";
import type { UiLanguage } from "../../storage/types";
import { ItemLink } from "../Detail/ItemLink";
import { biomeLabel } from "../Trainers/trainer-model";
import { LabelChips, Row } from "./ItemScreen";
import { SURPRISE_MULCH_ID, berryWorldBiomes, groupMutationPairs, type BerryObtainExtra } from "./item-page-model";

export function BerryObtainRow({
  kind,
  item,
  index,
  biomes,
  uiLang,
  items,
  lang,
}: {
  kind: BerryObtainExtra;
  item: ItemInfo;
  index: number;
  biomes: BiomeLabels | null;
  uiLang: UiLanguage;
  items: Record<string, ItemInfo>;
  lang: UiLanguage;
}) {
  const t = useT();
  switch (kind) {
    case "berryWorld": {
      const w = berryWorldBiomes(item.berry!.spawn);
      return (
        <Row icon={<Trees />} title={t("ip.berryWorld")} index={index} kind="berryWorld">
          {w.any ? (
            <span>{t("ip.berryWorldAny")}</span>
          ) : (
            <>
              <span>{t("ip.berryWorldText")}</span>
              <LabelChips labels={[...new Set(w.biomeTags.map((b) => biomeLabel(b, biomes)[uiLang]))]} />
            </>
          )}
        </Row>
      );
    }
    case "berryGrowth": {
      const p = item.obtain.find((r) => r.kind === "plantable");
      const tags = p?.kind === "plantable" ? p.biomeTags : [];
      return (
        <Row icon={<Sprout />} title={t("ip.berryGrowth")} index={index} kind="berryGrowth">
          <span>{t("ip.berryGrowthText")}</span>
          <LabelChips labels={[...new Set(tags.map((b) => biomeLabel(b, biomes)[uiLang]))]} />
        </Row>
      );
    }
    case "plantable":
      return (
        <Row icon={<Sprout />} title={t("ip.plant")} index={index} kind="plantable">
          <span>{t("ip.plantAny")}</span>
        </Row>
      );
    case "mutation":
      return (
        <Row icon={<Dna />} title={t("ip.mut.title")} index={index} kind="mutation">
          {groupMutationPairs(item.berry!.mutationPairs).map((g) => (
            <span key={g.fixed} className="mut-pair" data-mut-fixed={g.fixed}>
              <ItemLink id={g.fixed} items={items} lang={lang} className="mut-berry it-link" />
              <span className="mut-op">{t("ip.mut.plus")}</span>
              {g.partners.length > 1 ? <span className="mut-hint">{t("ip.mut.oneOf")}</span> : null}
              {g.partners.map((p) => (
                <ItemLink key={p} id={p} items={items} lang={lang} className="mut-berry it-link" />
              ))}
            </span>
          ))}
          <span className="mut-chance" data-mut-chance="">
            <b>{t("ip.mut.chance")}</b>{" "}
            <b>{t("ip.mut.chanceMulch")}</b>{" "}
            <ItemLink id={SURPRISE_MULCH_ID} items={items} lang={lang} className="mut-berry it-link" />
          </span>
          <span className="mut-how">{t("ip.mut.how")}</span>
        </Row>
      );
    default:
      return null;
  }
}
