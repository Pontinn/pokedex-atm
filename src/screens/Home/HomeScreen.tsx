// Tela Inicio (F2): hero com busca + botoes Pokedex/Aleatorio (F2.1), resumo de capturados, time e historico (F2.2).
// Porta design/prototipo/index.html:77-111 e app.js:699-724. Cada bloco le o proprio slice das stores (RF-04).
import "./home.css";
import pokeballUrl from "../../assets/pokeball.webp";
import { ArrowRight } from "../../components/Icon";
import type { ScreenProps } from "../../components/ScreenRouter";
import { useT } from "../../i18n/useT";
import { useNavigationActions } from "../../navigation/useNavigation";
import { useDatasetStore } from "../../state/dataset-store";
import { SearchBox } from "./SearchBox";

function HeroActions() {
  const t = useT();
  const { navigate, go } = useNavigationActions();
  const index = useDatasetStore((s) => s.speciesIndex);
  const random = () => {
    const pick = index?.[Math.floor(Math.random() * index.length)];
    if (pick) navigate("detail", { dex: pick.dex });
  };
  return (
    <div className="hero-actions">
      <button type="button" className="btn btn-primary" id="btn-random" data-nav="" disabled={!index} onClick={random}>
        <img className="btn-ball" src={pokeballUrl} alt="" />
        <span className="lbl-long">{t("home.random")}</span>
        <span className="lbl-short">{t("home.randomShort")}</span>
      </button>
      <button type="button" className="btn btn-ghost" id="btn-open-dex" data-nav="" onClick={() => go("dex")}>
        <span className="lbl-long">{t("home.openDex")}</span>
        <span className="lbl-short">{t("home.openDexShort")}</span>
        <ArrowRight />
      </button>
    </div>
  );
}

export function HomeScreen(_props: ScreenProps) {
  const t = useT();
  return (
    <section className="home-screen" data-screen="home">
      <div className="hero">
        <div className="hero-deco" />
        <div className="hero-text">
          <div className="eyebrow">{t("home.eyebrow")}</div>
          <h1>{t("home.title")}</h1>
        </div>
        <SearchBox />
        <HeroActions />
      </div>
    </section>
  );
}
