// Partes de isca da pagina do item (spawn-bait F2.1/F2.2): painel "Efeitos de isca" com o texto do proprio jogo e a
// linha de tempero da Panela de Fogueira. Sem lista de Pokemon (RF-26).
import { CookingPot, Fish } from "lucide-react";
import { Sparkles } from "../../components/Icon";
import type { ItemBait, ItemInfo, PotRecipe } from "../../data/types";
import { useT } from "../../i18n/useT";
import type { UiLanguage } from "../../storage/types";
import { ItemLink, humanItemId } from "../Detail/ItemLink";
import { Row } from "./ItemScreen";
import { ingredientTagLabel } from "./item-page-model";

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

const BAIT_SEASONING_TAG = "cobblemon:recipe_filters/bait_seasoning";

/**
 * Ingredientes das receitas de isca da Panela de Fogueira (spawn-bait F2.2): item com pagina vira ItemLink, item
 * fora do catalogo e texto simples com o nome do jogo, tag com rotulo humano; depois a nota dos temperos (RF-32).
 */
export function PotRecipeList({ recipes, items, lang }: { recipes: readonly PotRecipe[]; items: Record<string, ItemInfo>; lang: UiLanguage }) {
  const t = useT();
  return (
    <>
      {recipes.map((r) => (
        <div className="pot-recipe" key={r.recipeId} data-pot-recipe={r.recipeId}>
          <span className="pot-label">{t("ip.pot.ingredients")}</span>
          {r.ingredients.map((ing) => (
            <span className="pot-ing" key={`${ing.kind}-${ing.id}`} data-ingredient={ing.id}>
              <b>{t("ip.pot.count", { n: ing.count })}</b>
              {ing.kind === "tag" ? (
                <span className="pot-text pot-tag">{ingredientTagLabel(ing.id, t)}</span>
              ) : items[ing.id] ? (
                <ItemLink id={ing.id} items={items} lang={lang} className="pot-item it-link" size={18} />
              ) : (
                <span className="pot-text">{ing.name ? ing.name[lang] || ing.name.en : humanItemId(ing.id)}</span>
              )}
            </span>
          ))}
          {r.seasoningTag === BAIT_SEASONING_TAG ? <span className="pot-seasoning">{t("ip.pot.seasoning")}</span> : null}
        </div>
      ))}
    </>
  );
}
