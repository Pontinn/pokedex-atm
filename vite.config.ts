import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as { version: string };

/** Versao publicada do dataset (public/data/current.json); ausente = build sem dataset, sem JSON no precache. */
function readDatasetVersion(): string | null {
  try {
    const raw = JSON.parse(readFileSync(new URL("./public/data/current.json", import.meta.url), "utf8")) as {
      datasetVersion?: unknown;
    };
    return typeof raw.datasetVersion === "string" && /^[\w.-]+$/.test(raw.datasetVersion) ? raw.datasetVersion : null;
  } catch {
    return null;
  }
}

const datasetVersion = readDatasetVersion();

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // atualizacao automatica (Pontin 2026-09-28): sem botao "Atualizar". O SW novo ativa na hora e o
      // register-sw.ts recarrega a pagina uma vez no controllerchange.
      registerType: "autoUpdate",
      injectRegister: false,
      includeAssets: ["icons/*.png"],
      // F12.1 (RF-103, SPEC 2.5): manifest instalavel com os icones da pokebola gerados em B1.4.
      manifest: {
        name: "Pontindex",
        short_name: "Pontindex",
        description: "Pokedex do All the Mons (Cobblemon)",
        lang: "pt-BR",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#B0CDF3",
        theme_color: "#DC0A2D",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // precache = app shell + ponteiro do dataset + os 3 JSON do boot + efeitos sonoros (SPEC 2.5).
        // current.json vai no precache (e nao no runtime CacheFirst): ele NAO tem versao no caminho, entao so
        // pode mudar junto com um SW novo (revisao do precache), nunca ficar preso num cache antigo.
        globPatterns: [
          "**/*.{js,css,html,svg,woff2}",
          // imagens do shell empacotadas pelo Vite (pokebola, mascara da marca d'agua); "assets/*" NAO desce para
          // assets/items|sprites (runtime cache)
          "assets/*.{webp,png}",
          "data/current.json",
          ...(datasetVersion ? [`data/${datasetVersion}/{dataset-manifest,species-index,type-chart}.json`] : []),
          "assets/sfx/*.ogg",
        ],
        maximumFileSizeToCacheInBytes: 4_000_000,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/data\//, /^\/assets\//],
        cleanupOutdatedCaches: true,
        // com injectRegister false o plugin NAO liga estes dois sozinho para o autoUpdate (so com injectRegister
        // "auto"): o SW novo pula a espera e assume as abas abertas na hora.
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // artwork grande da PokeAPI (RF-102): opaco (img sem CORS), por isso status 0 tambem entra
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\//,
            handler: "CacheFirst",
            options: {
              cacheName: "pokeapi-artwork",
              expiration: { maxEntries: 600, maxAgeSeconds: 30 * 24 * 60 * 60, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // dataset versionado: o caminho carrega <datasetVersion>, entao CacheFirst nunca fica obsoleto
            urlPattern: /\/data\/(?!current\.json)[^?#]+\.json/,
            handler: "CacheFirst",
            options: {
              cacheName: "dataset",
              expiration: { purgeOnQuotaError: true },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // gritos tocam por <audio>: o navegador pede com Range, entao rangeRequests
            urlPattern: /\/assets\/cries\//,
            handler: "CacheFirst",
            options: {
              cacheName: "cries",
              expiration: { maxEntries: 300, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [200] },
              rangeRequests: true,
            },
          },
          {
            urlPattern: /\/assets\/sprites\//,
            handler: "CacheFirst",
            options: {
              cacheName: "sprites",
              expiration: { maxEntries: 1100, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: /\/assets\/items\//,
            handler: "CacheFirst",
            options: {
              cacheName: "items",
              expiration: { maxEntries: 1200, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@dataset-types": fileURLToPath(new URL("./src/data/types.ts", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    watch: {
      // Staging/cache do pipeline de dataset nao sao do app. No Windows o watcher do Vite segura handles das
      // pastas observadas e o rename do staging na publicacao falha com EPERM (e o dev server recarregava a toa).
      // coverage/: o vitest --coverage grava um arquivo por vez e cada um recarregava a pagina.
      ignored: ["**/tools/dataset/out/**", "**/tools/dataset/.cache/**", "**/coverage/**"],
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(pkg.version),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "vendor-react";
          if (/node_modules[\\/](fflate|qrcode|@zxing)[\\/]/.test(id)) return "vendor-sync";
          return undefined;
        },
      },
    },
  },
});
