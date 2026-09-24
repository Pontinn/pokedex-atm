// Backup (F10.2, RF-97/RF-98): exportar -> pontindex-backup-<yyyy-mm-dd>.json; importar -> parseBackup ->
// resumo + Mesclar/Substituir (mesmo SyncSummary de F11) -> applyBackup (um writeMany). Erros da matriz 5c, sem escrita.
import { memo, useCallback, useRef, useState } from "react";
import { Download, Upload } from "../../components/Icon";
import { InlineError } from "../../components/InlineError";
import { Modal } from "../../components/Modal";
import { useT } from "../../i18n/useT";
import type { MessageKey } from "../../i18n/messages";
import { getAppStorage } from "../../state/app-storage";
import { useDatasetStore } from "../../state/dataset-store";
import { useShellStore } from "../../state/shell-store";
import { USER_DOC_KEYS, type BackupFile, type DocMap } from "../../storage";
import { applyBackup, backupFileName, exportBackup, parseBackup, serializeBackup } from "../../storage/backup";
import { mergeDocuments, type MergeMode } from "../../sync/merge";
import { summarize } from "../../sync/summary";
import type { SyncSummary as SyncSummaryData } from "../../sync/types";
import { SyncSummary } from "../Sync/SyncSummary";
import { readLocalDocs, rehydrateAll } from "./data-actions";

export function downloadText(text: string, fileName: string, type: string): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

interface PendingImport {
  file: BackupFile;
  summary: SyncSummaryData;
  local: DocMap;
}

function capturedAfter(pending: PendingImport, mode: MergeMode): number {
  const incoming: Partial<DocMap> = { ...pending.file.documents };
  delete incoming.meta;
  return Object.keys(mergeDocuments(pending.local, incoming, mode).captured.entries).length;
}

export const BackupCard = memo(function BackupCard() {
  const t = useT();
  const pushToast = useShellStore((s) => s.pushToast);
  const speciesIndex = useDatasetStore((s) => s.speciesIndex);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<MessageKey | null>(null);
  const [pending, setPending] = useState<PendingImport | null>(null);
  const [mode, setMode] = useState<MergeMode>("merge");
  const [busy, setBusy] = useState(false);

  const onExport = useCallback(async () => {
    setError(null);
    try {
      const file = await exportBackup(getAppStorage());
      downloadText(serializeBackup(file), backupFileName(new Date()), "application/json");
      pushToast("backup.exported");
    } catch (err) {
      console.warn("[settings] export failed", err);
      setError("backup.failed");
    }
  }, [pushToast]);

  const onFile = useCallback(
    async (fileObj: File | undefined) => {
      if (!fileObj) return;
      setError(null);
      const text = await fileObj.text();
      const parsed = parseBackup(text);
      if (!parsed.ok) {
        setError(`sync.${parsed.error.code}` as MessageKey);
        return;
      }
      const file = parsed.value;
      const known = speciesIndex && speciesIndex.length > 0 ? speciesIndex : null;
      const summary = summarize(file.documents, known, { exportedAt: file.exportedAt });
      const local = await readLocalDocs(getAppStorage());
      setMode("merge");
      setPending({ file, summary, local });
    },
    [speciesIndex],
  );

  const onApply = useCallback(async () => {
    if (!pending) return;
    setBusy(true);
    try {
      const storage = getAppStorage();
      await applyBackup(storage, pending.file, mode);
      await rehydrateAll(storage, [...USER_DOC_KEYS]);
      setPending(null);
      pushToast("backup.imported");
    } catch (err) {
      console.warn("[settings] import failed", err);
      setPending(null);
      setError("backup.failed");
    } finally {
      setBusy(false);
    }
  }, [pending, mode, pushToast]);

  const close = useCallback(() => setPending(null), []);

  return (
    <div className="card" data-card="backup">
      <h3>{t("backup.title")}</h3>
      <p className="muted">{t("backup.hint")}</p>
      <div className="settings-actions">
        <button type="button" className="btn btn-primary" data-action="export" onClick={() => void onExport()}>
          <Download />
          {t("backup.export")}
        </button>
        <button type="button" className="btn btn-ghost" data-action="import" onClick={() => inputRef.current?.click()}>
          <Upload />
          {t("backup.import")}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          hidden
          data-input="backup-file"
          onChange={(e) => {
            const f = e.currentTarget.files?.[0];
            e.currentTarget.value = "";
            void onFile(f);
          }}
        />
      </div>
      {error ? (
        <div className="settings-error" data-error={error}>
          <InlineError messageKey={error} />
        </div>
      ) : null}
      <Modal open={pending !== null} onClose={close} title={t("backup.importTitle")}>
        {pending ? (
          <>
            <SyncSummary summary={pending.summary} mode={mode} onModeChange={setMode} capturedAfter={capturedAfter(pending, mode)} />
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={close}>
                {t("settings.cancel")}
              </button>
              <button type="button" className="btn btn-primary" data-action="apply-import" disabled={busy} onClick={() => void onApply()}>
                {t("sync.apply")}
              </button>
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  );
});
