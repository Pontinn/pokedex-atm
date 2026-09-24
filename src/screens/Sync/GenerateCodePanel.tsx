// Gerar codigo (F11.1, RF-72/RF-73/RF-112): encodeSyncCode(storage.readAll()) -> QR(s), texto copiavel,
// arquivo .pdx, resumo e carimbo de data. Nenhuma requisicao de rede.
import { memo, useCallback, useState } from "react";
import { Copy, Download, QrCode } from "../../components/Icon";
import { InlineError } from "../../components/InlineError";
import { useT } from "../../i18n/useT";
import type { MessageKey } from "../../i18n/messages";
import { getAppStorage } from "../../state/app-storage";
import { usePreferencesStore } from "../../state/preferences-store";
import { useShellStore } from "../../state/shell-store";
import { encodeSyncCode, type SyncEncoded } from "../../sync";
import { downloadText } from "../Settings/BackupCard";
import { QrFrames } from "./QrFrames";
import { SummaryLines, formatDateTime } from "./SyncSummary";

export const GenerateCodePanel = memo(function GenerateCodePanel() {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const pushToast = useShellStore((s) => s.pushToast);
  const [code, setCode] = useState<SyncEncoded | null>(null);
  const [error, setError] = useState<MessageKey | null>(null);
  const [copyFailed, setCopyFailed] = useState(false);

  const generate = useCallback(async () => {
    setError(null);
    setCopyFailed(false);
    try {
      const docs = await getAppStorage().readAll();
      setCode(encodeSyncCode(docs));
    } catch (err) {
      console.warn("[sync] encode failed", err);
      setError(err instanceof RangeError ? "sync.oversized" : "sync.applyFailed");
    }
  }, []);

  const copy = useCallback(async () => {
    if (!code) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(code.text);
      pushToast("sync.copied");
    } catch {
      setCopyFailed(true);
      const area = document.querySelector<HTMLTextAreaElement>(".sync-code-text");
      area?.focus();
      area?.select();
    }
  }, [code, pushToast]);

  const empty = code !== null && code.summary.captured + code.summary.team + code.summary.history === 0 && Object.keys(code.summary.trainersDefeated).length === 0;

  return (
    <div className="card sync-panel" data-panel="generate">
      <h3>{t("sync.generate")}</h3>
      <p className="muted">{t("sync.generateHint")}</p>
      <div className="settings-actions">
        <button type="button" className="btn btn-primary" data-action="generate" onClick={() => void generate()}>
          <QrCode />
          {t("sync.generate")}
        </button>
      </div>
      {error ? <InlineError messageKey={error} /> : null}
      {code ? (
        <div className="sync-result" data-result>
          {empty ? (
            <div className="notice notice-info sync-empty-note" data-nothing>
              <span>{t("sync.nothingYet")}</span>
            </div>
          ) : null}
          <div className="sync-result-grid">
            <QrFrames frames={code.frames} />
            <div className="sync-result-side">
              <SummaryLines summary={code.summary} />
              <p className="muted" data-generated-at>
                {t("sync.generatedAt", { date: formatDateTime(code.summary.exportedAt, lang) })}
              </p>
            </div>
          </div>
          <label className="sync-label" htmlFor="sync-code-out">
            {t("sync.codeText")}
          </label>
          <textarea id="sync-code-out" className="sync-code-text" readOnly value={code.text} rows={4} />
          {copyFailed ? <p className="sync-hint-warn">{t("sync.copyManual")}</p> : null}
          <div className="settings-actions">
            <button type="button" className="btn btn-ghost" data-action="copy" onClick={() => void copy()}>
              <Copy />
              {t("sync.copy")}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              data-action="download-pdx"
              onClick={() => downloadText(code.text, `pontindex-${new Date(code.summary.exportedAt).toISOString().slice(0, 10)}.pdx`, "text/plain")}
            >
              <Download />
              {t("sync.download")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
});
