// Artwork oficial da PokeAPI (SPEC 5.2; RF-09, RF-16, RF-125). Reutilizavel: ficha (hero e formas), captura e
// Comparar (grupo B, F7). Tenta official-artwork/<id>[shiny] com timeout de 8 s; erro ou timeout -> silhueta da
// pokebola (ArtworkPlaceholder) e UMA nova tentativa em segundo plano; `artworkId == null` (custom) nem tenta e
// mostra o aviso "a imagem nao vem da PokeAPI". Enquanto carrega, PokeballSpinner sobreposto.
import { memo, useEffect, useState } from "react";
import { ArtworkPlaceholder } from "../../components/ArtworkPlaceholder";
import { PokeballSpinner } from "../../components/PokeballSpinner";

export const ARTWORK_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";
export const ARTWORK_TIMEOUT_MS = 8000;

export function artworkUrl(artworkId: number, shiny = false): string {
  return `${ARTWORK_BASE}/${shiny ? "shiny/" : ""}${artworkId}.png`;
}

export interface ArtworkImageProps {
  /** id da PokeAPI; null = especie custom (sem artwork) */
  artworkId: number | null;
  shiny?: boolean;
  /** lado em px (quadrado) */
  size?: number;
  alt?: string;
  className?: string;
  /** mostra o aviso RF-09 no placeholder quando artworkId == null (padrao true) */
  showNotice?: boolean;
  /** chamado quando a imagem carregou (ou caiu no placeholder) */
  onSettled?(ok: boolean): void;
}

type Phase = "loading" | "ok" | "failed";

export const ArtworkImage = memo(function ArtworkImage({
  artworkId,
  shiny = false,
  size = 260,
  alt = "",
  className,
  showNotice = true,
  onSettled,
}: ArtworkImageProps) {
  const src = artworkId === null ? null : artworkUrl(artworkId, shiny);
  const [state, setState] = useState<{ src: string | null; phase: Phase; retry: number }>({ src, phase: "loading", retry: 0 });
  // troca de url (shiny, outra forma): reinicia o ciclo
  const current = state.src === src ? state : { src, phase: "loading" as Phase, retry: 0 };
  if (current !== state) setState(current);

  useEffect(() => {
    if (!src || current.phase !== "loading") return undefined;
    const timer = setTimeout(() => setState((s) => (s.src === src && s.phase === "loading" ? { ...s, phase: "failed" } : s)), ARTWORK_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [src, current.phase, current.retry]);

  // uma tentativa extra em segundo plano depois de cair no placeholder
  useEffect(() => {
    if (!src || current.phase !== "failed" || current.retry > 0) return undefined;
    const probe = new Image();
    probe.onload = () => setState((s) => (s.src === src ? { src, phase: "loading", retry: 1 } : s));
    probe.src = src;
    return () => {
      probe.onload = null;
    };
  }, [src, current.phase, current.retry]);

  useEffect(() => {
    if (current.phase !== "loading" || !src) onSettled?.(current.phase === "ok");
  }, [current.phase, src, onSettled]);

  if (!src) {
    return (
      <div className={`artwork artwork-missing ${className ?? ""}`.trim()} style={{ width: size }}>
        <ArtworkPlaceholder size={Math.round(size * 0.6)} notice={showNotice ? "notPokeapi" : null} />
      </div>
    );
  }
  if (current.phase === "failed") {
    return (
      <div className={`artwork artwork-failed ${className ?? ""}`.trim()} style={{ width: size }}>
        <ArtworkPlaceholder size={Math.round(size * 0.6)} />
      </div>
    );
  }
  return (
    <div className={`artwork ${className ?? ""}`.trim()} style={{ width: size, height: size }} data-phase={current.phase}>
      <img
        key={`${src}#${current.retry}`}
        className={`artwork-img${shiny ? " is-shiny" : ""}`}
        src={src}
        alt={alt}
        width={size}
        height={size}
        decoding="async"
        onLoad={() => setState((s) => (s.src === src ? { ...s, phase: "ok" } : s))}
        onError={() => setState((s) => (s.src === src ? { ...s, phase: "failed" } : s))}
      />
      {current.phase === "loading" ? (
        <span className="artwork-spinner">
          <PokeballSpinner size="sm" label={false} />
        </span>
      ) : null}
    </div>
  );
});
