// Card de Pokemon da grade (F3.1; porta pcard() de design/prototipo/app.js:685-694, style.css:406-423).
// Cores por tipo via .g-<tipo1> (--g1/--g2/--tc, RF-117); selos em linha propria acima do nome (RF-121, regra
// "Sem sobreposicao de texto"); marca de capturado dentro da area da imagem (nunca por cima dos selos).
// Reutilizado pelos Capturados (F6.2) com `footer` (data de captura e botao desmarcar).
import { memo, type CSSProperties, type ReactNode } from "react";
import pokeballUrl from "../../assets/pokeball.webp";
import { Badge } from "../../components/Badge";
import { Sparkle, Star } from "../../components/Icon";
import { TypeChip } from "../../components/TypeChip";
import type { RarityBucket, SpeciesSummary } from "../../data/types";
import { gameName, useT } from "../../i18n/useT";
import { useIsCaptured } from "../../state/captured-store";
import { usePreferencesStore } from "../../state/preferences-store";
import { formatDex, SpeciesSprite } from "../Home/SpeciesSprite";

/** Classe do badge por bucket de spawn (RF-27). */
export const RARITY_BADGE: Record<RarityBucket, { cls: string; key: string }> = {
  common: { cls: "badge-common", key: "rarity.common" },
  uncommon: { cls: "badge-uncommon", key: "rarity.uncommon" },
  rare: { cls: "badge-rare", key: "rarity.rare" },
  "ultra-rare": { cls: "badge-ultra", key: "rarity.ultra" },
};

/** "legendary" prevalece sobre "mythical" (SPEC F4.1, ASSUMPTION). */
export function specialLabel(labels: readonly string[]): "legendary" | "mythical" | null {
  if (labels.includes("legendary")) return "legendary";
  if (labels.includes("mythical")) return "mythical";
  return null;
}

/** Selo Lendario/Mitico + badge de raridade (omitido se primary == null, RF-10). */
export function SpeciesBadges({ species }: { species: Pick<SpeciesSummary, "labels" | "rarity"> }) {
  const t = useT();
  const special = specialLabel(species.labels);
  const rarity = species.rarity.primary ? RARITY_BADGE[species.rarity.primary] : null;
  return (
    <>
      {special ? (
        <Badge className={`badge-${special}`}>
          {special === "legendary" ? <Star /> : <Sparkle />}
          {t(`rarity.${special}`)}
        </Badge>
      ) : null}
      {rarity ? <Badge className={rarity.cls}>{t(rarity.key)}</Badge> : null}
    </>
  );
}

export interface PokemonCardProps {
  species: SpeciesSummary;
  /** posicao no lote que entra (delay do cardIn, limitado pelo chamador) */
  enterIndex?: number;
  onOpen(dex: number): void;
  /** conteudo extra no rodape (Capturados: data e desmarcar) */
  footer?: ReactNode;
}

export const PokemonCard = memo(function PokemonCard({ species, enterIndex = 0, onOpen, footer }: PokemonCardProps) {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const caught = useIsCaptured(species.dex);
  const special = specialLabel(species.labels);
  const type1 = species.types[0];
  const style = { "--i": enterIndex } as CSSProperties;
  const name = gameName(species, lang);
  return (
    <div className="pcard-cell" style={style}>
      <button
        type="button"
        className={`pcard g-${type1}${special ? ` rar-${special}` : ""}`}
        data-dex={species.dex}
        data-nav=""
        aria-label={`${formatDex(species.dex)} ${name}`}
        onClick={() => onOpen(species.dex)}
      >
        <span className="pcard-top">
          <span className="dex-num">{formatDex(species.dex)}</span>
          <span className="pcard-badges">
            <SpeciesBadges species={species} />
          </span>
        </span>
        <span className="pcard-art">
          <SpeciesSprite species={species} />
          {caught ? <img className="caught-mark" src={pokeballUrl} alt={t("detail.caughtDone")} title={t("detail.caughtDone")} /> : null}
        </span>
        <span className="pcard-name">{name}</span>
        <span className="pcard-types">
          {species.types.map((type) => (
            <TypeChip key={type} type={type} lang={lang} size="sm" />
          ))}
        </span>
      </button>
      {footer ? <div className="pcard-foot">{footer}</div> : null}
    </div>
  );
});
