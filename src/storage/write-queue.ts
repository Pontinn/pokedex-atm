// Fila que serializa escritas (SPEC 5.3): uma operacao por vez, na ordem de chegada; falha nao trava a fila.
export interface WriteQueue {
  run<T>(task: () => Promise<T>): Promise<T>;
}

export function createWriteQueue(): WriteQueue {
  let tail: Promise<unknown> = Promise.resolve();
  return {
    run<T>(task: () => Promise<T>): Promise<T> {
      const result = tail.then(task, task);
      tail = result.catch(() => undefined);
      return result;
    },
  };
}
