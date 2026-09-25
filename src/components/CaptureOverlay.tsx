// Overlay de captura (F6.1; porta startCapture/finishCapture/closeCapture app.js:1262-1298, style.css:712-781, UISPEC 5).
// NAO e tela: vive fora da pilha, renderizado por portal no <body> pela ficha (desmontar a ficha, ex. popstate durante
// a captura, fecha o overlay e limpa os timers). Linha do tempo exata do prototipo (0 on, 450 s-bg, 1000 s-ball,
// 1700 s-shake, 2150/2600 shakes, 3200 s-open, 3550 s-grow, 5250 s-flash, 5450 s-final); fundo por labels
// (legendary -> bg-lendario, mythical -> bg-mitico, senao bg-outros), nunca por bucket. Toque pula para s-final;
// clique em s-final, botao Fechar ou Esc fecham (pokedex_close). finishCapture marca o capturado uma vez.
import "../styles/capture.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import pokeballUrl from "../assets/pokeball.webp";
import { playSfx } from "../audio/sfx";
import type { SfxName } from "../audio/sfx-names";
import { useT } from "../i18n/useT";
import { REDUCE_MOTION_CLASS } from "../state/motion";

export type CaptureStage = "on" | "s-bg" | "s-ball" | "s-shake" | "s-open" | "s-grow" | "s-flash" | "s-final";
export type CaptureBg = "bg-lendario" | "bg-mitico" | "bg-outros";

export interface TimelineStep {
  at: number;
  stage?: CaptureStage;
  sfx?: SfxName;
}

/** Linha do tempo do prototipo (ms desde o clique em Capturei). O passo de 5450 e o finishCapture. */
export const CAPTURE_TIMELINE: readonly TimelineStep[] = [
  { at: 450, stage: "s-bg" },
  { at: 1000, stage: "s-ball", sfx: "poke_ball_throw_1" },
  { at: 1700, stage: "s-shake", sfx: "poke_ball_shake_1" },
  { at: 2150, sfx: "poke_ball_shake_2" },
  { at: 2600, sfx: "poke_ball_shake_3" },
  { at: 3200, stage: "s-open", sfx: "poke_ball_open" },
  { at: 3550, stage: "s-grow" },
  { at: 5250, stage: "s-flash", sfx: "poke_ball_shake_critical" },
];
export const CAPTURE_FINAL_AT = 5450;
/** Com reduzir animacoes: vai direto ao s-final apos 300 ms [ASSUMPTION da SPEC F6.1]. */
export const REDUCED_FINAL_AT = 300;

export function captureBackground(labels: readonly string[]): CaptureBg {
  if (labels.includes("legendary")) return "bg-lendario";
  if (labels.includes("mythical")) return "bg-mitico";
  return "bg-outros";
}

/** Classes do .capture por estagio (o prototipo mantem s-bg a partir do 450). */
export function stageClass(stage: CaptureStage): string {
  if (stage === "on") return "capture on";
  if (stage === "s-bg") return "capture on s-bg";
  return `capture on s-bg ${stage}`;
}

function reducedMotion(): boolean {
  return typeof document !== "undefined" && document.documentElement.classList.contains(REDUCE_MOTION_CLASS);
}

/**
 * Sequencia de captura: `stage` atual, `skip()` (pula para s-final) e `close()` (fecha, som pokedex_close).
 * `onFinal` roda uma vez quando chega ao s-final (por tempo ou por pulo). Timers limpos ao desmontar.
 */
export function useCaptureSequence(onFinal: () => void, onClosed: () => void) {
  const [stage, setStage] = useState<CaptureStage>("on");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const finished = useRef(false);
  const closed = useRef(false);
  const onFinalRef = useRef(onFinal);
  const onClosedRef = useRef(onClosed);
  onFinalRef.current = onFinal;
  onClosedRef.current = onClosed;

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    clear();
    setStage("s-final");
    playSfx("poke_ball_capture_succeeded");
    onFinalRef.current();
  }, [clear]);

  const close = useCallback(() => {
    if (closed.current) return;
    closed.current = true;
    clear();
    playSfx("pokedex_close");
    onClosedRef.current();
  }, [clear]);

  useEffect(() => {
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    if (reducedMotion()) {
      at(REDUCED_FINAL_AT, finish);
    } else {
      for (const step of CAPTURE_TIMELINE) {
        at(step.at, () => {
          if (step.stage) setStage(step.stage);
          if (step.sfx) playSfx(step.sfx);
        });
      }
      at(CAPTURE_FINAL_AT, finish);
    }
    return clear;
  }, [clear, finish]);

  return { stage, skip: finish, close };
}

// ---------------------------------------------------------------------------------------------------------------
// Fundos vetoriais (CAP_SVG, app.js:1266-1275): relampagos (lendario) e faiscas (mitico)
// ---------------------------------------------------------------------------------------------------------------

type Bolt = [x: number, y: number, r: number, sc: number, fill: string, op: number, delay: number, dur: number];
const BOLTS: readonly Bolt[] = [
  [90, 90, -35, 1.3, "#fff", 0.95, 0.0, 3.1], [150, 40, -50, 0.9, "#5a2a00", 0.9, 0.53, 3.47], [880, 70, 40, 1.2, "#fff", 0.95, 1.06, 3.84],
  [940, 150, 25, 0.8, "#5a2a00", 0.9, 1.59, 4.21], [80, 520, -140, 1.1, "#fff", 0.95, 2.12, 4.58], [170, 560, -120, 0.8, "#5a2a00", 0.85, 2.65, 4.95],
  [900, 530, 145, 1.3, "#fff", 0.95, 3.18, 3.42], [830, 570, 160, 0.9, "#5a2a00", 0.9, 0.01, 3.79], [500, 40, 0, 0.7, "#5a2a00", 0.8, 0.54, 4.16],
  [500, 570, 180, 0.7, "#fff", 0.9, 1.07, 4.53], [40, 300, -90, 0.8, "#5a2a00", 0.8, 1.6, 4.9], [960, 300, 90, 0.8, "#fff", 0.9, 2.13, 3.37],
  [300, 110, -20, 0.6, "#fff", 0.8, 2.66, 3.74], [700, 500, 160, 0.6, "#5a2a00", 0.8, 3.19, 4.11], [190, 250, -70, 0.9, "#fff", 0.9, 0.02, 4.48],
  [810, 240, 70, 0.9, "#5a2a00", 0.85, 0.55, 4.85], [210, 430, -115, 0.8, "#5a2a00", 0.85, 1.08, 3.32], [790, 440, 115, 0.9, "#fff", 0.9, 1.61, 3.69],
  [640, 90, 15, 0.7, "#fff", 0.85, 2.14, 4.06], [360, 520, -170, 0.7, "#5a2a00", 0.8, 2.67, 4.43],
];
type Spark = [x: number, y: number, r: number, dx: number, dy: number, delay: number];
const SPARKS: readonly Spark[] = [
  [70, 60, -40, -40, -22, 0.0], [930, 50, 40, 40, -23, 0.7], [60, 540, -140, -40, 22, 1.4], [940, 550, 140, 40, 23, 2.1],
  [500, 30, 0, 0, -46, 2.8], [500, 575, 180, 0, 46, 3.5], [200, 80, -25, -37, -27, 4.2], [800, 520, 155, 37, 27, 0.7],
  [30, 300, -90, -46, 0, 1.4], [970, 300, 90, 46, 0, 2.1], [250, 540, -155, -33, 32, 2.8], [760, 70, 30, 34, -30, 3.5],
];
type Dot = [x: number, y: number, dx: number, dy: number, delay: number];
const DOTS: readonly Dot[] = [
  [120, 180, -57, -18, 0.4], [880, 140, 55, -23, 1.3], [160, 470, -54, 27, 2.2], [840, 460, 54, 26, 3.1], [330, 60, -35, -49, 4.0],
  [680, 560, 34, 49, 0.7], [420, 140, -27, -54, 1.6], [600, 470, 30, 52, 2.5], [260, 330, -60, 7, 3.4], [740, 330, 60, 7, 0.1],
];

function CaptureSvg({ bg }: { bg: CaptureBg }) {
  if (bg === "bg-outros") return null;
  return (
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {bg === "bg-lendario"
        ? BOLTS.map(([x, y, r, sc, fill, op, delay, dur], i) => (
            <g key={i} className="bolt" style={{ animationDelay: `-${delay}s`, animationDuration: `${dur}s` }}>
              <polygon points="0,-60 14,-14 40,-22 6,60 -6,12 -34,20" fill={fill} opacity={op} transform={`translate(${x} ${y}) rotate(${r}) scale(${sc})`} />
            </g>
          ))
        : null}
      {bg === "bg-mitico" ? (
        <>
          {SPARKS.map(([x, y, r, dx, dy, delay], i) => (
            <g key={`s${i}`} className="spark" style={{ ["--dx" as string]: `${dx}px`, ["--dy" as string]: `${dy}px`, animationDelay: `-${delay}s` }}>
              <polygon points="-4,-120 4,-120 1,90 -1,90" fill="#fff" opacity=".6" transform={`translate(${x} ${y}) rotate(${r})`} />
              <polygon points="-12,-100 12,-100 3,60 -3,60" fill="#d9c8ff" opacity=".35" transform={`translate(${x} ${y}) rotate(${r + 12})`} />
            </g>
          ))}
          {DOTS.map(([x, y, dx, dy, delay], i) => (
            <g key={`d${i}`} className="spark" style={{ ["--dx" as string]: `${dx}px`, ["--dy" as string]: `${dy}px`, animationDelay: `-${delay}s` }}>
              <circle cx={x} cy={y} r="5" fill="#fff" opacity=".85" />
              <circle cx={x + 30} cy={y + 22} r="3" fill="#fff" opacity=".6" />
            </g>
          ))}
        </>
      ) : null}
    </svg>
  );
}

export interface CaptureOverlayProps {
  dex: number;
  name: string;
  labels: readonly string[];
  /** URL do artwork (null = custom: silhueta da pokebola) */
  artworkSrc: string | null;
  /** chamado uma vez ao chegar no s-final (grava o capturado) */
  onCaptured(): void;
  onClose(): void;
}

export function CaptureOverlay({ dex, name, labels, artworkSrc, onCaptured, onClose }: CaptureOverlayProps) {
  const t = useT();
  const { stage, skip, close } = useCaptureSequence(onCaptured, onClose);
  const [artFailed, setArtFailed] = useState(false);
  const bg = captureBackground(labels);
  const final = stage === "s-final";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return createPortal(
    <div
      className={stageClass(stage)}
      id="capture"
      data-dex={dex}
      data-stage={stage}
      role="dialog"
      aria-modal="true"
      aria-label={name}
      data-silent=""
      onClick={() => (final ? close() : skip())}
    >
      <div className={`cap-bg ${bg}`} data-bg={bg}>
        <div className="cap-boost">
          <div className="cap-rays" />
          <div className="cap-glow" />
        </div>
        <div className="cap-dots" />
        <CaptureSvg bg={bg} />
      </div>
      <div className="cap-stage">
        <div className="cap-burst" />
        <img
          className="cap-art"
          src={artworkSrc && !artFailed ? artworkSrc : pokeballUrl}
          alt=""
          draggable={false}
          onError={() => setArtFailed(true)}
        />
        <img className="cap-ball" src={pokeballUrl} alt="" draggable={false} />
      </div>
      <div className="cap-flash" />
      <div className="cap-skip">{t("capture.skip")}</div>
      <div className="cap-text">
        <div className="cap-name">{name}</div>
        <div className="cap-caught">{t("capture.caught")}</div>
        <button
          type="button"
          className="btn btn-light cap-close"
          data-silent=""
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
        >
          {t("capture.close")}
        </button>
      </div>
    </div>,
    document.body,
  );
}
