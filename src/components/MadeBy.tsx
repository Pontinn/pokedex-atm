// Links do autor (quick sw-legacy-button, L2): "Feito por Pontin" (portfolio) e, logo abaixo, "GitHub", discretos no
// rodape da sidebar (desktop) e no fim do conteudo rolavel do <main> (mobile, sem flutuar; uma linha com separador).
// Sempre abrem em nova aba. <a> nao toca o som de clique (installClickSound so pega button/.switch/role=button).
import { useT } from "../i18n/useT";
import { ExternalLink, Github } from "./Icon";

export const PORTFOLIO_URL = "https://portfolio.pontin.dev";
export const GITHUB_URL = "https://github.com/Pontinn";

/** Rotulo curto da URL (sem esquema) para o subtitulo do sheet "Mais". */
export const shortUrl = (url: string) => url.replace(/^https:\/\//, "");

export function MadeByLinks({ variant }: { variant: "sidebar" | "foot" }) {
  const t = useT();
  return (
    <div className={`made-by-links made-by-${variant}`}>
      <a className="made-by" href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer" aria-label={t("shell.madeByLabel")} data-portfolio="">
        <span>{t("shell.madeBy")}</span>
        <ExternalLink aria-hidden="true" />
      </a>
      {variant === "foot" ? (
<span className="made-by-sep" aria-hidden="true" />
      ) : null}
      <a className="made-by" href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label={t("shell.githubLabel")} data-github="">
        <Github aria-hidden="true" />
        <span>{t("shell.github")}</span>
      </a>
    </div>
  );
}
