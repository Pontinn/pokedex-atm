// Bloco de carregamento com brilho (shimmer, style.css:281 do prototipo).
import type { CSSProperties } from "react";

export function Skeleton({
  width,
  height = 16,
  radius,
  className,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
}) {
  const style: CSSProperties = { width, height, borderRadius: radius };
  return <div className={`skeleton${className ? ` ${className}` : ""}`} style={style} aria-hidden="true" />;
}
