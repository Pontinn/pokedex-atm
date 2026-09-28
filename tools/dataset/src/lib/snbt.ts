// Leitor SNBT minimo (formato dos arquivos do FTB Quests): compound `{ chave: valor }` (separador quebra de linha ou
// virgula), lista `[ ... ]` (inclusive `[I; 1, 2]`), string com aspas (duplas ou simples, com escapes), numero com
// sufixo (`1.0d`, `2L`, `3b`...), `true`/`false` e palavra solta. Numero vira `number` (long grande vira string).
export type Snbt = string | number | boolean | Snbt[] | { [key: string]: Snbt };

const BARE = /[A-Za-z0-9_.+-]/;

export function parseSnbt(text: string): Snbt {
  let i = 0;
  const ws = () => {
    while (i < text.length && /[\s,]/.test(text[i] as string)) i++;
  };
  const str = (): string => {
    const q = text[i++];
    let out = "";
    while (i < text.length && text[i] !== q) {
      if (text[i] === "\\") {
        i++;
        const c = text[i++];
        out += c === "n" ? "\n" : c === "t" ? "\t" : (c ?? "");
      } else out += text[i++];
    }
    i++;
    return out;
  };
  const bare = (): string => {
    const start = i;
    while (i < text.length && BARE.test(text[i] as string)) i++;
    if (start === i) throw new Error(`SNBT: caractere inesperado '${text[i]}' em ${i}`);
    return text.slice(start, i);
  };
  const scalar = (raw: string): Snbt => {
    if (raw === "true") return true;
    if (raw === "false") return false;
    const m = /^(-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)([bBsSlLfFdD]?)$/.exec(raw);
    if (!m) return raw;
    const n = Number(m[1]);
    return Number.isSafeInteger(n) || !Number.isInteger(n) ? n : (m[1] as string);
  };
  const value = (): Snbt => {
    ws();
    const c = text[i];
    if (c === "{") {
      i++;
      const obj: { [key: string]: Snbt } = {};
      for (;;) {
        ws();
        if (text[i] === "}") {
          i++;
          return obj;
        }
        const key = text[i] === '"' || text[i] === "'" ? str() : bare();
        ws();
        if (text[i] !== ":") throw new Error(`SNBT: ':' esperado em ${i}`);
        i++;
        obj[key] = value();
      }
    }
    if (c === "[") {
      i++;
      if (/^[BIL];/.test(text.slice(i, i + 2))) i += 2;
      const arr: Snbt[] = [];
      for (;;) {
        ws();
        if (text[i] === "]") {
          i++;
          return arr;
        }
        arr.push(value());
      }
    }
    if (c === '"' || c === "'") return str();
    return scalar(bare());
  };
  const out = value();
  return out;
}

export const isSnbtObject = (v: unknown): v is { [key: string]: Snbt } => typeof v === "object" && v !== null && !Array.isArray(v);
