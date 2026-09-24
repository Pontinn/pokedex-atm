// Amostra manual de 50 especies para conferencia campo a campo (A1), com o motivo de cada escolha.
export const MANUAL_SAMPLE: { dex: number; slug: string; reason: string }[] = [
  // comuns
  { dex: 16, slug: "pidgey", reason: "comum; tem arquivo 0000_pidgey_herd.json com enabled:false" },
  { dex: 19, slug: "rattata", reason: "comum, forma regional (Alola)" },
  { dex: 10, slug: "caterpie", reason: "comum, evolucao por nivel curta" },
  { dex: 161, slug: "sentret", reason: "comum gen2" },
  { dex: 396, slug: "starly", reason: "comum gen4 (BDSP)" },
  // iniciais
  { dex: 1, slug: "bulbasaur", reason: "inicial; linha com Mega/Gmax do Venusaur" },
  { dex: 4, slug: "charmander", reason: "inicial; raiz da cadeia do Charizard" },
  { dex: 7, slug: "squirtle", reason: "inicial" },
  { dex: 152, slug: "chikorita", reason: "inicial gen2" },
  { dex: 387, slug: "turtwig", reason: "inicial gen4" },
  { dex: 906, slug: "sprigatito", reason: "inicial gen9" },
  // lendarios
  { dex: 144, slug: "articuno", reason: "lendario com forma Galar" },
  { dex: 249, slug: "lugia", reason: "lendario; ccc tem 0249_lugia_shadow.json enabled:false" },
  { dex: 384, slug: "rayquaza", reason: "lendario sobrescrito pelo mega_showdown (Mega)" },
  { dex: 483, slug: "dialga", reason: "lendario sobrescrito pelo mega_showdown (Origin)" },
  { dex: 888, slug: "zacian", reason: "lendario gen8 com forma por item" },
  { dex: 1007, slug: "koraidon", reason: "lendario gen9" },
  // miticos
  { dex: 151, slug: "mew", reason: "mitico" },
  { dex: 385, slug: "jirachi", reason: "mitico com spawn so via kubejs + ccc" },
  { dex: 490, slug: "manaphy", reason: "mitico com spawn kubejs" },
  { dex: 492, slug: "shaymin", reason: "mitico com spawn kubejs e forma Sky" },
  { dex: 719, slug: "diancie", reason: "mitico com spawn kubejs e tag de bioma kubejs" },
  { dex: 807, slug: "zeraora", reason: "mitico com spawn kubejs e Mega do zamega" },
  // Mega/Gmax
  { dex: 6, slug: "charizard", reason: "Mega-X/Mega-Y (charizardite_x/_y + keystone) e Gmax sem item" },
  { dex: 3, slug: "venusaur", reason: "Mega e Gmax; override do mega_showdown" },
  { dex: 359, slug: "absol", reason: "Mega (mega_showdown) e Mega-Z (zamega:absolitez)" },
  { dex: 445, slug: "garchomp", reason: "Mega e Mega-Z (zamega:garchompitez)" },
  { dex: 94, slug: "gengar", reason: "Mega e Gmax; override do mega_showdown" },
  { dex: 448, slug: "lucario", reason: "Mega e Mega-Z" },
  // alterados por addon
  { dex: 179, slug: "mareep", reason: "adicao allthemons: drop silentgear:sinew 25%" },
  { dex: 180, slug: "flaaffy", reason: "adicao allthemons" },
  { dex: 120, slug: "staryu", reason: "adicao allthemons + spawn 0120_staryu duplicado (cobblemon x allthemons)" },
  { dex: 241, slug: "miltank", reason: "adicao allthemons" },
  { dex: 334, slug: "altaria", reason: "adicao legendarymonuments (cobblemon_drops) fora da lista da SPEC" },
  { dex: 808, slug: "meltan", reason: "adicao kubejs zzz_ccc_meltan sombreando a do ccc + adicao legendarymonuments" },
  { dex: 809, slug: "melmetal", reason: "override ccc + spawn ccc enabled:false" },
  // customs
  { dex: 9901, slug: "piglich", reason: "custom allthemons (Piglichu), sem sprite" },
  { dex: 9902, slug: "creepyon", reason: "custom allthemons com spawn proprio" },
  // spawns so no kubejs
  { dex: 550, slug: "basculin", reason: "spawn do jar sombreado pelo kubejs (0550_basculin.json)" },
  { dex: 901, slug: "ursaluna", reason: "kubejs 0901_ursaluna_bloodmoon sombreando o ccc" },
  { dex: 971, slug: "greavard", reason: "kubejs 0971_greavard sombreando o ccc" },
  // fosseis
  { dex: 142, slug: "aerodactyl", reason: "fossil old_amber + breeding (exemplo da SPEC)" },
  { dex: 138, slug: "omanyte", reason: "fossil helix" },
  { dex: 566, slug: "archen", reason: "fossil plume" },
  // pedidos explicitos
  { dex: 133, slug: "eevee", reason: "8 evolucoes; raridade uncommon + [rare, ultra-rare]" },
  { dex: 150, slug: "mewtwo", reason: "spawn ultra-rare do ccc + fossil allthemons; Megas" },
  { dex: 129, slug: "magikarp", reason: "muitos spawns (46), pesca" },
  { dex: 718, slug: "zygarde", reason: "formas 10%/Complete + Mega do zamega (zygardite)" },
  { dex: 745, slug: "lycanroc", reason: "formas; override mega_showdown; spawn duplicado entre jars" },
  { dex: 25, slug: "pikachu", reason: "muitas formas cosmeticas/Gmax; spawn 0025_pikachu_cosmetic duplicado" },
];
