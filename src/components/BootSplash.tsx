// Boot splash (index.html:16-28, style.css:192-204 do prototipo; UISPEC 8.9): tampa da Pokedex fechada enquanto o
// dataset carrega; ao ficar pronto toca pokedex_open (RF-116) e abre (lidUp/lidDown). So na 1a abertura da sessao.
import { useEffect, useState } from "react";
import pokeballUrl from "../assets/pokeball.webp";
import { playSfx } from "../audio/sfx";
import { useT } from "../i18n/useT";
import { useDatasetStore } from "../state/dataset-store";
import { PokedexLens } from "./PokedexLens";

export type BootPhase = "closed" | "opening" | "done";

/** delay 1.4 s + animacao .7 s (style.css:194-195) + folga */
const BOOT_FALLBACK_MS = 2600;

/** boot so na 1a abertura da sessao (SPEC F1.4 passo 2) */
let bootSoundPlayed = false;

/** So para testes. */
export function resetBootSplash(): void {
  bootSoundPlayed = false;
}

export function BootSplash() {
  const t = useT();
  const ready = useDatasetStore((s) => s.ready);
  const [phase, setPhase] = useState<BootPhase>(bootSoundPlayed ? "done" : "closed");

  useEffect(() => {
    if (ready && phase === "closed") {
      // StrictMode roda o efeito 2x no dev: o flag garante 1 som por sessao
      if (!bootSoundPlayed) playSfx("pokedex_open");
      bootSoundPlayed = true;
      setPhase("opening");
    }
  }, [ready, phase]);

  // garantia: se animationend nao disparar (aba em segundo plano), remove a tampa depois da animacao
  useEffect(() => {
    if (phase !== "opening") return undefined;
    const timer = setTimeout(() => setPhase("done"), BOOT_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === "done") return null;
  return (
    <div
      className={`boot${phase === "opening" ? " opening" : ""}`}
      data-phase={phase}
      aria-hidden="true"
      onAnimationEnd={(e) => {
        if (e.target instanceof HTMLElement && e.target.classList.contains("boot-lid-top")) setPhase("done");
      }}
    >
      <div className="boot-lid boot-lid-top">
        <div className="boot-device">
          <PokedexLens size="lg" />
        </div>
      </div>
      <div className="boot-lid boot-lid-bottom">
        <img className="boot-ball" src={pokeballUrl} alt="" />
        <div className="boot-title">{t("shell.brand")}</div>
        <div className="boot-sub">{t("boot.loading")}</div>
      </div>
    </div>
  );
}
