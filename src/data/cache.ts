// Cache em memoria dos arquivos do dataset com dedup de requests em voo (SPEC B7.4).
export class MemoryCache<T = unknown> {
  private readonly values = new Map<string, T>();
  private readonly inFlight = new Map<string, Promise<T>>();

  /** Valor em cache, ou a promessa em voo, ou dispara `load` uma unica vez (falha nao fica em cache). */
  get(key: string, load: () => Promise<T>): Promise<T> {
    if (this.values.has(key)) return Promise.resolve(this.values.get(key) as T);
    const pending = this.inFlight.get(key);
    if (pending) return pending;
    const p = load().then(
      (v) => {
        this.values.set(key, v);
        this.inFlight.delete(key);
        return v;
      },
      (e: unknown) => {
        this.inFlight.delete(key);
        throw e;
      },
    );
    this.inFlight.set(key, p);
    return p;
  }

  has(key: string): boolean {
    return this.values.has(key);
  }

  clear(): void {
    this.values.clear();
    this.inFlight.clear();
  }
}
