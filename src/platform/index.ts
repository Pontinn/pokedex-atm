// Deteccao de plataforma (Fase 1: sempre web).
import { webPlatform, type Platform } from "./web";

export type { Platform };
export { setInstallPromptAvailable } from "./web";

export const platform: Platform = webPlatform;
