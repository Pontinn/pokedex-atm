// Grade virtualizada de Pokemon (F3.1; RNF-01/RNF-07). Rola junto com #main (container da pilha, F1.3): o
// virtualizador usa #main como elemento de rolagem e `scrollMargin` = posicao da grade dentro dele. Virtualiza por
// LINHAS: colunas = floor((largura + gap) / (200 + gap)) no desktop, 2 no mobile; overscan 3.
// A altura total existe ja no 1o render (estimativa), entao o scroll restaurado pela pilha (F1.3) cai no lugar certo.
// Reutilizada pelos Capturados (F6.2) via `renderFooter`.
import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useIsMobile } from "../../components/useIsMobile";
import type { SpeciesSummary } from "../../data/types";
import { useNavigationActions } from "../../navigation/useNavigation";
import { PokemonCard } from "./PokemonCard";

export const CARD_MIN_WIDTH = 200;
export const GRID_GAP_DESKTOP = 14;
export const GRID_GAP_MOBILE = 10;
const ROW_ESTIMATE_DESKTOP = 236;
const ROW_ESTIMATE_MOBILE = 212;
/** no maximo 12 cards por lote animam com delay (i*45ms) */
const ENTER_BATCH = 12;

export function gridColumns(width: number, mobile: boolean): number {
  if (mobile) return 2;
  return Math.max(1, Math.floor((width + GRID_GAP_DESKTOP) / (CARD_MIN_WIDTH + GRID_GAP_DESKTOP)));
}

function getMain(): HTMLElement | null {
  return typeof document === "undefined" ? null : document.getElementById("main");
}

export interface DexGridProps {
  list: readonly SpeciesSummary[];
  renderFooter?: (species: SpeciesSummary) => ReactNode;
}

export const DexGrid = memo(function DexGrid({ list, renderFooter }: DexGridProps) {
  const mobile = useIsMobile();
  const { navigate } = useNavigationActions();
  const gridRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [margin, setMargin] = useState(0);
  const gap = mobile ? GRID_GAP_MOBILE : GRID_GAP_DESKTOP;
  const columns = gridColumns(width, mobile);
  const rows = Math.ceil(list.length / columns);

  // largura da grade e posicao dela dentro de #main; recalcula em resize/rotacao e quando os filtros mudam de altura
  useLayoutEffect(() => {
    const grid = gridRef.current;
    const main = getMain();
    if (!grid) return undefined;
    const measure = () => {
      setWidth(grid.clientWidth);
      if (main) setMargin(grid.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(grid);
    if (grid.parentElement) ro.observe(grid.parentElement);
    return () => ro.disconnect();
  }, []);

  const virtualizer = useVirtualizer({
    count: rows,
    getScrollElement: getMain,
    estimateSize: () => (mobile ? ROW_ESTIMATE_MOBILE : ROW_ESTIMATE_DESKTOP) + gap,
    overscan: 3,
    scrollMargin: margin,
  });

  const open = useCallback((dex: number) => navigate("detail", { dex }), [navigate]);
  const items = virtualizer.getVirtualItems();
  const firstRow = items[0]?.index ?? 0;

  return (
    <div
      ref={gridRef}
      className="poke-grid-virtual"
      data-columns={columns}
      style={{ height: virtualizer.getTotalSize(), position: "relative" }}
    >
      {width > 0
        ? items.map((row) => (
            <div
              key={row.key}
              data-index={row.index}
              ref={virtualizer.measureElement}
              className="poke-grid poke-row"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${row.start - margin}px)`,
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                paddingBottom: gap,
              }}
            >
              {list.slice(row.index * columns, row.index * columns + columns).map((s, col) => (
                <PokemonCard
                  key={s.dex}
                  species={s}
                  enterIndex={Math.min((row.index - firstRow) * columns + col, ENTER_BATCH - 1)}
                  onOpen={open}
                  footer={renderFooter?.(s)}
                />
              ))}
            </div>
          ))
        : null}
    </div>
  );
});
