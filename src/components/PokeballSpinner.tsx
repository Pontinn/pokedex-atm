// Spinner padrao de carregamento (RF-125): a pokebola girando, em 3 tamanhos.
import pokeballUrl from "../assets/pokeball.webp";
import { useT } from "../i18n/useT";

export type SpinnerSize = "sm" | "md" | "lg";

export function PokeballSpinner({ size = "md", label = true }: { size?: SpinnerSize; label?: boolean }) {
  const t = useT();
  return (
    <div className={`pb-spinner pb-spinner-${size}`} role="status" aria-live="polite">
      <img className="spin" src={pokeballUrl} alt="" />
      {label ? <span className="pb-spinner-label">{t("boot.loading")}</span> : null}
    </div>
  );
}
