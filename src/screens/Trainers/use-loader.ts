// Carrega um recurso do dataset sob demanda (loaders de B7.4 ja tem cache e retry) com estado e "Tentar de novo".
import { useCallback, useEffect, useState } from "react";

export interface LoaderState<T> {
  data: T | null;
  error: unknown;
  loading: boolean;
  retry(): void;
}

export function useLoader<T>(load: (() => Promise<T>) | null, deps: readonly unknown[]): LoaderState<T> {
  const [state, setState] = useState<{ data: T | null; error: unknown; loading: boolean }>({ data: null, error: null, loading: load !== null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!load) {
      setState({ data: null, error: null, loading: false });
      return undefined;
    }
    let alive = true;
    setState((s) => ({ data: s.data, error: null, loading: true }));
    load().then(
      (data) => alive && setState({ data, error: null, loading: false }),
      (error: unknown) => {
        console.warn("[loader] failed", error);
        if (alive) setState({ data: null, error, loading: false });
      },
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}
