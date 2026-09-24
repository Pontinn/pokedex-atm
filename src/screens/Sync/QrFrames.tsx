// QR do codigo (F11.1, RF-113): canvas 280 px dentro da moldura .item-hero-tile; 1 frame ou carrossel automatico
// (1,5 s) com setas e "Frame i de n". Tudo local (qrcode desenha no canvas, sem rede).
import { memo, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { ArrowLeft, ArrowRight } from "../../components/Icon";
import { useT } from "../../i18n/useT";

export const FRAME_INTERVAL_MS = 1500;

export const QrFrames = memo(function QrFrames({ frames }: { frames: readonly string[] }) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = frames.length;
  const current = Math.min(index, total - 1);

  useEffect(() => {
    if (total <= 1 || paused) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % total), FRAME_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [total, paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const text = frames[current];
    if (!canvas || text === undefined) return;
    QRCode.toCanvas(canvas, text, { width: 280, margin: 2, errorCorrectionLevel: "M" }).catch((err: unknown) =>
      console.warn("[sync] qr render failed", err),
    );
  }, [frames, current]);

  const step = (d: number) => {
    setPaused(true);
    setIndex((i) => (i + d + total) % total);
  };

  return (
    <div className="qr-frames" data-frames={total} data-frame-index={current + 1}>
      <div className="item-hero-tile qr-tile">
        <canvas ref={canvasRef} className="qr-canvas" width={280} height={280} data-qr-text={frames[current]} />
      </div>
      {total > 1 ? (
        <div className="qr-nav">
          <button type="button" className="tgl qr-prev" aria-label={t("sync.prevFrame")} onClick={() => step(-1)}>
            <ArrowLeft />
          </button>
          <span className="qr-counter">{t("sync.frames", { n: current + 1, total })}</span>
          <button type="button" className="tgl qr-next" aria-label={t("sync.nextFrame")} onClick={() => step(1)}>
            <ArrowRight />
          </button>
        </div>
      ) : null}
    </div>
  );
});
