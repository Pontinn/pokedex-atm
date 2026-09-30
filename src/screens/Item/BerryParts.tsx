// Partes de baga da pagina do item (berry-mutations F1.3..F1.5): "Encontrada no mundo" e "Cresce melhor em" no lugar do
// "Plantavel" das bagas, dentro de .item-obtain (depois das rotas existentes).
import { Sprout, Trees } from "lucide-react";
import type { BiomeLabels, ItemInfo } from "../../data/types";
import { useT } from "../../i18n/useT";
import type { UiLanguage } from "../../storage/types";
import { biomeLabel } from "../Trainers/trainer-model";
import { LabelChips, Row } from "./ItemScreen";
import { berryWorldBiomes, type BerryObtainExtra } from "./item-page-model";

export function BerryObtainRow({ kind, item, index, biomes, uiLang }: { kind: BerryObtainExtra; item: ItemInfo; index: number; biomes: BiomeLabels | null; uiLang: UiLanguage }) {
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
    default:
      return null;
  }
}
