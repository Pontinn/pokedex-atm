// Chip de tipo (prototipo chip(), app.js:676; RF-87). Estado "nao selecionado" em filtros = sem .on (contorno), nunca opacidade.
import type { TypeId } from "../data/types";
import type { UiLanguage } from "../storage/types";
import { TYPE_NAMES } from "../i18n/types";
import { TypeIcon } from "./TypeIcon";

export type TypeChipSize = "sm" | "md" | "lg";

export interface TypeChipProps {
  type: TypeId;
  lang: UiLanguage;
  size?: TypeChipSize;
  /** selecionado (filtros); undefined = chip informativo */
  selected?: boolean;
  className?: string;
}

export function typeName(type: TypeId, lang: UiLanguage): string {
  const name = TYPE_NAMES[type][lang];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function TypeChip({ type, lang, size = "md", selected, className }: TypeChipProps) {
  const classes = ["chip", `t-${type}`];
  if (size !== "md") classes.push(size);
  if (selected) classes.push("on");
  if (className) classes.push(className);
  return (
    <span className={classes.join(" ")} data-type={type}>
      <TypeIcon type={type} />
      <span>{typeName(type, lang)}</span>
    </span>
  );
}
