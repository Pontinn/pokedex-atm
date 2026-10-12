// Selo de geracao (pokemon-generation, UISPEC secoes 3 e 4): construido sobre Badge/.badge com a classe badge-gen
// (--secondary-soft + --text). Rotulo curto no card e no estagio da cadeia ("Gen 1", "Gen 7 (Let's Go)",
// "Gen 8 (Arceus)", "Pack"); longo no Hero ("Geração 1" pela chave dex.genN). Valor fora da tabela = sem selo.
import { Badge } from "../../components/Badge";
import { useT, type TranslateFn } from "../../i18n/useT";

export type GenerationForm = "short" | "long";

/** Rotulo do selo; null para valor desconhecido (nunca lanca). */
export function generationLabel(gen: string, form: GenerationForm, t: TranslateFn): string | null {
  if (gen === "custom") return t("dex.genBadgePack");
  if (gen === "gen7b") return t("dex.genBadge7b");
  if (gen === "gen8a") return t("dex.genBadge8a");
  const m = /^gen(\d+)$/.exec(gen);
  if (!m) return null;
  const n = Number(m[1]);
  return form === "short" ? t("dex.genBadge", { n }) : t("dex.genN", { n });
}

export function GenerationBadge({
  generation,
  form,
  className,
  label,
}: {
  generation: string | null | undefined;
  form: GenerationForm;
  className?: string;
  label?: string;
}) {
  const t = useT();
  const text = generation ? generationLabel(generation, form, t) : null;
  return text ? (
    <Badge className={`badge-gen${className ? ` ${className}` : ""}`} label={label}>
      {text}
    </Badge>
  ) : null;
}
