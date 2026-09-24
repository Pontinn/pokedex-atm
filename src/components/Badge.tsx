// Selo (.badge, style.css:325-335). Em cards fica em linha propria acima do titulo (regra "Sem sobreposicao de texto").
import type { ReactNode } from "react";

export function Badge({ className, children, title }: { className?: string; children: ReactNode; title?: string }) {
  return (
    <span className={`badge${className ? ` ${className}` : ""}`} title={title}>
      {children}
    </span>
  );
}
