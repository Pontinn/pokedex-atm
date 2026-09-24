// Migracao 0 -> 1 (SPEC 5b.3): importa as preferencias do prototipo (localStorage 'pontindex.terms' e
// 'pontindex.sound', app.js:654-655 e 1067/1407) para o doc `preferences` e remove as chaves depois do commit.
import { DOC_DEFAULTS } from "../defaults";
import type { PreferencesDoc } from "../types";
import type { Migration } from "./index";

export type LegacyStorage = Pick<Storage, "getItem" | "removeItem">;

export const LEGACY_TERMS_KEY = "pontindex.terms";
export const LEGACY_SOUND_KEY = "pontindex.sound";

function safeGet(storage: LegacyStorage | null, key: string): string | null {
  try {
    return storage ? storage.getItem(key) : null;
  } catch {
    return null;
  }
}

export function readLegacyPreferences(storage: LegacyStorage | null): Partial<PreferencesDoc> | null {
  const termsRaw = safeGet(storage, LEGACY_TERMS_KEY);
  const soundRaw = safeGet(storage, LEGACY_SOUND_KEY);
  if (termsRaw === null && soundRaw === null) return null;
  const patch: Partial<PreferencesDoc> = {};
  if (termsRaw !== null) {
    try {
      const parsed: unknown = JSON.parse(termsRaw);
      if (parsed && typeof parsed === "object") {
        const { d, o } = parsed as { d?: unknown; o?: unknown };
        if (d === "pt" || d === "en") patch.termsLanguage = d;
        if (o && typeof o === "object" && !Array.isArray(o)) {
          const overrides: Record<string, "pt" | "en"> = {};
          for (const [k, v] of Object.entries(o)) if (v === "pt" || v === "en") overrides[k] = v;
          patch.termsOverrides = overrides;
        }
      }
    } catch {
      // JSON invalido do prototipo: ignora e segue com os padroes
    }
  }
  if (soundRaw !== null) patch.soundEnabled = soundRaw !== "0";
  return patch;
}

export function createV1FromPrototypeMigration(storage: LegacyStorage | null): Migration {
  let imported = false;
  return {
    from: 0,
    to: 1,
    up(docs) {
      const legacy = readLegacyPreferences(storage);
      imported = legacy !== null;
      const base: PreferencesDoc = docs.preferences ?? structuredClone(DOC_DEFAULTS.preferences);
      return { ...docs, preferences: { ...base, ...(legacy ?? {}), schemaVersion: 1 } };
    },
    afterCommit() {
      if (!imported || !storage) return;
      try {
        storage.removeItem(LEGACY_TERMS_KEY);
        storage.removeItem(LEGACY_SOUND_KEY);
      } catch {
        // localStorage bloqueado: as chaves ficam, a migracao nao roda de novo (meta ja esta em v1)
      }
    },
  };
}
