// Raiz do app (F1.4): boot splash por cima do shell e a fila de toasts.
import { AppShell } from "./components/AppShell";
import { BootSplash } from "./components/BootSplash";
import { ToastHost } from "./components/Toast";

export function App() {
  return (
    <>
      <AppShell />
      <ToastHost />
      <BootSplash />
    </>
  );
}
