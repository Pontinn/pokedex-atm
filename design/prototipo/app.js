/* =====================================================================
   PONTINDEX - protótipo (vanilla JS)
   - I18N: dicionário {pt, en}; tudo que é visível passa por t()
   - DATA: dados fake em um único objeto
   - Renderização das telas, temas, layout mobile e animação de captura
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     I18N
     ------------------------------------------------------------------ */
  const I18N = {
    'boot.loading': { pt: 'Carregando dados...', en: 'Loading data...' },
    'nav.home': { pt: 'Início', en: 'Home' },
    'nav.dex': { pt: 'Pokédex', en: 'Pokédex' },
    'nav.captured': { pt: 'Capturados', en: 'Caught' },
    'nav.compare': { pt: 'Comparar', en: 'Compare' },
    'nav.settings': { pt: 'Configurações', en: 'Settings' },
    'nav.settingsShort': { pt: 'Ajustes', en: 'Settings' },
    'home.eyebrow': { pt: 'All the Mons · Cobblemon', en: 'All the Mons · Cobblemon' },
    'home.title': { pt: 'Qual Pokémon você procura?', en: 'Which Pokémon are you looking for?' },
    'home.searchPh': { pt: 'Buscar por nome ou número da Pokédex...', en: 'Search by name or Pokédex number...' },
    'home.search': { pt: 'Buscar', en: 'Search' },
    'home.random': { pt: 'Pokémon aleatório', en: 'Random Pokémon' },
    'home.openDex': { pt: 'Abrir Pokédex', en: 'Open Pokédex' },
    'home.randomShort': { pt: 'Aleatório', en: 'Random' },
    'home.openDexShort': { pt: 'Pokédex', en: 'Pokédex' },
    'home.caught': { pt: 'Capturados', en: 'Caught' },
    'home.seeAll': { pt: 'Ver todos', en: 'See all' },
    'home.of': { pt: 'de', en: 'of' },
    'home.lastCaught': { pt: 'Último: Lucario, hoje', en: 'Latest: Lucario, today' },
    'home.team': { pt: 'Meu time', en: 'My team' },
    'home.empty': { pt: 'Vazio', en: 'Empty' },
    'home.history': { pt: 'Histórico', en: 'History' },
    'home.historyHint': { pt: 'Últimos 20 consultados', en: 'Last 20 viewed' },
    'dex.results': { pt: 'resultados', en: 'results' },
    'dex.type': { pt: 'Tipo', en: 'Type' },
    'dex.gen': { pt: 'Geração', en: 'Generation' },
    'dex.evo': { pt: 'Evolução', en: 'Evolution' },
    'dex.sort': { pt: 'Ordenar', en: 'Sort' },
    'dex.status': { pt: 'Status', en: 'Status' },
    'dex.all': { pt: 'Todos', en: 'All' },
    'dex.onlyCaught': { pt: 'Só capturados', en: 'Caught only' },
    'dex.onlyMissing': { pt: 'Só faltando', en: 'Missing only' },
    'dex.byNum': { pt: 'Número', en: 'Number' },
    'dex.byName': { pt: 'Nome', en: 'Name' },
    'dex.byBst': { pt: 'Total de atributos', en: 'Base stat total' },
    'dex.none': { pt: 'Nenhum Pokémon com esses filtros.', en: 'No Pokémon match these filters.' },
    'evo.level': { pt: 'Nível', en: 'Level' },
    'evo.stone': { pt: 'Pedra', en: 'Stone' },
    'evo.trade': { pt: 'Troca', en: 'Trade' },
    'evo.friendship': { pt: 'Amizade', en: 'Friendship' },
    'evo.friendshipDay': { pt: 'Amizade + dia', en: 'Friendship + day' },
    'evo.fireStone': { pt: 'Pedra do Fogo', en: 'Fire Stone' },
    'evo.thunderStone': { pt: 'Pedra do Trovão', en: 'Thunder Stone' },
    'evo.waterStone': { pt: 'Pedra da Água', en: 'Water Stone' },
    'evo.none': { pt: 'Não evolui', en: 'Does not evolve' },
    'evo.methods': { pt: 'Métodos possíveis:', en: 'Possible methods:' },
    'rarity.common': { pt: 'Comum', en: 'Common' },
    'rarity.uncommon': { pt: 'Incomum', en: 'Uncommon' },
    'rarity.rare': { pt: 'Raro', en: 'Rare' },
    'rarity.ultra': { pt: 'Ultra-raro', en: 'Ultra-rare' },
    'rarity.legendary': { pt: 'Lendário', en: 'Legendary' },
    'rarity.mythical': { pt: 'Mítico', en: 'Mythical' },
    'detail.back': { pt: 'Voltar', en: 'Back' },
    'detail.caught': { pt: 'Capturei', en: 'Caught it' },
    'detail.caughtDone': { pt: 'Capturado', en: 'Caught' },
    'detail.addTeam': { pt: 'Adicionar ao time', en: 'Add to team' },
    'detail.inTeam': { pt: 'No time', en: 'In team' },
    'detail.shiny': { pt: 'Shiny', en: 'Shiny' },
    'detail.cry': { pt: 'Ouvir o grito', en: 'Play cry' },
    'detail.noSpawn': { pt: 'Não nasce no mundo', en: 'Does not spawn in the world' },
    'obtain.title': { pt: 'Como obter', en: 'How to obtain' },
    'obtain.evo': { pt: 'Evolução', en: 'Evolution' },
    'obtain.fossil': { pt: 'Fóssil / Reviver', en: 'Fossil / Revive' },
    'obtain.spawn': { pt: 'Spawn adicionado pelo All the Mons', en: 'Spawn added by All the Mons' },
    'obtain.addon': { pt: 'Addon', en: 'Addon' },
    'obtain.breed': { pt: 'Breeding (Cobbreeding)', en: 'Breeding (Cobbreeding)' },
    'obtain.breedText': { pt: 'Crie a partir de pais do grupo de ovo {g} no pasture', en: 'Breed from parents in the {g} egg group in the pasture' },
    'obtain.none': { pt: 'Sem rota confirmada no All the Mons nesta versão', en: 'No confirmed route in All the Mons in this version' },
    'obtain.noneHint': { pt: 'Assim que o pack ganhar uma forma de obter, ela aparece aqui.', en: 'Once the pack adds a way to obtain it, it will show up here.' },
    'obtain.packTag': { pt: 'Adicionado pelo pack', en: 'Added by the pack' },
    'obtain.open': { pt: 'Abrir ficha', en: 'Open entry' },
    'detail.noSpawnDesc': { pt: 'Este Pokémon não aparece naturalmente no All the Mons. Só por eventos, comandos ou troca.', en: 'This Pokémon does not spawn naturally in All the Mons. Only via events, commands or trade.' },
    'detail.stats': { pt: 'Atributos base', en: 'Base stats' },
    'detail.total': { pt: 'Total', en: 'Total' },
    'stat.hp': { pt: 'HP', en: 'HP' },
    'stat.atk': { pt: 'Ataque', en: 'Attack' },
    'stat.def': { pt: 'Defesa', en: 'Defense' },
    'stat.spa': { pt: 'At. Esp.', en: 'Sp. Atk' },
    'stat.spd': { pt: 'Def. Esp.', en: 'Sp. Def' },
    'stat.spe': { pt: 'Velocidade', en: 'Speed' },
    'detail.weak': { pt: 'Fraquezas & resistências', en: 'Weaknesses & resistances' },
    'weak.all': { pt: 'Todos', en: 'All' },
    'weak.weak': { pt: 'Fraquezas', en: 'Weaknesses' },
    'weak.res': { pt: 'Resistências', en: 'Resistances' },
    'detail.evo': { pt: 'Evoluções', en: 'Evolutions' },
    'detail.abilities': { pt: 'Habilidades', en: 'Abilities' },
    'detail.hidden': { pt: 'Oculta', en: 'Hidden' },
    'detail.moves': { pt: 'Golpes', en: 'Moves' },
    'tab.level': { pt: 'Nível', en: 'Level' },
    'tab.tm': { pt: 'TM', en: 'TM' },
    'tab.egg': { pt: 'Ovo', en: 'Egg' },
    'tab.tutor': { pt: 'Tutor', en: 'Tutor' },
    'col.level': { pt: 'Nv.', en: 'Lv.' },
    'col.move': { pt: 'Golpe', en: 'Move' },
    'col.type': { pt: 'Tipo', en: 'Type' },
    'col.cat': { pt: 'Categoria', en: 'Category' },
    'col.power': { pt: 'Poder', en: 'Power' },
    'col.acc': { pt: 'Precisão', en: 'Accuracy' },
    'cat.physical': { pt: 'Físico', en: 'Physical' },
    'cat.special': { pt: 'Especial', en: 'Special' },
    'cat.status': { pt: 'Status', en: 'Status' },
    'detail.where': { pt: 'Onde encontrar (All the Mons)', en: 'Where to find (All the Mons)' },
    'where.bucket': { pt: 'Raridade (spawn bucket)', en: 'Rarity (spawn bucket)' },
    'where.level': { pt: 'Nível', en: 'Level' },
    'where.biomes': { pt: 'Biomas', en: 'Biomes' },
    'where.conditions': { pt: 'Condições', en: 'Conditions' },
    'where.drops': { pt: 'Drops', en: 'Drops' },
    'cond.day': { pt: 'Dia', en: 'Day' },
    'cond.night': { pt: 'Noite', en: 'Night' },
    'cond.sky': { pt: 'Céu aberto', en: 'Open sky' },
    'cond.any': { pt: 'Qualquer hora', en: 'Any time' },
    'detail.forms': { pt: 'Formas', en: 'Forms' },
    'form.normal': { pt: 'Normal', en: 'Normal' },
    'form.ability': { pt: 'Habilidade', en: 'Ability' },
    'form.req': { pt: 'Requer', en: 'Requires' },
    'form.none': { pt: 'Forma base, sem item', en: 'Base form, no item' },
    'detail.calc': { pt: 'Calculadora rápida', en: 'Quick calculator' },
    'calc.level': { pt: 'Nível', en: 'Level' },
    'calc.ivs': { pt: 'IVs (todos)', en: 'IVs (all)' },
    'calc.evs': { pt: 'EVs (todos)', en: 'EVs (all)' },
    'calc.nature': { pt: 'Natureza', en: 'Nature' },
    'calc.hint': { pt: 'Valores estimados para o nível escolhido.', en: 'Estimated values at the chosen level.' },
    'captured.progress': { pt: '8,5% da Pokédex nacional', en: '8.5% of the national Pokédex' },
    'captured.gen1': { pt: 'Gen 1: 41/151', en: 'Gen 1: 41/151' },
    'captured.recent': { pt: 'Recentes', en: 'Recent' },
    'captured.on': { pt: 'Capturado em', en: 'Caught on' },
    'compare.vs': { pt: 'VS', en: 'VS' },
    'compare.swap': { pt: 'Trocar lados', en: 'Swap sides' },
    'compare.change': { pt: 'Trocar Pokémon', en: 'Change Pokémon' },
    'compare.total': { pt: 'Total', en: 'Total' },
    'nav.trainers': { pt: 'Treinadores', en: 'Trainers' },
    'nav.balls': { pt: 'Pokébolas', en: 'Poké Balls' },
    'nav.items': { pt: 'Itens & Comidas', en: 'Items & Food' },
    'nav.more': { pt: 'Mais', en: 'More' },
    'nav.trainersSub': { pt: 'Level cap por série', en: 'Level cap per series' },
    'nav.ballsSub': { pt: 'Multiplicadores e efeitos', en: 'Multipliers and effects' },
    'nav.itemsSub': { pt: 'Medicina, EV, cozinha, iscas', en: 'Medicine, EV, cooking, bait' },
    'nav.settingsSub': { pt: 'Tema, idioma, som', en: 'Theme, language, sound' },
    'tr.source': { pt: 'Fonte: Radical Cobblemon Trainers', en: 'Source: Radical Cobblemon Trainers' },
    'tr.series': { pt: 'Série', en: 'Series' },
    'tr.progress': { pt: 'Seu progresso', en: 'Your progress' },
    'tr.currentCap': { pt: 'Seu cap atual', en: 'Your current cap' },
    'tr.explain': { pt: 'Pokémon no nível do cap não ganham EXP; derrote o próximo treinador-chave para subir o cap.', en: 'Pokémon at the cap level do not gain EXP; defeat the next key trainer to raise the cap.' },
    'tr.cap': { pt: 'Cap', en: 'Cap' },
    'tr.defeated': { pt: 'Derrotado', en: 'Defeated' },
    'tr.next': { pt: 'Próximo', en: 'Next' },
    'tr.where': { pt: 'Onde', en: 'Where' },
    'tr.requires': { pt: 'Requer um de', en: 'Requires one of' },
    'tr.team': { pt: 'Time', en: 'Team' },
    'tr.bag': { pt: 'Mochila', en: 'Bag' },
    'tr.tip': { pt: 'Sugestão', en: 'Tip' },
    'tr.spawnItem': { pt: 'Item de spawn', en: 'Spawn item' },
    'tr.spawnHow': { pt: 'Clique com este item em um Trainer Spawner (bloco craftável) para spawnar este treinador onde quiser; com redstone o spawn é forçado.', en: 'Use this item on a Trainer Spawner (craftable block) to spawn this trainer wherever you want; with redstone the spawn is forced.' },
    'tr.done': { pt: 'de', en: 'of' },
    'tr.keyTrainers': { pt: 'treinadores-chave derrotados', en: 'key trainers defeated' },
    'role.leader': { pt: 'Líder', en: 'Gym Leader' },
    'role.rival': { pt: 'Rival', en: 'Rival' },
    'role.rocket': { pt: 'Equipe Rocket', en: 'Team Rocket' },
    'role.elite': { pt: 'Elite Four', en: 'Elite Four' },
    'role.champion': { pt: 'Campeão', en: 'Champion' },
    'ball.hint': { pt: 'Multiplicadores de captura do Cobblemon', en: 'Cobblemon catch multipliers' },
    'ball.all': { pt: 'Todas', en: 'All' },
    'ball.night': { pt: 'Noite / caverna', en: 'Night / cave' },
    'ball.water': { pt: 'Água', en: 'Water' },
    'ball.fishing': { pt: 'Pesca', en: 'Fishing' },
    'ball.first': { pt: '1º turno', en: '1st turn' },
    'ball.caught': { pt: 'Já capturado', en: 'Already caught' },
    'ball.after': { pt: 'Após capturar', en: 'After capture' },
    'ball.best': { pt: 'Melhor Pokébola', en: 'Best Poké Ball' },
    'ball.bestHint': { pt: 'Top 3 para este Pokémon', en: 'Top 3 for this Pokémon' },
    'ball.critical': { pt: 'Captura crítica', en: 'Critical capture' },
    'ball.criticalText': { pt: '{n} capturados: bônus {b}x', en: '{n} caught: {b}x bonus' },
    'ball.r.speed': { pt: 'Velocidade base {v}', en: 'Base Speed {v}' },
    'ball.r.night': { pt: 'à noite / em cavernas', en: 'at night / in caves' },
    'ball.r.first': { pt: '1º turno', en: '1st turn' },
    'ball.r.water': { pt: 'tipo Água ou Inseto', en: 'Water or Bug type' },
    'ball.r.caught': { pt: 'já registrado na Pokédex', en: 'already registered in the Pokédex' },
    'ball.r.heavy': { pt: 'Pokémon pesado', en: 'heavy Pokémon' },
    'ball.r.moon': { pt: 'evolui por Pedra da Lua', en: 'evolves with a Moon Stone' },
    'ball.r.love': { pt: 'gênero oposto na batalha', en: 'opposite gender in battle' },
    'item.search': { pt: 'Buscar item...', en: 'Search item...' },
    'item.how': { pt: 'Como usar', en: 'How to use' },
    'item.none': { pt: 'Nenhum item encontrado.', en: 'No item found.' },
    'cat.med': { pt: 'Medicina', en: 'Medicine' },
    'cat.ball': { pt: 'Pokébola', en: 'Poké Ball' },
    'cat.other': { pt: 'Item', en: 'Item' },
    'ip.back': { pt: 'Voltar', en: 'Back' },
    'ip.obtain': { pt: 'Como obter', en: 'How to obtain' },
    'ip.craft': { pt: 'Craftável', en: 'Craftable' },
    'ip.craftYes': { pt: 'Sim, tem receita', en: 'Yes, it has a recipe' },
    'ip.drop': { pt: 'Drop de Pokémon', en: 'Pokémon drop' },
    'ip.plant': { pt: 'Plantável', en: 'Plantable' },
    'ip.plantText': { pt: 'Cresce nos biomas:', en: 'Grows in biomes:' },
    'ip.loot': { pt: 'Loot de estrutura', en: 'Structure loot' },
    'ip.fish': { pt: 'Pesca', en: 'Fishing' },
    'ip.fishText': { pt: 'Pode vir na vara de pescar', en: 'Can be reeled in while fishing' },
    'ip.buy': { pt: 'Compra / NPC', en: 'Purchase / NPC' },
    'ip.used': { pt: 'Usado em', en: 'Used in' },
    'ip.evolves': { pt: 'Evolui', en: 'Evolves' },
    'ip.mult': { pt: 'Multiplicador de captura', en: 'Catch multiplier' },
    'ip.effect': { pt: 'Efeito', en: 'Effect' },
    'ip.form': { pt: 'Forma', en: 'Form' },
    'ip.revive': { pt: 'Reviver na máquina de fósseis', en: 'Revive in the fossil machine' },
    'ip.noDesc': { pt: 'Sem descrição cadastrada neste protótipo.', en: 'No description in this prototype yet.' },
    'cat.iv': { pt: 'Doces de IV', en: 'IV Candies' },
    'evo.branches': { pt: 'Evolui para', en: 'Evolves into' },
    'evo.friendship160': { pt: 'Amizade 160', en: 'Friendship 160' },
    'evo.day': { pt: 'de dia', en: 'daytime' },
    'evo.night': { pt: 'de noite', en: 'nighttime' },
    'evo.fairyMove': { pt: 'sabendo golpe de Fada', en: 'knowing a Fairy move' },
    'evo.leafStone': { pt: 'Pedra da Folha', en: 'Leaf Stone' },
    'evo.iceStone': { pt: 'Pedra do Gelo', en: 'Ice Stone' },
    'evo.linkCable': { pt: 'Link Cable (troca)', en: 'Link Cable (trade)' },
    'cat.vit': { pt: 'Vitaminas & EV', en: 'Vitamins & EV' },
    'cat.candy': { pt: 'Doces de EXP', en: 'EXP Candies' },
    'cat.evo': { pt: 'Evolução', en: 'Evolution' },
    'cat.held': { pt: 'Itens Segurados', en: 'Held Items' },
    'cat.battle': { pt: 'Batalha', en: 'Battle' },
    'cat.cook': { pt: 'Cozinha', en: 'Cooking' },
    'cat.berry': { pt: 'Berries', en: 'Berries' },
    'cat.bait': { pt: 'Iscas', en: 'Bait' },
    'settings.theme': { pt: 'Tema', en: 'Theme' },
    'settings.themeHint': { pt: 'Cor principal da carcaça e cor secundária da lente e detalhes.', en: 'Main shell color and secondary color for the lens and details.' },
    'settings.language': { pt: 'Idioma', en: 'Language' },
    'settings.languageHint': { pt: 'Nomes de golpes, habilidades e tipos aparecem no idioma escolhido. O jogo é em inglês.', en: 'Move, ability and type names follow the chosen language. The game itself is in English.' },
    'settings.sound': { pt: 'Som (bipe da Pokédex)', en: 'Sound (Pokédex beep)' },
    'settings.soundHint': { pt: 'Bipe curto ao abrir uma ficha ou capturar.', en: 'Short beep when opening an entry or catching.' },
    'settings.motion': { pt: 'Reduzir animações', en: 'Reduce motion' },
    'settings.motionHint': { pt: 'Desliga transições e efeitos. Também segue a preferência do sistema.', en: 'Turns off transitions and effects. Also follows the system preference.' },
    'settings.data': { pt: 'Dados: Cobblemon 1.7.3', en: 'Data: Cobblemon 1.7.3' },
    'settings.local': { pt: 'Tudo local neste aparelho. Sem conta, sem servidor.', en: 'Everything local on this device. No account, no server.' },
    'settings.images': { pt: 'Imagens: PokeAPI (online)', en: 'Images: PokeAPI (online)' },
    'settings.terms': { pt: 'Nomes do jogo em', en: 'Game names in' },
    'settings.termsHint': { pt: 'Idioma padrão de itens, biomas, golpes, habilidades e bolas. Cada card tem um botão PT | EN para trocar só ali.', en: 'Default language for items, biomes, moves, abilities and balls. Each card has a PT | EN switch to change only that card.' },
    'settings.termsPt': { pt: 'Português', en: 'Portuguese' },
    'settings.termsEn': { pt: 'Inglês', en: 'English' },
    'settings.default': { pt: 'Padrão', en: 'Default' },
    'capture.caught': { pt: 'Capturado!', en: 'Caught!' },
    'capture.close': { pt: 'Fechar', en: 'Close' },
    'capture.skip': { pt: 'Toque para pular', en: 'Tap to skip' },
    'theme.classico': { pt: 'Clássico', en: 'Classic' },
    'theme.classicoSub': { pt: 'Vermelho & Azul', en: 'Red & Blue' },
    'theme.preto': { pt: 'Preto', en: 'Black' },
    'theme.pretoSub': { pt: 'Preto & Amarelo', en: 'Black & Yellow' },
    'theme.verde': { pt: 'Verde', en: 'Green' },
    'theme.verdeSub': { pt: 'Verde & Creme', en: 'Green & Cream' },
    'theme.azul': { pt: 'Azul', en: 'Blue' },
    'theme.azulSub': { pt: 'Azul & Prata', en: 'Blue & Silver' },
    'theme.roxo': { pt: 'Roxo', en: 'Purple' },
    'theme.roxoSub': { pt: 'Roxo & Rosa', en: 'Purple & Pink' },
    'theme.branco': { pt: 'Branco', en: 'White' },
    'theme.brancoSub': { pt: 'Branco & Vermelho', en: 'White & Red' },
    'theme.laranja': { pt: 'Laranja', en: 'Orange' },
    'theme.laranjaSub': { pt: 'Laranja & Marinho', en: 'Orange & Navy' }
  };

  const TYPES = {
    normal: { pt: 'Normal', en: 'Normal' }, fire: { pt: 'Fogo', en: 'Fire' }, water: { pt: 'Água', en: 'Water' },
    electric: { pt: 'Elétrico', en: 'Electric' }, grass: { pt: 'Planta', en: 'Grass' }, ice: { pt: 'Gelo', en: 'Ice' },
    fighting: { pt: 'Lutador', en: 'Fighting' }, poison: { pt: 'Veneno', en: 'Poison' }, ground: { pt: 'Terra', en: 'Ground' },
    flying: { pt: 'Voador', en: 'Flying' }, psychic: { pt: 'Psíquico', en: 'Psychic' }, bug: { pt: 'Inseto', en: 'Bug' },
    rock: { pt: 'Pedra', en: 'Rock' }, ghost: { pt: 'Fantasma', en: 'Ghost' }, dragon: { pt: 'Dragão', en: 'Dragon' },
    dark: { pt: 'Sombrio', en: 'Dark' }, steel: { pt: 'Aço', en: 'Steel' }, fairy: { pt: 'Fada', en: 'Fairy' }
  };

  /* Tabela de tipos: atacante -> { 2: [...], 0.5: [...], 0: [...] } */
  const CHART = {
    normal: { 2: [], 0.5: ['rock', 'steel'], 0: ['ghost'] },
    fire: { 2: ['grass', 'ice', 'bug', 'steel'], 0.5: ['fire', 'water', 'rock', 'dragon'], 0: [] },
    water: { 2: ['fire', 'ground', 'rock'], 0.5: ['water', 'grass', 'dragon'], 0: [] },
    electric: { 2: ['water', 'flying'], 0.5: ['electric', 'grass', 'dragon'], 0: ['ground'] },
    grass: { 2: ['water', 'ground', 'rock'], 0.5: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'], 0: [] },
    ice: { 2: ['grass', 'ground', 'flying', 'dragon'], 0.5: ['fire', 'water', 'ice', 'steel'], 0: [] },
    fighting: { 2: ['normal', 'ice', 'rock', 'dark', 'steel'], 0.5: ['poison', 'flying', 'psychic', 'bug', 'fairy'], 0: ['ghost'] },
    poison: { 2: ['grass', 'fairy'], 0.5: ['poison', 'ground', 'rock', 'ghost'], 0: ['steel'] },
    ground: { 2: ['fire', 'electric', 'poison', 'rock', 'steel'], 0.5: ['grass', 'bug'], 0: ['flying'] },
    flying: { 2: ['grass', 'fighting', 'bug'], 0.5: ['electric', 'rock', 'steel'], 0: [] },
    psychic: { 2: ['fighting', 'poison'], 0.5: ['psychic', 'steel'], 0: ['dark'] },
    bug: { 2: ['grass', 'psychic', 'dark'], 0.5: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'], 0: [] },
    rock: { 2: ['fire', 'ice', 'flying', 'bug'], 0.5: ['fighting', 'ground', 'steel'], 0: [] },
    ghost: { 2: ['psychic', 'ghost'], 0.5: ['dark'], 0: ['normal'] },
    dragon: { 2: ['dragon'], 0.5: ['steel'], 0: ['fairy'] },
    dark: { 2: ['psychic', 'ghost'], 0.5: ['fighting', 'dark', 'fairy'], 0: [] },
    steel: { 2: ['ice', 'rock', 'fairy'], 0.5: ['fire', 'water', 'electric', 'steel'], 0: [] },
    fairy: { 2: ['fighting', 'dragon', 'dark'], 0.5: ['fire', 'poison', 'steel'], 0: [] }
  };

  /* ------------------------------------------------------------------
     DADOS FAKE (um único objeto)
     ------------------------------------------------------------------ */
  const ART = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
  const SPR = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
  const art = (id, shiny) => ART + (shiny ? 'shiny/' : '') + id + '.png';
  const spr = (id) => SPR + id + '.png';

  const MV = (lv, pt, en, type, cat, pow, acc, desc) => ({ lv, pt, en, type, cat, pow, acc, desc });

  const DATA = {
    total: 1025,
    caughtCount: 87,
    pokemon: [
      { id: 1, name: 'Bulbasaur', types: ['grass', 'poison'], gen: 1, rarity: 'common', evo: 'level', caught: true, date: '02/09/2026', stats: [45, 49, 49, 65, 65, 45] },
      { id: 4, name: 'Charmander', types: ['fire'], gen: 1, rarity: 'common', evo: 'level', caught: true, date: '05/09/2026', stats: [39, 52, 43, 60, 50, 65] },
      { id: 5, name: 'Charmeleon', types: ['fire'], gen: 1, rarity: 'uncommon', evo: 'level', caught: true, date: '11/09/2026', stats: [58, 64, 58, 80, 65, 80] },
      { id: 6, name: 'Charizard', types: ['fire', 'flying'], gen: 1, rarity: 'rare', evo: 'level', caught: false, egg: ['Monster', 'Dragon'], stats: [78, 84, 78, 109, 85, 100] },
      { id: 25, name: 'Pikachu', types: ['electric'], gen: 1, rarity: 'uncommon', evo: 'stone', caught: true, date: '03/09/2026', stats: [35, 55, 40, 50, 50, 90] },
      { id: 94, name: 'Gengar', types: ['ghost', 'poison'], gen: 1, rarity: 'rare', evo: 'trade', caught: true, date: '15/09/2026', stats: [60, 65, 60, 130, 75, 110] },
      { id: 133, name: 'Eevee', types: ['normal'], gen: 1, rarity: 'uncommon', evo: 'stone', caught: true, date: '08/09/2026', stats: [55, 55, 50, 45, 65, 55] },
      { id: 143, name: 'Snorlax', types: ['normal'], gen: 1, rarity: 'rare', evo: 'friendship', caught: false, stats: [160, 110, 65, 65, 110, 30] },
      { id: 149, name: 'Dragonite', types: ['dragon', 'flying'], gen: 1, rarity: 'ultra', evo: 'level', caught: false, stats: [91, 134, 95, 100, 100, 80] },
      { id: 142, name: 'Aerodactyl', types: ['rock', 'flying'], gen: 1, rarity: 'rare', evo: 'none', caught: false, noSpawn: true, egg: ['Flying'], stats: [80, 105, 65, 60, 75, 130] },
      { id: 150, name: 'Mewtwo', types: ['psychic'], gen: 1, rarity: 'legendary', evo: 'none', caught: false, noSpawn: true, stats: [106, 110, 90, 154, 90, 130] },
      { id: 151, name: 'Mew', types: ['psychic'], gen: 1, rarity: 'mythical', evo: 'none', caught: false, noSpawn: true, stats: [100, 100, 100, 100, 100, 100] },
      { id: 385, name: 'Jirachi', types: ['steel', 'psychic'], gen: 3, rarity: 'mythical', bucket: 'ultra', evo: 'none', caught: false, packSpawn: true, stats: [100, 100, 100, 100, 100, 100] },
      { id: 448, name: 'Lucario', types: ['fighting', 'steel'], gen: 4, rarity: 'rare', evo: 'friendship', caught: true, date: '23/09/2026', egg: ['Field', 'Human-like'], stats: [70, 110, 70, 115, 70, 90] }
    ],
    team: [6, 448, 94, 149, null, null],
    history: [6, 448, 25, 150, 133, 94],
    compare: [6, 448],
    /* Cadeias de evolução: lista de {id, name} e métodos entre eles */
    chains: {
      char: { ids: [4, 5, 6], names: ['Charmander', 'Charmeleon', 'Charizard'], methods: [{ k: 'evo.level', v: 16 }, { k: 'evo.level', v: 36 }] },
      bulba: { ids: [1, 2, 3], names: ['Bulbasaur', 'Ivysaur', 'Venusaur'], methods: [{ k: 'evo.level', v: 16 }, { k: 'evo.level', v: 32 }] },
      pika: { ids: [172, 25, 26], names: ['Pichu', 'Pikachu', 'Raichu'], methods: [{ k: 'evo.friendship', ico: 'heart' }, { k: 'evo.thunderStone', ico: 'gem' }] },
      gengar: { ids: [92, 93, 94], names: ['Gastly', 'Haunter', 'Gengar'], methods: [{ k: 'evo.level', v: 25 }, { k: 'evo.linkCable', ico: 'repeat' }] },
      eevee: { ids: [133], names: ['Eevee'], methods: [], branches: [
        { id: 135, name: 'Jolteon', k: 'evo.thunderStone', ico: 'gem' }, { id: 134, name: 'Vaporeon', k: 'evo.waterStone', ico: 'gem' },
        { id: 136, name: 'Flareon', k: 'evo.fireStone', ico: 'gem' }, { id: 470, name: 'Leafeon', k: 'evo.leafStone', ico: 'gem' },
        { id: 471, name: 'Glaceon', k: 'evo.iceStone', ico: 'gem' }, { id: 196, name: 'Espeon', k: 'evo.friendship160', k2: 'evo.day', ico: 'heart', ico2: 'sun' },
        { id: 197, name: 'Umbreon', k: 'evo.friendship160', k2: 'evo.night', ico: 'heart', ico2: 'moon' }, { id: 700, name: 'Sylveon', k: 'evo.friendship160', k2: 'evo.fairyMove', ico: 'heart', ico2: 'sparkles' } ] },
      snorlax: { ids: [446, 143], names: ['Munchlax', 'Snorlax'], methods: [{ k: 'evo.friendship', ico: 'heart' }] },
      dragonite: { ids: [147, 148, 149], names: ['Dratini', 'Dragonair', 'Dragonite'], methods: [{ k: 'evo.level', v: 30 }, { k: 'evo.level', v: 55 }] },
      lucario: { ids: [447, 448], names: ['Riolu', 'Lucario'], methods: [{ k: 'evo.friendshipDay', ico: 'heart' }] }
    },
    chainOf: { 4: 'char', 5: 'char', 6: 'char', 1: 'bulba', 25: 'pika', 94: 'gengar', 133: 'eevee', 143: 'snorlax', 149: 'dragonite', 448: 'lucario' },
    abilities: {
      6: [
        { pt: 'Chama', en: 'Blaze', hidden: false, descPt: 'Aumenta em 50% o poder de golpes de Fogo quando o HP está abaixo de 1/3.', descEn: 'Powers up Fire-type moves by 50% when HP is below 1/3.' },
        { pt: 'Poder Solar', en: 'Solar Power', hidden: true, descPt: 'Sob sol forte, Ataque Especial sobe 50%, mas perde 1/8 do HP por turno.', descEn: 'In harsh sunlight, Sp. Atk rises 50% but loses 1/8 HP each turn.' }
      ],
      150: [{ pt: 'Pressão', en: 'Pressure', hidden: false, descPt: 'O oponente gasta 2 PP por golpe usado contra este Pokémon.', descEn: 'The foe uses 2 PP per move used against this Pokémon.' },
        { pt: 'Nervos de Aço', en: 'Unnerve', hidden: true, descPt: 'Impede que oponentes comam Berries.', descEn: 'Prevents opposing Pokémon from eating Berries.' }],
      151: [{ pt: 'Sincronia', en: 'Synchronize', hidden: false, descPt: 'Passa queimadura, paralisia ou envenenamento para quem causou.', descEn: 'Passes burn, paralysis or poison to the Pokémon that inflicted it.' }],
      448: [{ pt: 'Firmeza', en: 'Steadfast', hidden: false, descPt: 'Velocidade sobe quando o Pokémon recua de medo.', descEn: 'Speed rises when the Pokémon flinches.' },
        { pt: 'Força Interior', en: 'Inner Focus', hidden: false, descPt: 'Não recua de medo.', descEn: 'Protects from flinching.' },
        { pt: 'Justiceiro', en: 'Justified', hidden: true, descPt: 'Ataque sobe ao receber um golpe Sombrio.', descEn: 'Attack rises when hit by a Dark-type move.' }],
      _: [{ pt: 'Habilidade', en: 'Ability', hidden: false, descPt: 'Descrição de exemplo da habilidade principal.', descEn: 'Sample description of the main ability.' },
        { pt: 'Habilidade oculta', en: 'Hidden Ability', hidden: true, descPt: 'Descrição de exemplo da habilidade oculta.', descEn: 'Sample description of the hidden ability.' }]
    },
    moves: {
      6: {
        level: [
          MV(1, 'Arranhão', 'Scratch', 'normal', 'physical', 40, 100, { pt: 'Garras afiadas e duras arranham o alvo para causar dano.', en: 'Hard, pointed, sharp claws rake the target to inflict damage.' }),
          MV(1, 'Rosnado', 'Growl', 'normal', 'status', null, 100, { pt: 'O usuário rosna de forma fofa, baixando o Ataque dos oponentes.', en: 'The user growls in an endearing way, lowering the Attack stat of opposing Pokémon.' }),
          MV(4, 'Brasa', 'Ember', 'fire', 'special', 40, 100, { pt: 'O alvo é atacado com pequenas chamas. Pode causar queimadura.', en: 'The target is attacked with small flames. This may also leave the target with a burn.' }),
          MV(12, 'Sopro do Dragão', 'Dragon Breath', 'dragon', 'special', 60, 100),
          MV(19, 'Presa de Fogo', 'Fire Fang', 'fire', 'physical', 65, 95),
          MV(24, 'Talho', 'Slash', 'normal', 'physical', 70, 100),
          MV(36, 'Lança-Chamas', 'Flamethrower', 'fire', 'special', 90, 100, { pt: 'O alvo é atingido por uma intensa rajada de fogo. Pode causar queimadura.', en: 'The target is scorched with an intense blast of fire. This may also leave the target with a burn.' }),
          MV(54, 'Inferno', 'Inferno', 'fire', 'special', 100, 50)
        ],
        tm: [
          MV('TM', 'Terremoto', 'Earthquake', 'ground', 'physical', 100, 100),
          MV('TM', 'Dança do Dragão', 'Dragon Dance', 'dragon', 'status', null, null),
          MV('TM', 'Raio Solar', 'Solar Beam', 'grass', 'special', 120, 100),
          MV('TM', 'Ataque Aéreo', 'Air Slash', 'flying', 'special', 75, 95)
        ],
        egg: [
          MV('Ovo', 'Dança da Chama', 'Flare Blitz', 'fire', 'physical', 120, 100),
          MV('Ovo', 'Garra de Dragão', 'Dragon Claw', 'dragon', 'physical', 80, 100)
        ],
        tutor: [
          MV('Tutor', 'Explosão de Fogo', 'Blast Burn', 'fire', 'special', 150, 90),
          MV('Tutor', 'Vento Cortante', 'Tailwind', 'flying', 'status', null, null)
        ]
      },
      _: {
        level: [
          MV(1, 'Investida', 'Tackle', 'normal', 'physical', 40, 100, { pt: 'Um ataque físico no qual o usuário avança e bate no alvo com todo o corpo.', en: 'A physical attack in which the user charges and slams into the target with its whole body.' }),
          MV(1, 'Rosnado', 'Growl', 'normal', 'status', null, 100, { pt: 'O usuário rosna de forma fofa, baixando o Ataque dos oponentes.', en: 'The user growls in an endearing way, lowering the Attack stat of opposing Pokémon.' }),
          MV(10, 'Ataque Rápido', 'Quick Attack', 'normal', 'physical', 40, 100),
          MV(20, 'Confusão', 'Confusion', 'psychic', 'special', 50, 100),
          MV(30, 'Desmaio', 'Swift', 'normal', 'special', 60, null),
          MV(40, 'Hiper Raio', 'Hyper Beam', 'normal', 'special', 150, 90)
        ],
        tm: [MV('TM', 'Proteção', 'Protect', 'normal', 'status', null, null), MV('TM', 'Descanso', 'Rest', 'psychic', 'status', null, null)],
        egg: [MV('Ovo', 'Desejo', 'Wish', 'normal', 'status', null, null)],
        tutor: [MV('Tutor', 'Bola de Energia', 'Energy Ball', 'grass', 'special', 90, 100)]
      }
    },
    where: {
      6: { levels: '36-56', biomes: [['Montanhas', 'Mountains'], ['Savana', 'Savanna'], ['Terras Áridas', 'Badlands'], ['Colinas Rochosas', 'Stony Peaks']], conds: ['cond.day', 'cond.sky'],
        drops: [['Carvão', 'Charcoal', 50], ['Pó de Blaze', 'Blaze Powder', 25], ['Pedra do Fogo', 'Fire Stone', 5]] },
      385: { levels: '60-80', biomes: [['Bioma especial: Picos Estrelados', 'Special biome: Starry Peaks']], conds: ['cond.night', 'cond.sky'], drops: [['Star Piece', 'Star Piece', 20], ['Comet Shard', 'Comet Shard', 5]] },
      448: { levels: '30-50', biomes: [['Montanhas', 'Mountains'], ['Picos Nevados', 'Snowy Peaks'], ['Taiga', 'Taiga']], conds: ['cond.any'], drops: [['Barra de Ferro', 'Iron Ingot', 40], ['Osso', 'Bone', 20]] },
      _: { levels: '5-30', biomes: [['Floresta', 'Forest'], ['Planície', 'Plains']], conds: ['cond.any'], drops: [['Berry Oran', 'Oran Berry', 40]] }
    },
    /* Como obter: métodos por Pokémon (k: evo | fossil | addon | spawn é derivado de where + packSpawn; breed é derivado de egg) */
    obtain: {
      6: [{ k: 'evo', pre: 5, preName: 'Charmeleon', pt: 'Evolua Charmeleon no nível 36', en: 'Evolve Charmeleon at level 36' }],
      448: [{ k: 'evo', pre: 447, preName: 'Riolu', pt: 'Evolua Riolu (amizade alta + dia)', en: 'Evolve Riolu (high friendship + daytime)' }],
      142: [{ k: 'fossil', item: 'Old Amber', pt: 'Reviva o fóssil Old Amber na máquina de fósseis', en: 'Revive the Old Amber fossil in the fossil machine' }],
      151: [{ k: 'addon', name: 'Legendary Monuments', pt: 'Invoque no altar Tree of Beginning com o item Mythic Flute', en: 'Summon at the Tree of Beginning altar with the Mythic Flute item' },
        { k: 'addon', name: 'Raid Dens', pt: 'Pode aparecer como recompensa de raid tier 5+', en: 'Can appear as a tier 5+ raid reward' }],
      150: [{ k: 'fossil', item: 'Ancient DNA Sample', pt: 'Reviva o item Ancient DNA Sample (ou Pika Star) na máquina de fósseis (All the Mons 1.3.0)', en: 'Revive the Ancient DNA Sample (or Pika Star) item in the fossil machine (All the Mons 1.3.0)' },
        { k: 'addon', name: 'Legendary Monuments', pt: 'Invoque no altar Cerulean Cave com o item Berserk Gene', en: 'Summon at the Cerulean Cave altar with the Berserk Gene item' }],
      5: [{ k: 'evo', pre: 4, preName: 'Charmander', pt: 'Evolua Charmander no nível 16', en: 'Evolve Charmander at level 16' }],
      94: [{ k: 'evo', pre: 93, preName: 'Haunter', pt: 'Evolua Haunter por troca', en: 'Evolve Haunter by trading' }],
      149: [{ k: 'evo', pre: 148, preName: 'Dragonair', pt: 'Evolua Dragonair no nível 55', en: 'Evolve Dragonair at level 55' }],
      143: [{ k: 'evo', pre: 446, preName: 'Munchlax', pt: 'Evolua Munchlax (amizade alta)', en: 'Evolve Munchlax (high friendship)' }],
      25: [{ k: 'evo', pre: 172, preName: 'Pichu', pt: 'Evolua Pichu (amizade alta)', en: 'Evolve Pichu (high friendship)' }]
    },
    forms: {
      6: [
        { key: 'form.normal', id: 6, types: ['fire', 'flying'], ability: ['Chama', 'Blaze'], stats: [78, 84, 78, 109, 85, 100] },
        { key: 'Mega X', id: 10034, types: ['fire', 'dragon'], ability: ['Garras Firmes', 'Tough Claws'], stats: [78, 130, 111, 130, 85, 100], req: [['Charizardite X', 'Charizardite X'], ['Pedra-Chave', 'Key Stone']], addon: 'Mega Showdown' },
        { key: 'Mega Y', id: 10035, types: ['fire', 'flying'], ability: ['Seca', 'Drought'], stats: [78, 104, 78, 159, 115, 100], req: [['Charizardite Y', 'Charizardite Y'], ['Pedra-Chave', 'Key Stone']], addon: 'Mega Showdown' },
        { key: 'Gmax', id: 10196, types: ['fire', 'flying'], ability: ['Chama', 'Blaze'], stats: [78, 84, 78, 109, 85, 100], req: [['Fator Gigantamax', 'Gigantamax Factor'], ['Sopa Max', 'Max Soup']], addon: 'Mega Showdown' }
      ]
    },
    themes: [
      { id: 'classico', p1: '#DC0A2D', p2: '#2A75BB' },
      { id: 'preto', p1: '#17171C', p2: '#F5C518' },
      { id: 'verde', p1: '#2F8F5B', p2: '#F2E8CF' },
      { id: 'azul', p1: '#1F5FBF', p2: '#C6CCD6' },
      { id: 'roxo', p1: '#6A3FC9', p2: '#FF6FB1' },
      { id: 'branco', p1: '#F7F7FA', p2: '#DC0A2D' },
      { id: 'laranja', p1: '#F0762B', p2: '#1E2A4A' }
    ],
    natures: [
      { pt: 'Modesto', en: 'Modest', up: 3, down: 1 }, { pt: 'Tímido', en: 'Timid', up: 5, down: 1 }, { pt: 'Corajoso', en: 'Adamant', up: 1, down: 3 },
      { pt: 'Alegre', en: 'Jolly', up: 5, down: 3 }, { pt: 'Ousado', en: 'Bold', up: 2, down: 1 }, { pt: 'Calmo', en: 'Calm', up: 4, down: 1 }, { pt: 'Sério', en: 'Hardy', up: -1, down: -1 }
    ]
  };
  /* Dados dos novos módulos (mesmo objeto DATA) */
  const TM = (id, name, lv, types, ability, moves) => ({ id, name, lv, types, ability, moves });
  Object.assign(DATA, {
    series: [
      { id: 'rr', name: 'Radical Red' }, { id: 'bdsp', name: 'BDSP' }, { id: 'unbound', name: 'Unbound' }, { id: 'atm', name: 'ATM Team' }, { id: 'cc', name: 'Content Creators' }
    ],
    /* Treinadores-chave em ordem. cap = nível máximo que derrotá-lo libera (= Pokémon mais forte do próximo).
       group = alternativas (qualquer um do grupo conta). */
    trainers: {
      rr: [
        { name: 'Brock', spawnItem: 'Hard Stone', role: 'leader', cap: 21, where: [['Pewter City', 'Pewter City'], ['Montanhas', 'Mountains']],
          team: [TM(74, 'Geodude', 12, ['rock', 'ground'], 'Sturdy', ['Tackle', 'Rock Throw', 'Defense Curl', 'Rock Polish']), TM(95, 'Onix', 14, ['rock', 'ground'], 'Sturdy', ['Rock Throw', 'Bind', 'Rock Tomb', 'Harden'])],
          bag: ['Potion x2'], tip: { pt: 'Leve Pokémon de Água/Planta: o time é Pedra/Terra.', en: 'Bring Water/Grass Pokémon: the team is Rock/Ground.' } },
        { group: [{ name: 'Archer', role: 'rocket' }, { name: 'Terry', role: 'rival' }], name: 'Archer', spawnItem: 'Black Sludge', role: 'rocket', cap: 27, where: [['Mt. Moon', 'Mt. Moon'], ['Cavernas', 'Caves']],
          team: [TM(42, 'Golbat', 19, ['poison', 'flying'], 'Inner Focus', ['Wing Attack', 'Bite', 'Confuse Ray', 'Astonish']), TM(228, 'Houndour', 21, ['dark', 'fire'], 'Flash Fire', ['Ember', 'Bite', 'Howl', 'Smog'])],
          bag: ['Super Potion x2'], tip: { pt: 'Terry (rival) também conta para este passo. Golpes de Pedra/Elétrico contra o Golbat.', en: 'Terry (rival) also counts for this step. Rock/Electric moves against Golbat.' } },
        { name: 'Misty', spawnItem: 'Mystic Water', role: 'leader', cap: 29, where: [['Cerulean City', 'Cerulean City'], ['Rios', 'Rivers']],
          team: [TM(120, 'Staryu', 24, ['water'], 'Natural Cure', ['Water Pulse', 'Swift', 'Rapid Spin', 'Recover']), TM(121, 'Starmie', 27, ['water', 'psychic'], 'Illuminate', ['Water Pulse', 'Psybeam', 'Swift', 'Recover'])],
          bag: ['Super Potion x2', 'X Defense'], tip: { pt: 'Planta/Elétrico. Cuidado com Recover do Starmie.', en: 'Grass/Electric. Watch out for Starmie\'s Recover.' } },
        { name: 'Brendan', spawnItem: 'Miracle Seed', role: 'rival', cap: 34, where: [['Rota 24', 'Route 24']],
          team: [TM(253, 'Grovyle', 27, ['grass'], 'Overgrow', ['Leaf Blade', 'Quick Attack', 'Pursuit', 'Fury Cutter']), TM(259, 'Marshtomp', 29, ['water', 'ground'], 'Torrent', ['Mud Shot', 'Water Gun', 'Bide', 'Rock Smash'])],
          bag: ['Potion x3'], tip: { pt: 'Voador/Fogo contra o Grovyle; Planta contra o Marshtomp.', en: 'Flying/Fire against Grovyle; Grass against Marshtomp.' } },
        { name: 'Lt. Surge', spawnItem: 'Magnet', role: 'leader', cap: 44, where: [['Vermilion City', 'Vermilion City'], ['Praias', 'Beaches']],
          team: [TM(100, 'Voltorb', 30, ['electric'], 'Static', ['Spark', 'Sonic Boom', 'Rollout', 'Screech']), TM(82, 'Magneton', 32, ['electric', 'steel'], 'Sturdy', ['Thunderbolt', 'Flash Cannon', 'Thunder Wave', 'Magnet Bomb']), TM(26, 'Raichu', 34, ['electric'], 'Static', ['Thunderbolt', 'Quick Attack', 'Double Team', 'Thunder Wave'])],
          bag: ['Hyper Potion x2'], tip: { pt: 'Terra anula Elétrico: leve um Pokémon de Terra.', en: 'Ground is immune to Electric: bring a Ground type.' } },
        { name: 'Erika', spawnItem: 'Miracle Seed', role: 'leader', cap: 46, where: [['Celadon City', 'Celadon City'], ['Floresta', 'Forest']],
          team: [TM(114, 'Tangela', 40, ['grass'], 'Chlorophyll', ['Giga Drain', 'Sleep Powder', 'Ancient Power', 'Knock Off']), TM(71, 'Victreebel', 42, ['grass', 'poison'], 'Chlorophyll', ['Leaf Blade', 'Sludge Bomb', 'Sleep Powder', 'Sunny Day']), TM(45, 'Vileplume', 44, ['grass', 'poison'], 'Effect Spore', ['Petal Dance', 'Sludge Bomb', 'Moonlight', 'Sleep Powder'])],
          bag: ['Hyper Potion x2', 'Full Heal'], tip: { pt: 'Fogo/Voador/Gelo. Leve Awakening: muito Sleep Powder.', en: 'Fire/Flying/Ice. Bring Awakenings: lots of Sleep Powder.' } },
        { name: 'Giovanni', spawnItem: 'Soft Sand', role: 'rocket', cap: 52, where: [['Silph Co.', 'Silph Co.'], ['Cidade', 'City']],
          team: [TM(31, 'Nidoqueen', 43, ['poison', 'ground'], 'Poison Point', ['Earth Power', 'Sludge Bomb', 'Ice Beam', 'Superpower']), TM(112, 'Rhydon', 44, ['ground', 'rock'], 'Rock Head', ['Earthquake', 'Stone Edge', 'Megahorn', 'Fire Punch']), TM(34, 'Nidoking', 46, ['poison', 'ground'], 'Sheer Force', ['Earth Power', 'Sludge Wave', 'Ice Beam', 'Thunderbolt'])],
          bag: ['Full Restore x2'], tip: { pt: 'Água/Planta/Gelo contra o time Terra.', en: 'Water/Grass/Ice against the Ground team.' } },
        { name: 'Lorelei', spawnItem: 'Never-Melt Ice', role: 'elite', cap: 58, where: [['Indigo Plateau', 'Indigo Plateau']],
          team: [TM(87, 'Dewgong', 50, ['water', 'ice'], 'Thick Fat', ['Surf', 'Ice Beam', 'Rest', 'Sleep Talk']), TM(91, 'Cloyster', 51, ['water', 'ice'], 'Skill Link', ['Icicle Spear', 'Rock Blast', 'Shell Smash', 'Hydro Pump']), TM(131, 'Lapras', 52, ['water', 'ice'], 'Water Absorb', ['Freeze-Dry', 'Surf', 'Thunderbolt', 'Ice Shard'])],
          bag: ['Full Restore x3'], tip: { pt: 'Elétrico/Lutador/Pedra. Shell Smash do Cloyster é perigoso.', en: 'Electric/Fighting/Rock. Cloyster\'s Shell Smash is dangerous.' } },
        { name: 'Blue', spawnItem: 'Expert Belt', role: 'champion', cap: 100, where: [['Indigo Plateau', 'Indigo Plateau']],
          team: [TM(18, 'Pidgeot', 56, ['normal', 'flying'], 'No Guard', ['Hurricane', 'Brave Bird', 'Heat Wave', 'Roost']), TM(65, 'Alakazam', 56, ['psychic'], 'Magic Guard', ['Psychic', 'Focus Blast', 'Shadow Ball', 'Calm Mind']), TM(112, 'Rhydon', 56, ['ground', 'rock'], 'Rock Head', ['Earthquake', 'Stone Edge', 'Megahorn', 'Swords Dance']), TM(130, 'Gyarados', 57, ['water', 'flying'], 'Intimidate', ['Waterfall', 'Crunch', 'Ice Fang', 'Dragon Dance']), TM(59, 'Arcanine', 57, ['fire'], 'Intimidate', ['Flare Blitz', 'Extreme Speed', 'Wild Charge', 'Close Combat']), TM(6, 'Charizard', 58, ['fire', 'flying'], 'Solar Power', ['Fire Blast', 'Air Slash', 'Solar Beam', 'Dragon Pulse'])],
          bag: ['Full Restore x4'], tip: { pt: 'Time balanceado nível 56-58. Leve Pedra para o Charizard e Elétrico para o Gyarados.', en: 'Balanced level 56-58 team. Bring Rock for Charizard and Electric for Gyarados.' } }
      ],
      bdsp: [
        { name: 'Roark', spawnItem: 'Smooth Rock', role: 'leader', cap: 20, where: [['Oreburgh', 'Oreburgh'], ['Minas', 'Mines']], team: [TM(74, 'Geodude', 12, ['rock', 'ground'], 'Sturdy', ['Tackle', 'Rock Throw', 'Stealth Rock', 'Defense Curl']), TM(95, 'Onix', 12, ['rock', 'ground'], 'Sturdy', ['Rock Throw', 'Bind', 'Screech', 'Harden']), TM(408, 'Cranidos', 14, ['rock'], 'Mold Breaker', ['Headbutt', 'Pursuit', 'Leer', 'Take Down'])], bag: ['Potion x2'], tip: { pt: 'Água/Planta/Lutador.', en: 'Water/Grass/Fighting.' } },
        { name: 'Gardenia', spawnItem: 'Miracle Seed', role: 'leader', cap: 30, where: [['Eterna', 'Eterna'], ['Floresta', 'Forest']], team: [TM(420, 'Cherubi', 19, ['grass'], 'Chlorophyll', ['Magical Leaf', 'Leech Seed', 'Growth', 'Safeguard']), TM(387, 'Turtwig', 19, ['grass'], 'Overgrow', ['Razor Leaf', 'Reflect', 'Withdraw', 'Absorb']), TM(407, 'Roserade', 22, ['grass', 'poison'], 'Natural Cure', ['Magical Leaf', 'Poison Sting', 'Grass Knot', 'Stun Spore'])], bag: ['Super Potion x2'], tip: { pt: 'Fogo/Voador. Cuidado com Stun Spore.', en: 'Fire/Flying. Watch out for Stun Spore.' } },
        { name: 'Cynthia', spawnItem: 'Dragon Fang', role: 'champion', cap: 100, where: [['Pokémon League', 'Pokémon League']], team: [TM(442, 'Spiritomb', 61, ['ghost', 'dark'], 'Pressure', ['Dark Pulse', 'Psychic', 'Silver Wind', 'Embargo']), TM(445, 'Garchomp', 66, ['dragon', 'ground'], 'Sand Veil', ['Dragon Rush', 'Earthquake', 'Brick Break', 'Giga Impact']), TM(350, 'Milotic', 63, ['water'], 'Marvel Scale', ['Surf', 'Ice Beam', 'Mirror Coat', 'Aqua Ring'])], bag: ['Full Restore x4'], tip: { pt: 'Gelo contra Garchomp; Fada contra Spiritomb.', en: 'Ice against Garchomp; Fairy against Spiritomb.' } }
      ],
      unbound: [
        { name: 'Mirskle', spawnItem: 'Never-Melt Ice', role: 'leader', cap: 25, where: [['Frozen Heights', 'Frozen Heights']], team: [TM(215, 'Sneasel', 18, ['dark', 'ice'], 'Inner Focus', ['Icy Wind', 'Feint Attack', 'Quick Attack', 'Taunt']), TM(459, 'Snover', 20, ['grass', 'ice'], 'Snow Warning', ['Razor Leaf', 'Icy Wind', 'Ingrain', 'Mist'])], bag: ['Super Potion x2'], tip: { pt: 'Fogo/Lutador/Aço.', en: 'Fire/Fighting/Steel.' } },
        { name: 'Alice', spawnItem: 'Dragon Fang', role: 'champion', cap: 100, where: [['Borrius League', 'Borrius League']], team: [TM(6, 'Charizard', 72, ['fire', 'flying'], 'Blaze', ['Fire Blast', 'Air Slash', 'Focus Blast', 'Roost']), TM(149, 'Dragonite', 74, ['dragon', 'flying'], 'Multiscale', ['Dragon Dance', 'Outrage', 'Fire Punch', 'Extreme Speed'])], bag: ['Full Restore x4'], tip: { pt: 'Pedra e Gelo resolvem quase tudo aqui.', en: 'Rock and Ice solve most of this fight.' } }
      ],
      atm: [
        { name: 'Pontin', spawnItem: 'Black Belt', role: 'rival', cap: 30, where: [['Spawn do servidor', 'Server spawn']], team: [TM(448, 'Lucario', 25, ['fighting', 'steel'], 'Inner Focus', ['Aura Sphere', 'Bone Rush', 'Metal Claw', 'Quick Attack'])], bag: ['Potion x3'], tip: { pt: 'Fogo/Lutador/Terra contra Lucario.', en: 'Fire/Fighting/Ground against Lucario.' } },
        { name: 'Time ATM', spawnItem: 'ATM Trainer Token', role: 'elite', cap: 100, where: [['Arena da base', 'Base arena']], team: [TM(94, 'Gengar', 55, ['ghost', 'poison'], 'Cursed Body', ['Shadow Ball', 'Sludge Bomb', 'Focus Blast', 'Nasty Plot']), TM(143, 'Snorlax', 55, ['normal'], 'Thick Fat', ['Body Slam', 'Rest', 'Curse', 'Earthquake'])], bag: ['Full Restore x2'], tip: { pt: 'Sombrio contra Gengar; Lutador contra Snorlax.', en: 'Dark against Gengar; Fighting against Snorlax.' } }
      ],
      cc: [
        { name: 'Cherry', spawnItem: 'Silk Scarf', role: 'leader', cap: 35, where: [['Vila dos criadores', 'Creators village']], team: [TM(133, 'Eevee', 28, ['normal'], 'Adaptability', ['Quick Attack', 'Bite', 'Swift', 'Baby-Doll Eyes']), TM(25, 'Pikachu', 30, ['electric'], 'Static', ['Thunderbolt', 'Quick Attack', 'Iron Tail', 'Nuzzle'])], bag: ['Super Potion x2'], tip: { pt: 'Lutador contra Eevee; Terra contra Pikachu.', en: 'Fighting against Eevee; Ground against Pikachu.' } },
        { name: 'Lucas', spawnItem: 'Twisted Spoon', role: 'champion', cap: 100, where: [['Estúdio', 'Studio']], team: [TM(150, 'Mewtwo', 70, ['psychic'], 'Pressure', ['Psystrike', 'Aura Sphere', 'Ice Beam', 'Recover'])], bag: ['Full Restore x3'], tip: { pt: 'Sombrio/Inseto/Fantasma contra Mewtwo.', en: 'Dark/Bug/Ghost against Mewtwo.' } }
      ]
    },
    /* Pokébolas: cores do ícone (b1 topo, b2 base, b3 detalhe), multiplicador, efeito e situações */
    balls: [
      { id: 'poke', name: 'Poké Ball', b1: '#e63946', b2: '#f1f1f1', b3: '', mult: '1x', pt: 'Pokébola padrão.', en: 'Standard ball.', tags: [] },
      { id: 'great', name: 'Great Ball', b1: '#3a86ff', b2: '#f1f1f1', b3: '#e63946', mult: '1.5x', pt: 'Melhor que a Poké Ball em qualquer situação.', en: 'Better than a Poké Ball in any situation.', tags: [] },
      { id: 'ultra', name: 'Ultra Ball', b1: '#1f1f1f', b2: '#f1f1f1', b3: '#f5d000', mult: '2x', pt: 'Alta taxa de captura em qualquer situação.', en: 'High catch rate in any situation.', tags: [] },
      { id: 'master', name: 'Master Ball', b1: '#7b2cbf', b2: '#f1f1f1', b3: '#ff6ec7', mult: '255x', pt: 'Captura garantida.', en: 'Guaranteed capture.', tags: [] },
      { id: 'net', name: 'Net Ball', b1: '#2ec4b6', b2: '#f1f1f1', b3: '#0b5563', mult: '3x', pt: '3x em Pokémon de Água ou Inseto.', en: '3x on Water or Bug type Pokémon.', tags: ['water'] },
      { id: 'dusk', name: 'Dusk Ball', b1: '#1f3b2a', b2: '#f1f1f1', b3: '#ff8c42', mult: '3.5x', pt: '3.5x com luz 0, 3x com luz 1-7 (noite ou caverna).', en: '3.5x at light level 0, 3x at light 1-7 (night or caves).', tags: ['night'] },
      { id: 'fast', name: 'Fast Ball', b1: '#ffb703', b2: '#f1f1f1', b3: '#e63946', mult: '4x', pt: '4x em Pokémon com Velocidade base ≥ 100.', en: '4x on Pokémon with base Speed ≥ 100.', tags: [] },
      { id: 'heavy', name: 'Heavy Ball', b1: '#6c757d', b2: '#3d5a80', b3: '#212529', mult: '1x a 4x', pt: '1x a 4x pelo peso do Pokémon (mais pesado, melhor).', en: '1x to 4x by the Pokémon\'s weight (heavier is better).', tags: [] },
      { id: 'love', name: 'Love Ball', b1: '#ff70a6', b2: '#f1f1f1', b3: '#ffd6e0', mult: '2.5x / 8x', pt: '2.5x se gênero oposto ao seu Pokémon; 8x se mesma espécie.', en: '2.5x if opposite gender to yours; 8x if same species.', tags: [] },
      { id: 'beast', name: 'Beast Ball', b1: '#2b3a67', b2: '#f1f1f1', b3: '#ffd166', mult: '5x / 0.1x', pt: '5x em Ultra Beasts, 0.1x no resto.', en: '5x on Ultra Beasts, 0.1x on everything else.', tags: [] },
      { id: 'quick', name: 'Quick Ball', b1: '#219ebc', b2: '#ffd60a', b3: '#f1f1f1', mult: '5x', pt: '5x no 1º turno da batalha.', en: '5x on the 1st turn of battle.', tags: ['first'] },
      { id: 'timer', name: 'Timer Ball', b1: '#e9ecef', b2: '#f1f1f1', b3: '#e63946', mult: '1x a 4x', pt: '1x a 4x conforme os turnos passam (máximo no turno 10).', en: '1x to 4x as turns pass (max at turn 10).', tags: [] },
      { id: 'repeat', name: 'Repeat Ball', b1: '#e63946', b2: '#f1f1f1', b3: '#1d1d1d', mult: '3.5x', pt: '3.5x se a espécie já está registrada na Pokédex.', en: '3.5x if the species is already registered in the Pokédex.', tags: ['caught'] },
      { id: 'level', name: 'Level Ball', b1: '#f4a261', b2: '#e63946', b3: '#1d1d1d', mult: '1x a 8x', pt: '1x a 8x conforme seu Pokémon é mais forte que o alvo.', en: '1x to 8x depending on how much stronger your Pokémon is.', tags: [] },
      { id: 'lure', name: 'Lure Ball', b1: '#4cc9f0', b2: '#f1f1f1', b3: '#f72585', mult: '4x', pt: '4x em Pokémon encontrados pescando.', en: '4x on Pokémon encountered while fishing.', tags: ['fishing', 'water'] },
      { id: 'moon', name: 'Moon Ball', b1: '#1b263b', b2: '#f1f1f1', b3: '#ffd166', mult: '4x', pt: '4x em Pokémon que evoluem por Pedra da Lua.', en: '4x on Pokémon that evolve with a Moon Stone.', tags: ['night'] },
      { id: 'dive', name: 'Dive Ball', b1: '#0077b6', b2: '#f1f1f1', b3: '#90e0ef', mult: '3.5x', pt: '3.5x em Pokémon debaixo d\'água.', en: '3.5x on Pokémon underwater.', tags: ['water'] },
      { id: 'nest', name: 'Nest Ball', b1: '#a7c957', b2: '#f1f1f1', b3: '#f4a261', mult: '1x a 4x', pt: 'Melhor quanto menor o nível do alvo (até 4x abaixo do nível 10).', en: 'Better the lower the target\'s level (up to 4x under level 10).', tags: [] },
      { id: 'friend', name: 'Friend Ball', b1: '#43aa8b', b2: '#f1f1f1', b3: '#f94144', mult: '1x', pt: 'Após capturar: amizade começa em 150.', en: 'After capture: friendship starts at 150.', tags: ['after'] },
      { id: 'luxury', name: 'Luxury Ball', b1: '#1d1d1d', b2: '#1d1d1d', b3: '#f4a261', mult: '1x', pt: 'Após capturar: amizade sobe mais rápido.', en: 'After capture: friendship rises faster.', tags: ['after'] },
      { id: 'heal', name: 'Heal Ball', b1: '#ff99c8', b2: '#f1f1f1', b3: '#6a4c93', mult: '1x', pt: 'Após capturar: cura totalmente HP, PP e status.', en: 'After capture: fully heals HP, PP and status.', tags: ['after'] },
      { id: 'premier', name: 'Premier Ball', b1: '#f1f1f1', b2: '#f1f1f1', b3: '#e63946', mult: '1x', pt: 'Igual à Poké Ball, só é mais bonita.', en: 'Same as a Poké Ball, just prettier.', tags: [] },
      { id: 'safari', name: 'Safari Ball', b1: '#6a994e', b2: '#a7c957', b3: '#386641', mult: '1.5x', pt: '1.5x em biomas de planície ou savana.', en: '1.5x in plains or savanna biomes.', tags: [] }
    ],
    itemCats: ['med', 'iv', 'vit', 'candy', 'evo', 'held', 'battle', 'cook', 'berry', 'bait'],
    /* Página de item: rotas de obtenção e usos (id = nome EN em snake_case) */
    itemMeta: {
      poke_ball: { craft: true, loot: [['Mina abandonada', 'Mineshaft'], ['Templo da selva', 'Jungle Temple'], ['Naufrágio', 'Shipwreck'], ['Vila', 'Village']], buy: { pt: 'Vendedor da vila: 200 PokéDollars', en: 'Village vendor: 200 PokéDollars' } },
      ultra_ball: { craft: true, loot: [['Cidade antiga', 'Ancient City'], ['Cidade do End', 'End City']], buy: { pt: 'Vendedor da vila: 800 PokéDollars', en: 'Village vendor: 800 PokéDollars' } },
      fire_stone: { drop: [[6, 'Charizard', 5], [5, 'Charmeleon', 3], [4, 'Charmander', 1]], loot: [['Fortaleza do Nether', 'Nether Fortress'], ['Bastião', 'Bastion Remnant']], evo: [[133, 'Eevee', 136, 'Flareon'], [37, 'Vulpix', 38, 'Ninetales'], [58, 'Growlithe', 59, 'Arcanine']] },
      thunder_stone: { drop: [[25, 'Pikachu', 2], [26, 'Raichu', 5]], loot: [['Mina abandonada', 'Mineshaft'], ['Fortaleza', 'Stronghold']], evo: [[133, 'Eevee', 135, 'Jolteon'], [25, 'Pikachu', 26, 'Raichu'], [603, 'Eelektrik', 604, 'Eelektross']] },
      rare_candy: { drop: [[143, 'Snorlax', 10], [149, 'Dragonite', 5]], loot: [['Cidade antiga', 'Ancient City'], ['Câmaras de provação', 'Trial Chambers']], fish: true },
      exp_candy_l: { drop: [[150, 'Mewtwo', 30]], loot: [['Cidade do End', 'End City']], buy: { pt: 'Recompensa de raid tier 3+', en: 'Raid reward tier 3+' } },
      protein: { craft: true, drop: [[448, 'Lucario', 8]], buy: { pt: 'Vendedor da vila: 9.800 PokéDollars', en: 'Village vendor: 9,800 PokéDollars' } },
      pomeg_berry: { plant: [['Selva', 'Jungle'], ['Pântano', 'Swamp'], ['Floresta', 'Forest']], drop: [[1, 'Bulbasaur', 15]] },
      ancient_dna_sample: { drop: [[142, 'Aerodactyl', 5]], loot: [['Cidade antiga', 'Ancient City'], ['Deep Dark', 'Deep Dark']], revive: [[150, 'Mewtwo']] },
      charizardite_x: { loot: [['Ruínas Mega (Mega Showdown)', 'Mega Ruins (Mega Showdown)'], ['Meteorito', 'Meteorite']], buy: { pt: 'Loja do Mega Showdown', en: 'Mega Showdown shop' }, form: [[6, 'Charizard', 'Mega X']] },
      adamant_mint: { plant: [['Montanhas', 'Mountains'], ['Picos', 'Peaks']] }
    },
    itemNames: { charcoal: ['Carvão', 'Charcoal'], blaze_powder: ['Pó de Blaze', 'Blaze Powder'], star_piece: ['Fragmento de Estrela', 'Star Piece'], comet_shard: ['Estilhaço de Cometa', 'Comet Shard'], iron_ingot: ['Barra de Ferro', 'Iron Ingot'], bone: ['Osso', 'Bone'], oran_berry: ['Oran Berry', 'Oran Berry'],
      old_amber_fossil: ['Âmbar Antigo', 'Old Amber'], ancient_dna_sample: ['Amostra de DNA Antigo', 'Ancient DNA Sample'], charizardite_x: ['Charizardite X', 'Charizardite X'], charizardite_y: ['Charizardite Y', 'Charizardite Y'], keystone: ['Pedra-Chave', 'Key Stone'], max_soup: ['Sopa Max', 'Max Soup'], gigantamax_factor: ['Fator Gigantamax', 'Gigantamax Factor'],
      hyper_potion: ['Hiper Poção', 'Hyper Potion'], hard_stone: ['Pedra Dura', 'Hard Stone'], mystic_water: ['Água Mística', 'Mystic Water'], black_sludge: ['Lodo Negro', 'Black Sludge'], miracle_seed: ['Semente Milagrosa', 'Miracle Seed'], magnet: ['Ímã', 'Magnet'], soft_sand: ['Areia Macia', 'Soft Sand'], never_melt_ice: ['Gelo Eterno', 'Never-Melt Ice'], expert_belt: ['Cinto de Perito', 'Expert Belt'], smooth_rock: ['Rocha Lisa', 'Smooth Rock'], dragon_fang: ['Presa de Dragão', 'Dragon Fang'], black_belt: ['Faixa Preta', 'Black Belt'], silk_scarf: ['Lenço de Seda', 'Silk Scarf'], twisted_spoon: ['Colher Torcida', 'Twisted Spoon'], atm_trainer_token: ['Ficha de Treinador ATM', 'ATM Trainer Token'], full_heal: ['Cura Total', 'Full Heal'], x_defense: ['X Defesa', 'X Defense'], honey: ['Mel', 'Honey'] },
    items: [
      { cat: 'med', ico: 'heart-pulse', pt: 'Poção', en: 'Potion', dpt: 'Recupera 20 HP.', den: 'Restores 20 HP.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'med', ico: 'heart-pulse', pt: 'Super Poção', en: 'Super Potion', dpt: 'Recupera 60 HP.', den: 'Restores 60 HP.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'med', ico: 'heart-pulse', pt: 'Restaurar Total', en: 'Full Restore', dpt: 'Recupera todo o HP e cura qualquer status.', den: 'Fully restores HP and cures any status.', hpt: 'Clique com o item no Pokémon ou use na batalha', hen: 'Click the Pokémon with the item or use in battle' },
      { cat: 'med', ico: 'sparkles', pt: 'Reviver', en: 'Revive', dpt: 'Revive um Pokémon desmaiado com metade do HP.', den: 'Revives a fainted Pokémon with half HP.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'vit', ico: 'flask-conical', pt: 'Proteína', en: 'Protein', dpt: 'Aumenta os EVs de Ataque em 10.', den: 'Raises Attack EVs by 10.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'vit', ico: 'flask-conical', pt: 'Ferro', en: 'Iron', dpt: 'Aumenta os EVs de Defesa em 10.', den: 'Raises Defense EVs by 10.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'vit', ico: 'flask-conical', pt: 'Carboidrato', en: 'Carbos', dpt: 'Aumenta os EVs de Velocidade em 10.', den: 'Raises Speed EVs by 10.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'vit', ico: 'flask-conical', pt: 'HP Up', en: 'HP Up', dpt: 'Aumenta os EVs de HP em 10.', den: 'Raises HP EVs by 10.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'iv', ico: 'candy', pt: 'Doce de Saúde', en: 'Health Candy', dpt: '+1 IV de HP.', den: '+1 HP IV.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'iv', ico: 'candy', pt: 'Doce de Poder', en: 'Mighty Candy', dpt: '+1 IV de Ataque.', den: '+1 Attack IV.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'iv', ico: 'candy', pt: 'Doce de Resistência', en: 'Tough Candy', dpt: '+1 IV de Defesa.', den: '+1 Defense IV.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'iv', ico: 'candy', pt: 'Doce de Inteligência', en: 'Smart Candy', dpt: '+1 IV de At. Esp..', den: '+1 Sp. Atk IV.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'iv', ico: 'candy', pt: 'Doce de Coragem', en: 'Courage Candy', dpt: '+1 IV de Def. Esp..', den: '+1 Sp. Def IV.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'iv', ico: 'candy', pt: 'Doce de Rapidez', en: 'Quick Candy', dpt: '+1 IV de Velocidade.', den: '+1 Speed IV.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'iv', ico: 'candy-off', pt: 'Doce de Doença', en: 'Sickly Candy', dpt: '-1 IV de HP.', den: '-1 HP IV.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'iv', ico: 'candy-off', pt: 'Doce de Fraqueza', en: 'Weak Candy', dpt: '-1 IV de Ataque.', den: '-1 Attack IV.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'iv', ico: 'candy-off', pt: 'Doce de Fragilidade', en: 'Brittle Candy', dpt: '-1 IV de Defesa.', den: '-1 Defense IV.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'iv', ico: 'candy-off', pt: 'Doce de Dormência', en: 'Numb Candy', dpt: '-1 IV de At. Esp..', den: '-1 Sp. Atk IV.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'iv', ico: 'candy-off', pt: 'Doce de Covardia', en: 'Coward Candy', dpt: '-1 IV de Def. Esp..', den: '-1 Sp. Def IV.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'iv', ico: 'candy-off', pt: 'Doce de Lentidão', en: 'Slow Candy', dpt: '-1 IV de Velocidade.', den: '-1 Speed IV.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'vit', ico: 'flask-conical', pt: 'Cálcio', en: 'Calcium', dpt: 'Aumenta os EVs de At. Esp. em 10.', den: 'Raises Sp. Atk EVs by 10.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'vit', ico: 'flask-conical', pt: 'Zinco', en: 'Zinc', dpt: 'Aumenta os EVs de Def. Esp. em 10.', den: 'Raises Sp. Def EVs by 10.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'vit', ico: 'dumbbell', pt: 'Power Bracer', en: 'Power Bracer', dpt: '+8 EV de Ataque ao ganhar EXP.', den: '+8 Attack EVs when gaining EXP.', hpt: 'Segure o item', hen: 'Hold the item' },
      { cat: 'vit', ico: 'dumbbell', pt: 'Power Weight', en: 'Power Weight', dpt: '+8 EV de HP ao ganhar EXP.', den: '+8 HP EVs when gaining EXP.', hpt: 'Segure o item', hen: 'Hold the item' },
      { cat: 'vit', ico: 'dumbbell', pt: 'Power Anklet', en: 'Power Anklet', dpt: '+8 EV de Velocidade ao ganhar EXP.', den: '+8 Speed EVs when gaining EXP.', hpt: 'Segure o item', hen: 'Hold the item' },
      { cat: 'vit', ico: 'cherry', pt: 'Pomeg Berry', en: 'Pomeg Berry', dpt: '-10 EV de HP, +amizade.', den: '-10 HP EVs, +friendship.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'vit', ico: 'cherry', pt: 'Kelpsy Berry', en: 'Kelpsy Berry', dpt: '-10 EV de Ataque, +amizade.', den: '-10 Attack EVs, +friendship.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'vit', ico: 'cherry', pt: 'Qualot Berry', en: 'Qualot Berry', dpt: '-10 EV de Defesa, +amizade.', den: '-10 Defense EVs, +friendship.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'vit', ico: 'cherry', pt: 'Hondew Berry', en: 'Hondew Berry', dpt: '-10 EV de At. Esp., +amizade.', den: '-10 Sp. Atk EVs, +friendship.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'vit', ico: 'cherry', pt: 'Grepa Berry', en: 'Grepa Berry', dpt: '-10 EV de Def. Esp., +amizade.', den: '-10 Sp. Def EVs, +friendship.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'vit', ico: 'cherry', pt: 'Tamato Berry', en: 'Tamato Berry', dpt: '-10 EV de Velocidade, +amizade.', den: '-10 Speed EVs, +friendship.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'candy', ico: 'candy', pt: 'Exp. Candy XS', en: 'Exp. Candy XS', dpt: 'Dá 100 pontos de EXP.', den: 'Grants 100 EXP points.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'candy', ico: 'candy', pt: 'Exp. Candy M', en: 'Exp. Candy M', dpt: 'Dá 3.000 pontos de EXP.', den: 'Grants 3,000 EXP points.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'candy', ico: 'candy', pt: 'Exp. Candy XL', en: 'Exp. Candy XL', dpt: 'Dá 30.000 pontos de EXP.', den: 'Grants 30,000 EXP points.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'battle', ico: 'leaf', pt: 'Hortelã Modesta', en: 'Modest Mint', dpt: 'Muda os bônus de stats para a natureza Modest (+At. Esp., -Ataque).', den: 'Changes stat bonuses to the Modest nature (+Sp. Atk, -Attack).', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'battle', ico: 'leaf', pt: 'Hortelã Alegre', en: 'Jolly Mint', dpt: 'Muda os bônus de stats para a natureza Jolly (+Velocidade, -At. Esp.).', den: 'Changes stat bonuses to the Jolly nature (+Speed, -Sp. Atk).', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'candy', ico: 'candy', pt: 'Exp. Candy S', en: 'Exp. Candy S', dpt: 'Dá 800 pontos de EXP.', den: 'Grants 800 EXP points.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'candy', ico: 'candy', pt: 'Exp. Candy L', en: 'Exp. Candy L', dpt: 'Dá 10.000 pontos de EXP.', den: 'Grants 10,000 EXP points.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'candy', ico: 'candy', pt: 'Doce Raro', en: 'Rare Candy', dpt: 'Aumenta o nível em 1.', den: 'Raises the level by 1.', hpt: 'Clique com o item no Pokémon (respeita o level cap)', hen: 'Click the Pokémon with the item (respects the level cap)' },
      { cat: 'evo', ico: 'gem', pt: 'Pedra do Fogo', en: 'Fire Stone', dpt: 'Evolui certos Pokémon de Fogo (Eevee, Growlithe, Vulpix).', den: 'Evolves certain Fire Pokémon (Eevee, Growlithe, Vulpix).', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'evo', ico: 'cable', pt: 'Link Cable', en: 'Link Cable', dpt: 'Substitui a evolução por troca (Haunter, Kadabra, Machoke).', den: 'Replaces trade evolution (Haunter, Kadabra, Machoke).', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'evo', ico: 'gem', pt: 'Pedra do Trovão', en: 'Thunder Stone', dpt: 'Evolui Pikachu, Eevee (Jolteon) e Eelektrik.', den: 'Evolves Pikachu, Eevee (Jolteon) and Eelektrik.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'held', ico: 'shield', pt: 'Leftovers', en: 'Leftovers', dpt: 'Recupera 1/16 do HP por turno.', den: 'Restores 1/16 HP each turn.', hpt: 'Segure o item (arraste na tela do Pokémon)', hen: 'Hold the item (drag it on the Pokémon screen)' },
      { cat: 'held', ico: 'shield', pt: 'Choice Scarf', en: 'Choice Scarf', dpt: 'Velocidade x1.5, mas trava no primeiro golpe usado.', den: 'Speed x1.5, but locks into the first move used.', hpt: 'Segure o item', hen: 'Hold the item' },
      { cat: 'held', ico: 'shield', pt: 'Life Orb', en: 'Life Orb', dpt: 'Golpes 30% mais fortes; perde 10% do HP por ataque.', den: 'Moves 30% stronger; loses 10% HP per attack.', hpt: 'Segure o item', hen: 'Hold the item' },
      { cat: 'held', ico: 'shield', pt: 'Everstone', en: 'Everstone', dpt: 'Impede a evolução enquanto segurado.', den: 'Prevents evolution while held.', hpt: 'Segure o item', hen: 'Hold the item' },
      { cat: 'battle', ico: 'zap', pt: 'X Attack', en: 'X Attack', dpt: 'Aumenta o Ataque em 2 estágios na batalha.', den: 'Raises Attack by 2 stages in battle.', hpt: 'Use na batalha', hen: 'Use in battle' },
      { cat: 'battle', ico: 'dna', pt: 'Adesivo de Habilidade', en: 'Ability Patch', dpt: 'Troca para a habilidade oculta.', den: 'Switches to the hidden ability.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'battle', ico: 'dna', pt: 'Cápsula de Habilidade', en: 'Ability Capsule', dpt: 'Alterna entre as habilidades normais.', den: 'Switches between the regular abilities.', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'battle', ico: 'leaf', pt: 'Hortelã Firme', en: 'Adamant Mint', dpt: 'Muda os bônus de stats para a natureza Adamant (+Atk, -SpA).', den: 'Changes stat bonuses to the Adamant nature (+Atk, -SpA).', hpt: 'Clique com o item no Pokémon', hen: 'Click the Pokémon with the item' },
      { cat: 'cook', ico: 'cake', pt: 'Poke Puff', en: 'Poké Puff', dpt: 'Aumenta a amizade.', den: 'Raises friendship.', hpt: 'Cozinhe no Campfire Pot com 3 temperos e dê ao Pokémon', hen: 'Cook in the Campfire Pot with 3 seasonings and give it to the Pokémon' },
      { cat: 'cook', ico: 'cup-soda', pt: 'Aprijuice', en: 'Aprijuice', dpt: 'Altera bônus de stats de montaria.', den: 'Changes mount stat bonuses.', hpt: 'Cozinhe com Apricorns no Campfire Pot e dê ao Pokémon', hen: 'Cook with Apricorns in the Campfire Pot and give it to the Pokémon' },
      { cat: 'cook', ico: 'coffee', pt: 'Sinister Tea', en: 'Sinister Tea', dpt: 'Efeitos de poção (cura HP e status).', den: 'Potion effects (heals HP and status).', hpt: 'Cozinhe no Campfire Pot com Sinistea e beba ou dê ao Pokémon', hen: 'Cook in the Campfire Pot with Sinistea and drink it or give it to the Pokémon' },
      { cat: 'cook', ico: 'cooking-pot', pt: 'Curry', en: 'Curry', dpt: 'Cura, aumenta amizade e dá EXP conforme os ingredientes.', den: 'Heals, raises friendship and grants EXP based on ingredients.', hpt: 'Cozinhe no Campfire Pot com 3 temperos', hen: 'Cook in the Campfire Pot with 3 seasonings' },
      { cat: 'berry', ico: 'cherry', pt: 'Oran Berry', en: 'Oran Berry', dpt: 'Recupera 10 HP quando o HP fica baixo.', den: 'Restores 10 HP when HP gets low.', hpt: 'Segure o item ou clique no Pokémon', hen: 'Hold the item or click the Pokémon' },
      { cat: 'berry', ico: 'cherry', pt: 'Sitrus Berry', en: 'Sitrus Berry', dpt: 'Recupera 1/4 do HP quando o HP fica baixo.', den: 'Restores 1/4 HP when HP gets low.', hpt: 'Segure o item', hen: 'Hold the item' },
      { cat: 'berry', ico: 'cherry', pt: 'Lum Berry', en: 'Lum Berry', dpt: 'Cura qualquer status.', den: 'Cures any status condition.', hpt: 'Segure o item', hen: 'Hold the item' },
      { cat: 'berry', ico: 'cherry', pt: 'Leppa Berry', en: 'Leppa Berry', dpt: 'Recupera 10 PP de um golpe.', den: 'Restores 10 PP of a move.', hpt: 'Segure o item', hen: 'Hold the item' },
      { cat: 'bait', ico: 'fish', pt: 'Aguav Berry (isca)', en: 'Aguav Berry (bait)', dpt: '50% de chance de natureza focada em Def. Esp.', den: '50% chance of a Sp. Def focused nature.', hpt: 'Coloque na vara de pescar (Poké Rod) antes de lançar', hen: 'Put it on the fishing rod (Poké Rod) before casting' },
      { cat: 'bait', ico: 'fish', pt: 'Kelpsy Berry (isca)', en: 'Kelpsy Berry (bait)', dpt: '50% de chance de natureza focada em Defesa.', den: '50% chance of a Defense focused nature.', hpt: 'Coloque na vara de pescar', hen: 'Put it on the fishing rod' },
      { cat: 'bait', ico: 'fish', pt: 'Hondew Berry (isca)', en: 'Hondew Berry (bait)', dpt: '50% de chance de natureza focada em At. Esp.', den: '50% chance of a Sp. Atk focused nature.', hpt: 'Coloque na vara de pescar', hen: 'Put it on the fishing rod' },
      { cat: 'bait', ico: 'fish', pt: 'Mel', en: 'Honey', dpt: 'Atrai mais Pokémon shiny na pesca (chance dobrada).', den: 'Attracts more shiny Pokémon while fishing (double chance).', hpt: 'Coloque na vara de pescar', hen: 'Put it on the fishing rod' }
    ]
  });
  const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  const STAT_COLORS = ['var(--s-hp)', 'var(--s-atk)', 'var(--s-def)', 'var(--s-spa)', 'var(--s-spd)', 'var(--s-spe)'];

  /* ------------------------------------------------------------------
     ESTADO
     ------------------------------------------------------------------ */
  const state = {
    lang: 'pt', theme: 'classico', sound: false, phone: false, screen: 'home',
    detailId: 6, shiny: false, moveTab: 'level', formIdx: 0, teamAdded: {}, weakFilter: 'all',
    series: 'rr', defeated: { rr: [true, true, true] }, trainerOpen: null, ballFilter: 'all', itemCat: 'med', itemQuery: '', itemOpen: null,
    termsDefault: 'pt', termsOverride: {}, itemId: 'poke_ball', back: [],
    filters: { types: [], gen: 'all', evo: 'all', sort: 'num', status: 'all' },
    capTimers: []
  };

  /* ------------------------------------------------------------------
     SONS (arquivos oficiais em assets/sons). SFX de UI respeitam o toggle (padrão ligado, salvo no
     localStorage); o grito do Pokémon é ação explícita e toca sempre. Nunca sobrepõe o mesmo som.
     Autoplay bloqueado antes do 1º gesto: o som fica pendente e toca no 1º clique, sem erro no console.
     ------------------------------------------------------------------ */
  const SFX = {}; let pendingSfx = null; window.__sfx = SFX; /* exposto só para o self-check do protótipo */
  const CRIES = ['bulbasaur', 'charmander', 'charmeleon', 'charizard', 'pikachu', 'eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon', 'mewtwo', 'mew', 'lucario', 'riolu', 'gengar', 'snorlax', 'dragonite', 'aerodactyl', 'jirachi', 'staryu', 'starmie', 'geodude', 'onix', 'cranidos'];
  function sfxEl(name, dir) {
    const key = (dir || 'ui') + '/' + name;
    if (!SFX[key]) { const a = new Audio(`assets/sons/${dir || 'ui'}/${name}.ogg`); a.preload = 'auto'; a.volume = 0.5; SFX[key] = a; }
    return SFX[key];
  }
  function playRaw(name, dir) {
    const a = sfxEl(name, dir); if (!a.paused) return a;
    a.currentTime = 0; const p = a.play();
    if (p && p.catch) p.catch(() => { pendingSfx = pendingSfx || { name, dir }; });
    return a;
  }
  const sfx = (name) => { if (state.sound) playRaw(name, 'ui'); };
  document.addEventListener('pointerdown', () => { if (pendingSfx && state.sound) { const q = pendingSfx; pendingSfx = null; playRaw(q.name, q.dir); } }, true);
  /* Ícones Lucide: converte <i data-lucide> em SVG após cada render */
  const icons = () => { if (window.lucide) window.lucide.createIcons(); };
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const t = (k) => (I18N[k] ? I18N[k][state.lang] : k);
  /* Idioma dos TERMOS DO JOGO (independente da UI): padrão em Configurações + override por card, persistido no localStorage */
  try { const saved = JSON.parse(localStorage.getItem('pontindex.terms') || 'null'); if (saved) { state.termsDefault = saved.d || 'pt'; state.termsOverride = saved.o || {}; } } catch (e) {}
  const saveTerms = () => { try { localStorage.setItem('pontindex.terms', JSON.stringify({ d: state.termsDefault, o: state.termsOverride })); } catch (e) {} };
  const tl = (card) => state.termsOverride[card] || state.termsDefault;
  const termsTgl = (card) => `<div class="seg seg-xs terms-tgl" data-tcard="${card}" title="PT | EN"><i data-lucide="languages"></i>${['pt', 'en'].map(l => `<button class="${tl(card) === l ? 'active' : ''}" data-tl="${l}">${l.toUpperCase()}</button>`).join('')}</div>`;
  /* Traduções de termos usados nos times dos treinadores e nas bolas */
  const MOVE_PT = { 'Tackle': 'Investida', 'Rock Throw': 'Lançamento de Pedra', 'Defense Curl': 'Enrolar Defensivo', 'Rock Polish': 'Polir Pedra', 'Bind': 'Amarrar', 'Rock Tomb': 'Tumba de Pedra', 'Harden': 'Endurecer', 'Wing Attack': 'Ataque de Asa', 'Bite': 'Mordida', 'Confuse Ray': 'Raio Confuso', 'Astonish': 'Assombrar', 'Ember': 'Brasa', 'Howl': 'Uivo', 'Smog': 'Fumaça', 'Water Pulse': 'Pulso de Água', 'Swift': 'Rajada Certeira', 'Rapid Spin': 'Giro Rápido', 'Recover': 'Recuperar', 'Psybeam': 'Psicorraio', 'Leaf Blade': 'Lâmina de Folha', 'Quick Attack': 'Ataque Rápido', 'Pursuit': 'Perseguição', 'Fury Cutter': 'Corte de Fúria', 'Mud Shot': 'Tiro de Lama', 'Water Gun': 'Jato de Água', 'Bide': 'Aguardar', 'Rock Smash': 'Quebra-Pedra', 'Spark': 'Faísca', 'Sonic Boom': 'Estrondo Sônico', 'Rollout': 'Rolamento', 'Screech': 'Guincho', 'Thunderbolt': 'Relâmpago', 'Flash Cannon': 'Canhão de Luz', 'Thunder Wave': 'Onda de Trovão', 'Magnet Bomb': 'Bomba Magnética', 'Double Team': 'Duplo Time', 'Giga Drain': 'Giga Dreno', 'Sleep Powder': 'Pó do Sono', 'Ancient Power': 'Poder Ancestral', 'Knock Off': 'Derrubar', 'Sludge Bomb': 'Bomba de Lodo', 'Sunny Day': 'Dia Ensolarado', 'Petal Dance': 'Dança das Pétalas', 'Moonlight': 'Luar', 'Earth Power': 'Poder da Terra', 'Ice Beam': 'Raio de Gelo', 'Superpower': 'Superpoder', 'Earthquake': 'Terremoto', 'Stone Edge': 'Gume de Pedra', 'Megahorn': 'Megachifre', 'Fire Punch': 'Soco de Fogo', 'Sludge Wave': 'Onda de Lodo', 'Surf': 'Surfar', 'Rest': 'Descanso', 'Sleep Talk': 'Falar Dormindo', 'Icicle Spear': 'Lança de Gelo', 'Rock Blast': 'Explosão de Pedra', 'Shell Smash': 'Quebra-Casco', 'Hydro Pump': 'Hidrobomba', 'Freeze-Dry': 'Congelar a Seco', 'Ice Shard': 'Estilhaço de Gelo', 'Hurricane': 'Furacão', 'Brave Bird': 'Pássaro Bravo', 'Heat Wave': 'Onda de Calor', 'Roost': 'Empoleirar', 'Psychic': 'Psíquico', 'Focus Blast': 'Explosão Focada', 'Shadow Ball': 'Bola Sombria', 'Calm Mind': 'Mente Calma', 'Swords Dance': 'Dança das Espadas', 'Waterfall': 'Cachoeira', 'Crunch': 'Mastigada', 'Ice Fang': 'Presa de Gelo', 'Dragon Dance': 'Dança do Dragão', 'Flare Blitz': 'Investida de Fogo', 'Extreme Speed': 'Velocidade Extrema', 'Wild Charge': 'Carga Selvagem', 'Close Combat': 'Combate Corporal', 'Fire Blast': 'Rajada de Fogo', 'Air Slash': 'Corte de Ar', 'Solar Beam': 'Raio Solar', 'Dragon Pulse': 'Pulso do Dragão', 'Stealth Rock': 'Pedras Furtivas', 'Headbutt': 'Cabeçada', 'Leer': 'Encarar', 'Take Down': 'Derrubada', 'Magical Leaf': 'Folha Mágica', 'Leech Seed': 'Semente Sanguessuga', 'Growth': 'Crescimento', 'Safeguard': 'Salvaguarda', 'Razor Leaf': 'Folha Navalha', 'Reflect': 'Refletir', 'Withdraw': 'Recolher', 'Absorb': 'Absorver', 'Poison Sting': 'Ferrão Venenoso', 'Grass Knot': 'Nó de Grama', 'Stun Spore': 'Esporo Paralisante', 'Dark Pulse': 'Pulso Sombrio', 'Silver Wind': 'Vento Prateado', 'Embargo': 'Embargo', 'Dragon Rush': 'Investida do Dragão', 'Brick Break': 'Quebra-Tijolo', 'Giga Impact': 'Giga Impacto', 'Mirror Coat': 'Manto Espelhado', 'Aqua Ring': 'Anel de Água', 'Icy Wind': 'Vento Gelado', 'Feint Attack': 'Ataque Fingido', 'Taunt': 'Provocar', 'Ingrain': 'Enraizar', 'Mist': 'Névoa', 'Outrage': 'Fúria', 'Aura Sphere': 'Esfera de Aura', 'Bone Rush': 'Investida de Osso', 'Metal Claw': 'Garra de Metal', 'Nasty Plot': 'Plano Maligno', 'Body Slam': 'Pancada Corporal', 'Curse': 'Maldição', 'Baby-Doll Eyes': 'Olhos de Boneca', 'Iron Tail': 'Cauda de Ferro', 'Nuzzle': 'Afago', 'Psystrike': 'Psicogolpe' };
  const ABIL_PT = { 'Sturdy': 'Robustez', 'Inner Focus': 'Força Interior', 'Flash Fire': 'Fogo Instantâneo', 'Natural Cure': 'Cura Natural', 'Illuminate': 'Iluminar', 'Overgrow': 'Crescimento Excessivo', 'Torrent': 'Torrente', 'Static': 'Estática', 'Chlorophyll': 'Clorofila', 'Effect Spore': 'Esporo de Efeito', 'Poison Point': 'Ponto Venenoso', 'Rock Head': 'Cabeça de Pedra', 'Sheer Force': 'Força Bruta', 'Thick Fat': 'Gordura Espessa', 'Skill Link': 'Elo de Habilidade', 'Water Absorb': 'Absorver Água', 'No Guard': 'Sem Guarda', 'Magic Guard': 'Guarda Mágica', 'Intimidate': 'Intimidar', 'Solar Power': 'Poder Solar', 'Mold Breaker': 'Quebra-Molde', 'Pressure': 'Pressão', 'Sand Veil': 'Véu de Areia', 'Marvel Scale': 'Escama Maravilha', 'Snow Warning': 'Aviso de Neve', 'Blaze': 'Chama', 'Multiscale': 'Multiescama', 'Cursed Body': 'Corpo Amaldiçoado', 'Adaptability': 'Adaptabilidade' };
  const ITEM_PT = { 'Hard Stone': 'Pedra Dura', 'Mystic Water': 'Água Mística', 'Black Sludge': 'Lodo Negro', 'Miracle Seed': 'Semente Milagrosa', 'Magnet': 'Ímã', 'Soft Sand': 'Areia Macia', 'Never-Melt Ice': 'Gelo Eterno', 'Expert Belt': 'Cinto de Perito', 'Smooth Rock': 'Rocha Lisa', 'Dragon Fang': 'Presa de Dragão', 'Black Belt': 'Faixa Preta', 'Silk Scarf': 'Lenço de Seda', 'Twisted Spoon': 'Colher Torcida', 'ATM Trainer Token': 'Ficha de Treinador ATM', 'Potion': 'Poção', 'Super Potion': 'Super Poção', 'Hyper Potion': 'Hiper Poção', 'Full Restore': 'Restaurar Total', 'Full Heal': 'Cura Total', 'X Defense': 'X Defesa', 'Old Amber': 'Âmbar Antigo', 'Ancient DNA Sample': 'Amostra de DNA Antigo', 'Master Ball': 'Bola Mestra', 'Charcoal': 'Carvão', 'Fire Stone': 'Pedra do Fogo' };
  const EGG_PT = { 'Field': 'Campo', 'Human-like': 'Humanoide', 'Monster': 'Monstro', 'Dragon': 'Dragão', 'Flying': 'Voador', 'Undiscovered': 'Desconhecido' };
  const BALL_PT = { poke: 'Pokébola', great: 'Grande Bola', ultra: 'Ultra Bola', master: 'Bola Mestra', net: 'Bola de Rede', dusk: 'Bola do Crepúsculo', fast: 'Bola Rápida', heavy: 'Bola Pesada', love: 'Bola do Amor', beast: 'Bola Fera', quick: 'Bola Veloz', timer: 'Bola Temporizada', repeat: 'Bola de Repetição', level: 'Bola de Nível', lure: 'Bola Isca', moon: 'Bola Lunar', dive: 'Bola de Mergulho', nest: 'Bola Ninho', friend: 'Bola da Amizade', luxury: 'Bola de Luxo', heal: 'Bola de Cura', premier: 'Bola Premier', safari: 'Bola Safári' };
  const term = (en, map, L) => (L === 'pt' && map[en]) ? map[en] : en;
  const termPair = (en, map, L) => { const pt = map[en]; return pt ? (L === 'pt' ? `${pt}<small>${en}</small>` : `${en}<small>${pt}</small>`) : en; };
  const ballName = (b, L) => L === 'pt' ? `${BALL_PT[b.id]}<small>${b.name}</small>` : `${b.name}<small>${BALL_PT[b.id]}</small>`;
  const tn = (type, L) => TYPES[type][L || state.lang];
  const byId = (id) => DATA.pokemon.find(p => p.id === id);
  const pad = (n) => '#' + String(n).padStart(4, '0');
  const fmtDate = (d) => state.lang === 'pt' ? d : d.split('/').reverse().join('-');

  /* ------------------------------------------------------------------
     COMPONENTES (strings HTML)
     ------------------------------------------------------------------ */
  const typeIcon = (type) => `<span class="ti t-${type}"><img src="../tipos/svg/${type}.svg" alt=""></span>`;
  const chip = (type, size, L) => `<span class="chip t-${type} ${size || ''}">${typeIcon(type)}<span>${tn(type, L)}</span></span>`;
  const badge = (p) => {
    const r = p.rarity;
    const cls = { common: 'badge-common', uncommon: 'badge-uncommon', rare: 'badge-rare', ultra: 'badge-ultra', legendary: 'badge-legendary', mythical: 'badge-mythical' }[r];
    const ico = r === 'legendary' ? '<i data-lucide="star"></i>' : r === 'mythical' ? '<i data-lucide="sparkle"></i>' : '';
    return `<span class="badge ${cls}">${ico}${t('rarity.' + r)}</span>`;
  };
  const imgArt = (id, cls, extra) => `<img class="${cls || ''}" src="${art(id)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${art(6)}'" ${extra || ''}>`;

  function pcard(p, i, showDate) {
    return `<button class="pcard g-${p.types[0]} rar-${p.rarity}" style="--i:${i};--tc:var(--t-${p.types[0]})" data-open="${p.id}">
      <div class="pcard-top"><span class="dex-num">${pad(p.id)}</span>${badge(p)}</div>
      ${p.caught ? `<img class="caught-mark" src="../pokebola.webp" alt="" title="${t('detail.caughtDone')}">` : ''}
      ${imgArt(p.id)}
      <div class="pcard-name">${p.name}</div>
      <div class="pcard-types">${p.types.map(x => chip(x, 'sm')).join('')}</div>
      ${showDate ? `<div class="caught-date">${t('captured.on')} ${fmtDate(p.date)}</div>` : ''}
    </button>`;
  }

  /* ------------------------------------------------------------------
     HOME
     ------------------------------------------------------------------ */
  function renderHome() {
    $('#team-slots').innerHTML = DATA.team.map(id => {
      if (!id) return `<div class="slot" title="${t('home.empty')}"><span class="slot-plus"><i data-lucide="plus"></i></span></div>`;
      const p = byId(id);
      return `<div class="slot filled" style="--tc:var(--t-${p.types[0]})" data-open="${id}" title="${p.name}">${imgArt(id)}<span class="slot-name">${p.name}</span></div>`;
    }).join('');
    $('#history-row').innerHTML = DATA.history.map((id, i) => {
      const p = byId(id);
      return `<div class="card hist clickable" style="animation:cardIn .5s var(--ease-out) both;animation-delay:${i * 50}ms" data-open="${id}">
        <img src="${spr(id)}" alt="" onerror="this.onerror=null;this.src='${art(id)}'">
        <div><div class="dex-num">${pad(id)}</div><div class="hist-name">${p.name}</div><div class="chips">${p.types.map(x => chip(x, 'sm')).join('')}</div></div>
      </div>`;
    }).join('');
    renderSearch();
  }

  function renderSearch() {
    const q = $('#search-input').value.trim().toLowerCase();
    const dd = $('#search-dd');
    if (!q) { dd.classList.remove('open'); dd.innerHTML = ''; return; }
    const res = DATA.pokemon.filter(p => p.name.toLowerCase().includes(q) || String(p.id) === q.replace('#', '')).slice(0, 3);
    dd.innerHTML = res.map(p => `<button class="dd-item" data-open="${p.id}">
      <img src="${spr(p.id)}" alt=""><span class="dex-num">${pad(p.id)}</span><span class="dd-name">${p.name}</span>
      <span class="dd-types">${p.types.map(x => chip(x, 'sm')).join('')}</span></button>`).join('');
    dd.classList.toggle('open', res.length > 0 && document.activeElement === $('#search-input'));
  }

  /* ------------------------------------------------------------------
     POKÉDEX / LISTA
     ------------------------------------------------------------------ */
  function renderFilters() {
    $('#filter-types').innerHTML = Object.keys(TYPES).map(k =>
      `<button class="chip sm t-${k} ${state.filters.types.includes(k) ? 'on' : ''}" data-ftype="${k}">${typeIcon(k)}<span>${tn(k)}</span><i data-lucide="check" class="chip-check"></i></button>`).join('');
  }
  function renderDex() {
    const f = state.filters;
    let list = DATA.pokemon.filter(p =>
      (f.types.length === 0 || f.types.some(x => p.types.includes(x))) &&
      (f.gen === 'all' || ('Gen ' + p.gen) === f.gen) &&
      (f.evo === 'all' || p.evo === f.evo) &&
      (f.status === 'all' || (f.status === 'caught' ? p.caught : !p.caught)));
    const bst = p => p.stats.reduce((a, b) => a + b, 0);
    list.sort((a, b) => f.sort === 'name' ? a.name.localeCompare(b.name) : f.sort === 'bst' ? bst(b) - bst(a) : a.id - b.id);
    $('#dex-count').textContent = list.length;
    $('#dex-grid').innerHTML = list.length ? list.map((p, i) => pcard(p, i)).join('') : `<p class="muted">${t('dex.none')}</p>`; icons();
  }

  /* ------------------------------------------------------------------
     FICHA
     ------------------------------------------------------------------ */
  function weaknesses(types) {
    const res = {};
    Object.keys(TYPES).forEach(atk => {
      let m = 1;
      types.forEach(def => { if (CHART[atk][2].includes(def)) m *= 2; if (CHART[atk][0.5].includes(def)) m *= 0.5; if (CHART[atk][0].includes(def)) m *= 0; });
      if (m !== 1) (res[m] = res[m] || []).push(atk);
    });
    return res;
  }
  const NAT_STAT = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  function calcStats(base, lv, iv, ev, nature) {
    return base.map((b, i) => {
      const core = Math.floor((2 * b + iv + Math.floor(ev / 4)) * lv / 100);
      if (i === 0) return core + lv + 10;
      let mult = 1; if (nature.up === i) mult = 1.1; if (nature.down === i) mult = 0.9;
      return Math.floor((core + 5) * mult);
    });
  }

  function statsBlock(stats, mirror) {
    const total = stats.reduce((a, b) => a + b, 0);
    return `<div class="stats">${stats.map((v, i) => `<div class="stat">
        <span class="stat-name">${t('stat.' + STAT_KEYS[i])}</span><span class="stat-val">${v}</span>
        <div class="bar"><i style="--w:${Math.min(100, v / 2)}%;--bc:${STAT_COLORS[i]};--d:${i * 80}ms"></i></div></div>`).join('')}
      <div class="stat-total"><span class="stat-name">${t('detail.total')}</span><span class="stat-val">${total}</span>
        <div class="bar"><i style="--w:${Math.min(100, total / 8)}%;--d:520ms"></i></div></div></div>`;
  }

  /* Componentes parciais da ficha: só eles são re-renderizados ao trocar aba/forma */
  function movesTableHTML() {
    const moves = (DATA.moves[state.detailId] || DATA.moves._)[state.moveTab]; const L = tl('moves');
    return `<table>
      <thead><tr><th>${t('col.level')}</th><th>${t('col.move')}</th><th>${t('col.type')}</th><th>${t('col.cat')}</th><th>${t('col.power')}</th><th>${t('col.acc')}</th></tr></thead>
      <tbody>${moves.map((m, i) => `<tr class="mv-row ${m.desc ? 'has-desc' : ''}" data-mv="${i}"><td class="num">${typeof m.lv === 'number' ? m.lv : t('tab.' + state.moveTab)}</td>
        <td><span class="mv-name">${L === 'pt' ? m.pt : m.en}${m.desc ? '<span class="mv-caret"><i data-lucide="chevron-down"></i></span>' : ''}</span><span class="mv-en">${L === 'pt' ? m.en : m.pt}</span></td>
        <td>${chip(m.type, 'sm', L)}</td><td><span class="cat cat-${m.cat}"><i></i>${t('cat.' + m.cat)}</span></td>
        <td class="num">${m.pow == null ? '-' : m.pow}</td><td class="num">${m.acc == null ? '-' : m.acc + '%'}</td></tr>${m.desc ? `<tr class="mv-desc"><td colspan="6"><div class="desc-wrap"><div class="desc-inner"><p class="desc-text">${state.lang === 'pt' ? m.desc.pt : m.desc.en}</p></div></div></td></tr>` : ''}`).join('')}</tbody>
    </table>`;
  }
  function formBodyHTML(forms) {
    const form = forms[Math.min(state.formIdx, forms.length - 1)], L = tl('forms');
    return `${imgArt(form.id)}
      <div class="form-info">
        <div class="types">${form.types.map(x => chip(x, '', L)).join('')}</div>
        <div class="form-req"><span class="muted">${t('form.req')}:</span> ${form.req ? form.req.map(r => `<button class="tag tag-item it-link" data-item-open="${slug(r[1])}">${itemImg(r[1], 'gem', 'xs')}${L === 'pt' ? r[0] : r[1]}</button>`).join(' + ') + (form.addon ? ` <span class="muted">(${form.addon})</span>` : '') : `<span class="muted">${t('form.none')}</span>`}</div>
        <div><span class="muted">${t('form.ability')}:</span> <strong>${state.lang === 'pt' ? form.ability[0] : form.ability[1]}</strong> <span class="muted">(${state.lang === 'pt' ? form.ability[1] : form.ability[0]})</span></div>
        <div class="show-bars">${statsBlock(form.stats)}</div>
      </div>`;
  }
  function formsOf(p) {
    const abilities = DATA.abilities[p.id] || DATA.abilities._;
    return DATA.forms[p.id] || [{ key: 'form.normal', id: p.id, types: p.types, ability: [abilities[0].pt, abilities[0].en], stats: p.stats }];
  }
  /* Troca o conteúdo de um componente com uma pequena transição (sem re-renderizar a tela) */
  function swapIn(el, html) { el.innerHTML = html; el.classList.remove('part-in'); void el.offsetWidth; el.classList.add('part-in'); icons(); }
  function updateDetailButtons() {
    const p = byId(state.detailId); const bc = $('#btn-caught'), bt = $('#btn-team'); if (!bc || !bt) return;
    const inTeam = DATA.team.includes(p.id) || state.teamAdded[p.id];
    bc.classList.toggle('done', !!p.caught); bc.querySelector('span').textContent = p.caught ? t('detail.caughtDone') : t('detail.caught');
    bt.classList.toggle('done', !!inTeam); bt.innerHTML = inTeam ? '<i data-lucide="check"></i> ' + t('detail.inTeam') : '<i data-lucide="plus"></i> ' + t('detail.addTeam'); icons();
    bt.classList.remove('part-in'); void bt.offsetWidth; bt.classList.add('part-in');
  }

  /* Painel de fraquezas: só as linhas do filtro escolhido (Todos / Fraquezas / Resistências) */
  function weakGridHTML() {
    const wk = weaknesses(byId(state.detailId).types);
    const rows = [[4, 'x4', 'mult-4'], [2, 'x2', 'mult-2'], [0.5, 'x½', 'mult-half'], [0.25, 'x¼', 'mult-quarter'], [0, 'x0', 'mult-0']]
      .filter(r => wk[r[0]] && (state.weakFilter === 'all' || (state.weakFilter === 'weak' ? r[0] > 1 : r[0] < 1)));
    const L = tl('weak');
    return rows.length ? rows.map(r => `<div class="weak-row"><span class="mult ${r[2]}">${r[1]}</span><div class="chips">${wk[r[0]].map(x => chip(x, 'sm', L)).join('')}</div></div>`).join('') : `<p class="muted">-</p>`;
  }

  /* Bloco "Como obter": métodos aplicáveis com ícone Lucide; fallback neutro quando nada se aplica */
  function obtainHTML(p, where) {
    const ico = { evo: 'arrow-up-circle', fossil: 'bone', spawn: 'map-pin', addon: 'puzzle', breed: 'egg' }; const L = tl('where');
    const rows = [];
    if (p.packSpawn && where) rows.push({ k: 'spawn', html: `<span class="badge badge-${p.bucket || 'rare'}">${t('rarity.' + (p.bucket || 'rare'))}</span> <b>${t('where.level')} ${where.levels}</b> · ${where.biomes.map(b => L === 'pt' ? b[0] : b[1]).join(', ')} <span class="tag">${t('obtain.packTag')}</span>` });
    (DATA.obtain[p.id] || []).forEach(m => {
      const txt = L === 'pt' ? m.pt : m.en;
      if (m.k === 'evo') rows.push({ k: 'evo', html: txt, extra: `<button class="ob-link" data-open="${m.pre}"><img src="${spr(m.pre)}" alt="" onerror="this.onerror=null;this.src='${art(m.pre)}'"><span>${m.preName}</span><i data-lucide="arrow-right"></i></button>` });
      else if (m.k === 'fossil') rows.push({ k: 'fossil', html: `${txt} <button class="tag tag-item it-link" data-item-open="${slug(m.item)}">${itemImg(m.item, 'bone', 'xs')}${term(m.item, ITEM_PT, L)}</button>` });
      else rows.push({ k: 'addon', title: m.name, html: txt, icon: m.name === 'Raid Dens' ? 'swords' : 'puzzle' });
    });
    if (p.egg && p.egg[0] !== 'Undiscovered') rows.push({ k: 'breed', html: t('obtain.breedText').replace('{g}', p.egg.map(g => term(g, EGG_PT, L)).join(' / ')) });
    const list = rows.length ? rows.map(r => `<div class="ob-row"><span class="ob-ico"><i data-lucide="${r.icon || ico[r.k]}"></i></span>
        <div class="ob-body"><div class="ob-title">${r.title ? t('obtain.addon') + ': ' + r.title : t('obtain.' + r.k)}</div><div class="ob-text">${r.html}</div></div>${r.extra || ''}</div>`).join('')
      : `<div class="ob-row ob-none"><span class="ob-ico"><i data-lucide="info"></i></span><div class="ob-body"><div class="ob-title">${t('obtain.none')}</div><div class="ob-text">${t('obtain.noneHint')}</div></div></div>`;
    return `<div class="obtain"><div class="ob-head">${t('obtain.title')}</div><div class="ob-list">${list}</div></div>`;
  }

  function evoHTML() {
    const p = byId(state.detailId), chainKey = DATA.chainOf[p.id], chain = chainKey ? DATA.chains[chainKey] : null, L = tl('evo');
    const M = (k) => I18N[k] ? I18N[k][L] : k;
    const STONE_ITEM = {"evo.thunderStone": "Thunder Stone", "evo.waterStone": "Water Stone", "evo.fireStone": "Fire Stone", "evo.leafStone": "Leaf Stone", "evo.iceStone": "Ice Stone", "evo.linkCable": "Link Cable"};
    const methodChip = (m) => `<${STONE_ITEM[m.k] ? `button class="method it-link" data-item-open="${slug(STONE_ITEM[m.k])}"` : 'span class="method"'}>${STONE_ITEM[m.k] ? itemImg(STONE_ITEM[m.k], m.ico || 'gem', 'xs') : `<i data-lucide="${m.ico || 'arrow-up'}"></i>`}${M(m.k)}${m.v ? ' ' + m.v : ''}${m.k2 ? ` <i data-lucide="${m.ico2}"></i>${M(m.k2)}` : ''}</${STONE_ITEM[m.k] ? 'button' : 'span'}>`;
    const node = (id, name) => `<div class="evo ${id === p.id ? 'current' : ''}" ${byId(id) ? `data-open="${id}"` : ''}>${imgArt(id)}<span class="dex-num">${pad(id)}</span><span class="evo-name">${name}</span></div>`;
    if (!chain) return `<p class="muted">${t('evo.none')}</p>`;
    const linear = chain.ids.length > 1 ? `<div class="evo-chain">${chain.ids.map((id, i) => `${i > 0 ? `<div class="evo-arrow"><span class="arr"><i data-lucide="arrow-right"></i></span>${methodChip(chain.methods[i - 1])}</div>` : ''}${node(id, chain.names[i])}`).join('')}</div>` : '';
    const branches = chain.branches ? `<div class="evo-branching"><div class="evo-root">${node(chain.ids[0], chain.names[0])}<div class="evo-root-label">${t('evo.branches')}</div></div>
      <div class="evo-branches">${chain.branches.map((b, i) => `<div class="evo-branch" style="--i:${i}"><div class="evo-edge"><span class="arr"><i data-lucide="corner-down-right"></i></span>${methodChip(b)}</div>${node(b.id, b.name)}</div>`).join('')}</div></div>` : '';
    return linear + branches;
  }
  function abilitiesHTML() {
    const p = byId(state.detailId), abilities = DATA.abilities[p.id] || DATA.abilities._, L = tl('abilities');
    return `<div class="abilities">${abilities.map(a => `<div class="ability">
            <div class="ab-name">${L === 'pt' ? a.pt : a.en}${a.hidden ? `<span class="tag">${t('detail.hidden')}</span>` : ''}<span class="ab-en">${L === 'pt' ? a.en : a.pt}</span></div>
            <div class="ab-desc">${state.lang === 'pt' ? a.descPt : a.descEn}</div></div>`).join('')}</div>`;
  }
  function whereHTML() {
    const p = byId(state.detailId), where = p.noSpawn ? null : (DATA.where[p.id] || DATA.where._), L = tl('where');
    const isSpecial = p.rarity === 'legendary' || p.rarity === 'mythical';
    return `${p.noSpawn ? '' : `<div class="where">
            <div class="kv"><span class="k">${t('where.bucket')}</span><span class="v">${isSpecial ? `<span class="badge badge-${p.bucket || 'rare'}">${t('rarity.' + (p.bucket || 'rare'))}</span>` : badge(p)}</span></div>
            <div class="kv"><span class="k">${t('where.level')}</span><span class="v">${where.levels}</span></div>
            <div class="kv"><span class="k">${t('where.biomes')}</span><div class="chips">${where.biomes.map(b => `<span class="biome">${L === 'pt' ? b[0] : b[1]}</span>`).join('')}</div></div>
            <div class="kv"><span class="k">${t('where.conditions')}</span><div class="chips">${where.conds.map(c => `<span class="cond">${c === 'cond.day' ? '<i data-lucide="sun"></i>' : c === 'cond.night' ? '<i data-lucide="moon"></i>' : '<i data-lucide="cloud"></i>'} ${I18N[c][L]}</span>`).join('')}</div></div>
            <div class="drops"><span class="k" style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">${t('where.drops')}</span>
              ${where.drops.map(d => `<div class="drop"><button class="drop-name it-link" data-item-open="${slug(d[1])}">${itemImg(d[1], 'package', 'sm')}${L === 'pt' ? d[0] : d[1]}</button><span class="pct">${d[2]}%</span><div class="drop-bar"><i style="--w:${d[2]}%"></i></div></div>`).join('')}</div>
          </div>`}
          ${obtainHTML(p, where)}`;
  }
  /* ------------------------------------------------------------------
     PÁGINA DO ITEM
     ------------------------------------------------------------------ */
  const titleCase = (id) => id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  function itemInfo(id) {
    const it = DATA.items.find(x => slug(x.en) === id);
    if (it) return { id, pt: it.pt, en: it.en, cat: it.cat, ico: it.ico, dpt: it.dpt, den: it.den, hpt: it.hpt, hen: it.hen };
    const ball = DATA.balls.find(b => b.id + '_ball' === id);
    if (ball) return { id, pt: BALL_PT[ball.id], en: ball.name, cat: 'ball', ico: 'circle-dot', dpt: ball.pt, den: ball.en, ball };
    const n = DATA.itemNames[id] || [ITEM_PT[titleCase(id)] || titleCase(id), titleCase(id)];
    return { id, pt: n[0], en: n[1], cat: 'other', ico: 'package' };
  }
  const monChip = (id, name, extra) => `<button class="mon-chip" data-open="${id}"><img src="${spr(id)}" alt="" onerror="this.onerror=null;this.src='${art(id)}'"><span>${name}</span>${extra ? `<b>${extra}</b>` : ''}</button>`;
  function itemPageBodyHTML() {
    const info = itemInfo(state.itemId), meta = DATA.itemMeta[info.id] || {}, L = tl('itempage'), U = state.lang;
    const name1 = L === 'pt' ? info.pt : info.en, name2 = L === 'pt' ? info.en : info.pt;
    const rows = [];
    if (meta.craft) rows.push(['hammer', t('ip.craft'), `<span class="badge badge-uncommon">${t('ip.craftYes')}</span>`]);
    if (meta.drop) rows.push(['gift', t('ip.drop'), `<div class="mon-chips">${meta.drop.map(d => monChip(d[0], d[1], d[2] + '%')).join('')}</div>`]);
    if (meta.plant) rows.push(['sprout', t('ip.plant'), `${t('ip.plantText')} <span class="chips">${meta.plant.map(b => `<span class="biome">${L === 'pt' ? b[0] : b[1]}</span>`).join('')}</span>`]);
    if (meta.loot) rows.push(['package-open', t('ip.loot'), `<span class="chips">${meta.loot.map(b => `<span class="biome">${L === 'pt' ? b[0] : b[1]}</span>`).join('')}</span>`]);
    if (meta.fish) rows.push(['fish', t('ip.fish'), t('ip.fishText')]);
    if (meta.buy) rows.push(['store', t('ip.buy'), U === 'pt' ? meta.buy.pt : meta.buy.en]);
    const obtain = rows.length ? rows.map((r, i) => `<div class="ob-row" style="--i:${i}"><span class="ob-ico"><i data-lucide="${r[0]}"></i></span><div class="ob-body"><div class="ob-title">${r[1]}</div><div class="ob-text">${r[2]}</div></div></div>`).join('')
      : `<div class="ob-row ob-none"><span class="ob-ico"><i data-lucide="info"></i></span><div class="ob-body"><div class="ob-title">${t('obtain.none')}</div><div class="ob-text">${t('obtain.noneHint')}</div></div></div>`;
    const used = [];
    if (meta.evo) used.push(['arrow-up-circle', t('ip.evolves'), `<div class="mon-chips">${meta.evo.map(e => `<span class="evo-pair">${monChip(e[0], e[1])}<i data-lucide="arrow-right"></i>${monChip(e[2], e[3])}</span>`).join('')}</div>`]);
    if (meta.revive) used.push(['bone', t('ip.revive'), `<div class="mon-chips">${meta.revive.map(e => monChip(e[0], e[1])).join('')}</div>`]);
    if (meta.form) used.push(['sparkles', t('ip.form'), `<div class="mon-chips">${meta.form.map(e => monChip(e[0], e[1], e[2])).join('')}</div>`]);
    if (info.ball) used.push(['target', t('ip.mult'), `<b>${info.ball.mult}</b> · ${U === 'pt' ? info.ball.pt : info.ball.en}`]);
    if (info.cat === 'cook' || info.cat === 'berry' || info.cat === 'med') used.push(['heart-pulse', t('ip.effect'), U === 'pt' ? info.dpt : info.den]);
    const usedHTML = used.length ? `<div class="panel" style="--i:2"><h3>${t('ip.used')}</h3><div class="ob-list">${used.map((r, i) => `<div class="ob-row" style="--i:${i}"><span class="ob-ico"><i data-lucide="${r[0]}"></i></span><div class="ob-body"><div class="ob-title">${r[1]}</div><div class="ob-text">${r[2]}</div></div></div>`).join('')}</div></div>` : '';
    const img = MAN[info.id] ? `<img src="assets/itens/${MAN[info.id]}/${info.id}.png" alt="">` : `<i data-lucide="${info.ico}"></i>`;
    return `<div class="item-hero card ${info.cat === 'ball' ? 'ball-tile' : 'cat-' + info.cat}">
        <div class="item-hero-tile">${img}</div>
        <div class="item-hero-info">
          <span class="badge badge-common">${t('cat.' + info.cat)}</span>
          <h2>${name1}</h2><div class="item-alt">${name2}</div>
          <p class="item-hero-desc">${info.dpt ? (U === 'pt' ? info.dpt : info.den) : t('ip.noDesc')}</p>
          ${info.hpt ? `<div class="item-how"><i data-lucide="mouse-pointer-click"></i><span><b>${t('item.how')}:</b> ${U === 'pt' ? info.hpt : info.hen}</span></div>` : ''}
        </div></div>
      <div class="panel" style="--i:1"><h3>${t('ip.obtain')}</h3><div class="ob-list">${obtain}</div></div>${usedHTML}`;
  }
  function renderItemPage() {
    $('#item-detail').innerHTML = `<div class="item-page-head"><button class="detail-back" data-back><i data-lucide="arrow-left"></i> ${t('ip.back')}</button>${termsTgl('itempage')}</div><div id="cb-itempage">${itemPageBodyHTML()}</div>`;
  }
  function openItem(id) { navigate('item', () => { state.itemId = id; renderItemPage(); }); icons(); }

  /* Registro dos cards com termos do jogo: id do card -> [container, função de HTML] */
  const TERM_CARDS = {
    where: ['#cb-where', whereHTML], moves: ['#moves-table', () => movesTableHTML()], abilities: ['#cb-abilities', abilitiesHTML], evo: ['#cb-evo', evoHTML],
    weak: ['#weak-grid', () => weakGridHTML()], best: ['#cb-best', () => bestBallHTML(byId(state.detailId))],
    forms: ['#form-body', () => formBodyHTML(formsOf(byId(state.detailId)))], itempage: ['#cb-itempage', itemPageBodyHTML],
    balls: ['#ball-grid', () => ballGridHTML()], items: ['#item-grid', () => itemGridHTML()], trainers: ['#tr-list', () => trList().map(trStepHTML).join('')]
  };

  function renderDetail() {
    const p = byId(state.detailId);
    const chainKey = DATA.chainOf[p.id];
    const chain = chainKey ? DATA.chains[chainKey] : null;
    const abilities = DATA.abilities[p.id] || DATA.abilities._;
    const where = p.noSpawn ? null : (DATA.where[p.id] || DATA.where._);
    const forms = formsOf(p);
    const isSpecial = p.rarity === 'legendary' || p.rarity === 'mythical';
    const inTeam = DATA.team.includes(p.id) || state.teamAdded[p.id];

    const html = `
    <button class="detail-back" data-back><i data-lucide="arrow-left"></i> ${t('detail.back')}</button>
    <div class="detail" style="--tc:var(--t-${p.types[0]})">
      <div class="detail-left">
        <div class="card hero-card g-${p.types[0]} ${p.rarity === 'legendary' ? 'hero-legendary' : p.rarity === 'mythical' ? 'hero-mythical' : ''}">
          <div class="hero-art ${(isSpecial ? 1 : 0) + (p.noSpawn ? 1 : 0) >= 2 ? 'stacked3' : (isSpecial || p.noSpawn) ? 'stacked' : ''}">
            ${isSpecial ? `<div class="sheen"></div><div class="sparkles">${[[12,18],[30,70],[52,12],[70,40],[86,22],[80,78],[20,46],[60,84]].map(([x, y], i) => `<i style="left:${x}%;top:${y}%;animation-delay:${(i * 0.37).toFixed(2)}s"></i>`).join('')}</div>` : ''}
            <div class="seal">${isSpecial ? badge(p) : ''}<span class="badge badge-${p.bucket || (isSpecial ? 'rare' : p.rarity)}">${t('rarity.' + (p.bucket || (isSpecial ? 'rare' : p.rarity)))}</span>${p.noSpawn ? `<span class="badge badge-nospawn">${t('detail.noSpawn')}</span>` : ''}</div>
            <button class="shiny-btn ${state.shiny ? 'on' : ''}" id="shiny-btn" title="${t('detail.shiny')}"><i data-lucide="sparkles"></i></button>
            ${CRIES.includes(p.name.toLowerCase()) ? `<button class="shiny-btn cry-btn" id="cry-btn" title="${t('detail.cry')}" data-cry="${p.name.toLowerCase()}"><i data-lucide="volume-2"></i></button>` : ''}
            <div class="hero-title"><div class="dex-num">${pad(p.id)}</div><h2>${p.name}</h2></div>
            <img id="detail-art" src="${art(p.id, state.shiny)}" alt="${p.name}" onerror="this.onerror=null;this.src='${art(p.id)}'">
          </div>
          <div class="hero-body">
            <div class="types">${p.types.map(x => chip(x, 'lg')).join('')}</div>
            <div class="hero-actions-2">
              <button class="btn btn-accent ${p.caught ? 'done' : ''}" id="btn-caught"><img class="ball-ico" src="../pokebola.webp" alt=""><span>${p.caught ? t('detail.caughtDone') : t('detail.caught')}</span></button>
              <button class="btn btn-ghost ${inTeam ? 'done' : ''}" id="btn-team">${inTeam ? '<i data-lucide="check"></i> ' + t('detail.inTeam') : '<i data-lucide="plus"></i> ' + t('detail.addTeam')}</button>
            </div>
          </div>
        </div>
        <div class="panel" style="--i:1"><h3>${t('detail.stats')}</h3>${statsBlock(p.stats)}</div>
      </div>

      <div class="detail-right">
        <div class="panel" style="--i:2"><div class="panel-head"><h3>${t('detail.weak')}</h3><div class="ph-right">
            <div class="seg seg-sm" id="weak-seg">${[['all', 'weak.all'], ['weak', 'weak.weak'], ['res', 'weak.res']].map(([v, k]) => `<button class="${state.weakFilter === v ? 'active' : ''}" data-wf="${v}">${t(k)}</button>`).join('')}</div>${termsTgl('weak')}</div></div>
          <div class="weak-grid" id="weak-grid">${weakGridHTML()}</div>
        </div>

        <div class="panel" style="--i:3"><div class="panel-head"><h3>${t('detail.evo')}</h3>${termsTgl('evo')}</div><div id="cb-evo">${evoHTML()}</div></div>

        <div class="panel" style="--i:4"><div class="panel-head"><h3>${t('detail.abilities')}</h3>${termsTgl('abilities')}</div><div id="cb-abilities">${abilitiesHTML()}</div></div>

        <div class="panel" style="--i:5"><div class="panel-head"><h3>${t('detail.moves')}</h3>${termsTgl('moves')}</div>
          <div class="tabs" id="move-tabs">${['level', 'tm', 'egg', 'tutor'].map(k => `<button class="${state.moveTab === k ? 'active' : ''}" data-mtab="${k}">${t('tab.' + k)}</button>`).join('')}</div>
          <div class="table-wrap" id="moves-table">${movesTableHTML()}</div>
        </div>

        <div class="panel" style="--i:6"><div class="panel-head"><h3>${t('detail.where')}</h3>${termsTgl('where')}</div><div id="cb-where">${whereHTML()}</div></div>

        <div class="panel" style="--i:7"><div class="panel-head"><h3>${t('ball.best')}</h3><div class="ph-right"><span class="muted">${t('ball.bestHint')}</span>${termsTgl('best')}</div></div><div id="cb-best">${bestBallHTML(p)}</div></div>

        <div class="panel" style="--i:8"><div class="panel-head"><h3>${t('detail.forms')}</h3>${termsTgl('forms')}</div>
          <div class="tabs" id="form-tabs">${forms.map((f, i) => `<button class="${i === state.formIdx ? 'active' : ''}" data-ftab="${i}">${f.key.startsWith('form.') ? t(f.key) : f.key}</button>`).join('')}</div>
          <div class="forms" id="form-body">${formBodyHTML(forms)}</div>
        </div>

        <details class="panel calc" style="--i:9" id="calc">
          <summary>${t('detail.calc')}<span class="caret"><i data-lucide="chevron-down"></i></span></summary>
          <div class="calc-body">
            <div class="calc-inputs">
              <label>${t('calc.level')}<input type="number" id="c-lv" value="50" min="1" max="100"></label>
              <label>${t('calc.nature')}<select id="c-nat">${DATA.natures.map((n, i) => `<option value="${i}">${state.lang === 'pt' ? n.pt : n.en} (${n.en})</option>`).join('')}</select></label>
              <label>${t('calc.ivs')}<input type="number" id="c-iv" value="31" min="0" max="31"></label>
              <label>${t('calc.evs')}<input type="number" id="c-ev" value="0" min="0" max="252"></label>
            </div>
            <div><div class="calc-out" id="calc-out"></div><p class="muted" style="margin-top:8px">${t('calc.hint')}</p></div>
          </div>
        </details>
      </div>
    </div>`;
    $('#detail').innerHTML = html;
    renderCalc();
  }

  function renderCalc() {
    const p = byId(state.detailId);
    const lv = +$('#c-lv').value || 1, iv = +$('#c-iv').value || 0, ev = +$('#c-ev').value || 0;
    const nat = DATA.natures[+$('#c-nat').value];
    const out = calcStats(p.stats, lv, iv, ev, nat);
    $('#calc-out').innerHTML = out.map((v, i) => `<div class="co ${nat.up === i ? 'up' : nat.down === i ? 'down' : ''}"><b>${v}</b><span>${t('stat.' + STAT_KEYS[i])}</span></div>`).join('');
  }

  /* ------------------------------------------------------------------
     CAPTURADOS / COMPARAR / CONFIG
     ------------------------------------------------------------------ */
  function renderCaptured() {
    const list = DATA.pokemon.filter(p => p.caught).sort((a, b) => b.date.split('/').reverse().join('').localeCompare(a.date.split('/').reverse().join('')));
    $('#captured-grid').innerHTML = list.map((p, i) => pcard(p, i, true)).join(''); icons();
  }

  function renderCompare() {
    const [a, b] = DATA.compare.map(byId);
    const side = (p, cls) => `<div class="card cmp-poke ${cls}">${imgArt(p.id)}<div><div class="dex-num">${pad(p.id)}</div><h3>${p.name}</h3><div class="types">${p.types.map(x => chip(x, 'sm')).join('')}</div><button class="link" data-open="${p.id}">${t('compare.change')}</button></div></div>`;
    const ta = a.stats.reduce((x, y) => x + y, 0), tb = b.stats.reduce((x, y) => x + y, 0);
    $('#compare').innerHTML = `<div class="compare">
      <div class="cmp-pick">${side(a, 'left')}<div class="cmp-vs">${t('compare.vs')}</div>${side(b, 'right')}</div>
      <div class="panel"><div class="cmp-stats">
        ${a.stats.map((v, i) => `<div class="cmp-row"><span class="v ${v > b.stats[i] ? 'win' : ''}">${v}</span>
          <div class="bar left"><i style="--w:${Math.min(100, v / 2)}%;--bc:var(--t-${a.types[0]});--d:${i * 70}ms"></i></div>
          <span class="lbl">${t('stat.' + STAT_KEYS[i])}</span>
          <div class="bar"><i style="--w:${Math.min(100, b.stats[i] / 2)}%;--bc:var(--t-${b.types[0]});--d:${i * 70}ms"></i></div>
          <span class="v r ${b.stats[i] > v ? 'win' : ''}">${b.stats[i]}</span></div>`).join('')}
        <div class="cmp-row" style="border-top:1.5px dashed var(--border);padding-top:10px"><span class="v ${ta > tb ? 'win' : ''}">${ta}</span>
          <div class="bar left"><i style="--w:${Math.min(100, ta / 8)}%;--bc:var(--t-${a.types[0]});--d:500ms"></i></div><span class="lbl">${t('compare.total')}</span>
          <div class="bar"><i style="--w:${Math.min(100, tb / 8)}%;--bc:var(--t-${b.types[0]});--d:500ms"></i></div><span class="v r ${tb > ta ? 'win' : ''}">${tb}</span></div>
      </div>
      <div style="display:flex;justify-content:center;margin-top:14px"><button class="btn btn-ghost" id="cmp-swap"><i data-lucide="arrow-left-right"></i> ${t('compare.swap')}</button></div></div>
    </div>`;
  }

  function renderTermsSetting() {
    const el = $('#terms-setting'); if (!el) return;
    el.innerHTML = `<h3>${t('settings.terms')}</h3><p class="muted">${t('settings.termsHint')}</p><div class="seg" id="terms-seg">${['pt', 'en'].map(l => `<button class="${state.termsDefault === l ? 'active' : ''}" data-tdef="${l}">${t(l === 'pt' ? 'settings.termsPt' : 'settings.termsEn')}</button>`).join('')}</div>`;
  }
  function renderThemes() {
    $('#theme-grid').innerHTML = DATA.themes.map(th => `<button class="theme-sw ${state.theme === th.id ? 'active' : ''}" data-theme-pick="${th.id}" style="--p1:${th.p1};--p2:${th.p2}">
      <div class="sw"></div><div><div class="sw-name">${t('theme.' + th.id)}${th.id === 'classico' ? ` <span class="pill">${t('settings.default')}</span>` : ''}</div><div class="sw-sub">${t('theme.' + th.id + 'Sub')}</div></div></button>`).join('');
  }

  /* ------------------------------------------------------------------
     I18N / TEMA / LAYOUT
     ------------------------------------------------------------------ */
  function applyStatic() {
    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    $$('.tgl-txt').forEach(el => { el.textContent = state.lang.toUpperCase(); });
    $$('#lang-seg button').forEach(b => b.classList.toggle('active', b.dataset.v === state.lang));
    document.documentElement.lang = state.lang === 'pt' ? 'pt-BR' : 'en';
  }
  function renderAll() {
    applyStatic(); renderHome(); renderFilters(); renderDex(); renderDetail(); renderCaptured(); renderCompare(); renderThemes(); renderTrainers(); renderBalls(); renderItems(); renderTermsSetting(); renderItemPage(); icons();
  }
  function setLang(l) { state.lang = l; renderAll(); }
  function setTheme(id) {
    state.theme = id; document.documentElement.dataset.theme = id;
    $$('.theme-sw').forEach(b => b.classList.toggle('active', b.dataset.themePick === id));
  }
  function nextTheme() { const i = DATA.themes.findIndex(x => x.id === state.theme); setTheme(DATA.themes[(i + 1) % DATA.themes.length].id); }
  function setSound(on) {
    state.sound = on; $('#sw-sound').checked = on; try { localStorage.setItem('pontindex.sound', on ? '1' : '0'); } catch (e) {}
    $$('#tgl-sound, #tgl-sound-m').forEach(b => { b.classList.toggle('off', !on); const i = b.querySelector('[data-lucide]'); if (i) i.setAttribute('data-lucide', on ? 'volume-2' : 'volume-x'); }); icons();
  }
  function updateLayout() {
    document.body.classList.toggle('phone', state.phone);
    $('#app').classList.toggle('mobile', state.phone || window.innerWidth < 900);
    $('#p-phone').classList.toggle('active', state.phone);
  }

  /* ------------------------------------------------------------------
     TREINADORES (level cap)
     ------------------------------------------------------------------ */
  const ROLE_CLS = { leader: 'role-leader', rival: 'role-rival', rocket: 'role-rocket', elite: 'role-elite', champion: 'role-champion' };
  const roleBadge = (r) => `<span class="badge ${ROLE_CLS[r]}">${t('role.' + r)}</span>`;
  const trList = () => DATA.trainers[state.series];
  const trDefeated = () => state.defeated[state.series] || (state.defeated[state.series] = []);
  function currentCap() {
    const list = trList(), d = trDefeated(); let cap = list[0].team.reduce((m, x) => Math.max(m, x.lv), 0);
    list.forEach((tr, i) => { if (d[i]) cap = tr.cap; }); return cap;
  }
  function trHeaderHTML() {
    const list = trList(), d = trDefeated(), n = d.filter(Boolean).length, cap = currentCap();
    const next = list.findIndex((x, i) => !d[i]);
    return `<div class="tr-cap"><span class="tr-cap-k">${t('tr.currentCap')}</span><span class="tr-cap-v">${cap}</span></div>
      <div class="tr-prog"><div class="progress"><div class="progress-bar" style="--p:${(n / list.length) * 100}%"></div></div>
      <div class="summary-foot"><span>${n} ${t('tr.done')} ${list.length} ${t('tr.keyTrainers')}</span><span>${next >= 0 ? t('tr.next') + ': ' + list[next].name : ''}</span></div></div>`;
  }
  function trStepBodyHTML(tr) {
    const L = tl('trainers');
    return `<div class="tr-body">
      <div class="tr-sec">${t('tr.team')}</div>
      <div class="tr-team">${tr.team.map(m => `<div class="tr-mon"><img src="${spr(m.id)}" alt="" onerror="this.onerror=null;this.src='${art(m.id)}'"><div class="tr-mon-info"><div class="tr-mon-name">${m.name} <span class="tr-lv">Lv. ${m.lv}</span></div>
        <div class="chips">${m.types.map(x => chip(x, 'sm', L)).join('')}</div><div class="tr-ab"><span class="muted">${state.lang === 'pt' ? 'Habilidade' : 'Ability'}:</span> <b>${term(m.ability, ABIL_PT, L)}</b></div>
        <div class="tr-moves">${m.moves.map(mv => `<span class="mv-chip">${term(mv, MOVE_PT, L)}</span>`).join('')}</div></div></div>`).join('')}</div>
      <div class="tr-spawn"><span class="tr-sec">${t('tr.spawnItem')}</span><div class="tr-spawn-row"><button class="biome biome-item it-link tr-spawn-chip" data-item-open="${slug(tr.spawnItem)}">${itemImg(tr.spawnItem, 'package', 'sm')}${term(tr.spawnItem, ITEM_PT, L)}</button><div class="tr-spawn-how"><i data-lucide="box"></i><span>${t('tr.spawnHow')}</span></div></div></div>
      <div class="tr-foot"><div><span class="tr-sec">${t('tr.bag')}</span><div class="chips">${tr.bag.map(b => `<button class="biome biome-item it-link" data-item-open="${slug(b.replace(/ x\d+$/, ''))}">${itemImg(b.replace(/ x\d+$/, ''), 'package', 'xs')}${term(b.replace(/ x\d+$/, ''), ITEM_PT, L)}${(b.match(/ x\d+$/) || [''])[0]}</button>`).join('')}</div></div>
      <div class="tr-tip"><i data-lucide="lightbulb"></i><div><b>${t('tr.tip')}:</b> ${state.lang === 'pt' ? tr.tip.pt : tr.tip.en}</div></div></div></div>`;
  }
  function trStepHTML(tr, i) {
    const d = trDefeated(), open = state.trainerOpen === i, next = trList().findIndex((x, k) => !d[k]) === i, L = tl('trainers');
    const strongest = tr.team.reduce((m, x) => Math.max(m, x.lv), 0);
    return `<div class="tr-step ${d[i] ? 'done' : ''} ${next ? 'next' : ''} ${open ? 'open' : ''}" style="--i:${i}" id="tr-step-${i}">
      <div class="tr-line"></div><div class="tr-dot"><i data-lucide="${d[i] ? 'check' : 'swords'}"></i></div>
      <div class="tr-card">
        <div class="tr-head" data-tr="${i}">
          <div class="tr-main"><div class="tr-name">${tr.name} ${roleBadge(tr.role)}</div>
            ${tr.group ? `<div class="tr-group">${t('tr.requires')}: ${tr.group.map(g => `<span>${g.name} <em>(${t('role.' + g.role)})</em></span>`).join(' / ')}</div>` : ''}
            <div class="tr-meta"><span class="muted">Lv. max ${strongest}</span><span class="tr-spawn-mini" title="${t('tr.spawnItem')}: ${term(tr.spawnItem, ITEM_PT, L)}">${itemImg(tr.spawnItem, 'package', 'xs')}</span><span class="tr-where"><i data-lucide="map-pin"></i>${tr.where.map(w => `<span class="biome">${L === 'pt' ? w[0] : w[1]}</span>`).join('')}</span></div></div>
          <div class="tr-capchip"><span>${t('tr.cap')}</span><i data-lucide="arrow-right"></i><b>${tr.cap}</b></div>
          <label class="tr-check" title="${t('tr.defeated')}"><input type="checkbox" data-trd="${i}" ${d[i] ? 'checked' : ''}><span></span><em>${t('tr.defeated')}</em></label>
          <span class="tr-caret"><i data-lucide="chevron-down"></i></span>
        </div>
        <div class="tr-body-wrap" id="tr-body-${i}">${open ? trStepBodyHTML(tr) : ''}</div>
      </div></div>`;
  }
  function renderTrainers() {
    $('#trainers').innerHTML = `<div class="tr-top">
      <div class="tr-tools"><div class="filter-group"><label>${t('tr.series')}</label><div class="chips-scroll" id="tr-series">${DATA.series.map(sr => `<button class="seg-chip ${sr.id === state.series ? 'active' : ''}" data-series="${sr.id}">${sr.name}</button>`).join('')}</div></div>${termsTgl('trainers')}</div>
      <div class="notice notice-info"><i data-lucide="info"></i><div>${t('tr.explain')}</div></div></div>
      <div class="card tr-headcard"><h3>${t('tr.progress')}</h3><div id="tr-header">${trHeaderHTML()}</div></div>
      <div class="tr-list" id="tr-list">${trList().map(trStepHTML).join('')}</div>`;
    icons();
  }
  function refreshTrainerStates() {
    const d = trDefeated(), next = trList().findIndex((x, k) => !d[k]);
    $$('.tr-step').forEach((el, i) => { el.classList.toggle('done', !!d[i]); el.classList.toggle('next', i === next); el.querySelector('.tr-dot i, .tr-dot svg').outerHTML = `<i data-lucide="${d[i] ? 'check' : 'swords'}"></i>`; });
    swapIn($('#tr-header'), trHeaderHTML());
  }

  /* ------------------------------------------------------------------
     POKÉBOLAS
     ------------------------------------------------------------------ */
  /* Imagem real do item: assets/itens/<namespace>/<id>.png. Tenta cobblemon -> allthemons -> mega_showdown;
     se nenhum existir, remove o <img> e mostra o ícone Lucide de fallback (assim nunca fica imagem quebrada). */
  const ITEM_IMG = { 'Poké Puff': 'poke_puff_base_sweet', 'Aprijuice': 'aprijuice_red', 'Sinister Tea': 'sinister_tea_unremarkable_base', 'Curry': 'smoked_tail_curry', 'Old Amber': 'old_amber_fossil', 'Key Stone': 'keystone', 'Honey': 'honey_bottle' };
  const slug = (en) => ITEM_IMG[en] || en.toLowerCase().replace(/\(.*?\)/g, '').replace(/[.'\u00e9]/g, m => m === '\u00e9' ? 'e' : '').trim().replace(/[\s-]+/g, '_');
  window.__imgErr = function (img) {
    const ns = ['cobblemon', 'allthemons', 'mega_showdown']; let i = +img.dataset.i + 1;
    if (i < ns.length) { img.dataset.i = i; img.src = `assets/itens/${ns[i]}/${img.dataset.id}.png`; return; }
    const fb = img.nextElementSibling; img.remove(); if (fb) { fb.style.display = ''; icons(); }
  };
  const MAN = window.ITEM_MANIFEST || {};
  const itemImg = (en, fallbackIcon, cls) => { const id = slug(en), ns = MAN[id];
    const inner = ns ? `<img src="assets/itens/${ns}/${id}.png" data-id="${id}" data-i="2" alt="" onerror="__imgErr(this)"><i data-lucide="${fallbackIcon || 'package'}" style="display:none"></i>` : `<i data-lucide="${fallbackIcon || 'package'}"></i>`;
    return `<span class="it-tile it-link ${cls || ''}" data-item-open="${id}" role="button" tabindex="0" title="${en}">${inner}</span>`; };
  const ballIcon = (b, cls) => `<span class="it-tile ball-tile it-link ${cls || ''}" data-item-open="${b.id}_ball" role="button"><img src="assets/itens/cobblemon/${b.id}_ball.png" data-id="${b.id}_ball" data-i="0" alt="" onerror="__imgErr(this)"><span class="ball-ico" style="--b1:${b.b1};--b2:${b.b2};--b3:${b.b3 || 'transparent'};display:none"></span></span>`;
  const ballIconOld = (b, cls) => `<span class="ball-ico ${cls || ''}" style="--b1:${b.b1};--b2:${b.b2};--b3:${b.b3 || 'transparent'}"></span>`;
  const BALL_FILTERS = ['all', 'night', 'water', 'fishing', 'first', 'caught', 'after'];
  function ballGridHTML() {
    const list = DATA.balls.filter(b => state.ballFilter === 'all' || b.tags.includes(state.ballFilter));
    return list.map((b, i) => `<div class="ball-card it-link" style="--i:${i}" data-item-open="${b.id}_ball">${ballIcon(b)}<div class="ball-info"><div class="ball-name">${ballName(b, tl('balls'))}<span class="ball-mult">${b.mult}</span></div><div class="ball-eff">${state.lang === 'pt' ? b.pt : b.en}</div></div></div>`).join('');
  }
  function renderBalls() {
    $('#balls').innerHTML = `<div class="page-tools"><div class="seg seg-tabs" id="ball-filters">${BALL_FILTERS.map(f => `<button class="${state.ballFilter === f ? 'active' : ''}" data-bf="${f}">${t('ball.' + f)}</button>`).join('')}</div>${termsTgl('balls')}</div>
      <div class="ball-grid" id="ball-grid">${ballGridHTML()}</div>`;
  }
  /* Ranking de bolas para um Pokémon (regras simplificadas do Cobblemon) */
  function bestBalls(p) {
    const where = DATA.where[p.id]; const out = [];
    const B = id => DATA.balls.find(b => b.id === id);
    out.push({ b: B('quick'), m: 5, why: t('ball.r.first') });
    if (p.stats[5] >= 100) out.push({ b: B('fast'), m: 4, why: t('ball.r.speed').replace('{v}', p.stats[5]) });
    if (p.caught) out.push({ b: B('repeat'), m: 3.5, why: t('ball.r.caught') });
    out.push({ b: B('dusk'), m: where && where.conds.includes('cond.night') ? 3.5 : 3, why: t('ball.r.night') });
    if (p.types.includes('water') || p.types.includes('bug')) out.push({ b: B('net'), m: 3, why: t('ball.r.water') });
    if (p.stats[0] + p.stats[2] >= 240) out.push({ b: B('heavy'), m: 3, why: t('ball.r.heavy') });
    out.push({ b: B('love'), m: 2.5, why: t('ball.r.love') });
    return out.sort((a, b) => b.m - a.m).slice(0, 3);
  }
  function bestBallHTML(p) {
    const bonus = DATA.caughtCount >= 600 ? 2.5 : DATA.caughtCount >= 450 ? 2 : DATA.caughtCount >= 300 ? 1.5 : DATA.caughtCount >= 150 ? 1 : DATA.caughtCount >= 30 ? 0.5 : 0;
    return `<div class="best-balls">${bestBalls(p).map((r, i) => `<div class="best-ball it-link" style="--i:${i}" data-item-open="${r.b.id}_ball"><span class="best-rank">${i + 1}</span>${ballIcon(r.b, 'sm')}<div class="best-info"><div class="ball-name">${ballName(r.b, tl('best'))}<span class="ball-mult">${r.m}x</span></div><div class="ball-eff">${r.why}</div></div></div>`).join('')}</div>
      <div class="best-crit"><i data-lucide="target"></i><span><b>${t('ball.critical')}:</b> ${t('ball.criticalText').replace('{n}', DATA.caughtCount).replace('{b}', bonus)}</span></div>`;
  }

  /* ------------------------------------------------------------------
     ITENS & COMIDAS
     ------------------------------------------------------------------ */
  function itemGridHTML() {
    const norm = (x) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const q = norm(state.itemQuery.trim());
    /* Busca sempre nos DOIS idiomas (nome PT e EN), independente do toggle do card, e sem acentos */
    const list = DATA.items.filter(it => (q ? norm(it.pt + ' ' + it.en).includes(q) : it.cat === state.itemCat));
    if (!list.length) return `<p class="muted">${t('item.none')}</p>`; const L = tl('items');
    return list.map((it, i) => { const k = DATA.items.indexOf(it); return `<div class="item-card ${state.itemOpen === k ? 'open' : ''}" style="--i:${i}" data-item="${k}">
      <div class="item-head it-link" data-item-open="${slug(it.en)}" tabindex="0" role="link">${itemImg(it.en, it.ico, 'lg cat-' + it.cat)}<div class="item-names"><div class="item-name">${L === 'pt' ? it.pt : it.en}</div><div class="item-alt">${L === 'pt' ? it.en : it.pt}</div></div><span class="tag">${t('cat.' + it.cat)}</span><span class="tr-caret"><i data-lucide="chevron-down"></i></span></div>
      <div class="item-desc">${state.lang === 'pt' ? it.dpt : it.den}</div>
      <div class="desc-wrap ${state.itemOpen === k ? 'open' : ''}"><div class="desc-inner"><div class="item-how"><i data-lucide="mouse-pointer-click"></i><span><b>${t('item.how')}:</b> ${state.lang === 'pt' ? it.hpt : it.hen}</span></div></div></div></div>`; }).join('');
  }
  function renderItems() {
    $('#items').innerHTML = `<div class="item-top"><div class="item-tools"><div class="search search-sm"><span class="search-ico"><i data-lucide="search"></i></span><input id="item-q" type="text" value="${state.itemQuery}" placeholder="${t('item.search')}"></div>${termsTgl('items')}</div>
      <div class="tabs" id="item-tabs">${DATA.itemCats.map(c => `<button class="${state.itemCat === c && !state.itemQuery ? 'active' : ''}" data-icat="${c}">${t('cat.' + c)}</button>`).join('')}</div></div>
      <div class="item-grid" id="item-grid">${itemGridHTML()}</div>`;
  }

  /* ------------------------------------------------------------------
     NAVEGAÇÃO
     ------------------------------------------------------------------ */
  /* Pilha de navegação real: cada navegação guarda {tela, parâmetros, estado de UI, scroll}.
     "Voltar" (botão, gesto ou botão físico do Android via popstate) restaura exatamente esse snapshot. */
  function snapshot() {
    return { screen: state.screen, detailId: state.detailId, itemId: state.itemId, scroll: $('#main').scrollTop,
      ui: { moveTab: state.moveTab, formIdx: state.formIdx, weakFilter: state.weakFilter, shiny: state.shiny, series: state.series, trainerOpen: state.trainerOpen,
        ballFilter: state.ballFilter, itemCat: state.itemCat, itemQuery: state.itemQuery, itemOpen: state.itemOpen, filters: JSON.parse(JSON.stringify(state.filters)),
        openMoves: $$('.mv-row.open').map(r => r.dataset.mv), calcOpen: !!($('#calc') && $('#calc').open), capturedTab: $$('#captured-tabs button').findIndex(b => b.classList.contains('active')) } };
  }
  function showScreen(screen) {
    state.screen = screen;
    $$('.screen').forEach(s => s.classList.toggle('active', s.dataset.screen === screen));
    const navKey = screen === 'detail' ? 'dex' : screen === 'item' ? 'items' : screen;
    $$('.nav-item, .tab').forEach(b => b.classList.toggle('active', b.dataset.go === navKey));
    $('.tab[data-more]').classList.toggle('active', ['trainers', 'balls', 'items', 'item', 'settings'].includes(screen));
    $('#more-sheet').classList.remove('open'); $('#proto').classList.remove('open'); $('#search-dd').classList.remove('open');
  }
  /* navigate(): empilha o estado atual, aplica a mudança (fn) e mostra a tela no topo */
  function navigate(screen, fn) {
    state.back.push(snapshot()); if (state.back.length > 40) state.back.shift();
    if (fn) fn();
    showScreen(screen); $('#main').scrollTop = 0;
    try { history.pushState({ pontindex: state.back.length }, ''); } catch (e) {}
  }
  function go(screen) { if (screen === state.screen) { $('#main').scrollTop = 0; showScreen(screen); return; } navigate(screen); }
  function restore(snap) {
    Object.assign(state, { detailId: snap.detailId, itemId: snap.itemId }, snap.ui);
    if (snap.screen === 'detail') { renderDetail(); snap.ui.openMoves.forEach(i => { const r = $(`.mv-row[data-mv="${i}"]`); if (r) { r.classList.add('open'); r.nextElementSibling.querySelector('.desc-wrap').classList.add('open'); } }); if (snap.ui.calcOpen && $('#calc')) $('#calc').open = true; }
    else if (snap.screen === 'item') renderItemPage();
    else if (snap.screen === 'dex') { renderFilters(); renderDex(); $('#f-gen').value = state.filters.gen; $('#f-evo').value = state.filters.evo; $('#f-sort').value = state.filters.sort; $$('#f-status button').forEach(b => b.classList.toggle('active', b.dataset.v === state.filters.status)); }
    else if (snap.screen === 'trainers') renderTrainers();
    else if (snap.screen === 'balls') renderBalls();
    else if (snap.screen === 'items') renderItems();
    else if (snap.screen === 'captured' && snap.ui.capturedTab >= 0) $$('#captured-tabs button').forEach((b, i) => b.classList.toggle('active', i === snap.ui.capturedTab));
    showScreen(snap.screen); icons();
    const main = $('#main'); main.style.scrollBehavior = 'auto'; main.scrollTop = snap.scroll; requestAnimationFrame(() => { main.scrollTop = snap.scroll; setTimeout(() => { main.style.scrollBehavior = ''; }, 50); });
  }
  /* goBack(): usado pelo botão "Voltar" e pelo popstate (botão físico). */
  function goBack(fromPopstate) {
    const snap = state.back.pop();
    if (!snap) { if (!fromPopstate) showScreen('home'); return; }
    if (!fromPopstate) { state.ignorePop = true; try { history.back(); } catch (e) { state.ignorePop = false; } }
    restore(snap);
  }
  document.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-item-open]:not(button)')) { e.preventDefault(); openItem(e.target.dataset.itemOpen); } });
  window.addEventListener('popstate', () => { if (state.ignorePop) { state.ignorePop = false; return; } goBack(true); });
  try { history.replaceState({ pontindex: 0 }, ''); } catch (e) {}

  function openDetail(id) {
    if (DATA.chainOf[id]) setTimeout(() => sfx('evolution_notification'), 350);
    navigate('detail', () => {
      state.detailId = id; state.shiny = false; state.moveTab = 'level'; state.formIdx = 0;
      DATA.history = [id].concat(DATA.history.filter(x => x !== id)).slice(0, 6);
      renderHome(); renderDetail();
    }); icons();
  }

  /* ------------------------------------------------------------------
     ANIMAÇÃO DE CAPTURA
     ------------------------------------------------------------------ */
  const cap = $('#capture');
  /* Camadas vetoriais dos fundos de captura: raios/brilho/pontilhado em divs + SVG com
     relâmpagos (lendário, classe .bolt: piscam e derivam) e faíscas (mítico, classe .spark: derivam para fora e cintilam) */
  const LAYERS = '<div class="cap-boost"><div class="cap-rays"></div><div class="cap-glow"></div></div><div class="cap-dots"></div>';
  const bolt = (x, y, r, sc, fill, op, delay, dur) => `<g class="bolt" style="animation-delay:-${delay}s;animation-duration:${dur}s"><polygon points="0,-60 14,-14 40,-22 6,60 -6,12 -34,20" fill="${fill}" opacity="${op}" transform="translate(${x} ${y}) rotate(${r}) scale(${sc})"/></g>`;
  const spark = (x, y, r, dx, dy, delay) => `<g class="spark" style="--dx:${dx}px;--dy:${dy}px;animation-delay:-${delay}s"><polygon points="-4,-120 4,-120 1,90 -1,90" fill="#fff" opacity=".6" transform="translate(${x} ${y}) rotate(${r})"/><polygon points="-12,-100 12,-100 3,60 -3,60" fill="#d9c8ff" opacity=".35" transform="translate(${x} ${y}) rotate(${r + 12})"/></g>`;
  const dot = (x, y, dx, dy, delay) => `<g class="spark" style="--dx:${dx}px;--dy:${dy}px;animation-delay:-${delay}s"><circle cx="${x}" cy="${y}" r="5" fill="#fff" opacity=".85"/><circle cx="${x + 30}" cy="${y + 22}" r="3" fill="#fff" opacity=".6"/></g>`;
  const CAP_SVG = {
    'bg-lendario': `<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">${bolt(90, 90, -35, 1.3, '#fff', 0.95, 0.0, 3.1)}${bolt(150, 40, -50, 0.9, '#5a2a00', 0.9, 0.53, 3.47)}${bolt(880, 70, 40, 1.2, '#fff', 0.95, 1.06, 3.84)}${bolt(940, 150, 25, 0.8, '#5a2a00', 0.9, 1.59, 4.21)}${bolt(80, 520, -140, 1.1, '#fff', 0.95, 2.12, 4.58)}${bolt(170, 560, -120, 0.8, '#5a2a00', 0.85, 2.65, 4.95)}${bolt(900, 530, 145, 1.3, '#fff', 0.95, 3.18, 3.42)}${bolt(830, 570, 160, 0.9, '#5a2a00', 0.9, 0.01, 3.79)}${bolt(500, 40, 0, 0.7, '#5a2a00', 0.8, 0.54, 4.16)}${bolt(500, 570, 180, 0.7, '#fff', 0.9, 1.07, 4.53)}${bolt(40, 300, -90, 0.8, '#5a2a00', 0.8, 1.6, 4.9)}${bolt(960, 300, 90, 0.8, '#fff', 0.9, 2.13, 3.37)}${bolt(300, 110, -20, 0.6, '#fff', 0.8, 2.66, 3.74)}${bolt(700, 500, 160, 0.6, '#5a2a00', 0.8, 3.19, 4.11)}${bolt(190, 250, -70, 0.9, '#fff', 0.9, 0.02, 4.48)}${bolt(810, 240, 70, 0.9, '#5a2a00', 0.85, 0.55, 4.85)}${bolt(210, 430, -115, 0.8, '#5a2a00', 0.85, 1.08, 3.32)}${bolt(790, 440, 115, 0.9, '#fff', 0.9, 1.61, 3.69)}${bolt(640, 90, 15, 0.7, '#fff', 0.85, 2.14, 4.06)}${bolt(360, 520, -170, 0.7, '#5a2a00', 0.8, 2.67, 4.43)}</svg>`,
    'bg-mitico': `<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">${spark(70, 60, -40, -40, -22, 0.0)}${spark(930, 50, 40, 40, -23, 0.7)}${spark(60, 540, -140, -40, 22, 1.4)}${spark(940, 550, 140, 40, 23, 2.1)}${spark(500, 30, 0, 0, -46, 2.8)}${spark(500, 575, 180, 0, 46, 3.5)}${spark(200, 80, -25, -37, -27, 4.2)}${spark(800, 520, 155, 37, 27, 0.7)}${spark(30, 300, -90, -46, 0, 1.4)}${spark(970, 300, 90, 46, 0, 2.1)}${spark(250, 540, -155, -33, 32, 2.8)}${spark(760, 70, 30, 34, -30, 3.5)}${dot(120, 180, -57, -18, 0.4)}${dot(880, 140, 55, -23, 1.3)}${dot(160, 470, -54, 27, 2.2)}${dot(840, 460, 54, 26, 3.1)}${dot(330, 60, -35, -49, 4.0)}${dot(680, 560, 34, 49, 0.7)}${dot(420, 140, -27, -54, 1.6)}${dot(600, 470, 30, 52, 2.5)}${dot(260, 330, -60, 7, 3.4)}${dot(740, 330, 60, 7, 0.1)}</svg>`,
    'bg-outros': ''
  };
  function capStage(cls) { cap.className = 'capture on s-bg ' + cls; }
  function clearCap() { state.capTimers.forEach(clearTimeout); state.capTimers = []; }
  function startCapture(id) {
    const p = byId(id); clearCap();
    const bg = p.rarity === 'legendary' ? 'bg-lendario' : p.rarity === 'mythical' ? 'bg-mitico' : 'bg-outros';
    const bgEl = $('.cap-bg', cap);
    bgEl.className = 'cap-bg ' + bg;
    bgEl.innerHTML = LAYERS + (CAP_SVG[bg] || '');
    $('.cap-art', cap).src = art(id);
    $('.cap-name', cap).textContent = p.name;
    cap.dataset.id = id;
    cap.className = 'capture on';
    const at = (ms, fn) => state.capTimers.push(setTimeout(fn, ms));
    at(450, () => capStage(''));
    at(1000, () => { capStage('s-ball'); sfx('poke_ball_throw_1'); });
    at(1700, () => { capStage('s-shake'); sfx('poke_ball_shake_1'); });
    at(2150, () => sfx('poke_ball_shake_2'));
    at(2600, () => sfx('poke_ball_shake_3'));
    at(3200, () => { capStage('s-open'); sfx('poke_ball_open'); });
    at(3550, () => capStage('s-grow'));
    at(5250, () => { capStage('s-flash'); sfx('poke_ball_shake_critical'); });
    at(5450, () => finishCapture());
  }
  function finishCapture() {
    clearCap(); capStage('s-final'); sfx('poke_ball_capture_succeeded');
    const p = byId(+cap.dataset.id);
    if (!p.caught) { p.caught = true; p.date = '23/09/2026'; DATA.caughtCount += 1; }
    renderDex(); renderCaptured(); if (state.screen === 'detail' && state.detailId === p.id) updateDetailButtons();
  }
  function closeCapture() { clearCap(); cap.className = 'capture'; sfx('pokedex_close'); }

  /* ------------------------------------------------------------------
     BOOT
     ------------------------------------------------------------------ */
  function boot() {
    const b = $('#boot'); b.classList.remove('done'); sfx('pokedex_open');
    setTimeout(() => b.classList.add('done'), 2300);
  }
  function replayBoot() {
    const old = $('#boot'); const n = old.cloneNode(true); old.replaceWith(n); boot();
  }

  /* ------------------------------------------------------------------
     EVENTOS
     ------------------------------------------------------------------ */
  document.addEventListener('click', (e) => {
    const cryBtn = e.target.closest('#cry-btn');
    if (cryBtn) { const a = playRaw(cryBtn.dataset.cry, 'cries'); cryBtn.classList.add('playing'); a.onended = () => cryBtn.classList.remove('playing'); setTimeout(() => cryBtn.classList.remove('playing'), 2500); return; }
    if (e.target.closest('[data-go], .tab, .nav-item, [data-back], [data-item-open], [data-open], [data-mtab], [data-ftab], [data-icat], [data-bf], [data-series], [data-wf], [data-tl], [data-more]')) sfx('pokedex_click_short');
    else if (e.target.closest('button, .switch, .pcard, .item-card, .tr-head')) sfx('click');
    const io = e.target.closest('[data-item-open]');
    if (io) { e.preventDefault(); openItem(io.dataset.itemOpen); return; }
    if (e.target.closest('[data-back]')) { goBack(false); return; }
    const goBtn = e.target.closest('[data-go]');
    if (goBtn) { go(goBtn.dataset.go); return; }
    const open = e.target.closest('[data-open]');
    if (open) { openDetail(+open.dataset.open); return; }
    const capBtn = e.target.closest('[data-cap]');
    if (capBtn) { $('#proto').classList.remove('open'); startCapture(+capBtn.dataset.cap); return; }
    const th = e.target.closest('[data-theme-pick]');
    if (th) { setTheme(th.dataset.themePick); return; }
    const ft = e.target.closest('[data-ftype]');
    if (ft) { const k = ft.dataset.ftype; const i = state.filters.types.indexOf(k); i >= 0 ? state.filters.types.splice(i, 1) : state.filters.types.push(k); ft.classList.toggle('on', i < 0); renderDex(); return; }
    const tlb = e.target.closest('[data-tl]');
    if (tlb) { const box = tlb.closest('[data-tcard]'), card = box.dataset.tcard; state.termsOverride[card] = tlb.dataset.tl; saveTerms();
      $$('button', box).forEach(b => b.classList.toggle('active', b === tlb)); const [sel, fn] = TERM_CARDS[card]; const target = $(sel); if (target) swapIn(target, fn()); return; }
    const tdef = e.target.closest('[data-tdef]');
    if (tdef) { state.termsDefault = tdef.dataset.tdef; state.termsOverride = {}; saveTerms(); renderAll(); go('settings'); return; }
    if (e.target.closest('[data-more]')) { $('#more-sheet').classList.toggle('open'); return; }
    if (e.target.closest('[data-close-sheet]')) { $('#more-sheet').classList.remove('open'); return; }
    const sr = e.target.closest('[data-series]');
    if (sr) { state.series = sr.dataset.series; state.trainerOpen = null; $$('#tr-series button').forEach(b => b.classList.toggle('active', b === sr)); swapIn($('#tr-header'), trHeaderHTML()); swapIn($('#tr-list'), trList().map(trStepHTML).join('')); return; }
    const trd = e.target.closest('[data-trd]');
    if (trd) { const before = currentCap(); trDefeated()[+trd.dataset.trd] = trd.checked; refreshTrainerStates(); icons(); if (currentCap() > before) sfx('levelup'); return; }
    if (e.target.closest('.tr-check')) return;
    const trh = e.target.closest('[data-tr]');
    if (trh) { const i = +trh.dataset.tr; const was = state.trainerOpen; if (was !== null && was !== i) { $('#tr-step-' + was).classList.remove('open'); $('#tr-body-' + was).innerHTML = ''; }
      state.trainerOpen = was === i ? null : i; const step = $('#tr-step-' + i); step.classList.toggle('open', state.trainerOpen === i); swapIn($('#tr-body-' + i), state.trainerOpen === i ? trStepBodyHTML(trList()[i]) : ''); return; }
    const bf = e.target.closest('[data-bf]');
    if (bf) { state.ballFilter = bf.dataset.bf; $$('#ball-filters button').forEach(b => b.classList.toggle('active', b === bf)); swapIn($('#ball-grid'), ballGridHTML()); return; }
    const ic = e.target.closest('[data-icat]');
    if (ic) { state.itemCat = ic.dataset.icat; state.itemQuery = ''; $('#item-q').value = ''; $$('#item-tabs button').forEach(b => b.classList.toggle('active', b === ic)); swapIn($('#item-grid'), itemGridHTML()); return; }
    const itc = e.target.closest('[data-item]');
    if (itc) { const k = +itc.dataset.item; state.itemOpen = state.itemOpen === k ? null : k; $$('.item-card').forEach(c => { const on = +c.dataset.item === state.itemOpen; c.classList.toggle('open', on); c.querySelector('.desc-wrap').classList.toggle('open', on); }); return; }
    const wf = e.target.closest('[data-wf]');
    if (wf) { state.weakFilter = wf.dataset.wf; $$('#weak-seg button').forEach(b => b.classList.toggle('active', b === wf)); swapIn($('#weak-grid'), weakGridHTML()); return; }
    const mt = e.target.closest('[data-mtab]');
    if (mt) { state.moveTab = mt.dataset.mtab; $$('#move-tabs button').forEach(b => b.classList.toggle('active', b === mt)); swapIn($('#moves-table'), movesTableHTML()); return; }
    const mr = e.target.closest('.mv-row.has-desc');
    if (mr) { mr.classList.toggle('open'); mr.nextElementSibling.querySelector('.desc-wrap').classList.toggle('open', mr.classList.contains('open')); return; }
    const fb = e.target.closest('[data-ftab]');
    if (fb) { state.formIdx = +fb.dataset.ftab; $$('#form-tabs button').forEach(b => b.classList.toggle('active', b === fb)); swapIn($('#form-body'), formBodyHTML(formsOf(byId(state.detailId)))); return; }
    const st = e.target.closest('#f-status button');
    if (st) { state.filters.status = st.dataset.v; $$('#f-status button').forEach(b => b.classList.toggle('active', b === st)); renderDex(); return; }
    const ct = e.target.closest('#captured-tabs button');
    if (ct) { $$('#captured-tabs button').forEach(b => b.classList.toggle('active', b === ct)); renderCaptured(); return; }
    const ls = e.target.closest('#lang-seg button');
    if (ls) { setLang(ls.dataset.v); return; }
    if (e.target.closest('#shiny-btn')) { sfx('shiny'); state.shiny = !state.shiny; const img = $('#detail-art'); img.src = art(state.detailId, state.shiny); img.classList.remove('swap'); void img.offsetWidth; img.classList.add('swap'); $('#shiny-btn').classList.toggle('on', state.shiny); return; }
    if (e.target.closest('#btn-caught')) { startCapture(state.detailId); return; }
    if (e.target.closest('#btn-team')) { state.teamAdded[state.detailId] = !state.teamAdded[state.detailId]; const empty = DATA.team.indexOf(null); if (state.teamAdded[state.detailId] && empty >= 0 && !DATA.team.includes(state.detailId)) DATA.team[empty] = state.detailId; else if (!state.teamAdded[state.detailId]) DATA.team = DATA.team.map(x => x === state.detailId ? null : x); renderHome(); updateDetailButtons(); icons(); return; }
    if (e.target.closest('#cmp-swap')) { DATA.compare.reverse(); renderCompare(); icons(); return; }
    if (e.target.closest('#btn-random')) { openDetail(DATA.pokemon[Math.floor(Math.random() * DATA.pokemon.length)].id); return; }
    if (e.target.closest('#tgl-lang, #tgl-lang-m, #p-lang')) { setLang(state.lang === 'pt' ? 'en' : 'pt'); return; }
    if (e.target.closest('#tgl-theme, #p-theme')) { nextTheme(); return; }
    if (e.target.closest('#tgl-sound, #tgl-sound-m')) { setSound(!state.sound); return; }
    if (e.target.closest('#p-phone')) { state.phone = !state.phone; updateLayout(); return; }
    if (e.target.closest('#p-boot')) { $('#proto').classList.remove('open'); replayBoot(); return; }
    if (e.target.closest('#proto-fab')) { $('#proto').classList.toggle('open'); return; }
    if (!e.target.closest('#search')) $('#search-dd').classList.remove('open');
  });

  cap.addEventListener('click', () => { if (cap.classList.contains('s-final')) closeCapture(); else finishCapture(); });

  $('#search-input').addEventListener('input', renderSearch);
  document.addEventListener('input', (e) => { if (e.target.id === 'item-q') { state.itemQuery = e.target.value; $$('#item-tabs button').forEach(b => b.classList.toggle('active', !state.itemQuery && b.dataset.icat === state.itemCat)); swapIn($('#item-grid'), itemGridHTML()); } });
  $('#search-input').addEventListener('focus', renderSearch);
  $('#search-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') { const first = $('#search-dd .dd-item'); if (first) openDetail(+first.dataset.open); } });
  $('#f-gen').addEventListener('change', (e) => { state.filters.gen = e.target.value; renderDex(); });
  $('#f-evo').addEventListener('change', (e) => { state.filters.evo = e.target.value; renderDex(); });
  $('#f-sort').addEventListener('change', (e) => { state.filters.sort = e.target.value; renderDex(); });
  $('#sw-sound').addEventListener('change', (e) => setSound(e.target.checked));
  $('#sw-motion').addEventListener('change', (e) => document.documentElement.classList.toggle('reduce-motion', e.target.checked));
  document.addEventListener('input', (e) => { if (e.target.closest('#calc')) renderCalc(); });
  document.addEventListener('change', (e) => { if (e.target.closest('#calc')) renderCalc(); });
  window.addEventListener('resize', updateLayout);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && cap.classList.contains('on')) closeCapture(); });

  /* ------------------------------------------------------------------
     INIT
     ------------------------------------------------------------------ */
  let soundPref = true; try { soundPref = localStorage.getItem('pontindex.sound') !== '0'; } catch (e) {}
  renderAll(); setSound(soundPref); updateLayout(); boot();
  setTimeout(() => { if (state.screen === 'home') { $('#search-input').focus(); renderSearch(); } }, 2400);
})();
