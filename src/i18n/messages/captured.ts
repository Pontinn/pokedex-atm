// Mensagens i18n do modulo "captured". Dono: agente A (Capturados).
// Cada agente acrescenta chaves SO no(s) proprio(s) modulo(s); o agregador e src/i18n/messages.ts.
import type { Message } from "./types";

export const CAPTURED_MESSAGES = {
  "captured.recent": { pt: "Recentes", en: "Recent" },
  "captured.on": { pt: "Capturado em", en: "Caught on" },
} as const satisfies Record<string, Message>;
