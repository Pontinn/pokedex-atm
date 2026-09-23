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
    'detail.noSpawn': { pt: 'Não nasce no mundo', en: 'Does not spawn in the world' },
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
      { id: 6, name: 'Charizard', types: ['fire', 'flying'], gen: 1, rarity: 'rare', evo: 'level', caught: false, stats: [78, 84, 78, 109, 85, 100] },
      { id: 25, name: 'Pikachu', types: ['electric'], gen: 1, rarity: 'uncommon', evo: 'stone', caught: true, date: '03/09/2026', stats: [35, 55, 40, 50, 50, 90] },
      { id: 94, name: 'Gengar', types: ['ghost', 'poison'], gen: 1, rarity: 'rare', evo: 'trade', caught: true, date: '15/09/2026', stats: [60, 65, 60, 130, 75, 110] },
      { id: 133, name: 'Eevee', types: ['normal'], gen: 1, rarity: 'uncommon', evo: 'stone', caught: true, date: '08/09/2026', stats: [55, 55, 50, 45, 65, 55] },
      { id: 143, name: 'Snorlax', types: ['normal'], gen: 1, rarity: 'rare', evo: 'friendship', caught: false, stats: [160, 110, 65, 65, 110, 30] },
      { id: 149, name: 'Dragonite', types: ['dragon', 'flying'], gen: 1, rarity: 'ultra', evo: 'level', caught: false, stats: [91, 134, 95, 100, 100, 80] },
      { id: 150, name: 'Mewtwo', types: ['psychic'], gen: 1, rarity: 'legendary', evo: 'none', caught: false, stats: [106, 110, 90, 154, 90, 130] },
      { id: 151, name: 'Mew', types: ['psychic'], gen: 1, rarity: 'mythical', evo: 'none', caught: false, noSpawn: true, stats: [100, 100, 100, 100, 100, 100] },
      { id: 448, name: 'Lucario', types: ['fighting', 'steel'], gen: 4, rarity: 'rare', evo: 'friendship', caught: true, date: '23/09/2026', stats: [70, 110, 70, 115, 70, 90] }
    ],
    team: [6, 448, 94, 149, null, null],
    history: [6, 448, 25, 150, 133, 94],
    compare: [6, 448],
    /* Cadeias de evolução: lista de {id, name} e métodos entre eles */
    chains: {
      char: { ids: [4, 5, 6], names: ['Charmander', 'Charmeleon', 'Charizard'], methods: [{ k: 'evo.level', v: 16 }, { k: 'evo.level', v: 36 }] },
      bulba: { ids: [1, 2, 3], names: ['Bulbasaur', 'Ivysaur', 'Venusaur'], methods: [{ k: 'evo.level', v: 16 }, { k: 'evo.level', v: 32 }] },
      pika: { ids: [172, 25, 26], names: ['Pichu', 'Pikachu', 'Raichu'], methods: [{ k: 'evo.friendship' }, { k: 'evo.thunderStone' }] },
      gengar: { ids: [92, 93, 94], names: ['Gastly', 'Haunter', 'Gengar'], methods: [{ k: 'evo.level', v: 25 }, { k: 'evo.trade' }] },
      eevee: { ids: [133, 134], names: ['Eevee', 'Vaporeon'], methods: [{ k: 'evo.waterStone' }] },
      snorlax: { ids: [446, 143], names: ['Munchlax', 'Snorlax'], methods: [{ k: 'evo.friendship' }] },
      dragonite: { ids: [147, 148, 149], names: ['Dratini', 'Dragonair', 'Dragonite'], methods: [{ k: 'evo.level', v: 30 }, { k: 'evo.level', v: 55 }] },
      lucario: { ids: [447, 448], names: ['Riolu', 'Lucario'], methods: [{ k: 'evo.friendshipDay' }] }
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
      150: { levels: '70-70', biomes: [['Cavernas Profundas', 'Deep Caves'], ['Deep Dark', 'Deep Dark']], conds: ['cond.night'], drops: [['Master Ball', 'Master Ball', 1], ['Poção Máxima', 'Max Potion', 30]] },
      448: { levels: '30-50', biomes: [['Montanhas', 'Mountains'], ['Picos Nevados', 'Snowy Peaks'], ['Taiga', 'Taiga']], conds: ['cond.any'], drops: [['Barra de Ferro', 'Iron Ingot', 40], ['Osso', 'Bone', 20]] },
      _: { levels: '5-30', biomes: [['Floresta', 'Forest'], ['Planície', 'Plains']], conds: ['cond.any'], drops: [['Berry Oran', 'Oran Berry', 40]] }
    },
    forms: {
      6: [
        { key: 'form.normal', id: 6, types: ['fire', 'flying'], ability: ['Chama', 'Blaze'], stats: [78, 84, 78, 109, 85, 100] },
        { key: 'Mega X', id: 10034, types: ['fire', 'dragon'], ability: ['Garras Firmes', 'Tough Claws'], stats: [78, 130, 111, 130, 85, 100] },
        { key: 'Mega Y', id: 10035, types: ['fire', 'flying'], ability: ['Seca', 'Drought'], stats: [78, 104, 78, 159, 115, 100] },
        { key: 'Gmax', id: 10196, types: ['fire', 'flying'], ability: ['Chama', 'Blaze'], stats: [78, 84, 78, 109, 85, 100] }
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
  const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  const STAT_COLORS = ['var(--s-hp)', 'var(--s-atk)', 'var(--s-def)', 'var(--s-spa)', 'var(--s-spd)', 'var(--s-spe)'];

  /* ------------------------------------------------------------------
     ESTADO
     ------------------------------------------------------------------ */
  const state = {
    lang: 'pt', theme: 'classico', sound: false, phone: false, screen: 'home',
    detailId: 6, shiny: false, moveTab: 'level', formIdx: 0, teamAdded: {},
    filters: { types: [], gen: 'all', evo: 'all', sort: 'num', status: 'all' },
    capTimers: []
  };

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const t = (k) => (I18N[k] ? I18N[k][state.lang] : k);
  const tn = (type) => TYPES[type][state.lang];
  const byId = (id) => DATA.pokemon.find(p => p.id === id);
  const pad = (n) => '#' + String(n).padStart(4, '0');
  const fmtDate = (d) => state.lang === 'pt' ? d : d.split('/').reverse().join('-');

  /* ------------------------------------------------------------------
     COMPONENTES (strings HTML)
     ------------------------------------------------------------------ */
  const typeIcon = (type) => `<span class="ti t-${type}"><img src="../tipos/svg/${type}.svg" alt=""></span>`;
  const chip = (type, size) => `<span class="chip t-${type} ${size || ''}">${typeIcon(type)}<span>${tn(type)}</span></span>`;
  const badge = (p) => {
    const r = p.rarity;
    const cls = { common: 'badge-common', uncommon: 'badge-uncommon', rare: 'badge-rare', ultra: 'badge-ultra', legendary: 'badge-legendary', mythical: 'badge-mythical' }[r];
    const ico = r === 'legendary' ? '&#9733; ' : r === 'mythical' ? '&#10022; ' : '';
    return `<span class="badge ${cls}">${ico}${t('rarity.' + r)}</span>`;
  };
  const imgArt = (id, cls, extra) => `<img class="${cls || ''}" src="${art(id)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${art(6)}'" ${extra || ''}>`;

  function pcard(p, i, showDate) {
    return `<button class="pcard" style="--i:${i};--tc:var(--t-${p.types[0]})" data-open="${p.id}">
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
      if (!id) return `<div class="slot" title="${t('home.empty')}"><span class="slot-plus">+</span></div>`;
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
      `<button class="chip sm t-${k} ${state.filters.types.includes(k) ? 'on' : ''}" data-ftype="${k}">${typeIcon(k)}<span>${tn(k)}</span></button>`).join('');
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
    $('#dex-grid').innerHTML = list.length ? list.map((p, i) => pcard(p, i)).join('') : `<p class="muted">${t('dex.none')}</p>`;
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
    const moves = (DATA.moves[state.detailId] || DATA.moves._)[state.moveTab];
    return `<table>
      <thead><tr><th>${t('col.level')}</th><th>${t('col.move')}</th><th>${t('col.type')}</th><th>${t('col.cat')}</th><th>${t('col.power')}</th><th>${t('col.acc')}</th></tr></thead>
      <tbody>${moves.map((m, i) => `<tr class="mv-row ${m.desc ? 'has-desc' : ''}" data-mv="${i}"><td class="num">${typeof m.lv === 'number' ? m.lv : t('tab.' + state.moveTab)}</td>
        <td><span class="mv-name">${state.lang === 'pt' ? m.pt : m.en}${m.desc ? '<span class="mv-caret">&#9660;</span>' : ''}</span><span class="mv-en">${state.lang === 'pt' ? m.en : m.pt}</span></td>
        <td>${chip(m.type, 'sm')}</td><td><span class="cat cat-${m.cat}"><i></i>${t('cat.' + m.cat)}</span></td>
        <td class="num">${m.pow == null ? '-' : m.pow}</td><td class="num">${m.acc == null ? '-' : m.acc + '%'}</td></tr>${m.desc ? `<tr class="mv-desc"><td colspan="6"><div class="desc-wrap"><div class="desc-inner"><p class="desc-text">${state.lang === 'pt' ? m.desc.pt : m.desc.en}</p></div></div></td></tr>` : ''}`).join('')}</tbody>
    </table>`;
  }
  function formBodyHTML(forms) {
    const form = forms[Math.min(state.formIdx, forms.length - 1)];
    return `${imgArt(form.id)}
      <div class="form-info">
        <div class="types">${form.types.map(x => chip(x)).join('')}</div>
        <div><span class="muted">${t('form.ability')}:</span> <strong>${state.lang === 'pt' ? form.ability[0] : form.ability[1]}</strong> <span class="muted">(${state.lang === 'pt' ? form.ability[1] : form.ability[0]})</span></div>
        <div class="show-bars">${statsBlock(form.stats)}</div>
      </div>`;
  }
  function formsOf(p) {
    const abilities = DATA.abilities[p.id] || DATA.abilities._;
    return DATA.forms[p.id] || [{ key: 'form.normal', id: p.id, types: p.types, ability: [abilities[0].pt, abilities[0].en], stats: p.stats }];
  }
  /* Troca o conteúdo de um componente com uma pequena transição (sem re-renderizar a tela) */
  function swapIn(el, html) { el.innerHTML = html; el.classList.remove('part-in'); void el.offsetWidth; el.classList.add('part-in'); }
  function updateDetailButtons() {
    const p = byId(state.detailId); const bc = $('#btn-caught'), bt = $('#btn-team'); if (!bc || !bt) return;
    const inTeam = DATA.team.includes(p.id) || state.teamAdded[p.id];
    bc.classList.toggle('done', !!p.caught); bc.querySelector('span').textContent = p.caught ? t('detail.caughtDone') : t('detail.caught');
    bt.classList.toggle('done', !!inTeam); bt.innerHTML = inTeam ? '&#10003; ' + t('detail.inTeam') : '+ ' + t('detail.addTeam');
    bt.classList.remove('part-in'); void bt.offsetWidth; bt.classList.add('part-in');
  }

  function renderDetail() {
    const p = byId(state.detailId);
    const chainKey = DATA.chainOf[p.id];
    const chain = chainKey ? DATA.chains[chainKey] : null;
    const abilities = DATA.abilities[p.id] || DATA.abilities._;
    const where = DATA.where[p.id] || DATA.where._;
    const forms = formsOf(p);
    const wk = weaknesses(p.types);
    const multRows = [[4, 'x4', 'mult-4'], [2, 'x2', 'mult-2'], [0.5, 'x½', 'mult-half'], [0.25, 'x¼', 'mult-quarter'], [0, 'x0', 'mult-0']];
    const isSpecial = p.rarity === 'legendary' || p.rarity === 'mythical';
    const inTeam = DATA.team.includes(p.id) || state.teamAdded[p.id];

    const html = `
    <button class="detail-back" data-go="dex">&larr; ${t('detail.back')}</button>
    <div class="detail" style="--tc:var(--t-${p.types[0]})">
      <div class="detail-left">
        <div class="card hero-card">
          <div class="hero-art">
            ${isSpecial ? `<div class="seal">${badge(p)}</div>` : ''}
            <button class="shiny-btn ${state.shiny ? 'on' : ''}" id="shiny-btn" title="${t('detail.shiny')}">&#10024;</button>
            <img id="detail-art" src="${art(p.id, state.shiny)}" alt="${p.name}" onerror="this.onerror=null;this.src='${art(p.id)}'">
          </div>
          <div class="hero-body">
            <div class="dex-num">${pad(p.id)}</div>
            <h2>${p.name}</h2>
            <div class="types">${p.types.map(x => chip(x, 'lg')).join('')}</div>
            <div class="badges">${isSpecial ? `<span class="badge badge-rare">${t('rarity.rare')}</span>` : badge(p)}${p.noSpawn ? `<span class="badge badge-nospawn">${t('detail.noSpawn')}</span>` : ''}</div>
            <div class="hero-actions-2">
              <button class="btn btn-accent ${p.caught ? 'done' : ''}" id="btn-caught"><img class="ball-ico" src="../pokebola.webp" alt=""><span>${p.caught ? t('detail.caughtDone') : t('detail.caught')}</span></button>
              <button class="btn btn-ghost ${inTeam ? 'done' : ''}" id="btn-team">${inTeam ? '&#10003; ' + t('detail.inTeam') : '+ ' + t('detail.addTeam')}</button>
            </div>
          </div>
        </div>
        ${p.noSpawn ? `<div class="notice"><span>&#9888;</span><div><strong>${t('detail.noSpawn')}</strong>${t('detail.noSpawnDesc')}</div></div>` : ''}
        <div class="panel" style="--i:1"><h3>${t('detail.stats')}</h3>${statsBlock(p.stats)}</div>
      </div>

      <div class="detail-right">
        <div class="panel" style="--i:2"><h3>${t('detail.weak')}</h3>
          <div class="weak-grid">${multRows.filter(r => wk[r[0]]).map(r => `<div class="weak-row"><span class="mult ${r[2]}">${r[1]}</span><div class="chips">${wk[r[0]].map(x => chip(x, 'sm')).join('')}</div></div>`).join('')}</div>
        </div>

        <div class="panel" style="--i:3"><h3>${t('detail.evo')}</h3>
          ${chain ? `<div class="evo-chain">${chain.ids.map((id, i) => `${i > 0 ? `<div class="evo-arrow"><span class="arr">&rarr;</span><span class="method">${t(chain.methods[i - 1].k)}${chain.methods[i - 1].v ? ' ' + chain.methods[i - 1].v : ''}</span></div>` : ''}
            <div class="evo ${id === p.id ? 'current' : ''}" ${byId(id) ? `data-open="${id}"` : ''}>${imgArt(id)}<span class="dex-num">${pad(id)}</span><span class="evo-name">${chain.names[i]}</span></div>`).join('')}</div>`
          : `<p class="muted">${t('evo.none')}</p>`}
          <div class="evo-methods"><span>${t('evo.methods')}</span><span>${t('evo.level')} 16</span><span>${t('evo.fireStone')}</span><span>${t('evo.friendshipDay')}</span><span>${t('evo.trade')}</span></div>
        </div>

        <div class="panel" style="--i:4"><h3>${t('detail.abilities')}</h3>
          <div class="abilities">${abilities.map(a => `<div class="ability">
            <div class="ab-name">${state.lang === 'pt' ? a.pt : a.en}${a.hidden ? `<span class="tag">${t('detail.hidden')}</span>` : ''}<span class="ab-en">${state.lang === 'pt' ? a.en : a.pt}</span></div>
            <div class="ab-desc">${state.lang === 'pt' ? a.descPt : a.descEn}</div></div>`).join('')}</div>
        </div>

        <div class="panel" style="--i:5"><h3>${t('detail.moves')}</h3>
          <div class="tabs" id="move-tabs">${['level', 'tm', 'egg', 'tutor'].map(k => `<button class="${state.moveTab === k ? 'active' : ''}" data-mtab="${k}">${t('tab.' + k)}</button>`).join('')}</div>
          <div class="table-wrap" id="moves-table">${movesTableHTML()}</div>
        </div>

        <div class="panel" style="--i:6"><h3>${t('detail.where')}</h3>
          ${p.noSpawn ? `<div class="notice"><span>&#9888;</span><div><strong>${t('detail.noSpawn')}</strong>${t('detail.noSpawnDesc')}</div></div>` : `<div class="where">
            <div class="kv"><span class="k">${t('where.bucket')}</span><span class="v">${badge(p)}</span></div>
            <div class="kv"><span class="k">${t('where.level')}</span><span class="v">${where.levels}</span></div>
            <div class="kv"><span class="k">${t('where.biomes')}</span><div class="chips">${where.biomes.map(b => `<span class="biome">${state.lang === 'pt' ? b[0] : b[1]}</span>`).join('')}</div></div>
            <div class="kv"><span class="k">${t('where.conditions')}</span><div class="chips">${where.conds.map(c => `<span class="cond">${c === 'cond.day' ? '&#9728;' : c === 'cond.night' ? '&#9790;' : '&#9729;'} ${t(c)}</span>`).join('')}</div></div>
            <div class="drops"><span class="k" style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">${t('where.drops')}</span>
              ${where.drops.map(d => `<div class="drop"><span>${state.lang === 'pt' ? d[0] : d[1]}</span><span class="pct">${d[2]}%</span><div class="drop-bar"><i style="--w:${d[2]}%"></i></div></div>`).join('')}</div>
          </div>`}
        </div>

        <div class="panel" style="--i:7"><h3>${t('detail.forms')}</h3>
          <div class="tabs" id="form-tabs">${forms.map((f, i) => `<button class="${i === state.formIdx ? 'active' : ''}" data-ftab="${i}">${f.key.startsWith('form.') ? t(f.key) : f.key}</button>`).join('')}</div>
          <div class="forms" id="form-body">${formBodyHTML(forms)}</div>
        </div>

        <details class="panel calc" style="--i:8" id="calc">
          <summary>${t('detail.calc')}<span class="caret">&#9660;</span></summary>
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
    $('#captured-grid').innerHTML = list.map((p, i) => pcard(p, i, true)).join('');
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
      <div style="display:flex;justify-content:center;margin-top:14px"><button class="btn btn-ghost" id="cmp-swap">&#8644; ${t('compare.swap')}</button></div></div>
    </div>`;
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
    applyStatic(); renderHome(); renderFilters(); renderDex(); renderDetail(); renderCaptured(); renderCompare(); renderThemes();
  }
  function setLang(l) { state.lang = l; renderAll(); }
  function setTheme(id) {
    state.theme = id; document.documentElement.dataset.theme = id;
    $$('.theme-sw').forEach(b => b.classList.toggle('active', b.dataset.themePick === id));
  }
  function nextTheme() { const i = DATA.themes.findIndex(x => x.id === state.theme); setTheme(DATA.themes[(i + 1) % DATA.themes.length].id); }
  function setSound(on) {
    state.sound = on; $('#sw-sound').checked = on;
    $$('#tgl-sound, #tgl-sound-m').forEach(b => b.classList.toggle('off', !on));
  }
  function updateLayout() {
    document.body.classList.toggle('phone', state.phone);
    $('#app').classList.toggle('mobile', state.phone || window.innerWidth < 900);
    $('#p-phone').classList.toggle('active', state.phone);
  }

  /* ------------------------------------------------------------------
     NAVEGAÇÃO
     ------------------------------------------------------------------ */
  function go(screen) {
    state.screen = screen;
    $$('.screen').forEach(s => s.classList.toggle('active', s.dataset.screen === screen));
    const navKey = screen === 'detail' ? 'dex' : screen;
    $$('.nav-item, .tab').forEach(b => b.classList.toggle('active', b.dataset.go === navKey));
    $('#main').scrollTop = 0;
    $('#proto').classList.remove('open');
    $('#search-dd').classList.remove('open');
  }
  function openDetail(id) {
    state.detailId = id; state.shiny = false; state.moveTab = 'level'; state.formIdx = 0;
    DATA.history = [id].concat(DATA.history.filter(x => x !== id)).slice(0, 6);
    renderHome(); renderDetail(); go('detail');
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
    at(1000, () => capStage('s-ball'));
    at(1700, () => capStage('s-shake'));
    at(3200, () => capStage('s-open'));
    at(3550, () => capStage('s-grow'));
    at(5250, () => capStage('s-flash'));
    at(5450, () => finishCapture());
  }
  function finishCapture() {
    clearCap(); capStage('s-final');
    const p = byId(+cap.dataset.id);
    if (!p.caught) { p.caught = true; p.date = '23/09/2026'; DATA.caughtCount += 1; }
    renderDex(); renderCaptured(); if (state.screen === 'detail' && state.detailId === p.id) updateDetailButtons();
  }
  function closeCapture() { clearCap(); cap.className = 'capture'; }

  /* ------------------------------------------------------------------
     BOOT
     ------------------------------------------------------------------ */
  function boot() {
    const b = $('#boot'); b.classList.remove('done');
    setTimeout(() => b.classList.add('done'), 2300);
  }
  function replayBoot() {
    const old = $('#boot'); const n = old.cloneNode(true); old.replaceWith(n); boot();
  }

  /* ------------------------------------------------------------------
     EVENTOS
     ------------------------------------------------------------------ */
  document.addEventListener('click', (e) => {
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
    if (e.target.closest('#shiny-btn')) { state.shiny = !state.shiny; const img = $('#detail-art'); img.src = art(state.detailId, state.shiny); img.classList.remove('swap'); void img.offsetWidth; img.classList.add('swap'); $('#shiny-btn').classList.toggle('on', state.shiny); return; }
    if (e.target.closest('#btn-caught')) { startCapture(state.detailId); return; }
    if (e.target.closest('#btn-team')) { state.teamAdded[state.detailId] = !state.teamAdded[state.detailId]; const empty = DATA.team.indexOf(null); if (state.teamAdded[state.detailId] && empty >= 0 && !DATA.team.includes(state.detailId)) DATA.team[empty] = state.detailId; else if (!state.teamAdded[state.detailId]) DATA.team = DATA.team.map(x => x === state.detailId ? null : x); renderHome(); updateDetailButtons(); return; }
    if (e.target.closest('#cmp-swap')) { DATA.compare.reverse(); renderCompare(); return; }
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
  renderAll(); setSound(false); updateLayout(); boot();
  setTimeout(() => { if (state.screen === 'home') { $('#search-input').focus(); renderSearch(); } }, 2400);
})();
