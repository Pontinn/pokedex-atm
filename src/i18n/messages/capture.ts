// Mensagens i18n do modulo "capture". Dono: agente A (animacao de captura).
// Cada agente acrescenta chaves SO no(s) proprio(s) modulo(s); o agregador e src/i18n/messages.ts.
import type { Message } from "./types";

export const CAPTURE_MESSAGES = {
  "capture.caught": { pt: "Capturado!", en: "Caught!" },
  "capture.close": { pt: "Fechar", en: "Close" },
  "capture.skip": { pt: "Toque para pular", en: "Tap to skip" },
} as const satisfies Record<string, Message>;
