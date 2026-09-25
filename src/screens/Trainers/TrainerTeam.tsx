// Corpo expandido do treinador (F8.2 passo 3; porta trStepBodyHTML, app.js:1094-1104): time completo (sprite 96px,
// nome, Lv, tipos, habilidade, golpes, item segurado), item de spawn clicavel + explicacao, mochila com quantidade.
import { memo } from "react";
import { Box } from "../../components/Icon";
import { ItemTile } from "../../components/ItemTile";
import { InlineError } from "../../components/InlineError";
import { Skeleton } from "../../components/Skeleton";
import { TypeChip } from "../../components/TypeChip";
import type { AbilitiesFile, ItemsFile, MovesFile, SpeciesSummary, TrainerInfo } from "../../data/types";
import { loadAbilities, loadMoves } from "../../data/loaders";
import { gameName, useT } from "../../i18n/useT";
import { useNavigationActions } from "../../navigation/useNavigation";
import type { UiLanguage } from "../../storage/types";
import { SpeciesSprite } from "../Home/SpeciesSprite";
import { humanizeId, itemTexturePath } from "./trainer-model";
import { useLoader } from "./use-loader";

const loadTeamTerms = () => Promise.all([loadMoves(), loadAbilities()]);

export function ItemChip({ id, items, lang, quantity, className }: { id: string; items: ItemsFile | null; lang: UiLanguage; quantity?: number; className?: string }) {
  const { navigate } = useNavigationActions();
  const item = items?.[id];
  const name = item ? gameName(item, lang) : humanizeId(id);
  return (
    <button
      type="button"
      className={`biome biome-item it-link ${className ?? ""}`.trim()}
      data-nav
      data-item-open={id}
      onClick={() => navigate("item", { itemId: id })}
    >
      <ItemTile texture={itemTexturePath(item?.texture)} size={className?.includes("tr-spawn-chip") ? 36 : 24} />
      <span>
        {name}
        {quantity !== undefined ? ` x${quantity}` : ""}
      </span>
    </button>
  );
}

function TeamMon({
  mon,
  species,
  moves,
  abilities,
  items,
  lang,
}: {
  mon: TrainerInfo["team"][number];
  species: SpeciesSummary | undefined;
  moves: MovesFile;
  abilities: AbilitiesFile;
  items: ItemsFile | null;
  lang: UiLanguage;
}) {
  const t = useT();
  const name = species ? gameName(species, lang) : humanizeId(mon.species);
  const ability = mon.ability ? abilities[mon.ability] : undefined;
  return (
    <div className="tr-mon" data-species={mon.species}>
      <SpeciesSprite species={{ dex: mon.dex ?? 0, hasSprite: species?.hasSprite ?? false }} size={56} />
      <div className="tr-mon-info">
        <div className="tr-mon-name">
          {name}
          <span className="tr-lv">{`Lv. ${mon.level}`}</span>
        </div>
        {species ? (
          <div className="chips">
            {species.types.map((ty) => (
              <TypeChip key={ty} type={ty} lang={lang} size="sm" />
            ))}
          </div>
        ) : null}
        {mon.ability ? (
          <div className="tr-ab">
            <span className="muted">{`${t("tr.ability")}: `}</span>
            <b>{ability ? gameName(ability, lang) : humanizeId(mon.ability)}</b>
          </div>
        ) : null}
        {mon.moveset.length > 0 ? (
          <div className="tr-moves">
            {mon.moveset.map((mv) => (
              <span key={mv} className="mv-chip">
                {moves[mv] ? gameName(moves[mv], lang) : humanizeId(mv)}
              </span>
            ))}
          </div>
        ) : null}
        {mon.heldItem ? (
          <div className="tr-held">
            <span className="muted">{`${t("tr.heldItem")}:`}</span>
            <ItemChip id={mon.heldItem} items={items} lang={lang} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const TrainerTeam = memo(function TrainerTeam({
  trainer,
  speciesByDex,
  items,
  lang,
}: {
  trainer: TrainerInfo;
  speciesByDex: ReadonlyMap<number, SpeciesSummary>;
  items: ItemsFile | null;
  lang: UiLanguage;
}) {
  const t = useT();
  const terms = useLoader(trainer.team.length > 0 ? loadTeamTerms : null, [trainer.team.length > 0]);
  return (
    <div className="tr-body">
      <div className="tr-sec">{t("tr.team")}</div>
      {trainer.team.length === 0 ? (
        <p className="muted tr-team-none">{t("tr.teamUnknown")}</p>
      ) : terms.error ? (
        <InlineError onRetry={terms.retry} />
      ) : !terms.data ? (
        <div className="tr-team">
          {trainer.team.map((_m, i) => (
            <Skeleton key={i} height={96} />
          ))}
        </div>
      ) : (
        <div className="tr-team">
          {trainer.team.map((m, i) => (
            <TeamMon
              key={`${m.species}-${i}`}
              mon={m}
              species={m.dex === null ? undefined : speciesByDex.get(m.dex)}
              moves={terms.data![0]}
              abilities={terms.data![1]}
              items={items}
              lang={lang}
            />
          ))}
        </div>
      )}
      {trainer.signatureItem ? (
        <div className="tr-spawn">
          <span className="tr-sec">{t("tr.spawnItem")}</span>
          <div className="tr-spawn-row">
            <ItemChip id={trainer.signatureItem} items={items} lang={lang} className="tr-spawn-chip" />
            <div className="tr-spawn-how">
              <Box aria-hidden="true" />
              <span>{t("tr.spawnHow")}</span>
            </div>
          </div>
        </div>
      ) : null}
      {trainer.bag.length > 0 ? (
        <div className="tr-foot">
          <div>
            <span className="tr-sec">{t("tr.bag")}</span>
            <div className="chips">
              {trainer.bag.map((b) => (
                <ItemChip key={b.item} id={b.item} items={items} lang={lang} quantity={b.quantity} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
});
