// Partes de isca da pagina do item (spawn-bait F2.1/F2.2): painel "Efeitos de isca" com o texto do proprio jogo e a
// linha de tempero da Panela de Fogueira. Sem lista de Pokemon (RF-26).
import { CookingPot, Fish } from "lucide-react";
import { Sparkles } from "../../components/Icon";
import type { ItemBait } from "../../data/types";
import { useT } from "../../i18n/useT";
import type { UiLanguage } from "../../storage/types";
import { Row } from "./ItemScreen";

export function BaitEffectsPanel({ bait, lang }: { bait: ItemBait; lang: UiLanguage }) {
  const t = useT();
  return (
    <section className="panel item-bait" data-bait-effects="" style={{ ["--i" as string]: 2 }}>
      <h3>{t("ip.bait")}</h3>
      <div className="ob-list">
        {bait.effects.map((e, i) => (
          <Row
            key={`${e.kind}-${e.subcategory ?? ""}-${i}`}
            icon={e.kind === "shinyReroll" || e.kind === "rarityBucket" ? <Sparkles /> : <Fish />}
            title={t(`ip.bait.kind.${e.kind}`)}
            index={i}
            kind={`bait-${e.kind}`}
          >
            <span className="bait-effect-text">{e.text[lang] || e.text.en}</span>
          </Row>
        ))}
        <Row icon={<CookingPot />} title={t("ip.bait.seasoning")} index={bait.effects.length} kind="bait-seasoning">
          <span>{t(bait.seasoning ? "ip.bait.seasoningYes" : "ip.bait.seasoningNo")}</span>
        </Row>
      </div>
    </section>
  );
}
