// Tela Sincronizar (F11, sem prototipo: UISPEC 8.1). Lazy pelo registro: qrcode, fflate e @zxing ficam neste chunk.
import "./sync.css";
import type { ScreenProps } from "../../components/ScreenRouter";
import { SegmentedControl } from "../../components/SegmentedControl";
import { useT } from "../../i18n/useT";
import { useNavigationActions, useScreenUi } from "../../navigation/useNavigation";
import { GenerateCodePanel } from "./GenerateCodePanel";
import { SyncExplainer } from "./SyncExplainer";

type Mode = "generate" | "receive";

export function SyncScreen(_props: ScreenProps) {
  const t = useT();
  const mode = useScreenUi("sync", "mode") ?? "generate";
  const { updateUi } = useNavigationActions();
  return (
    <section className="sync-screen" data-screen="sync">
      <div className="page-head">
        <h2>{t("sync.title")}</h2>
      </div>
      <div className="sync-body">
        <SyncExplainer />
        <SegmentedControl<Mode>
          className="sync-mode-seg"
          ariaLabel={t("sync.title")}
          value={mode}
          onChange={(m) => updateUi<"sync">({ mode: m })}
          options={[
            { value: "generate", label: t("sync.generate") },
            { value: "receive", label: t("sync.receive") },
          ]}
        />
        {mode === "generate" ? <GenerateCodePanel /> : null}
      </div>
    </section>
  );
}
