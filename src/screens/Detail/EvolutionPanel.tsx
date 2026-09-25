// Cadeia de evolucao (F4.3; porta evoHTML app.js:839-850, style.css:530-564). Linear quando cada no tem <= 1 saida;
// ramificada (Eevee) quando algum no tem > 1. Cada aresta mostra o metodo EXATO do Cobblemon (RF-19): item clicavel
// (RF-71), nivel, amizade, horario, golpe de tipo, item segurado, troca; "Condicao especial" com o raw no tooltip.
// Nos clicaveis abrem a ficha; no ausente do dataset renderiza sem link. Som `evolution_ui` uma vez por montagem.
import { Fragment, memo, useEffect, useState, type CSSProperties } from "react";
import { playSfx } from "../../audio/sfx";
import { ArrowRight } from "../../components/Icon";
import { ItemTile } from "../../components/ItemTile";
import { TermsToggle } from "../../components/TermsToggle";
import type { EvolutionChain, EvolutionChainNode, EvolutionEdge, ItemsFile } from "../../data/types";
import { loadItems } from "../../data/loaders";
import { typeName } from "../../components/TypeChip";
import { gameName, useT } from "../../i18n/useT";
import { useNavigationActions } from "../../navigation/useNavigation";
import { useKnownDexSet } from "../../state/captured-store";
import { useTermsLanguage } from "../../state/preferences-store";
import type { UiLanguage } from "../../storage/types";
import { SpeciesSprite } from "../Home/SpeciesSprite";

/** textura do dataset ("assets/items/x.png") -> caminho aceito pelo ItemTile (relativo a /assets/items/) */
export function itemTexture(texture: string | null | undefined): string | null {
  return texture ? texture.replace(/^\/?assets\/items\//, "") : null;
}

export function useItems(): ItemsFile | null {
  const [items, setItems] = useState<ItemsFile | null>(null);
  useEffect(() => {
    let alive = true;
    loadItems().then(
      (data) => alive && setItems(data),
      (err: unknown) => console.warn("[detail] loadItems failed", err),
    );
    return () => {
      alive = false;
    };
  }, []);
  return items;
}

function humanItem(id: string): string {
  const path = id.includes(":") ? id.slice(id.indexOf(":") + 1) : id;
  return path.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type T = (key: string, vars?: Record<string, string | number>) => string;

/** Partes de texto do metodo (sem o item clicavel, que e renderizado a parte). */
export function methodParts(edge: EvolutionEdge, t: T, lang: UiLanguage, itemName: (id: string) => string): string[] {
  const parts: string[] = [];
  for (const r of edge.requirements) {
    if (r.kind === "level") parts.push(t("evo.levelN", { n: r.minLevel }));
    else if (r.kind === "friendship") parts.push(t("evo.friendshipN", { n: r.amount }));
    else if (r.kind === "timeRange") parts.push(r.range === "night" ? t("evo.night") : r.range === "day" ? t("evo.day") : r.range);
    else if (r.kind === "hasMoveType") parts.push(t("evo.moveType", { type: typeName(r.type, lang) }));
    else if (r.kind === "heldItem") parts.push(t("evo.holding", { item: itemName(r.item) }));
    else parts.push(t("evo.special"));
  }
  if (edge.variant === "trade") parts.unshift(t("evo.trade"));
  if (parts.length === 0 && !edge.requiredItem) parts.push(edge.variant === "level_up" ? t("evo.levelUp") : t("evo.special"));
  return parts;
}

function rawTooltip(edge: EvolutionEdge): string | undefined {
  const raws = edge.requirements.filter((r) => r.kind === "other").map((r) => JSON.stringify((r as { raw: unknown }).raw));
  return raws.length ? raws.join("\n") : undefined;
}

const MethodChip = memo(function MethodChip({ edge, items, lang }: { edge: EvolutionEdge; items: ItemsFile | null; lang: UiLanguage }) {
  const t = useT();
  const { navigate } = useNavigationActions();
  const itemName = (id: string) => (items?.[id] ? gameName(items[id], lang) : humanItem(id));
  const parts = methodParts(edge, t, lang, itemName);
  const item = edge.requiredItem;
  return (
    <span className="method" title={rawTooltip(edge)} data-edge={edge.id}>
      {item ? (
        <button
          type="button"
          className="evo-item it-link"
          data-nav=""
          data-item={item}
          onClick={(e) => {
            e.stopPropagation();
            navigate("item", { itemId: item });
          }}
        >
          <ItemTile texture={itemTexture(items?.[item]?.texture)} size={18} />
          <span>{itemName(item)}</span>
        </button>
      ) : null}
      {parts.length ? <span className="method-text">{(item ? " + " : "") + parts.join(" + ")}</span> : null}
    </span>
  );
});

function EvoNode({ node, current, known, lang }: { node: EvolutionChainNode; current: boolean; known: boolean; lang: UiLanguage }) {
  const { navigate } = useNavigationActions();
  const body = (
    <>
      <SpeciesSprite species={{ dex: node.dex, hasSprite: node.dex < 9000 }} />
      <span className="evo-name">{gameName(node, lang)}</span>
    </>
  );
  if (!known || current) {
    return (
      <div className={`evo${current ? " current" : ""}`} data-evo={node.dex}>
        {body}
      </div>
    );
  }
  return (
    <button type="button" className="evo" data-evo={node.dex} data-nav="" onClick={() => navigate("detail", { dex: node.dex })}>
      {body}
    </button>
  );
}

const EvolutionChainView = memo(function EvolutionChainView({ chain, currentDex }: { chain: EvolutionChain; currentDex: number }) {
  const t = useT();
  const lang = useTermsLanguage("evo");
  const items = useItems();
  const known = useKnownDexSet();
  const byDex = new Map(chain.nodes.map((n) => [n.dex, n]));
  const outgoing = new Map<number, EvolutionEdge[]>();
  for (const e of chain.edges) outgoing.set(e.from, [...(outgoing.get(e.from) ?? []), e]);
  const isKnown = (dex: number) => (known ? known.has(dex) : true);
  const node = (dex: number) => byDex.get(dex) ?? { dex, slug: String(dex), name: { pt: String(dex), en: String(dex) }, types: [] };

  if (chain.edges.length === 0) return <p className="muted evo-none">{t("evo.none")}</p>;

  const branching = [...outgoing.values()].some((list) => list.length > 1);
  if (branching) {
    const rootDex = [...outgoing.entries()].find(([, list]) => list.length > 1)?.[0] ?? chain.root;
    const pre = chain.edges.filter((e) => e.to === rootDex);
    return (
      <div className="evo-branching">
        <div className="evo-root">
          {pre.map((e) => (
            <EvoNode key={e.from} node={node(e.from)} current={e.from === currentDex} known={isKnown(e.from)} lang={lang} />
          ))}
          <EvoNode node={node(rootDex)} current={rootDex === currentDex} known={isKnown(rootDex)} lang={lang} />
          <span className="evo-root-label">{t("evo.branches")}</span>
        </div>
        <div className="evo-branches">
          {(outgoing.get(rootDex) ?? []).map((e, i) => (
            <div className="evo-branch" key={e.id} style={{ "--i": i } as CSSProperties} data-to={e.to}>
              <div className="evo-edge">
                <span className="arr">
                  <ArrowRight />
                </span>
                <MethodChip edge={e} items={items} lang={lang} />
              </div>
              <EvoNode node={node(e.to)} current={e.to === currentDex} known={isKnown(e.to)} lang={lang} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // linear: segue a raiz pelas arestas unicas
  const sequence: { dex: number; edge: EvolutionEdge | null }[] = [{ dex: chain.root, edge: null }];
  const seen = new Set([chain.root]);
  for (let cur = chain.root; ; ) {
    const next = outgoing.get(cur)?.[0];
    if (!next || seen.has(next.to)) break;
    seen.add(next.to);
    sequence.push({ dex: next.to, edge: next });
    cur = next.to;
  }
  return (
    <div className="evo-chain">
      {sequence.map((s) => (
        <Fragment key={s.dex}>
          {s.edge ? (
            <div className="evo-arrow">
              <span className="arr">
                <ArrowRight />
              </span>
              <MethodChip edge={s.edge} items={items} lang={lang} />
            </div>
          ) : null}
          <EvoNode node={node(s.dex)} current={s.dex === currentDex} known={isKnown(s.dex)} lang={lang} />
        </Fragment>
      ))}
    </div>
  );
});

export const EvolutionPanel = memo(function EvolutionPanel({ chain, currentDex }: { chain: EvolutionChain; currentDex: number }) {
  const t = useT();
  const evolves = chain.edges.length > 0;
  useEffect(() => {
    if (evolves) playSfx("evolution_ui");
  }, [evolves]);
  return (
    <div className="panel evo-panel" id="evo-panel" style={{ "--i": 3 } as CSSProperties}>
      <div className="panel-head">
        <h3>{t("detail.evo")}</h3>
        <TermsToggle cardKey="evo" />
      </div>
      <EvolutionChainView chain={chain} currentDex={currentDex} />
    </div>
  );
});
