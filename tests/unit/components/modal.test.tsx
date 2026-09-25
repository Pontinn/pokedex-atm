// T1: Modal (src/components/Modal.tsx, UISPEC 8.3): fechar por Esc, por clique no fundo e pelo X (confirmacao
// de fechamento); layout desktop (modal-layer) x mobile (sheet, useIsMobile < 900px).
// Regra do projeto: sem texto literal em JSX fora de src/i18n; o conteudo dos testes usa data-testid/aria-label.
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Modal } from "../../../src/components/Modal";

function setWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  window.dispatchEvent(new Event("resize"));
}

describe("Modal", () => {
  beforeEach(() => setWidth(1280));
  afterEach(() => cleanup());

  it("open=false nao renderiza nada", () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="titulo">
        <div data-testid="body" />
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("desktop: renderiza titulo e conteudo em modal-layer; Esc confirma o fechamento (onClose)", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="confirmar">
        <div data-testid="body" />
      </Modal>,
    );
    expect(document.querySelector(".modal-layer")).not.toBeNull();
    expect(document.querySelector(".modal-title")?.textContent).toBe("confirmar");
    expect(screen.getByTestId("body")).toBeTruthy();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("clique no fundo (.modal-bg) fecha; clique dentro do card nao fecha", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose}>
        <button type="button" aria-label="acao" data-testid="acao" />
      </Modal>,
    );
    fireEvent.click(screen.getByTestId("acao"));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(document.querySelector(".modal-bg")!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("botao X fecha (aria-label do i18n)", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="x">
        <div data-testid="body" />
      </Modal>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("mobile (< 900px): renderiza sheet-panel com sheet-handle em vez do modal-layer", () => {
    setWidth(390);
    render(
      <Modal open onClose={vi.fn()} title="sheet">
        <div data-testid="body" />
      </Modal>,
    );
    expect(document.querySelector(".modal-layer")).toBeNull();
    expect(document.querySelector(".sheet-panel")).not.toBeNull();
    expect(document.querySelector(".sheet-handle")).not.toBeNull();
  });

  it("sem title: nao renderiza modal-title", () => {
    render(
      <Modal open onClose={vi.fn()}>
        <div data-testid="body" />
      </Modal>,
    );
    expect(document.querySelector(".modal-title")).toBeNull();
  });
});
