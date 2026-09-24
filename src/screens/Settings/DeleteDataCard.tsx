// Apagar dados (F10.2, RF-122): checkboxes por entidade ou Tudo; Modal com a lista e a contagem; "Tudo" exige
// digitar a palavra de confirmacao. Uma transacao (writeMany dos padroes); "Tudo" tambem limpa os snapshots.
import { memo, useCallback, useState } from "react";
import { Trash2 } from "../../components/Icon";
import { Modal } from "../../components/Modal";
import { useT } from "../../i18n/useT";
import type { MessageKey } from "../../i18n/messages";
import { getAppStorage } from "../../state/app-storage";
import { useShellStore } from "../../state/shell-store";
import { USER_DOC_KEYS, type DocKey } from "../../storage";
import { deleteData } from "../../storage/backup";
import { countRecords, readLocalDocs, rehydrateAll } from "./data-actions";

type UserKey = Exclude<DocKey, "meta">;

export const DELETE_OPTIONS: readonly { key: UserKey; label: MessageKey }[] = [
  { key: "history", label: "deleteData.history" },
  { key: "team", label: "deleteData.team" },
  { key: "captured", label: "deleteData.captured" },
  { key: "trainerProgress", label: "deleteData.trainers" },
  { key: "preferences", label: "deleteData.preferences" },
];

export const DeleteDataCard = memo(function DeleteDataCard() {
  const t = useT();
  const pushToast = useShellStore((s) => s.pushToast);
  const [selected, setSelected] = useState<ReadonlySet<UserKey>>(new Set());
  const [confirm, setConfirm] = useState<{ n: number } | null>(null);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const all = selected.size === DELETE_OPTIONS.length;

  const toggle = (key: UserKey, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
  };
  const toggleAll = (on: boolean) => setSelected(on ? new Set(DELETE_OPTIONS.map((o) => o.key)) : new Set());

  const openConfirm = useCallback(async () => {
    const docs = await readLocalDocs(getAppStorage());
    const n = [...selected].reduce((sum, key) => sum + countRecords(docs, key), 0);
    setTyped("");
    setConfirm({ n });
  }, [selected]);

  const close = useCallback(() => setConfirm(null), []);

  const run = useCallback(async () => {
    setBusy(true);
    const keys = [...selected];
    try {
      const storage = getAppStorage();
      await deleteData(storage, all ? "all" : keys);
      await rehydrateAll(storage, all ? [...USER_DOC_KEYS] : keys);
      setSelected(new Set());
      pushToast("deleteData.done");
    } catch (err) {
      console.warn("[settings] delete failed", err);
      pushToast("backup.failed", { tone: "error" });
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  }, [selected, all, pushToast]);

  const word = t("deleteData.word");
  const canApply = !busy && (!all || typed.trim().toUpperCase() === word);
  const list = DELETE_OPTIONS.filter((o) => selected.has(o.key))
    .map((o) => t(o.label))
    .join(", ");

  return (
    <div className="card" data-card="delete">
      <h3>{t("deleteData.title")}</h3>
      <p className="muted">{t("deleteData.hint")}</p>
      <div className="delete-list">
        {DELETE_OPTIONS.map((o) => (
          <label key={o.key} className="delete-opt">
            <input type="checkbox" data-delete={o.key} checked={selected.has(o.key)} onChange={(e) => toggle(o.key, e.currentTarget.checked)} />
            <span>{t(o.label)}</span>
          </label>
        ))}
        <label className="delete-opt all">
          <input type="checkbox" data-delete="all" checked={all} onChange={(e) => toggleAll(e.currentTarget.checked)} />
          <span>{t("deleteData.all")}</span>
        </label>
      </div>
      <button
        type="button"
        className="btn btn-danger"
        data-action="delete"
        disabled={selected.size === 0}
        onClick={() => void openConfirm()}
      >
        <Trash2 />
        {t("deleteData.button")}
      </button>
      <Modal open={confirm !== null} onClose={close} title={t("deleteData.title")}>
        {confirm ? (
          <>
            <p className="confirm-text" data-confirm-text>
              {t("deleteData.willDelete", { list: all ? t("deleteData.all") : list, n: confirm.n })}
            </p>
            {all ? (
              <label className="confirm-label">
                {t("deleteData.typeToConfirm", { word })}
                <input
                  className="confirm-input"
                  data-input="confirm-word"
                  value={typed}
                  autoComplete="off"
                  onChange={(e) => setTyped(e.currentTarget.value)}
                />
              </label>
            ) : null}
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={close}>
                {t("settings.cancel")}
              </button>
              <button type="button" className="btn btn-danger" data-action="confirm-delete" disabled={!canApply} onClick={() => void run()}>
                <Trash2 />
                {t("deleteData.apply")}
              </button>
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  );
});
