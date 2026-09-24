// ErrorBoundary por tela (regra geral de Frontend): mensagem + "Tentar de novo" + "Voltar ao inicio".
import { Component, type ErrorInfo, type ReactNode } from "react";
import { useT } from "../i18n/useT";

function ErrorFallback({ onRetry, onHome }: { onRetry(): void; onHome?: () => void }) {
  const t = useT();
  return (
    <div className="card error-fallback" role="alert">
      <h2>{t("error.title")}</h2>
      <div className="error-fallback-actions">
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          {t("error.retry")}
        </button>
        {onHome ? (
          <button type="button" className="btn btn-ghost" onClick={onHome}>
            {t("error.home")}
          </button>
        ) : null}
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  onHome?: () => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, { error: unknown }> {
  state = { error: null as unknown };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.warn("[ui] screen crashed", error, info.componentStack);
  }

  private retry = () => this.setState({ error: null });

  private home = () => {
    this.setState({ error: null });
    this.props.onHome?.();
  };

  render() {
    if (this.state.error) {
      return <ErrorFallback onRetry={this.retry} onHome={this.props.onHome ? this.home : undefined} />;
    }
    return this.props.children;
  }
}
