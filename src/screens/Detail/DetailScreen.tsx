// Tela da ficha (F4/F5). F4.1: hero (selos, shiny, grito, Capturei, time); F4.2: stats, fraquezas, habilidades. Recebe params.dex; carrega a ficha por
// useSpeciesDetail; ao ABRIR (nao ao restaurar via Voltar) registra a visita no historico (RF-33), toca o grito
// apos 350 ms com o som ligado (RF-91) e, se a especie evolui, `evolution_notification`.
import "./detail.css";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { playCry } from "../../audio/cries";
import { playSfx } from "../../audio/sfx";
import { EmptyState } from "../../components/EmptyState";
import { ArrowLeft } from "../../components/Icon";
import { InlineError } from "../../components/InlineError";
import type { ScreenProps } from "../../components/ScreenRouter";
import { Skeleton } from "../../components/Skeleton";
import type { SpeciesDetail } from "../../data/types";
import { useT } from "../../i18n/useT";
import { reapplyRestoredScroll, useNavigationStore } from "../../navigation/navigation-store";
import { useNavigationActions } from "../../navigation/useNavigation";
import { useHistoryStore } from "../../state/history-store";
import { usePreferencesStore } from "../../state/preferences-store";
import { AbilitiesPanel } from "./AbilitiesPanel";
import { EvolutionPanel } from "./EvolutionPanel";
import { HeroCard } from "./HeroCard";
import { MovesPanel } from "./MovesPanel";
import { WherePanel } from "./WherePanel";
import { StatsPanel } from "./StatsPanel";
import { useSpeciesDetail } from "./use-species-detail";
import { WeaknessPanel } from "./WeaknessPanel";

export const CRY_DELAY_MS = 350;

/** Efeitos de abertura: historico + grito + som de evolucao, uma vez por abertura nova. */
function useOpenEffects(dex: number, detail: SpeciesDetail | null) {
  // entrada restaurada pelo Voltar tem restoredScroll != null no momento da montagem
  const [restored] = useState(() => useNavigationStore.getState().restoredScroll !== null);
  const pushed = useRef(false);
  const played = useRef(false);

  useEffect(() => {
    if (restored || pushed.current || !Number.isInteger(dex) || dex <= 0) return;
    pushed.current = true;
    useHistoryStore
      .getState()
      .push(dex)
      .catch((err: unknown) => console.warn("[detail] history push failed", err));
  }, [dex, restored]);

  useEffect(() => {
    if (restored || played.current || !detail) return undefined;
    played.current = true;
    if (!usePreferencesStore.getState().soundEnabled) return undefined;
    if (detail.evolutionChain.edges.length > 0) playSfx("evolution_notification");
    if (!detail.cry) return undefined;
    const cry = detail.cry;
    const timer = setTimeout(() => playCry(cry), CRY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [detail, restored]);

  // a ficha carrega depois do 1o paint: reaplica o scroll salvo quando o conteudo existe
  useEffect(() => {
    if (restored && detail) reapplyRestoredScroll();
  }, [restored, detail]);
}

function BackButton() {
  const t = useT();
  const { goBack } = useNavigationActions();
  return (
    <button type="button" className="detail-back" data-nav="" onClick={() => goBack()}>
      <ArrowLeft />
      {t("detail.back")}
    </button>
  );
}

export function DetailScreen({ params }: ScreenProps) {
  const dex = Number((params as { dex?: number }).dex);
  const state = useSpeciesDetail(dex);
  useOpenEffects(dex, state.detail);

  if (state.status === "notFound") {
    return (
      <section className="detail-screen">
        <BackButton />
        <EmptyState messageKey="detail.notFound" />
      </section>
    );
  }
  if (state.status === "error") {
    return (
      <section className="detail-screen">
        <BackButton />
        <InlineError onRetry={state.retry} />
      </section>
    );
  }
  const detail = state.detail;
  return (
    <section className="detail-screen" data-dex={dex}>
      <BackButton />
      <div className="detail" style={detail ? ({ "--tc": `var(--t-${detail.types[0]})` } as CSSProperties) : undefined}>
        <div className="detail-left">
          {detail ? (
            <>
              <HeroCard detail={detail} />
              <StatsPanel stats={detail.baseStats} />
            </>
          ) : (
            <div className="hero-skeleton" aria-busy="true">
              <Skeleton height={420} />
            </div>
          )}
        </div>
        {detail ? (
          <div className="detail-right">
            <WeaknessPanel types={detail.types} />
            <EvolutionPanel chain={detail.evolutionChain} currentDex={detail.dex} />
            <AbilitiesPanel abilities={detail.abilities} />
            <MovesPanel moves={detail.moves} />
            <WherePanel detail={detail} />
          </div>
        ) : (
          <div className="detail-right" />
        )}
      </div>
    </section>
  );
}
