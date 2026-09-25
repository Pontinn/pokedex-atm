// Golpes (F4.4; porta movesTableHTML app.js:778-787, style.css:576-601): abas Nivel/TM/Ovo/Tutor em current.ui.moveTab,
// tabela com nome no idioma dos termos do card + <small> no outro, tipo, categoria, poder, precisao e PP; linha com
// descricao expansivel, linhas abertas em current.ui.openMoveRows (restauradas ao voltar). Trocar aba re-renderiza
// so a tabela (RF-04).
import { memo, useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { EmptyState } from "../../components/EmptyState";
import { ChevronDown } from "../../components/Icon";
import { InlineError } from "../../components/InlineError";
import { Skeleton } from "../../components/Skeleton";
import { TermsToggle } from "../../components/TermsToggle";
import { TypeChip } from "../../components/TypeChip";
import { loadMoves } from "../../data/loaders";
import type { MoveInfo, MovesFile, SpeciesMoves } from "../../data/types";
import { useT } from "../../i18n/useT";
import type { DetailMoveTab } from "../../navigation/types";
import { useNavigationActions, useScreenUi } from "../../navigation/useNavigation";
import { useNavigationStore } from "../../navigation/navigation-store";
import { usePreferencesStore, useTermsLanguage } from "../../state/preferences-store";
import { humanizeId } from "./AbilitiesPanel";

export const MOVE_TABS: readonly DetailMoveTab[] = ["level", "tm", "egg", "tutor"];

export interface MoveRowData {
  /** chave unica da linha na aba (id do golpe; nivel + id na aba Nivel) */
  key: string;
  id: string;
  level: number | null;
  info: MoveInfo | null;
}

/** Linhas de uma aba juntando moves.json; a aba Nivel e ordenada por nivel asc (estavel). */
export function buildMoveRows(moves: SpeciesMoves, tab: DetailMoveTab, file: MovesFile): MoveRowData[] {
  if (tab === "level") {
    return moves.level
      .map((m, i) => ({ m, i }))
      .sort((a, b) => a.m.level - b.m.level || a.i - b.i)
      .map(({ m }) => ({ key: `${m.level}-${m.move}`, id: m.move, level: m.level, info: file[m.move] ?? null }));
  }
  return moves[tab].map((id) => ({ key: id, id, level: null, info: file[id] ?? null }));
}

/** moves.json carregado uma vez (cache do loader). */
export function useMovesFile(): { data: MovesFile | null; error: boolean; retry(): void } {
  const [state, setState] = useState<{ data: MovesFile | null; error: boolean; attempt: number }>({ data: null, error: false, attempt: 0 });
  useEffect(() => {
    let alive = true;
    loadMoves().then(
      (data) => alive && setState((s) => ({ ...s, data, error: false })),
      (err: unknown) => {
        console.warn("[detail] loadMoves failed", err);
        if (alive) setState((s) => ({ ...s, error: true }));
      },
    );
    return () => {
      alive = false;
    };
  }, [state.attempt]);
  return { data: state.data, error: state.error, retry: () => setState((s) => ({ ...s, error: false, attempt: s.attempt + 1 })) };
}

function MoveTabs() {
  const t = useT();
  const tab = useScreenUi("detail", "moveTab");
  const { updateUi } = useNavigationActions();
  return (
    <div className="tabs" id="move-tabs" role="tablist">
      {MOVE_TABS.map((k) => (
        <button
          key={k}
          type="button"
          role="tab"
          aria-selected={tab === k}
          className={tab === k ? "active" : ""}
          data-mtab={k}
          onClick={() => updateUi<"detail">({ moveTab: k })}
        >
          {t(`tab.${k}`)}
        </button>
      ))}
    </div>
  );
}

const MoveRow = memo(function MoveRow({ row, tab, open, onToggle }: { row: MoveRowData; tab: DetailMoveTab; open: boolean; onToggle(key: string): void }) {
  const t = useT();
  const termsLang = useTermsLanguage("moves");
  const uiLang = usePreferencesStore((s) => s.uiLanguage);
  const other = termsLang === "pt" ? "en" : "pt";
  const info = row.info;
  if (!info) console.warn(`[detail] move "${row.id}" missing in moves.json`);
  const main = info ? info.name[termsLang] || info.name.en : humanizeId(row.id);
  const alt = info ? info.name[other] : "";
  const desc = info ? info.description[uiLang] || info.description.en : "";
  const noMech = !info || info.type == null;
  const mechTitle = noMech ? t("moves.noMechanics") : undefined;
  const hasDesc = desc.length > 0;
  return (
    <>
      <tr
        className={`mv-row${hasDesc ? " has-desc" : ""}${open ? " open" : ""}`}
        data-mv={row.key}
        aria-expanded={hasDesc ? open : undefined}
        onClick={hasDesc ? () => onToggle(row.key) : undefined}
      >
        <td className="num">{row.level ?? t(`tab.${tab}`)}</td>
        <td className="mv-cell">
          <span className="mv-name">
            {main}
            {hasDesc ? (
              <span className="mv-caret">
                <ChevronDown />
              </span>
            ) : null}
          </span>
          {alt && alt !== main ? <span className="mv-en">{alt}</span> : null}
        </td>
        <td title={mechTitle}>{info?.type ? <TypeChip type={info.type} lang={termsLang} size="sm" /> : "-"}</td>
        <td title={mechTitle}>
          {info?.category ? (
            <span className={`cat cat-${info.category}`}>
              <i />
              {t(`cat.${info.category}`)}
            </span>
          ) : (
            "-"
          )}
        </td>
        <td className="num">{info?.power ? info.power : "-"}</td>
        <td className="num">{info?.accuracy ? `${info.accuracy}%` : "-"}</td>
        <td className="num">{info?.pp ?? "-"}</td>
      </tr>
      {hasDesc ? (
        <tr className="mv-desc">
          <td colSpan={7}>
            <div className={`desc-wrap${open ? " open" : ""}`}>
              <div className="desc-inner">
                <p className="desc-text">{desc}</p>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
});

const MovesTable = memo(function MovesTable({ moves }: { moves: SpeciesMoves }) {
  const t = useT();
  const tab = useScreenUi("detail", "moveTab");
  const openRows = useScreenUi("detail", "openMoveRows");
  const { data, error, retry } = useMovesFile();
  const rows = useMemo(() => (data ? buildMoveRows(moves, tab, data) : []), [moves, tab, data]);
  const openSet = useMemo(() => new Set(openRows), [openRows]);
  const onToggle = useCallback((key: string) => {
    const current = (useNavigationStore.getState().current.ui as { openMoveRows?: string[] }).openMoveRows ?? [];
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    useNavigationStore.getState().updateUi<"detail">({ openMoveRows: next });
  }, []);
  if (error) return <InlineError onRetry={retry} />;
  if (!data) return <Skeleton height={180} />;
  if (rows.length === 0) return <EmptyState messageKey="moves.empty" />;
  return (
    <div className="table-wrap part-in" id="moves-table" key={tab}>
      <table>
        <thead>
          <tr>
            <th>{t("col.level")}</th>
            <th>{t("col.move")}</th>
            <th>{t("col.type")}</th>
            <th>{t("col.cat")}</th>
            <th>{t("col.power")}</th>
            <th>{t("col.acc")}</th>
            <th>{t("col.pp")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <MoveRow key={row.key} row={row} tab={tab} open={openSet.has(row.key)} onToggle={onToggle} />
          ))}
        </tbody>
      </table>
    </div>
  );
});

export const MovesPanel = memo(function MovesPanel({ moves }: { moves: SpeciesMoves }) {
  const t = useT();
  return (
    <div className="panel moves-panel" id="moves-panel" style={{ "--i": 5 } as CSSProperties}>
      <div className="panel-head">
        <h3>{t("detail.moves")}</h3>
        <TermsToggle cardKey="moves" />
      </div>
      <MoveTabs />
      <MovesTable moves={moves} />
    </div>
  );
});
