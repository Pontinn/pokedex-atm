// Melhor Pokebola (F5.3; porta bestBallHTML app.js:1176-1180, style.css:1086-1092): rankBalls (B6.4) -> top 3 com
// best-rank 1/2/3 (1o dourado), bola clicavel (pagina do item), nome no idioma do card, "x{best}" e, para condicionais,
// o texto da condicao ("3.5x com luz 0", RF-64). Ranking completo colapsavel abaixo do top 3; garantidas numa linha
// separada; bloco "Captura critica" pelo total de capturados conhecidos; "Ver todas" abre a tela de Pokebolas.
import { memo, useEffect, useMemo, useState, type CSSProperties } from "react";
import { Target } from "../../components/Icon";
import { ItemTile } from "../../components/ItemTile";
import { PokeballSpinner } from "../../components/PokeballSpinner";
import { TermsToggle } from "../../components/TermsToggle";
import { typeName } from "../../components/TypeChip";
import { loadBalls } from "../../data/loaders";
import type { BallInfo, ItemsFile, SpeciesDetail } from "../../data/types";
import { partitionBalls, type RankedBall } from "../../domain/ball-ranking";
import { hasMessage, useT, type TranslateFn } from "../../i18n/useT";
import { useNavigationActions } from "../../navigation/useNavigation";
import { useCapturedKnownCount, useIsCaptured } from "../../state/captured-store";
import { useTermsLanguage } from "../../state/preferences-store";
import type { UiLanguage } from "../../storage/types";
import { useItems } from "./EvolutionPanel";

export const BEST_BALL_TOP = 3;

/** "3.5x" / "0.1x" (ponto decimal como no jogo e na tela de Pokebolas). */
export function formatMultiplier(m: number): string {
  return `${Number(m.toFixed(2))}x`;
}

/** Bonus de captura critica pelo total de capturados (IDEA; texto informativo do prototipo app.js:1177). */
export function criticalBonus(caught: number): number {
  if (caught > 600) return 2.5;
  if (caught >= 451) return 2;
  if (caught >= 301) return 1.5;
  if (caught >= 151) return 1;
  if (caught >= 31) return 0.5;
  return 0;
}

/** Texto da linha de uma bola ranqueada: condicao externa, motivo intrinseco ou "sem condicao". */
export function bestBallReason(r: RankedBall, species: Pick<SpeciesDetail, "baseStats" | "weight">, t: TranslateFn, lang: UiLanguage): string {
  const rule = r.ball.rule;
  if (r.conditional && r.conditionKey) {
    const key = `detail.ballCond.${r.conditionKey}`;
    return hasMessage(key) ? `${formatMultiplier(r.multiplier)} ${t(key)}` : formatMultiplier(r.multiplier);
  }
  if (rule.kind !== "conditional") return t("detail.ballWhy.flat");
  switch (rule.condition) {
    case "hasAnyType":
      return t("detail.ballWhy.types", { types: (rule.applies?.types ?? []).map((ty) => typeName(ty, lang)).join(" / ") });
    case "minBaseSpeedAbove":
      return t("detail.ballWhy.speed", { v: species.baseStats.speed });
    case "registeredCaught":
      return t("detail.ballWhy.caught");
    case "heavyTarget":
      return t("detail.ballWhy.heavy", { kg: species.weight == null ? "?" : (species.weight / 10).toLocaleString(lang === "pt" ? "pt-BR" : "en-US") });
    case "ultraBeast":
      return t(r.multiplier === rule.bestMultiplier ? "detail.ballWhy.ultraBeast" : "detail.ballWhy.notUltraBeast");
    default:
      return t("detail.ballWhy.flat");
  }
}

function useBalls(): BallInfo[] | null {
  const [balls, setBalls] = useState<BallInfo[] | null>(null);
  useEffect(() => {
    let alive = true;
    loadBalls().then(
      (data) => alive && setBalls(data),
      (err: unknown) => console.warn("[detail] loadBalls failed", err),
    );
    return () => {
      alive = false;
    };
  }, []);
  return balls;
}

function ballName(ball: BallInfo, lang: UiLanguage): { main: string; other: string } {
  const other = lang === "pt" ? "en" : "pt";
  return { main: ball.name[lang] || ball.name.en, other: ball.name[other] || ball.name.en };
}

const BestBallRow = memo(function BestBallRow({
  row,
  rank,
  reason,
  lang,
  items,
}: {
  row: RankedBall;
  rank: number;
  reason: string;
  lang: UiLanguage;
  items: ItemsFile | null;
}) {
  const { navigate } = useNavigationActions();
  const name = ballName(row.ball, lang);
  return (
    <button
      type="button"
      className={`best-ball it-link${rank === 1 ? " best-first" : ""}`}
      style={{ "--i": Math.min(rank - 1, 8) } as CSSProperties}
      data-nav=""
      data-ball={row.ball.id}
      onClick={() => navigate("item", { itemId: row.ball.itemId })}
    >
      <span className="best-rank">{rank}</span>
      <ItemTile texture={items?.[row.ball.itemId]?.texture} size={44} />
      <span className="best-info">
        <span className="ball-name">
          <span className="ball-name-main">{name.main}</span>
          {name.other !== name.main ? <small>{name.other}</small> : null}
          <span className="ball-mult">{formatMultiplier(row.multiplier)}</span>
        </span>
        <span className="ball-eff">{reason}</span>
      </span>
    </button>
  );
});

export const BestBallPanel = memo(function BestBallPanel({ detail }: { detail: SpeciesDetail }) {
  const t = useT();
  const lang = useTermsLanguage("best");
  const balls = useBalls();
  const items = useItems();
  const captured = useIsCaptured(detail.dex);
  const caughtCount = useCapturedKnownCount();
  const { navigate } = useNavigationActions();
  const [all, setAll] = useState(false);
  const part = useMemo(() => (balls ? partitionBalls(detail, balls, { captured }) : null), [balls, detail, captured]);
  const shown = part ? (all ? part.ranked : part.ranked.slice(0, BEST_BALL_TOP)) : [];
  return (
    <div className="panel best-panel" id="best-panel" style={{ "--i": 7 } as CSSProperties}>
      <div className="panel-head">
        <h3>{t("ball.best")}</h3>
        <div className="ph-right">
          <span className="muted">{t("ball.bestHint")}</span>
          <TermsToggle cardKey="best" />
        </div>
      </div>
      {part ? (
        <>
          <div className="best-balls">
            {shown.map((row, i) => (
              <BestBallRow key={row.ball.id} row={row} rank={i + 1} reason={bestBallReason(row, detail, t, lang)} lang={lang} items={items} />
            ))}
          </div>
          {part.guaranteed.length > 0 ? (
            <div className="best-guaranteed">
              <b>{`${t("detail.ballGuaranteed")}:`}</b>{" "}
              {part.guaranteed.map((g) => ballName(g.ball, lang).main).join(", ")}
            </div>
          ) : null}
          <div className="best-crit">
            <Target aria-hidden="true" />
            <span>
              <b>{`${t("ball.critical")}:`}</b> {t("ball.criticalText", { n: caughtCount, b: criticalBonus(caughtCount) })}
            </span>
          </div>
          <div className="best-actions">
            {part.ranked.length > BEST_BALL_TOP ? (
              <button type="button" className="btn btn-ghost best-more" onClick={() => setAll((v) => !v)}>
                {all ? t("where.showLess") : t("detail.ballRankAll", { n: part.ranked.length })}
              </button>
            ) : null}
            <button type="button" className="btn btn-ghost best-all" data-nav="" onClick={() => navigate("balls", {})}>
              {t("detail.ballSeeAll")}
            </button>
          </div>
        </>
      ) : (
        <PokeballSpinner size="sm" />
      )}
    </div>
  );
});
