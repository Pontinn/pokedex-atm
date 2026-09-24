// Restaurar snapshot pre-migracao (F10.2, RF-96 rollback, SPEC 5b.3 DOWN): lista os `backups` pre-migration-*
// com data e versao; "Restaurar" pede confirmacao e regrava os docs do snapshot.
import { memo, useCallback, useEffect, useState } from "react";
import { RotateCcw } from "../../components/Icon";
import { Modal } from "../../components/Modal";
import { useT } from "../../i18n/useT";
import { getAppStorage } from "../../state/app-storage";
import { usePreferencesStore } from "../../state/preferences-store";
import { useShellStore } from "../../state/shell-store";
import { USER_DOC_KEYS, type SafetySnapshot } from "../../storage";
import { formatDateTime } from "../Sync/SyncSummary";
import { DATA_CHANGED_EVENT, rehydrateAll } from "./data-actions";

export const RestoreSnapshotCard = memo(function RestoreSnapshotCard() {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const pushToast = useShellStore((s) => s.pushToast);
  const [snapshots, setSnapshots] = useState<SafetySnapshot[] | null>(null);
  const [target, setTarget] = useState<SafetySnapshot | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    getAppStorage()
      .listSnapshots()
      .then((list) => setSnapshots(list.filter((s) => s.id.startsWith("pre-migration")).sort((a, b) => b.createdAt - a.createdAt)))
      .catch((err: unknown) => {
        console.warn("[settings] list snapshots", err);
        setSnapshots([]);
      });
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(DATA_CHANGED_EVENT, load);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, load);
  }, [load]);

  const close = useCallback(() => setTarget(null), []);
  const restore = useCallback(async () => {
    if (!target) return;
    setBusy(true);
    try {
      const storage = getAppStorage();
      await storage.restorePreMigrationSnapshot(target.id);
      await rehydrateAll(storage, [...USER_DOC_KEYS]);
      pushToast("about.restored");
    } catch (err) {
      console.warn("[settings] restore failed", err);
      pushToast("backup.failed", { tone: "error" });
    } finally {
      setBusy(false);
      setTarget(null);
    }
  }, [target, pushToast]);

  return (
    <div className="card" data-card="restore">
      <h3>{t("about.restore")}</h3>
      <p className="muted">{t("about.restoreHint")}</p>
      {snapshots === null ? null : snapshots.length === 0 ? (
        <p className="install-manual" data-restore-empty>
          {t("about.restoreEmpty")}
        </p>
      ) : (
        <div className="snapshot-list">
          {snapshots.map((s) => (
            <div key={s.id} className="snapshot-row" data-snapshot={s.id}>
              <span>{t("about.restoreItem", { date: formatDateTime(s.createdAt, lang), v: s.version })}</span>
              <button type="button" className="btn btn-ghost" onClick={() => setTarget(s)}>
                <RotateCcw />
                {t("about.restoreButton")}
              </button>
            </div>
          ))}
        </div>
      )}
      <Modal open={target !== null} onClose={close} title={t("about.restore")}>
        <p className="confirm-text">{t("about.restoreConfirm")}</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={close}>
            {t("settings.cancel")}
          </button>
          <button type="button" className="btn btn-primary" data-action="confirm-restore" disabled={busy} onClick={() => void restore()}>
            {t("about.restoreButton")}
          </button>
        </div>
      </Modal>
    </div>
  );
});
