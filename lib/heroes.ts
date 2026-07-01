export type Skill = {
  name: string;
  desc: string;
};

export type Hero = {
  id: number;
  name: string;
  portrait: string;
  title: string;
  logo: string;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number; // 0..1
  skill: Skill;
  blurb: string;
};

export const HEROES: Hero[] = [
  {
    id: 1,
    name: "Fighter",
    portrait: "/art/hero1.png",
    title: "/art/title1.png",
    logo: "/art/logo1.png",
    maxHp: 120,
    atk: 28,
    def: 14,
    spd: 10,
    crit: 0.15,
    skill: { name: "Rage Strike", desc: "A furious blow dealing heavy damage." },
    blurb: "Balanced brawler with strong, reliable hits.",
  },
  {
    id: 2,
    name: "Swordsman",
    portrait: "/art/hero2.png",
    title: "/art/title2.png",
    logo: "/art/logo2.png",
    maxHp: 100,
    atk: 30,
    def: 8,
    spd: 16,
    crit: 0.2,
    skill: { name: "Triple Slash", desc: "Three rapid cuts in one turn." },
    blurb: "Fast and aggressive, lands extra hits.",
  },
  {
    id: 3,
    name: "Mage",
    portrait: "/art/hero3.png",
    title: "/art/title3.png",
    logo: "/art/logo3.png",
    maxHp: 80,
    atk: 38,
    def: 6,
    spd: 9,
    crit: 0.15,
    skill: { name: "Fireball", desc: "Massive magic damage that ignores armor and Burns." },
    blurb: "Glass cannon. Hits hardest, breaks easily.",
  },
  {
    id: 4,
    name: "Ninja",
    portrait: "/art/hero4.png",
    title: "/art/title4.png",
    logo: "/art/logo4.png",
    maxHp: 90,
    atk: 26,
    def: 8,
    spd: 20,
    crit: 0.3,
    skill: { name: "Shadow Strike", desc: "Guaranteed critical that also Poisons." },
    blurb: "Strikes first, crits often.",
  },
  {
    id: 5,
    name: "Priest",
    portrait: "/art/hero5.png",
    title: "/art/title5.png",
    logo: "/art/logo5.png",
    maxHp: 130,
    atk: 22,
    def: 12,
    spd: 8,
    crit: 0.1,
    skill: { name: "Holy Heal", desc: "Restore health, cleanse, and gain a shield." },
    blurb: "Outlasts foes by healing wounds.",
  },
  {
    id: 6,
    name: "Taoist",
    portrait: "/art/hero6.png",
    title: "/art/title6.png",
    logo: "/art/logo6.png",
    maxHp: 110,
    atk: 24,
    def: 10,
    spd: 12,
    crit: 0.15,
    skill: { name: "Curse", desc: "Damage, Weaken the enemy, and maybe Stun them." },
    blurb: "Controls the fight with hexes.",
  },
  {
    id: 7,
    name: "Knight",
    portrait: "/art/hero7.png",
    title: "/art/title7.png",
    logo: "/art/logo7.png",
    maxHp: 150,
    atk: 20,
    def: 20,
    spd: 6,
    crit: 0.1,
    skill: { name: "Shield Wall", desc: "Raise a large shield and heal." },
    blurb: "An immovable wall of armor.",
  },
];

export const getHero = (id: number) =>
  HEROES.find((h) => h.id === id) ?? HEROES[0];
