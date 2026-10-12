// Selo (.badge, style.css:325-335). Em cards fica em linha propria acima do titulo (regra "Sem sobreposicao de texto").
import type { ReactNode } from "react";

// label (pokemon-generation): nome acessivel do selo (role="img" + aria-label); sem label o HTML e o de antes.
export function Badge({
  className,
  children,
  title,
  label,
}: {
  className?: string;
  children: ReactNode;
  title?: string;
  label?: string;
}) {
  return (
    <span className={`badge${className ? ` ${className}` : ""}`} title={title} role={label ? "img" : undefined} aria-label={label}>
      {children}
    </span>
  );
}
