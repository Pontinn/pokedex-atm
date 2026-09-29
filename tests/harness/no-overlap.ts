// Regra geral "Sem sobreposicao de texto" (SPEC, Frontend): nenhum texto visivel pode cruzar outro texto ou um
// controle (botao, selo, chip, icone, imagem, input) que nao seja seu ancestral/descendente. Compara os retangulos
// (Range.getClientRects dos nos de texto e getBoundingClientRect dos controles) com tolerancia de 1 px.
// Criado em F1.4; toda feature de frontend e o T1 reutilizam. Headless, sem timers.
import { expect, type Locator, type Page } from "@playwright/test";

export interface OverlapIssue {
  a: string;
  b: string;
  rectA: [number, number, number, number];
  rectB: [number, number, number, number];
}

export interface NoOverlapOptions {
  /** tolerancia em px (padrao 1) */
  tolerance?: number;
  /** seletores extras tratados como controle */
  controls?: string[];
  /** seletores ignorados (ex. decoracao que pode ficar por baixo do texto de proposito) */
  ignore?: string[];
}

export const DEFAULT_CONTROL_SELECTORS = [
  "button",
  "[role='button']",
  "a[href]",
  "input",
  "select",
  "textarea",
  "img",
  "svg",
  ".badge",
  ".chip",
  ".tag",
  ".tgl",
  ".seg",
  ".switch",
];

/** Lista os pares sobrepostos dentro de `root` (seletor CSS ou Locator). */
export async function findOverlaps(page: Page, root: string | Locator, opts: NoOverlapOptions = {}): Promise<OverlapIssue[]> {
  const handle = typeof root === "string" ? page.locator(root).first() : root.first();
  return handle.evaluate(
    (rootEl, cfg) => {
      const tol = cfg.tolerance;
      const ignoreSel = cfg.ignore.join(",");
      const isIgnored = (el: Element) => (ignoreSel ? !!el.closest(ignoreSel) : false);
      const visible = (el: Element) => {
        for (let n: Element | null = el; n; n = n.parentElement) {
          const cs = getComputedStyle(n);
          if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) return false;
        }
        return true;
      };
      const describe = (el: Element) => {
        const cls = typeof el.className === "string" && el.className ? `.${el.className.trim().split(/\s+/).join(".")}` : "";
        const text = (el.textContent ?? "").trim().slice(0, 30);
        return `${el.tagName.toLowerCase()}${cls}${text ? ` "${text}"` : ""}`;
      };
      type Box = { el: Element; r: { left: number; top: number; right: number; bottom: number }; kind: "text" | "control"; node?: Node };
      const boxes: Box[] = [];
      const inViewport = (r: DOMRect) => r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;

      // Parte VISIVEL do retangulo: recorta pelos ancestrais com overflow diferente de visible (ex. linhas escondidas
      // por line-clamp + overflow:hidden continuam em getClientRects, mas o usuario nao as ve). null = nada visivel.
      const clipRect = (el: Element, r: DOMRect): DOMRect | null => {
        let left = r.left;
        let top = r.top;
        let right = r.right;
        let bottom = r.bottom;
        for (let n: Element | null = el; n && n !== document.documentElement; n = n.parentElement) {
          const cs = getComputedStyle(n);
          const clipX = cs.overflowX !== "visible";
          const clipY = cs.overflowY !== "visible";
          if (!clipX && !clipY) continue;
          const c = n.getBoundingClientRect();
          if (clipX) {
            left = Math.max(left, c.left);
            right = Math.min(right, c.right);
          }
          if (clipY) {
            top = Math.max(top, c.top);
            bottom = Math.min(bottom, c.bottom);
          }
          if (right - left <= 0 || bottom - top <= 0) return null;
        }
        return new DOMRect(left, top, right - left, bottom - top);
      };

      // textos: um retangulo por linha de cada no de texto nao vazio (so a parte visivel)
      const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.textContent || !n.textContent.trim()) continue;
        const parent = n.parentElement;
        if (!parent || isIgnored(parent) || !visible(parent)) continue;
        const range = document.createRange();
        range.selectNodeContents(n);
        for (const raw of Array.from(range.getClientRects())) {
          const r = clipRect(parent, raw);
          if (r && inViewport(r)) boxes.push({ el: parent, r, kind: "text", node: n });
        }
      }
      // controles
      const seen = new Set<Element>();
      for (const el of Array.from(rootEl.querySelectorAll(cfg.controls.join(",")))) {
        if (seen.has(el) || isIgnored(el) || !visible(el)) continue;
        seen.add(el);
        const r = el.getBoundingClientRect();
        if (inViewport(r)) boxes.push({ el, r, kind: "control" });
      }

      const issues: { a: string; b: string; rectA: [number, number, number, number]; rectB: [number, number, number, number] }[] = [];
      const related = (x: Element, y: Element) => x === y || x.contains(y) || y.contains(x);
      for (let i = 0; i < boxes.length; i++) {
        const A = boxes[i]!;
        if (A.kind !== "text") continue;
        for (let j = 0; j < boxes.length; j++) {
          if (i === j) continue;
          const B = boxes[j]!;
          if (B.kind === "text" && (j < i || B.node === A.node)) continue;
          // ancestral/descendente (rotulo dentro do proprio botao) nao conta; icone irmao dentro do botao conta
          if (related(A.el, B.el)) continue;
          const a = A.r;
          const b = B.r;
          const overlap = a.left < b.right - tol && b.left < a.right - tol && a.top < b.bottom - tol && b.top < a.bottom - tol;
          if (overlap) {
            issues.push({
              a: describe(A.el),
              b: describe(B.el),
              rectA: [a.left, a.top, a.right, a.bottom].map(Math.round) as [number, number, number, number],
              rectB: [b.left, b.top, b.right, b.bottom].map(Math.round) as [number, number, number, number],
            });
          }
        }
      }
      return issues;
    },
    {
      tolerance: opts.tolerance ?? 1,
      controls: [...DEFAULT_CONTROL_SELECTORS, ...(opts.controls ?? [])],
      ignore: opts.ignore ?? [],
    },
  );
}

/** Falha o teste se houver sobreposicao dentro de `root`. */
export async function expectNoOverlap(page: Page, root: string | Locator, opts: NoOverlapOptions = {}): Promise<void> {
  const issues = await findOverlaps(page, root, opts);
  expect(issues, `text overlap in ${typeof root === "string" ? root : "locator"}`).toEqual([]);
}
