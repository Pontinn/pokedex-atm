// Resumo antes de aplicar (RF-75, SPEC 5.4.4) + escolha Mesclar/Substituir e previa do resultado.
// Usado pela tela Sincronizar (F11.2) e pelo import de backup de Configuracoes (F10.2). Sem dependencias pesadas
// (nada de fflate/qrcode/zxing aqui): Configuracoes importa este arquivo no chunk principal.
import { memo } from "react";
import { SegmentedControl } from "../../components/SegmentedControl";
import { useT } from "../../i18n/useT";
import { usePreferencesStore } from "../../state/preferences-store";
import type { MergeMode } from "../../sync/merge";
import type { SyncSummary as SyncSummaryData } from "../../sync/types";

export function formatDateTime(ms: number, lang: "pt" | "en"): string {
  return new Date(ms).toLocaleString(lang === "pt" ? "pt-BR" : "en-US", { dateStyle: "short", timeStyle: "short" });
}

export function SummaryLines({ summary }: { summary: SyncSummaryData }) {
  const t = useT();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const series = Object.entries(summary.trainersDefeated).filter(([, n]) => n > 0);
  return (
    <div className="card-info sync-summary-lines">
      <div className="info-line" data-sum="captured">
        <span className="dot" aria-hidden="true" />
        <span>{t("sync.sumCaptured", { n: summary.captured })}</span>
      </div>
      <div className="info-line" data-sum="team">
        <span className="dot" aria-hidden="true" />
        <span>{t("sync.sumTeam", { n: summary.team })}</span>
      </div>
      <div className="info-line" data-sum="history">
        <span className="dot" aria-hidden="true" />
        <span>{t("sync.sumHistory", { n: summary.history })}</span>
      </div>
      <div className="info-line" data-sum="trainers">
        <span className="dot" aria-hidden="true" />
        <span>
          {series.length > 0
            ? t("sync.sumTrainers", { list: series.map(([id, n]) => `${id} (${n})`).join(", ") })
            : t("sync.sumTrainersNone")}
        </span>
      </div>
      {summary.preferences ? (
        <div className="info-line" data-sum="prefs">
          <span className="dot" aria-hidden="true" />
          <span>{t("sync.sumPrefs")}</span>
        </div>
      ) : null}
      {summary.exportedAt > 0 ? (
        <div className="info-line" data-sum="date">
          <span className="dot" aria-hidden="true" />
          <span>{t("sync.sumDate", { date: formatDateTime(summary.exportedAt, lang) })}</span>
        </div>
      ) : null}
      {summary.unknownIds > 0 ? (
        <div className="info-line" data-sum="orphans">
          <span className="dot" aria-hidden="true" />
          <span>{t("sync.orphans", { n: summary.unknownIds })}</span>
        </div>
      ) : null}
    </div>
  );
}

export const SyncSummary = memo(function SyncSummary({
  summary,
  mode,
  onModeChange,
  capturedAfter,
}: {
  summary: SyncSummaryData;
  mode: MergeMode;
  onModeChange(mode: MergeMode): void;
  /** capturados que o receptor tera depois de aplicar no modo atual */
  capturedAfter: number;
}) {
  const t = useT();
  return (
    <div className="sync-summary" data-sync-summary>
      <h3>{t("sync.summary")}</h3>
      <SummaryLines summary={summary} />
      <SegmentedControl<MergeMode>
        className="merge-seg"
        ariaLabel={t("sync.merge")}
        value={mode}
        onChange={onModeChange}
        options={[
          { value: "merge", label: t("sync.merge") },
          { value: "replace", label: t("sync.replace") },
        ]}
      />
      <p className="sync-preview" data-preview>
        {t(mode === "merge" ? "sync.afterMerge" : "sync.afterReplace", { n: capturedAfter })}
      </p>
    </div>
  );
});
