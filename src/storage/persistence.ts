// Armazenamento duravel (SPEC 5.3): chamado no 1o gesto do usuario (F1.4); resultado exibido em Configuracoes > Sobre.
let persisted: boolean | null = null;

export async function requestPersistence(): Promise<boolean> {
  try {
    const storage = typeof navigator === "undefined" ? undefined : navigator.storage;
    persisted = storage?.persist ? await storage.persist() : false;
  } catch {
    persisted = false;
  }
  return persisted;
}

/** null = ainda nao solicitado. */
export function getPersistenceResult(): boolean | null {
  return persisted;
}
