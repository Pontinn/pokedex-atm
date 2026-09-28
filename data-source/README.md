# data-source

Copia extraida (2026-09-23) dos arquivos da instancia **All the Mons 1.3.0** (Cobblemon 1.7.3) que o pipeline de dados do Pontindex le. Existe para rodar o build em um PC SEM o modpack instalado.

- `atm-1.3.0/mods/<nome-do-jar>/...`: conteudo filtrado de cada jar, com a estrutura interna preservada (`data/**/*.json`, `assets/*/lang/{pt_br,en_us}.json`, `assets/*/textures/{item,gui}/**`, `assets/*/sounds.json`, gritos `sounds/pokemon/**/*_cry.ogg` e os sons de UI pequenos). Os jars originais nao entram: o do Cobblemon tem 128 MB, acima do limite de 100 MB por arquivo do GitHub.
- `atm-1.3.0/kubejs/data/{cobblemon,rctmod,legendary_spawns_ccc}` e `atm-1.3.0/config/{rctmod-server.toml,cobblemon/}`: copiados como estao.
- `atm-1.3.0/MANIFEST.json`: quantos arquivos vieram de cada jar (`additions` lista o que entrou depois da extracao inicial).
- 2026-09-28: acrescentados os `assets/<ns>/textures/item/**/*.png.mcmeta` (24 arquivos: cobblemon, allthemons, mega_showdown) copiados dos jars originais, ao lado da textura correspondente. Eles marcam as texturas animadas (tira vertical de quadros); o pipeline publica so o primeiro quadro.
- Ficaram de fora (nao usados pelo app): texturas de modelo 3D (`textures/pokemon`), estruturas `.nbt`, `.mcfunction`, sons de golpes/blocos/pesca/montaria/animacao/musica e sons de Pokemon que nao sao grito.

O pipeline deve aceitar duas fontes: a instancia real (le os jars) ou esta pasta (jars ja "abertos" em `mods/<jar>/`). Veja a pendencia 10 em `.forge/complete/pontindex/RETOMADA_pontindex.md`.
