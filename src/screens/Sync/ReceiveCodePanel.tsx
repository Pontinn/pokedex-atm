// Receber codigo (F11.2, RF-74..78, RF-113): camera, colar ou arquivo -> FrameCollector (frames em qualquer ordem)
// -> decodeSyncCode -> erro da matriz 5c SEM escrita, ou resumo + Mesclar/Substituir -> mergeDocuments -> writeMany.
import { memo, useCallback, useRef, useState } from "react";
import { Upload } from "../../components/Icon";
import { InlineError } from "../../components/InlineError";
import { useT } from "../../i18n/useT";
import type { MessageKey } from "../../i18n/messages";
import { useNavigationActions } from "../../navigation/useNavigation";
import { getAppStorage } from "../../state/app-storage";
import { useDatasetStore } from "../../state/dataset-store";
import { useShellStore } from "../../state/shell-store";
import { USER_DOC_KEYS, type DocMap } from "../../storage";
import { FrameCollector, decodeSyncCode, mergeDocuments, summarize, type MergeMode, type SyncDecoded, type SyncSummary as SyncSummaryData } from "../../sync";
import { readLocalDocs, rehydrateAll } from "../Settings/data-actions";
import { CameraScanner } from "./CameraScanner";
import { SyncSummary } from "./SyncSummary";

interface Pending {
  decoded: SyncDecoded;
  summary: SyncSummaryData;
  local: DocMap;
}

export const ReceiveCodePanel = memo(function ReceiveCodePanel() {
  const t = useT();
  const pushToast = useShellStore((s) => s.pushToast);
  const speciesIndex = useDatasetStore((s) => s.speciesIndex);
  const { updateUi } = useNavigationActions();
  const collector = useRef(new FrameCollector());
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState<{ received: number; total: number } | null>(null);
  const [warn, setWarn] = useState<MessageKey | null>(null);
  const [error, setError] = useState<MessageKey | null>(null);
  const [cameraOff, setCameraOff] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [mode, setMode] = useState<MergeMode>("merge");
  const [busy, setBusy] = useState(false);

  const decode = useCallback(
    async (code: string) => {
      const r = decodeSyncCode(code);
      if (!r.ok) {
        setError(`sync.${r.error.code}` as MessageKey);
        setPending(null);
        return;
      }
      const known = speciesIndex && speciesIndex.length > 0 ? speciesIndex : null;
      const summary = summarize(r.value.docs, known, { exportedAt: r.value.exportedAt });
      const local = await readLocalDocs(getAppStorage());
      setMode("merge");
      setPending({ decoded: r.value, summary, local });
    },
    [speciesIndex],
  );

  /** Toda entrada (frame lido, texto colado, arquivo) passa pelo coletor; "PDX1." inteiro completa na hora. */
  const feed = useCallback(
    (input: string) => {
      setError(null);
      if (input.replace(/\s+/g, "").length === 0) {
        setError("sync.empty");
        return;
      }
      const status = collector.current.add(input);
      if (status.error) {
        setWarn(status.error === "otherSession" ? "sync.otherSession" : "sync.invalidFrame");
        return;
      }
      setWarn(null);
      if (!status.complete) {
        setProgress({ received: status.received, total: status.total });
        return;
      }
      const code = collector.current.assemble() ?? "";
      collector.current.reset();
      setProgress(null);
      void decode(code);
    },
    [decode],
  );

  const cancel = useCallback(() => {
    collector.current.reset();
    setProgress(null);
    setWarn(null);
    setPending(null);
    setError(null);
  }, []);

  const apply = useCallback(async () => {
    if (!pending) return;
    setBusy(true);
    try {
      const storage = getAppStorage();
      const merged = mergeDocuments(pending.local, pending.decoded.docs, mode);
      const toWrite: Partial<DocMap> = {};
      for (const key of USER_DOC_KEYS) (toWrite as Record<string, unknown>)[key] = merged[key];
      await storage.writeMany(toWrite);
      await rehydrateAll(storage, [...USER_DOC_KEYS]);
      setPending(null);
      setText("");
      pushToast("sync.applied");
      updateUi<"sync">({ mode: null });
    } catch (err) {
      console.warn("[sync] apply failed", err);
      setError("sync.applyFailed");
    } finally {
      setBusy(false);
    }
  }, [pending, mode, pushToast, updateUi]);

  const onUnavailable = useCallback(() => {
    setCameraOff(true);
    textRef.current?.focus();
  }, []);

  const capturedAfter = pending ? Object.keys(mergeDocuments(pending.local, pending.decoded.docs, mode).captured.entries).length : 0;

  return (
    <div className="card sync-panel" data-panel="receive">
      <h3>{t("sync.receive")}</h3>
      <p className="muted">{t("sync.ownDevices")}</p>
      {pending ? (
        <div className="sync-review">
          <SyncSummary summary={pending.summary} mode={mode} onModeChange={setMode} capturedAfter={capturedAfter} />
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" data-action="cancel" onClick={cancel}>
              {t("sync.cancel")}
            </button>
            <button type="button" className="btn btn-primary" data-action="apply" disabled={busy} onClick={() => void apply()}>
              {t("sync.apply")}
            </button>
          </div>
        </div>
      ) : (
        <div className="sync-inputs">
          <div className="sync-input-block">
            <span className="sync-label">{t("sync.scan")}</span>
            {cameraOff ? (
              <div className="notice sync-camera-off" data-camera-off>
                <span>
                  <strong>{t("sync.cameraUnavailable")}</strong>
                  {t("sync.cameraUnavailableHint")}
                </span>
              </div>
            ) : (
              <CameraScanner onText={feed} onUnavailable={onUnavailable} />
            )}
            {progress ? (
              <div className="sync-progress-row">
                <span className="sync-progress" data-progress>
                  {t("sync.progress", { n: progress.total - progress.received, i: progress.received, total: progress.total })}
                </span>
                <button type="button" className="btn btn-ghost" data-action="cancel-frames" onClick={cancel}>
                  {t("sync.cancel")}
                </button>
              </div>
            ) : null}
            {warn ? (
              <p className="sync-warn" data-warn={warn}>
                {t(warn)}
              </p>
            ) : null}
          </div>
          <div className="sync-input-block">
            <label className="sync-label" htmlFor="sync-code-in">
              {t("sync.paste")}
            </label>
            <textarea
              id="sync-code-in"
              ref={textRef}
              className="sync-code-text"
              rows={4}
              value={text}
              placeholder={t("sync.pastePlaceholder")}
              onChange={(e) => setText(e.currentTarget.value)}
            />
            {text.trim().length === 0 ? <p className="muted">{t("sync.empty")}</p> : null}
            <div className="settings-actions">
              <button type="button" className="btn btn-primary" data-action="receive" disabled={text.trim().length === 0} onClick={() => feed(text)}>
                {t("sync.receiveButton")}
              </button>
            </div>
          </div>
          <div className="sync-input-block">
            <span className="sync-label">{t("sync.file")}</span>
            <p className="muted">{t("sync.fileHint")}</p>
            <div className="settings-actions">
              <button type="button" className="btn btn-ghost" data-action="open-file" onClick={() => fileRef.current?.click()}>
                <Upload />
                {t("sync.file")}
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdx,.txt,text/plain"
              hidden
              data-input="sync-file"
              onChange={(e) => {
                const f = e.currentTarget.files?.[0];
                e.currentTarget.value = "";
                if (f) void f.text().then(feed);
              }}
            />
          </div>
        </div>
      )}
      {error ? (
        <div className="settings-error" data-error={error}>
          <InlineError messageKey={error} />
        </div>
      ) : null}
    </div>
  );
});
