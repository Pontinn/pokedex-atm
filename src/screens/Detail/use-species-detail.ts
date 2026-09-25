// Carrega a ficha da especie (F4; consome loadSpecies de src/data/loaders.ts, B7.4, sem redefinir). Dex fora do
// indice do dataset atual (link antigo/orfao) = "notFound" sem nem pedir o arquivo.
import { useCallback, useEffect, useState } from "react";
import type { SpeciesDetail } from "../../data/types";
import { loadSpecies } from "../../data/loaders";
import { useDatasetStore } from "../../state/dataset-store";

export type SpeciesDetailState =
  | { status: "loading"; detail: null }
  | { status: "ready"; detail: SpeciesDetail }
  | { status: "notFound"; detail: null }
  | { status: "error"; detail: null };

export function useSpeciesDetail(dex: number): SpeciesDetailState & { retry(): void } {
  const index = useDatasetStore((s) => s.speciesIndex);
  const known = index ? index.some((s) => s.dex === dex) : null;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ key: string; value: SpeciesDetailState }>({ key: "", value: { status: "loading", detail: null } });
  const key = `${dex}#${attempt}`;

  useEffect(() => {
    if (known !== true) return undefined;
    let alive = true;
    loadSpecies(dex).then(
      (detail) => alive && setState({ key, value: { status: "ready", detail } }),
      (err: unknown) => {
        console.warn("[detail] loadSpecies failed", err);
        if (alive) setState({ key, value: { status: "error", detail: null } });
      },
    );
    return () => {
      alive = false;
    };
  }, [dex, known, key]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  if (known === false) return { status: "notFound", detail: null, retry };
  if (state.key !== key) return { status: "loading", detail: null, retry };
  return { ...state.value, retry };
}
