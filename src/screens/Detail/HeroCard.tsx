// Card hero da ficha (F4.1; porta app.js:940-956 e style.css:449-487). Gradiente por tipo (.g-<tipo1>) ou especial
// (.hero-legendary / .hero-mythical com sheen + 8 faiscas, RF-118); raios ::before de 240% (RNF-12).
// Correcao da regra "Sem sobreposicao de texto" (feedback/1.png): a linha de selos fica EM FLUXO acima do titulo e
// reserva a largura dos botoes shiny/grito a direita (padding-right), quebrando em mais linhas quando precisa.
import { memo, useCallback, useState, type CSSProperties } from "react";
import pokeballUrl from "../../assets/pokeball.webp";
import { playCry } from "../../audio/cries";
import { playSfx } from "../../audio/sfx";
import { Check, Plus, Sparkles, Volume2 } from "../../components/Icon";
import { Modal } from "../../components/Modal";
import { TypeChip } from "../../components/TypeChip";
import type { SpeciesDetail } from "../../data/types";
import { gameName, useT } from "../../i18n/useT";
import { useNavigationActions, useScreenUi } from "../../navigation/useNavigation";
import { useCapturedHydrated, useCapturedStore, useIsCaptured } from "../../state/captured-store";
import { usePreferencesStore } from "../../state/preferences-store";
import { useIsInTeam, useTeamHydrated, useTeamStore } from "../../state/team-store";
import { SpeciesBadges, specialLabel } from "../Dex/PokemonCard";
import { formatDex } from "../Home/SpeciesSprite";
import { ArtworkImage } from "./ArtworkImage";

const SPARKLES: readonly [number, number][] = [
  [12, 18],
  [30, 70],
  [52, 12],
  [70, 40],
  [86, 22],
  [80, 78],
  [20, 46],
  [60, 84],
];

/** Hook do botao "Capturei" (F4.1; F6.1 troca o clique por abrir a animacao de captura). */
export type CaptureStarter = (detail: SpeciesDetail) => void;

function markCaptured(detail: SpeciesDetail) {
  void useCapturedStore.getState().mark(detail.dex);
}

const CaptureButtons = memo(function CaptureButtons({ detail, onCapture = markCaptured }: { detail: SpeciesDetail; onCapture?: CaptureStarter }) {
  const t = useT();
  useCapturedHydrated();
  useTeamHydrated();
  const caught = useIsCaptured(detail.dex);
  const inTeam = useIsInTeam(detail.dex);
  const [confirm, setConfirm] = useState(false);
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const name = gameName(detail, lang);
  return (
    <div className="hero-actions-2">
      <button
        type="button"
        id="btn-caught"
        className={`btn btn-accent${caught ? " done" : ""}`}
        aria-pressed={caught}
        onClick={() => (caught ? setConfirm(true) : onCapture(detail))}
      >
        <img className="ball-ico" src={pokeballUrl} alt="" />
        <span>{caught ? t("detail.caughtDone") : t("detail.caught")}</span>
      </button>
      <button
        type="button"
        id="btn-team"
        className={`btn btn-ghost${inTeam ? " done" : ""}`}
        aria-pressed={inTeam}
        onClick={() => {
          const store = useTeamStore.getState();
          void (inTeam ? store.removeFromTeam(detail.dex) : store.addToTeam(detail.dex));
        }}
      >
        {inTeam ? <Check /> : <Plus />}
        <span>{inTeam ? t("detail.inTeam") : t("detail.addTeam")}</span>
      </button>
      <Modal open={confirm} onClose={() => setConfirm(false)} title={t("detail.unmarkTitle")}>
        <p className="modal-text">{t("detail.unmarkBody", { name })}</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setConfirm(false)}>
            {t("detail.cancel")}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            id="btn-unmark-confirm"
            onClick={() => {
              setConfirm(false);
              void useCapturedStore.getState().unmark(detail.dex);
            }}
          >
            {t("detail.unmark")}
          </button>
        </div>
      </Modal>
    </div>
  );
});

function ShinyButton() {
  const t = useT();
  const shiny = useScreenUi("detail", "shiny");
  const { updateUi } = useNavigationActions();
  return (
    <button
      type="button"
      className={`shiny-btn${shiny ? " on" : ""}`}
      id="shiny-btn"
      title={t("detail.shiny")}
      aria-label={t("detail.shiny")}
      aria-pressed={shiny}
      onClick={() => {
        if (!shiny) playSfx("shiny");
        updateUi<"detail">({ shiny: !shiny });
      }}
    >
      <Sparkles />
    </button>
  );
}

function CryButton({ cry }: { cry: string }) {
  const t = useT();
  const [playing, setPlaying] = useState(false);
  const play = useCallback(() => {
    const el = playCry(cry);
    setPlaying(true);
    const stop = () => setPlaying(false);
    el.addEventListener("ended", stop, { once: true });
    el.addEventListener("error", stop, { once: true });
    el.addEventListener("pause", stop, { once: true });
  }, [cry]);
  return (
    <button
      type="button"
      className={`shiny-btn cry-btn${playing ? " playing" : ""}`}
      id="cry-btn"
      data-silent=""
      title={t("detail.cry")}
      aria-label={t("detail.cry")}
      onClick={play}
    >
      <Volume2 />
    </button>
  );
}

function HeroArtwork({ detail }: { detail: SpeciesDetail }) {
  const shiny = useScreenUi("detail", "shiny");
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const [swapKey, setSwapKey] = useState(0);
  const [prev, setPrev] = useState(shiny);
  if (prev !== shiny) {
    setPrev(shiny);
    setSwapKey((k) => k + 1);
  }
  return (
    <div className={`hero-img${swapKey > 0 ? " swap" : ""}`} key={swapKey}>
      <ArtworkImage artworkId={detail.artworkId} shiny={shiny} size={260} alt={gameName(detail, lang)} />
    </div>
  );
}

export const HeroCard = memo(function HeroCard({ detail, onCapture }: { detail: SpeciesDetail; onCapture?: CaptureStarter }) {
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const special = specialLabel(detail.labels);
  const type1 = detail.types[0];
  const hasCry = detail.cry !== null;
  const hasSeal = special !== null || detail.rarity.primary !== null;
  return (
    <div className={`card hero-card g-${type1}${special ? ` hero-${special}` : ""}`} data-dex={detail.dex}>
      <div className={`hero-art${hasCry ? " has-cry" : ""}`}>
        {special ? (
          <>
            <div className="sheen" />
            <div className="sparkles">
              {SPARKLES.map(([x, y], i) => (
                <i key={i} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i * 0.37).toFixed(2)}s` } as CSSProperties} />
              ))}
            </div>
          </>
        ) : null}
        <div className="hero-buttons">
          {hasCry ? <CryButton cry={detail.cry as string} /> : null}
          <ShinyButton />
        </div>
        <div className={`seal${hasSeal ? "" : " seal-empty"}`}>
          <SpeciesBadges species={detail} />
        </div>
        <div className="hero-title">
          <div className="dex-num">{formatDex(detail.dex)}</div>
          <h2>{gameName(detail, lang)}</h2>
        </div>
        <HeroArtwork detail={detail} />
      </div>
      <div className="hero-body">
        <div className="types">
          {detail.types.map((type) => (
            <TypeChip key={type} type={type} lang={lang} size="lg" />
          ))}
        </div>
        <CaptureButtons detail={detail} onCapture={onCapture} />
      </div>
    </div>
  );
});
