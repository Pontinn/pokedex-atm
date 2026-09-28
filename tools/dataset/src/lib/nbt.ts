// Leitor NBT binario minimo (estruturas `.nbt` do Minecraft: gzip + big-endian). Devolve objetos/arrays JS;
// long vira bigint, arrays tipados viram arrays de number/bigint. So leitura, sem dependencia externa.
import { gunzipSync } from "node:zlib";

export type Nbt = number | bigint | string | Nbt[] | { [key: string]: Nbt };

export function parseNbt(bytes: Uint8Array): Nbt {
  const buf = bytes[0] === 0x1f && bytes[1] === 0x8b ? gunzipSync(bytes) : Buffer.from(bytes);
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let p = 0;
  const utf = (): string => {
    const len = view.getUint16(p);
    p += 2;
    const s = buf.toString("utf8", p, p + len);
    p += len;
    return s;
  };
  const payload = (type: number): Nbt => {
    switch (type) {
      case 1:
        return view.getInt8(p++);
      case 2: {
        const v = view.getInt16(p);
        p += 2;
        return v;
      }
      case 3: {
        const v = view.getInt32(p);
        p += 4;
        return v;
      }
      case 4: {
        const v = view.getBigInt64(p);
        p += 8;
        return v;
      }
      case 5: {
        const v = view.getFloat32(p);
        p += 4;
        return v;
      }
      case 6: {
        const v = view.getFloat64(p);
        p += 8;
        return v;
      }
      case 7:
      case 11:
      case 12: {
        const n = view.getInt32(p);
        p += 4;
        const out: Nbt[] = [];
        for (let k = 0; k < n; k++) out.push(payload(type === 7 ? 1 : type === 11 ? 3 : 4));
        return out;
      }
      case 8:
        return utf();
      case 9: {
        const inner = view.getInt8(p++);
        const n = view.getInt32(p);
        p += 4;
        const out: Nbt[] = [];
        for (let k = 0; k < n; k++) out.push(payload(inner));
        return out;
      }
      case 10: {
        const obj: { [key: string]: Nbt } = {};
        for (;;) {
          const t = view.getInt8(p++);
          if (t === 0) return obj;
          const name = utf();
          obj[name] = payload(t);
        }
      }
      default:
        throw new Error(`NBT: tag desconhecida ${type} em ${p}`);
    }
  };
  const rootType = view.getInt8(p++);
  utf(); // nome da raiz
  return payload(rootType);
}

export const isNbtObject = (v: unknown): v is { [key: string]: Nbt } => typeof v === "object" && v !== null && !Array.isArray(v);
