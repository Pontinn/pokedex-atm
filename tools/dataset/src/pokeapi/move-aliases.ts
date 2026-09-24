// B3.2: excecoes de nome entre o id de golpe do Cobblemon (ja sem separadores) e o nome PokeAPI
// (normalizado do mesmo jeito: so [a-z0-9]). Usado quando a comparacao direta nao casa.
export const MOVE_ALIASES: Readonly<Record<string, string>> = {
  // id real no Cobblemon 1.7.3 e "visegrip" (confirmado no snapshot); a PokeAPI publica usa o slug
  // classico "vice-grip" (o nome atual do golpe e "Vise Grip", mas o recurso da API ainda e vice-grip).
  visegrip: "vice-grip",
  hijumpkick: "high-jump-kick",
  faintattack: "feint-attack",
  smellingsalts: "smelling-salts",
  thunderpunch: "thunder-punch",
  softboiled: "soft-boiled",
  doubleslap: "double-slap",
  solarbeam: "solar-beam",
  dynamicpunch: "dynamic-punch",
  extremespeed: "extreme-speed",
  ancientpower: "ancient-power",
  smokescreen: "smokescreen",
  selfdestruct: "self-destruct",
  lockon: "lock-on",
  willowisp: "will-o-wisp",
  uturn: "u-turn",
  xscissor: "x-scissor",
  vcreate: "v-create",
  mudslap: "mud-slap",
  kingsshield: "king-s-shield",
  landswrath: "land-s-wrath",
  forestscurse: "forest-s-curse",
};

