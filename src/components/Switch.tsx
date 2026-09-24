// Interruptor (.switch, style.css:701-706).
export function Switch({
  checked,
  onChange,
  ariaLabel,
  id,
}: {
  checked: boolean;
  onChange(checked: boolean): void;
  ariaLabel: string;
  id?: string;
}) {
  return (
    <label className="switch">
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.currentTarget.checked)}
      />
      <span />
    </label>
  );
}
