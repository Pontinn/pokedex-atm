// Controle segmentado (.seg, style.css:399-403).
import type { ReactNode } from "react";

export interface SegmentOption<V extends string> {
  value: V;
  label: ReactNode;
}

export function SegmentedControl<V extends string>({
  options,
  value,
  onChange,
  className,
  ariaLabel,
}: {
  options: readonly SegmentOption<V>[];
  value: V;
  onChange(value: V): void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div className={`seg${className ? ` ${className}` : ""}`} role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={o.value === value ? "active" : ""}
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
