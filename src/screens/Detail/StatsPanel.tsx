// Atributos base (F4.2; porta statsBlock app.js:768-775, style.css:503-514): 6 barras (--w = min(100, v/2)%, cores
// --s-*, delay i*80ms) + Total = BST (--w = total/8). Reutilizado pelas formas (F5.2) com outros baseStats.
import { memo, useEffect, useState, type CSSProperties } from "react";
import type { BaseStats } from "../../data/types";
import { useT } from "../../i18n/useT";

export const STAT_ROWS: readonly { key: keyof BaseStats; label: string; color: string }[] = [
  { key: "hp", label: "stat.hp", color: "var(--s-hp)" },
  { key: "attack", label: "stat.atk", color: "var(--s-atk)" },
  { key: "defence", label: "stat.def", color: "var(--s-def)" },
  { key: "specialAttack", label: "stat.spa", color: "var(--s-spa)" },
  { key: "specialDefence", label: "stat.spd", color: "var(--s-spd)" },
  { key: "speed", label: "stat.spe", color: "var(--s-spe)" },
];

export function statTotal(stats: BaseStats): number {
  return STAT_ROWS.reduce((sum, r) => sum + stats[r.key], 0);
}

export const StatBars = memo(function StatBars({ stats }: { stats: BaseStats }) {
  const t = useT();
  // as barras crescem de scaleX(0) para 1 depois do 1o paint (transicao do prototipo)
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const total = statTotal(stats);
  return (
    <div className={`stats${shown ? " show-bars" : ""}`}>
      {STAT_ROWS.map((r, i) => (
        <div className="stat" key={r.key} data-stat={r.key}>
          <span className="stat-name">{t(r.label)}</span>
          <span className="stat-val">{stats[r.key]}</span>
          <div className="bar">
            <i style={{ "--w": `${Math.min(100, stats[r.key] / 2)}%`, "--bc": r.color, "--d": `${i * 80}ms` } as CSSProperties} />
          </div>
        </div>
      ))}
      <div className="stat-total">
        <span className="stat-name">{t("detail.total")}</span>
        <span className="stat-val" data-stat="total">
          {total}
        </span>
        <div className="bar">
          <i style={{ "--w": `${Math.min(100, total / 8)}%`, "--d": "520ms" } as CSSProperties} />
        </div>
      </div>
    </div>
  );
});

export const StatsPanel = memo(function StatsPanel({ stats }: { stats: BaseStats }) {
  const t = useT();
  return (
    <div className="panel stats-panel" style={{ "--i": 1 } as CSSProperties}>
      <h3>{t("detail.stats")}</h3>
      <StatBars stats={stats} />
    </div>
  );
});
