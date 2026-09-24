// Placeholder de artwork (RF-09/RF-16): silhueta preta da pokebola (como .cap-art, UISPEC 8.4) + aviso opcional.
import pokeballUrl from "../assets/pokeball.webp";
import { useT } from "../i18n/useT";

export type ArtworkNotice = "unavailable" | "notPokeapi" | null;

export function ArtworkPlaceholder({ size = 160, notice = null }: { size?: number; notice?: ArtworkNotice }) {
  const t = useT();
  return (
    <div className="art-placeholder" style={{ width: size }}>
      <img className="art-placeholder-img" src={pokeballUrl} alt="" width={size} height={size} />
      {notice ? (
        <span className="art-placeholder-notice">
          {t(notice === "notPokeapi" ? "error.imageNotPokeapi" : "error.imageUnavailable")}
        </span>
      ) : null}
    </div>
  );
}
