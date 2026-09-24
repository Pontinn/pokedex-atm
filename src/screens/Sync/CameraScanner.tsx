// Leitor de QR pela camera (F11.2, RF-74/RF-113): @zxing/browser carregado so ao clicar "Abrir camera";
// le continuamente e manda cada texto lido para o coletor de frames. Camera negada/indisponivel -> onUnavailable.
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Camera, X } from "../../components/Icon";
import { useT } from "../../i18n/useT";

interface Controls {
  stop(): void;
}

export const CameraScanner = memo(function CameraScanner({
  onText,
  onUnavailable,
}: {
  onText(text: string): void;
  onUnavailable(): void;
}) {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<Controls | null>(null);
  const onTextRef = useRef(onText);
  onTextRef.current = onText;
  const [open, setOpen] = useState(false);

  const stop = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setOpen(false);
  }, []);

  useEffect(() => () => controlsRef.current?.stop(), []);

  const start = useCallback(async () => {
    setOpen(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("no camera api");
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      const video = videoRef.current;
      if (!video) throw new Error("no video element");
      controlsRef.current = await reader.decodeFromVideoDevice(undefined, video, (result) => {
        if (result) onTextRef.current(result.getText());
      });
    } catch (err) {
      console.warn("[sync] camera unavailable", err);
      controlsRef.current?.stop();
      controlsRef.current = null;
      setOpen(false);
      onUnavailable();
    }
  }, [onUnavailable]);

  return (
    <div className="camera-box" data-camera={open ? "open" : "closed"}>
      {open ? (
        <>
          <video ref={videoRef} className="camera-video" muted playsInline />
          <button type="button" className="btn btn-ghost" data-action="close-camera" onClick={stop}>
            <X />
            {t("sync.closeCamera")}
          </button>
        </>
      ) : (
        <>
          <video ref={videoRef} className="camera-video" hidden muted playsInline />
          <button type="button" className="btn btn-ghost" data-action="open-camera" onClick={() => void start()}>
            <Camera />
            {t("sync.openCamera")}
          </button>
        </>
      )}
    </div>
  );
});
