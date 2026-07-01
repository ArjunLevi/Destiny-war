export type Kingdom = {
  id: number;
  name: string;
  realm: string;
  logo: string;
  banner: string;
  title: string;
  lore: string;
  top: string;
  left: string;
};

export const KINGDOMS: Kingdom[] = [
  {
    id: 1,
    name: "Fighter",
    realm: "Ironhold Dominion",
    logo: "/art/logo1.png",
    banner: "/art/kingdom1.png",
    title: "/art/title1.png",
    lore:
      "Ironhold trains soldiers who never break formation. Their arenas are built into cliffside forges where every blow echoes like thunder. They hold the northern passes and supply steel to every front.",
    top: "14%",
    left: "16%",
  },
  {
    id: 2,
    name: "Swordsman",
    realm: "Bladehaven Coast",
    logo: "/art/logo2.png",
    banner: "/art/kingdom2.png",
    title: "/art/title2.png",
    lore:
      "Bladehaven's duelists strike faster than tide. Their schools line the eastern coves, and their captains lead expedition fleets with reckless grace. Speed is their doctrine — hesitation is exile.",
    top: "10%",
    left: "58%",
  },
  {
    id: 3,
    name: "Mage",
    realm: "Ember Spire",
    logo: "/art/logo3.png",
    banner: "/art/kingdom3.png",
    title: "/art/title3.png",
    lore:
      "Ember Spire pierces the storm clouds above the eastern sea. Archmages bind comet fire into spellglass. Their power is unmatched — and their towers burn brightest when the realm is threatened.",
    top: "24%",
    left: "84%",
  },
  {
    id: 4,
    name: "Ninja",
    realm: "Shadow Veil",
    logo: "/art/logo4.png",
    banner: "/art/kingdom4.png",
    title: "/art/title4.png",
    lore:
      "Hidden among misty archipelagos, the Shadow Veil clan moves unseen. They poison supply lines, steal war maps, and vanish before dawn. Many kings fear a blade they cannot see.",
    top: "40%",
    left: "70%",
  },
  {
    id: 5,
    name: "Priest",
    realm: "Sanctum of Light",
    logo: "/art/logo5.png",
    banner: "/art/kingdom5.png",
    title: "/art/title5.png",
    lore:
      "The Sanctum tends the wounded and keeps the old prayers alive. Their healers march with every coalition, turning lost battles into stalemates. Light, to them, is not mercy — it is strategy.",
    top: "52%",
    left: "14%",
  },
  {
    id: 6,
    name: "Taoist",
    realm: "Jade Monastery",
    logo: "/art/logo6.png",
    banner: "/art/kingdom6.png",
    title: "/art/title6.png",
    lore:
      "High on jade terraces, monks read the flow of battle like river currents. Hexes, stuns, and curses bend fate itself. They claim neutrality — until the Shadow Crown threatens the balance.",
    top: "70%",
    left: "42%",
  },
  {
    id: 7,
    name: "Knight",
    realm: "Crownwall Bastion",
    logo: "/art/logo7.png",
    banner: "/art/kingdom7.png",
    title: "/art/title7.png",
    lore:
      "Crownwall stands at the heart of the fractured map — an immovable fortress of honor and plate. Knights there swear to reunite the shards peacefully, or bury every tyrant who tries otherwise.",
    top: "46%",
    left: "48%",
  },
];
