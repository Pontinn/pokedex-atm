---
feature: pontindex
stage: spec
status: in-progress
language: pt-BR
branch: feature/pontindex (criada de main em 5700491, 2026-09-23)
mode: full
autonomy: total (usuario 2026-09-23: "quero q siga 100% autonomo"; gates auto-aprovados, perguntas abertas resolvidas pelo default recomendado e registradas como premissa; PARAR antes da Stage 4 (implementacao) e esperar o usuario; push/merge continuam exigindo pedido explicito)
top_model: fable
running_agent: forge-spec aplicando achados da revisao (acumulado ~37 min; timer de 1h termina em ~23 min)
agent_time_limit: 1h por agente (usuario 2026-09-23); ao bater 1h, parar e continuar com agente novo de contexto zerado a partir do disco
baselines:
  CONTEXT: { commit: 5700491, deps: [IDEA_pontindex.md, design/prototipo/**, design/tipos/**, instancia ATMons (fora do repo)] }
  PRD: { commit: fe314db, deps: [IDEA_pontindex.md, CONTEXT_pontindex.md] }
  UISPEC: { commit: fe314db, deps: [design/prototipo/index.html, design/prototipo/style.css, design/prototipo/app.js, design/tipos/cores.json] }
  IDEA: { commit: <ver git log: ultimo commit de 2026-09-23>, deps: [design/prototipo/**, design/tipos/**, design/capture/**] }
updated: 2026-09-23
---
## 2026-09-23 10:30 - Stage 1 iniciado
- Projeto do zero: pasta vazia, sem git, sem codigo. forge-context nao tem o que ler ainda.
- Ambiente Android instalado nesta sessao (SDK 36, build-tools 36.0.0, platform-tools, ANDROID_HOME configurado). JDK 21 e Node 24 ja existiam.
- Orquestrador roda em Fable, entao top_model = fable (usuario ainda nao foi perguntado; confirmar antes do primeiro dispatch top-tier).

## 2026-09-23 10:45 - pesquisa retornou (agente research, sonnet)
- All the Mons = ATM10 + Cobblemon (MC 1.21.1 NeoForge). Evolucoes do Cobblemon diferem dos jogos; dados em JSON no GitLab do Cobblemon. PokeAPI livre/CORS; dataset CSV offline existe. Formulas de stats registradas na IDEA secao 7.
- Aguardando respostas do usuario as 6 perguntas (prioridades, "poder maximo", dados locais, offline, idioma, referencia visual).

## 2026-09-23 11:00 - respostas do usuario registradas
- Plug and play, historico local, animacoes, todas as sugestoes entram, poder maximo = BST, dados locais, so online, pt-BR com opcao EN, custo zero. Referencia visual pendente. Agente pesquisando API do ATM/Cobblemon.

## 2026-09-23 11:15 - pesquisa 2 retornou (agente research, sonnet)
- ATM sem API. Cobblemon GitLab: species + spawn_pool_world JSON (bucket common/uncommon/rare/ultra-rare), raw sem CORS -> empacotar em build-time com tag fixa. PokeAPI: CORS ok, pt-br existe, sem raridade (so legendary/mythical/capture_rate). Registrado na IDEA secao 7 e 12.

## 2026-09-23 11:35 - inspecao direta Cobblemon 1.8.1 (orquestrador, curl no scratchpad)
- 1.025 species, 842 spawn files, lang pt_br/en_us completos (nomes, descricoes, golpes, habilidades). Detalhes de golpes (tipo/poder) so via PokeAPI. Registrado na IDEA secao 7.
- Pendente do usuario: regra de raridade, versao do Cobblemon no pack, historico apagar, referencia visual, ordem das sprints.

## 2026-09-23 11:45 - Cobblemon 1.7.3 confirmado pelo usuario e verificado no GitLab
- Tag 1.7.3 existe, mesma estrutura. 1.025 species, 824 spawn, lang pt_br/en_us ok. Amostras em scratchpad/cobblemon173.

## 2026-09-23 12:00 - capturados + animacao de captura + premissas aceitas
- Novo: sistema de capturados (botao na ficha, lista) e animacao de captura (fundo por raridade, silhueta, flash, revelacao). Cores por raridade virao do usuario na raiz do projeto. Premissas 1-16 aceitas. Ideia NAO finalizada: referencia visual pendente.

## 2026-09-23 12:20 - assets do usuario organizados em design/, captura fechada
- design/capture/bg-{lendario,mitico,outros}.avif + design/pokebola.webp. Pokebola: botao capturei, abertura da animacao, icone, loading. Silhueta preta do artwork. Pular com toque. Premissas 17-19 adotadas por padrao. So falta: referencia visual (ideia aberta).

## 2026-09-23 12:40 - prototipo visual
- Usuario sem referencias; pediu HTML proposto por mim. Agente (fable) construindo design/prototipo/. Aprovacao do prototipo = fim da Stage 1.

## 2026-09-23 13:10 - prototipo entregue e validado; git iniciado
- design/prototipo/ (index.html, style.css, app.js, LEIA-ME.txt). Validei com Playwright headless: 0 erros de console em 1280/390, sem travessao, prints desktop/mobile conferidos (home + ficha) e coerentes com o brief.
- git init em main a pedido do usuario; commit inicial 579d8b6 com IDEA + design/ (STATE segue gitignored).
- Aguardando aprovacao do prototipo pelo usuario = fechamento da Stage 1.

## 2026-09-23 13:25 - revisao v1 do prototipo pelo usuario
- Gostou no geral. 4 correcoes enviadas ao agente (mesma sessao). Aguardando retorno para nova validacao.

## 2026-09-23 13:45 - prototipo v2 validado
- 4 correcoes aplicadas pelo agente. Validei com Playwright headless: chips compactos com glifo (claro e escuro), fundo azul-claro, sem rotacao, 3 fundos de captura em CSS/SVG nitidos (grid conferido). 0 erros de console. Commit da v2 feito. Aguardando aprovacao final do usuario.

## 2026-09-23 13:55 - revisao v2 pelo usuario
- Gostou de tudo; pediu fundo mais evidente e animacao no fundo da captura. Ambos enviados ao agente (v3).

## 2026-09-23 14:20 - v3 validada; v4 em andamento
- v3 (fundo #B0CDF3 etc., captura animada, chips vivos no escuro, scrollbars tematicas transparentes, chips sem vazar, badge nowrap) conferida por mim nos prints. Commit adiado ate a v4 voltar (agente editando os arquivos).
- Novas perguntas do usuario: descricao de golpes (temos no lang do Cobblemon: sim), IV/EV recomendados (nao existe nos dados; opcoes heuristica x Smogon, ponto aberto), abas nao devem recarregar a tela (requisito), marca d'agua de Pokebola girando (aceito).

## 2026-09-23 14:40 - v4 validada e commitada
- Abas/filtros atualizam so o componente, marca d'agua de Pokebola, descricao dos golpes expandindo. Conferido nos prints, 0 erros. Commit v3+v4. Aguardando aprovacao final do prototipo.

## 2026-09-23 15:10 - v5 validada e commitada
- Marca d'agua mono .03; paleta unica por tipo (a/b saturados) em cores.json; hero card com gradiente do tipo + raios girando sem borda; lendario dourado / mitico roxo-azul com brilho e faiscas; chips com gradiente; tema Preto com cards #111. Prints conferidos (Charizard, Mewtwo, Mew mobile, Gengar preto). Aguardando aprovacao do usuario.

## 2026-09-23 15:40 - v6 validada e commitada
- Filtro Todos/Fraquezas/Resistencias (parcial) e icones Lucide (49 svgs) conferidos, 0 erros. Pesquisa "como obter" ainda rodando.

## 2026-09-23 16:00 - pesquisa 3 retornou (como obter)
- Repo AllTheMods/All-the-Mons tem kubejs/data/cobblemon com 23 spawns extras (lendarios), fossils no Cobblemon (14), evolucao via preEvolution; addons Legendary Monuments, Raid Dens, Cobbreeding. Registrado na IDEA secao 7. Bloco "Como obter" enviado ao agente do prototipo.

## 2026-09-23 16:30 - instancia local inspecionada; agente do prototipo retomado apos rate limit
- ATM 1.3.0, 398 mods; dados efetivos em jars (CCC compat 326, allthemons 16 com fossils/mewtwo.json) + kubejs (21 spawns). Decisao: dataset gerado da instancia local. Cobbreeding ausente (breeding nao confirmado). Registrado na IDEA.
- Agente do prototipo caiu por 429 no bloco Como obter (faltava tweak mobile); retomado via SendMessage.

## 2026-09-23 16:50 - v7 (Como obter) validada e commitada
- Bloco Como obter com evolucao/fossil/spawn do pack/addon/breeding/fallback; Mewtwo via fossil (Ancient DNA Sample / Pika Star). Prints conferidos (Mewtwo desktop, Lucario mobile), 0 erros. Pendente do usuario: aprovacao final do prototipo; breeding existe no pack?

## 2026-09-23 17:20 - treinadores, pokebolas, itens
- rctmod: 1559 times, 282 spawns (110 chave), series, requiredDefeats; ATM adiciona serie atm_team. Cobblemon lang: 51 bolas com tooltip PT/EN, 430 itens com tooltip, comida 1.7 (seasonings, puffs). Registrado na IDEA. Agente pesquisando regra do cap + efeitos de comida. Commit 9d13561 (botoes mobile).

## 2026-09-23 17:35 - pesquisa 4 retornou (level cap, bolas, comida)
- Cap = nivel max do proximo treinador-chave (+relativeLevelCap=0); requiredDefeats AND/OR; Trainer Card aponta o proximo. Captura critica por progresso da Pokedex. Cozinha: 4 tipos de seasoning. Registrado na IDEA. Pendente: aprovacao do prototipo (idea-done).

## 2026-09-23 17:45 - v8 em andamento
- Usuario quer as 3 secoes novas no prototipo antes de aprovar. Enviado ao agente (nav com "Mais" no mobile, timeline de treinadores com cap, grid de bolas + ranking na ficha, itens por categoria).

## 2026-09-23 19:00 - v8 validada e commitada
- Treinadores (series, stepper com cap, time expandido), Pokebolas (23 + filtros, Melhor Pokebola na ficha), Itens & Comidas (10 categorias, busca bilingue), toggle PT/EN de termos por card, Eevee com 8 ramos e itens exatos, legenda falsa removida, Formas com item, badge de raridade no topo-esquerdo, nav "Mais" no mobile. Prints conferidos, 0 erros. Aguardando aprovacao final (idea-done).

## 2026-09-23 19:40 - decisoes de fechamento
- Tudo e must-have (sem MoSCoW de corte). Apos aprovacao da pagina de itens: idea-done, gravar contexto completo (STATE + IDEA + nota de retomada) e parar; proxima sessao inicia com --prd.

## 2026-09-23 20:10 - v9 validada e commitada
- Imagens reais (1134 texturas, manifest.js), pagina de item com Como obter / Usado em, links de item em todo lugar, pilha de navegacao real (Voltar restaura aba TM + scroll; testado por mim e pelo agente, hardware back ok). 0 erros, 0 imagens quebradas. Aguardando aprovacao final da IDEA.

## 2026-09-23 fim - STAGE 1 CONCLUIDA (idea-done)
- Prototipo aprovado pelo usuario ("Tudo aprovado, achei incrivel"). IDEA completa (secoes 1-13; secao 13 = nota de retomada).
- Ultimo lote: item de spawn dos treinadores (completo, commitado); SONS no prototipo ficaram PARCIAIS (agente parado): botao de grito no card + sons de UI com toggle ligado por padrao estao decididos na IDEA e devem ser implementados no APP (prototipo nao precisa ser completado). Assets de som ja extraidos em design/prototipo/assets/sons/.
- PROXIMA SESSAO: `/forge --prd pontindex`. Ler IDEA secao 13 primeiro. Criar branch feature/pontindex a partir de main. Nao existe CONTEXT (projeto sem codigo): rodar forge-context sobre design/prototipo + fontes de dados listadas na IDEA.

## 2026-09-23 pos-fechamento - decisao de entrega
- Site PWA na Vercel primeiro (sem backend); apps Windows/Android so depois do site pronto, mesmo codigo, atualizador automatico; botao "Baixar app" (Android + Windows) so no site. Registrado na IDEA secao 2 e 13. PRD deve planejar a Fase 1 (site) e deixar a Fase 2 como sprint futura.

## 2026-09-23 pos-fechamento 2 - Sincronizar + Amigos
- Botao Sincronizar (tela explicativa + gerar/receber codigo QR ou texto, mesclar/substituir) e aba Amigos (ver capturados do amigo via codigo dele, snapshot). Sem banco. Registrado na IDEA secao 2, 6 e 12.

## 2026-09-23 pos-fechamento 3 - nome, compartilhamento total, ID fixo
- Tela de nome na 1a abertura; codigo sempre com capturados + time + treinadores; ID fixo por instalacao para atualizar o amigo sem duplicar (sync continua manual por codigo). IDEA secoes 2 e 6.

## 2026-09-23 pos-fechamento 4 - Amigos/nome/ID REMOVIDOS
- Usuario removeu a aba Amigos, o nome do jogador e o ID fixo. Fica so "Sincronizar" entre os proprios dispositivos (codigo/QR, mesclar/substituir). IDEA limpa.

## 2026-09-23 - Stage 2 iniciada
- Branch feature/pontindex criada de main (5700491). forge-context (sonnet) rodando em background. Proximo: forge-prd.
- forge-context voltou: CONTEXT_pontindex.md (181 linhas, identificadores en). Contagens da IDEA reverificadas; achados: prototipo nao persiste tema/idioma/animacoes (app deve), fosseis 15 vs 14. 7 pontos em aberto. forge-prd rodando.

## 2026-09-23 - usuario pediu pipeline 100% autonomo
- Gates auto-aprovados, defaults recomendados para perguntas abertas, sem push/merge.
- Ajuste: autonomia total so ate o fim da Stage 3 (SPEC + checklist). Parar antes da implementacao.

## 2026-09-23 - PRD aprovado (auto, modo autonomo) e commitado fe314db
- PRD rev 4: 125 RFs, 12 RNFs, 9 decisoes assumidas. Review PASS (2a rodada). CONTEXT review PASS. Level cap confirmado no bytecode do rctmod. forge-ui-recon rodando; forge-spec depois.
- UISPEC pronto (49 prints em ui-refs/, render-captured, 11 gaps: Sincronizar, Baixar app, Apagar dados, placeholders, badge nospawn nao replicar). forge-spec e review do UISPEC em paralelo.
- Bug na captura (raiz do servidor = design/prototipo quebrava ../pokebola.webp e ../tipos/svg): usuario notou icones faltando. Recapturado com raiz design/, 50 prints, 0 assets quebrados, conferido por mim. UISPEC review PASS + warnings aplicados.

## 2026-09-23 - preparacao para outro PC
- Usuario vai continuar em outro PC. Artefatos commitados e branch feature/pontindex publicada no origin. A pedido do usuario, .gitignore deixou de ignorar STATE/checklists/relatorios/handoffs/ui-refs (tudo do .forge versionado). RETOMADA_pontindex.md (versionado) resume o estado, as regras combinadas e o que o PC novo precisa (instancia do modpack + ATM_INSTANCE_DIR). CLAUDE.md global publicado em github.com/Pontinn/claude-md (privado) com a Regra 2 (1h por agente).
- Usuario autorizou (2026-09-23) push automatico da branch feature/pontindex a cada etapa concluida ate a viagem. Merge continua proibido sem pedido.

## 2026-09-23 - SPEC review NEEDS-CHANGES
- 2 blockers (merge de species_additions perdia drops do pack; ids de tema/fundo em PT), 6 warnings, 8 nits. Cascata aplicada por mim: PRD rev 6 (RF-59 texto 22, RF-63 48 bolas verificadas no jar) e CONTEXT (48 bolas). forge-spec corrigindo.
