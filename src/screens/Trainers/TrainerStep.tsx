// Um passo da linha do tempo (F8.2 passo 2; porta trStepHTML, app.js:1105-1121): estado done/next/bloqueado,
// "Requer um de: ..." por sublista (RF-61), Lv. max, item de spawn mini, biomas, "Cap -> N", checkbox Derrotado
// (RF-60) e acordeao com o time (TrainerTeam).
import { memo } from "react";
import { ArrowRight, Check, ChevronDown, MapPin, Swords } from "../../components/Icon";
import { ItemTile } from "../../components/ItemTile";
import type { BiomeLabels, ItemsFile, SpeciesSummary, TrainerInfo } from "../../data/types";
import { gameName, useT } from "../../i18n/useT";
import type { UiLanguage } from "../../storage/types";
import { TrainerTeam } from "./TrainerTeam";
import { biomeLabel, itemTexturePath, roleClass, type TrainerStepState } from "./trainer-model";

export interface TrainerStepProps {
  trainer: TrainerInfo;
  index: number;
  state: TrainerStepState;
  blocked: boolean;
  level: number;
  open: boolean;
  defeated: boolean;
  trainersById: ReadonlyMap<string, TrainerInfo>;
  speciesByDex: ReadonlyMap<number, SpeciesSummary>;
  items: ItemsFile | null;
  biomes: BiomeLabels | null;
  lang: UiLanguage;
  uiLang: UiLanguage;
  onToggleOpen(id: string): void;
  onToggleDefeated(id: string, defeated: boolean): void;
}

export const TrainerStep = memo(function TrainerStep(p: TrainerStepProps) {
  const t = useT();
  const { trainer } = p;
  const showRequires = p.blocked || trainer.requiredDefeats.some((g) => g.length > 1);
  const classes = ["tr-step", p.state];
  if (p.blocked) classes.push("blocked");
  if (p.open) classes.push("open");
  const signature = trainer.signatureItem ? p.items?.[trainer.signatureItem] : undefined;
  const bodyId = `tr-body-${trainer.id}`;
  return (
    <div className={classes.join(" ")} style={{ ["--i" as string]: Math.min(p.index, 12) }} data-trainer={trainer.id} data-state={p.state}>
      <div className="tr-line" />
      <div className="tr-dot" aria-hidden="true">
        {p.state === "done" ? <Check /> : <Swords />}
      </div>
      <div className="tr-card">
        <div className="tr-head">
          <button
            type="button"
            className="tr-toggle"
            aria-expanded={p.open}
            aria-controls={bodyId}
            onClick={() => p.onToggleOpen(trainer.id)}
          >
            <span className="tr-main">
              <span className="tr-name">
                <span className="tr-name-text">{trainer.name}</span>
                <span className={`badge ${roleClass(trainer.type)}`}>{gameName(trainer.typeLabel, p.uiLang)}</span>
              </span>
              {showRequires ? (
                <span className="tr-group">
                  {trainer.requiredDefeats
                    .filter((g) => g.length > 0)
                    .map((g, gi) => (
                      <span key={gi} className="tr-group-line">
                        {`${t("tr.requires")}: `}
                        {g.map((id, i) => {
                          const req = p.trainersById.get(id);
                          return (
                            <span key={id}>
                              {i > 0 ? " / " : ""}
                              {req ? req.name : id}
                              {req ? <em>{` (${gameName(req.typeLabel, p.uiLang)})`}</em> : null}
                            </span>
                          );
                        })}
                      </span>
                    ))}
                </span>
              ) : null}
              <span className="tr-meta">
                <span className="muted">
                  {t("tr.lvMax")} {trainer.maxTeamLevel}
                </span>
                {trainer.signatureItem ? (
                  <span className="tr-spawn-mini" title={`${t("tr.spawnItem")}: ${signature ? gameName(signature, p.lang) : trainer.signatureItem}`}>
                    <ItemTile texture={itemTexturePath(signature?.texture)} size={24} />
                  </span>
                ) : null}
                {trainer.biomes.whitelist.length > 0 ? (
                  <span className="tr-where">
                    <MapPin aria-hidden="true" />
                    {trainer.biomes.whitelist.map((b) => (
                      <span key={b} className="biome">
                        {gameName(biomeLabel(b, p.biomes), p.lang)}
                      </span>
                    ))}
                  </span>
                ) : null}
              </span>
            </span>
          </button>
          <div className="tr-capchip" data-testid="tr-capchip">
            <span>{t("tr.cap")}</span>
            <ArrowRight aria-hidden="true" />
            <b>{p.level}</b>
          </div>
          <label className="tr-check" title={t("tr.defeated")} data-silent>
            <input
              type="checkbox"
              checked={p.defeated}
              data-trd={trainer.id}
              onChange={(e) => p.onToggleDefeated(trainer.id, e.target.checked)}
            />
            <span />
            <em>{t("tr.defeated")}</em>
          </label>
          <button type="button" className="tr-caret" aria-label={trainer.name} aria-expanded={p.open} onClick={() => p.onToggleOpen(trainer.id)}>
            <ChevronDown aria-hidden="true" />
          </button>
        </div>
        <div className="tr-body-wrap" id={bodyId}>
          {p.open ? <TrainerTeam trainer={trainer} speciesByDex={p.speciesByDex} items={p.items} lang={p.lang} /> : null}
        </div>
      </div>
    </div>
  );
});
