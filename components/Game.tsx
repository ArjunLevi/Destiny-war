"use client";

import { useEffect, useReducer, useState } from "react";
import { useComposeCast } from "@coinbase/onchainkit/minikit";
import { HEROES, Hero } from "@/lib/heroes";
import { Leaderboard } from "@/components/Leaderboard";
import { BattleField, type CombatFx } from "@/components/BattleField";
import { DestinyWallet } from "@/components/DestinyWallet";
import {
  applyOnchainStats,
  arenaPowerRating,
  formatOnchainStats,
  type ArenaChampion,
  type OnchainHeroStats,
} from "@/lib/arenaCombat";
import { useArenaChampions } from "@/lib/useArenaChampions";

const MAX_ENERGY = 100;
const START_ENERGY = 50;

type Status = {
  burn: number;
  poison: number;
  weaken: number;
  stun: number;
  shield: number;
};

type Combatant = {
  hero: Hero;
  hp: number;
  maxHp: number;
  atk: number;
  baseAtk: number;
  def: number;
  spd: number;
  crit: number;
  energy: number;
  st: Status;
  isBoss: boolean;
  lifesteal: number;
  thorns: number;
  energyStart: number;
  tokenId?: bigint;
  onchain?: OnchainHeroStats;
  arenaRating?: number;
};

type Upgrade = {
  id: string;
  icon: string;
  title: string;
  desc: string;
  apply: (p: Combatant) => Combatant;
};

type Screen = "menu" | "select" | "battle" | "upgrade" | "over";

type State = {
  screen: Screen;
  player: Combatant | null;
  enemy: Combatant | null;
  wave: number;
  turn: "player" | "enemy";
  log: string[];
  hitTarget: "player" | "enemy" | null;
  hitKey: number;
  combatFx: CombatFx | null;
  playerStunned: boolean;
  upgrades: Upgrade[] | null;
};

type Action =
  | { type: "GO_SELECT" }
  | { type: "START"; champion: ArenaChampion }
  | { type: "PLAYER"; kind: "attack" | "skill" | "defend" | "pass" }
  | { type: "ENEMY" }
  | { type: "CHOOSE"; id: string }
  | { type: "MENU" };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const r = Math.round;
const emptySt = (): Status => ({ burn: 0, poison: 0, weaken: 0, stun: 0, shield: 0 });

function makeCombatant(
  hero: Hero,
  scale = 1,
  boss = false,
  champion?: ArenaChampion,
): Combatant {
  const onchain = champion
    ? {
        power: champion.power,
        strength: champion.strength,
        speed: champion.speed,
      }
    : undefined;
  const scaled = onchain ? applyOnchainStats(hero, onchain) : null;
  const s = scale * (boss ? 1.55 : 1);

  return {
    hero,
    maxHp: r((scaled?.maxHp ?? hero.maxHp) * s),
    hp: r((scaled?.maxHp ?? hero.maxHp) * s),
    atk: r((scaled?.atk ?? hero.atk) * (boss ? scale * 1.25 : scale)),
    baseAtk: r((scaled?.atk ?? hero.atk) * (boss ? scale * 1.25 : scale)),
    def: r((scaled?.def ?? hero.def) * scale),
    spd: scaled?.spd ?? hero.spd,
    crit: scaled?.crit ?? hero.crit,
    energy: START_ENERGY,
    st: emptySt(),
    isBoss: boss,
    lifesteal: 0,
    thorns: 0,
    energyStart: START_ENERGY,
    tokenId: champion?.tokenId,
    onchain,
    arenaRating: onchain ? arenaPowerRating(onchain) : undefined,
  };
}

function spawnEnemy(wave: number, avoidId: number, boss: boolean): Combatant {
  const scale = 1 + (wave - 1) * 0.12;
  const pool = HEROES.filter((h) => h.id !== avoidId);
  const hero = pool[Math.floor(Math.random() * pool.length)];
  return makeCombatant(hero, scale, boss);
}

const UPGRADES: Upgrade[] = [
  {
    id: "blade",
    icon: "⚔️",
    title: "Sharpened Blade",
    desc: "+20% Attack",
    apply: (p) => ({ ...p, atk: r(p.atk * 1.2), baseAtk: r(p.baseAtk * 1.2) }),
  },
  {
    id: "iron",
    icon: "🛡️",
    title: "Iron Body",
    desc: "+25% Max HP (and heal it)",
    apply: (p) => {
      const maxHp = r(p.maxHp * 1.25);
      return { ...p, maxHp, hp: clamp(p.hp + (maxHp - p.maxHp), 0, maxHp) };
    },
  },
  {
    id: "eye",
    icon: "🎯",
    title: "Eagle Eye",
    desc: "+12% Crit chance",
    apply: (p) => ({ ...p, crit: Math.min(0.85, p.crit + 0.12) }),
  },
  {
    id: "vamp",
    icon: "🧛",
    title: "Vampiric Edge",
    desc: "+15% Lifesteal",
    apply: (p) => ({ ...p, lifesteal: p.lifesteal + 0.15 }),
  },
  {
    id: "thorns",
    icon: "🌵",
    title: "Thornmail",
    desc: "+25% Thorns (reflect damage)",
    apply: (p) => ({ ...p, thorns: p.thorns + 0.25 }),
  },
  {
    id: "trance",
    icon: "⚡",
    title: "Battle Trance",
    desc: "Start each wave with full energy",
    apply: (p) => ({ ...p, energyStart: MAX_ENERGY }),
  },
  {
    id: "wind",
    icon: "❤️",
    title: "Second Wind",
    desc: "Heal to full now",
    apply: (p) => ({ ...p, hp: p.maxHp }),
  },
  {
    id: "berserk",
    icon: "😤",
    title: "Berserker",
    desc: "+35% Attack, -10% Max HP",
    apply: (p) => {
      const maxHp = r(p.maxHp * 0.9);
      return {
        ...p,
        atk: r(p.atk * 1.35),
        baseAtk: r(p.baseAtk * 1.35),
        maxHp,
        hp: clamp(p.hp, 0, maxHp),
      };
    },
  },
];

function pick3(): Upgrade[] {
  return [...UPGRADES].sort(() => Math.random() - 0.5).slice(0, 3);
}

function pushLog(log: string[], line: string) {
  return [line, ...log].slice(0, 5);
}

function computeHit(
  attacker: Combatant,
  defender: Combatant,
  mult: number,
  opts: { ignoreDef?: boolean; forceCrit?: boolean } = {}
) {
  const eff = attacker.atk * (attacker.st.weaken > 0 ? 0.75 : 1);
  const variance = rand(0.85, 1.15);
  let dmg = opts.ignoreDef
    ? eff * mult * variance
    : eff * mult * variance - defender.def * 0.5;
  dmg = Math.max(1, dmg);
  const crit = opts.forceCrit || Math.random() < attacker.crit;
  if (crit) dmg *= 1.8;
  return { dmg: r(dmg), crit };
}

function applyHit(target: Combatant, dmg: number): Combatant {
  const absorbed = Math.min(target.st.shield, dmg);
  const rem = dmg - absorbed;
  return {
    ...target,
    st: { ...target.st, shield: target.st.shield - absorbed },
    hp: clamp(target.hp - rem, 0, target.maxHp),
  };
}

function tick(c: Combatant) {
  let dmg = 0;
  const notes: string[] = [];
  if (c.st.burn > 0) {
    const d = r(c.maxHp * 0.05) + 3;
    dmg += d;
    notes.push(`burns (${d})`);
  }
  if (c.st.poison > 0) {
    const d = r(c.maxHp * 0.04) + 2;
    dmg += d;
    notes.push(`poison (${d})`);
  }
  const stunnedThisTurn = c.st.stun > 0;
  const st: Status = {
    burn: Math.max(0, c.st.burn - 1),
    poison: Math.max(0, c.st.poison - 1),
    weaken: Math.max(0, c.st.weaken - 1),
    stun: Math.max(0, c.st.stun - 1),
    shield: c.st.shield,
  };
  return {
    c: { ...c, st, hp: clamp(c.hp - dmg, 0, c.maxHp) },
    dmg,
    notes,
    stunnedThisTurn,
  };
}

const initialState: State = {
  screen: "menu",
  player: null,
  enemy: null,
  wave: 1,
  turn: "player",
  log: [],
  hitTarget: null,
  hitKey: 0,
  combatFx: null,
  playerStunned: false,
  upgrades: null,
};

function handToPlayer(
  base: State,
  player: Combatant,
  enemy: Combatant,
  log: string[]
): State {
  const t = tick(player);
  let nlog = log;
  if (t.dmg > 0)
    nlog = pushLog(nlog, `${player.hero.name} ${t.notes.join(" & ")}.`);
  if (t.c.hp <= 0) {
    return {
      ...base,
      player: t.c,
      enemy,
      screen: "over",
      turn: "player",
      playerStunned: false,
      log: pushLog(nlog, `${player.hero.name} succumbs to wounds...`),
      hitTarget: "player",
      hitKey: base.hitKey + 1,
    };
  }
  return {
    ...base,
    player: t.c,
    enemy,
    turn: "player",
    playerStunned: t.stunnedThisTurn,
    log: t.stunnedThisTurn
      ? pushLog(nlog, `${player.hero.name} is stunned!`)
      : nlog,
  };
}

function toUpgrade(
  base: State,
  player: Combatant,
  enemy: Combatant,
  log: string[]
): State {
  return {
    ...base,
    player,
    enemy: { ...enemy, hp: 0 },
    screen: "upgrade",
    upgrades: pick3(),
    log: pushLog(log, `${enemy.hero.name} defeated!`),
    hitTarget: "enemy",
    hitKey: base.hitKey + 1,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "GO_SELECT":
      return { ...initialState, screen: "select" };

    case "START": {
      const hero =
        HEROES.find((h) => h.id === action.champion.classId) ?? HEROES[0];
      const player = makeCombatant(hero, 1, false, action.champion);
      const enemy = spawnEnemy(1, hero.id, false);
      const playerFirst = player.spd >= enemy.spd;
      const log = [
        `Champion #${action.champion.tokenId} enters the arena (${player.arenaRating}% power).`,
        `Wave 1 — a ${enemy.hero.name} blocks your path!`,
        playerFirst ? "You move first." : "Enemy strikes first!",
      ];
      const base: State = {
        ...initialState,
        screen: "battle",
        wave: 1,
      };
      if (playerFirst) return handToPlayer(base, player, enemy, log);
      return { ...base, player, enemy, turn: "enemy", log };
    }

    case "PLAYER": {
      if (!state.player || !state.enemy || state.turn !== "player") return state;
      if (state.screen !== "battle") return state;

      let player = { ...state.player };
      let enemy = { ...state.enemy };
      let log = state.log;

      // Stunned or passing — skip straight to the enemy.
      if (state.playerStunned || action.kind === "pass") {
        return { ...state, turn: "enemy", playerStunned: false };
      }

      const heal = (amt: number) =>
        (player = { ...player, hp: clamp(player.hp + amt, 0, player.maxHp) });
      const gain = (e: number) =>
        (player = { ...player, energy: Math.min(MAX_ENERGY, player.energy + e) });
      const lifesteal = (dmg: number) => {
        if (player.lifesteal > 0) heal(r(dmg * player.lifesteal));
      };

      let fxKind: CombatFx["kind"] = "player-attack";
      let fxDmg: number | undefined;
      let fxCrit: boolean | undefined;

      if (action.kind === "attack") {
        const { dmg, crit } = computeHit(player, enemy, 1);
        enemy = applyHit(enemy, dmg);
        lifesteal(dmg);
        gain(25);
        fxDmg = dmg;
        fxCrit = crit;
        log = pushLog(
          log,
          `${player.hero.name} strikes for ${dmg}${crit ? " (CRIT!)" : ""}.`
        );
      } else if (action.kind === "defend") {
        fxKind = "player-defend";
        player = {
          ...player,
          st: { ...player.st, shield: player.st.shield + r(player.maxHp * 0.2) },
        };
        heal(r(player.maxHp * 0.05));
        gain(20);
        log = pushLog(log, `${player.hero.name} guards and gains a shield.`);
      } else {
        fxKind = "player-skill";
        // skill
        if (player.energy < MAX_ENERGY) return state;
        player = { ...player, energy: 0 };
        const name = player.hero.skill.name;
        switch (player.hero.name) {
          case "Swordsman": {
            let total = 0;
            let crits = 0;
            for (let i = 0; i < 3; i++) {
              const h = computeHit(player, enemy, 0.6);
              total += h.dmg;
              if (h.crit) crits++;
            }
            enemy = applyHit(enemy, total);
            lifesteal(total);
            fxDmg = total;
            fxCrit = crits > 0;
            log = pushLog(log, `${name}! 3 hits for ${total}${crits ? ` (${crits} crit)` : ""}.`);
            break;
          }
          case "Mage": {
            const h = computeHit(player, enemy, 1.8, { ignoreDef: true });
            enemy = applyHit(enemy, h.dmg);
            enemy = { ...enemy, st: { ...enemy.st, burn: 3 } };
            lifesteal(h.dmg);
            fxDmg = h.dmg;
            fxCrit = h.crit;
            log = pushLog(log, `${name} blasts ${h.dmg} and ignites a Burn!`);
            break;
          }
          case "Ninja": {
            const h = computeHit(player, enemy, 1.4, { forceCrit: true });
            enemy = applyHit(enemy, h.dmg);
            enemy = { ...enemy, st: { ...enemy.st, poison: 3 } };
            lifesteal(h.dmg);
            fxDmg = h.dmg;
            fxCrit = true;
            log = pushLog(log, `${name} crits ${h.dmg} and applies Poison!`);
            break;
          }
          case "Priest": {
            heal(r(player.maxHp * 0.4));
            player = {
              ...player,
              st: {
                ...player.st,
                burn: 0,
                poison: 0,
                shield: player.st.shield + r(player.maxHp * 0.15),
              },
            };
            log = pushLog(log, `${name} heals, cleanses, and shields.`);
            break;
          }
          case "Taoist": {
            const h = computeHit(player, enemy, 1.3);
            enemy = applyHit(enemy, h.dmg);
            const stun = Math.random() < 0.3 ? 1 : 0;
            enemy = { ...enemy, st: { ...enemy.st, weaken: 3, stun: Math.max(enemy.st.stun, stun) } };
            lifesteal(h.dmg);
            fxDmg = h.dmg;
            fxCrit = h.crit;
            log = pushLog(
              log,
              `${name} hits ${h.dmg}, Weakens${stun ? " & Stuns" : ""} the foe!`
            );
            break;
          }
          case "Knight": {
            player = {
              ...player,
              st: { ...player.st, shield: player.st.shield + r(player.maxHp * 0.4) },
            };
            heal(r(player.maxHp * 0.12));
            log = pushLog(log, `${name}! A massive shield rises.`);
            break;
          }
          default: {
            const h = computeHit(player, enemy, 2);
            enemy = applyHit(enemy, h.dmg);
            lifesteal(h.dmg);
            fxDmg = h.dmg;
            fxCrit = h.crit;
            log = pushLog(log, `${name} smashes for ${h.dmg}${h.crit ? " (CRIT!)" : ""}.`);
          }
        }
      }

      const damagedEnemy =
        action.kind === "attack" ||
        (action.kind === "skill" && fxDmg !== undefined);
      const nextHitKey = damagedEnemy ? state.hitKey + 1 : state.hitKey;

      if (enemy.hp <= 0) {
        return toUpgrade(state, player, enemy, log);
      }

      return {
        ...state,
        player,
        enemy,
        turn: "enemy",
        log,
        hitTarget: damagedEnemy ? "enemy" : null,
        hitKey: nextHitKey,
        combatFx: {
          kind: fxKind,
          key: nextHitKey,
          damage: fxDmg,
          crit: fxCrit,
        },
      };
    }

    case "ENEMY": {
      if (!state.player || !state.enemy || state.turn !== "enemy") return state;
      if (state.screen !== "battle") return state;

      const t = tick(state.enemy);
      let enemy = t.c;
      let player = { ...state.player };
      let log = state.log;
      if (t.dmg > 0)
        log = pushLog(log, `${enemy.hero.name} ${t.notes.join(" & ")}.`);

      if (enemy.hp <= 0) {
        return toUpgrade(state, player, enemy, log);
      }

      if (t.stunnedThisTurn) {
        log = pushLog(log, `${enemy.hero.name} is stunned!`);
        return handToPlayer(state, player, enemy, log);
      }

      const lowHp = enemy.hp / enemy.maxHp < 0.3;
      let didDamage = true;
      let fxKind: CombatFx["kind"] = "enemy-attack";
      let fxDmg: number | undefined;
      let fxCrit: boolean | undefined;

      if (lowHp && Math.random() < 0.25) {
        enemy = {
          ...enemy,
          st: { ...enemy.st, shield: enemy.st.shield + r(enemy.maxHp * 0.18) },
          energy: Math.min(MAX_ENERGY, enemy.energy + 20),
          hp: clamp(enemy.hp + r(enemy.maxHp * 0.05), 0, enemy.maxHp),
        };
        log = pushLog(log, `${enemy.hero.name} defends.`);
        didDamage = false;
      } else if (enemy.energy >= MAX_ENERGY && Math.random() < 0.5) {
        fxKind = "enemy-skill";
        enemy = { ...enemy, energy: 0 };
        if (enemy.hero.name === "Priest") {
          enemy = {
            ...enemy,
            hp: clamp(enemy.hp + r(enemy.maxHp * 0.4), 0, enemy.maxHp),
          };
          log = pushLog(log, `${enemy.hero.name} heals up.`);
          didDamage = false;
        } else {
          const mult =
            enemy.hero.name === "Fighter"
              ? 2
              : enemy.hero.name === "Mage"
                ? 1.8
                : enemy.hero.name === "Ninja"
                  ? 1.4
                  : 1.5;
          const h = computeHit(player, enemy, mult, {
            ignoreDef: enemy.hero.name === "Mage",
            forceCrit: enemy.hero.name === "Ninja",
          });
          player = applyHit(player, h.dmg);
          fxDmg = h.dmg;
          fxCrit = h.crit;
          log = pushLog(
            log,
            `${enemy.hero.name} unleashes ${enemy.hero.skill.name} for ${h.dmg}${h.crit ? " (CRIT!)" : ""}!`
          );
          if (player.thorns > 0) {
            const ref = Math.max(1, r(h.dmg * player.thorns));
            enemy = applyHit(enemy, ref);
            log = pushLog(log, `Thorns reflect ${ref}!`);
          }
        }
      } else {
        const h = computeHit(player, enemy, 1);
        player = applyHit(player, h.dmg);
        fxDmg = h.dmg;
        fxCrit = h.crit;
        enemy = { ...enemy, energy: Math.min(MAX_ENERGY, enemy.energy + 25) };
        log = pushLog(
          log,
          `${enemy.hero.name} attacks for ${h.dmg}${h.crit ? " (CRIT!)" : ""}.`
        );
        if (player.thorns > 0) {
          const ref = Math.max(1, r(h.dmg * player.thorns));
          enemy = applyHit(enemy, ref);
          log = pushLog(log, `Thorns reflect ${ref}!`);
        }
      }

      if (enemy.hp <= 0) {
        return toUpgrade(state, player, enemy, log);
      }

      if (player.hp <= 0) {
        return {
          ...state,
          player,
          enemy,
          screen: "over",
          log: pushLog(log, `${player.hero.name} has fallen...`),
          hitTarget: "player",
          hitKey: state.hitKey + 1,
        };
      }

      const nextHitKey = didDamage ? state.hitKey + 1 : state.hitKey;
      return handToPlayer(
        {
          ...state,
          hitTarget: didDamage ? "player" : null,
          hitKey: nextHitKey,
          combatFx: didDamage
            ? { kind: fxKind, key: nextHitKey, damage: fxDmg, crit: fxCrit }
            : null,
        },
        player,
        enemy,
        log
      );
    }

    case "CHOOSE": {
      if (!state.player || !state.upgrades) return state;
      const up = state.upgrades.find((u) => u.id === action.id);
      if (!up) return state;
      let player = up.apply(state.player);
      const wave = state.wave + 1;
      const boss = wave % 5 === 0;
      const enemy = spawnEnemy(wave, player.hero.id, boss);
      player = {
        ...player,
        energy: player.energyStart,
        st: emptySt(),
        atk: player.baseAtk,
        hp: clamp(player.hp + r(player.maxHp * 0.2), 0, player.maxHp),
      };
      const playerFirst = player.spd >= enemy.spd;
      const log = pushLog(
        state.log,
        boss
          ? `Wave ${wave} — BOSS ${enemy.hero.name} appears!`
          : `Wave ${wave} — ${enemy.hero.name} appears.`
      );
      const base: State = {
        ...state,
        screen: "battle",
        wave,
        upgrades: null,
        hitTarget: null,
        hitKey: state.hitKey + 1,
        combatFx: null,
      };
      if (playerFirst) return handToPlayer(base, player, enemy, log);
      return { ...base, player, enemy, turn: "enemy", playerStunned: false, log };
    }

    case "MENU":
      return { ...initialState };

    default:
      return state;
  }
}

function Bars({ c, showChampion }: { c: Combatant; showChampion?: boolean }) {
  const hpPct = clamp((c.hp / c.maxHp) * 100, 0, 100);
  const enPct = clamp((c.energy / MAX_ENERGY) * 100, 0, 100);
  return (
    <div className="fighter-meta">
      <div className="row">
        <strong>
          {c.isBoss ? "👑 " : ""}
          {showChampion && c.tokenId != null ? (
            <>
              {c.hero.name}{" "}
              <span className="champion-id-tag">#{c.tokenId.toString()}</span>
            </>
          ) : (
            c.hero.name
          )}
        </strong>
        <span className="muted">
          {c.hp}/{c.maxHp}
        </span>
      </div>
      {showChampion && c.onchain && (
        <p className="fighter-onchain-stats">{formatOnchainStats(c.onchain)}</p>
      )}
      <div className="bar">
        <span
          style={{
            width: `${hpPct}%`,
            background: hpPct > 50 ? "#4fdc6b" : hpPct > 25 ? "#ffcc4d" : "#ff5d5d",
          }}
        />
      </div>
      <div className="bar energy">
        <span style={{ width: `${enPct}%` }} />
      </div>
      <div className="statuses">
        {c.st.shield > 0 && <span className="badge shield">🛡 {c.st.shield}</span>}
        {c.st.burn > 0 && <span className="badge burn">🔥 {c.st.burn}</span>}
        {c.st.poison > 0 && <span className="badge poison">☠ {c.st.poison}</span>}
        {c.st.weaken > 0 && <span className="badge weaken">▼ {c.st.weaken}</span>}
        {c.st.stun > 0 && <span className="badge stun">✦ {c.st.stun}</span>}
      </div>
    </div>
  );
}

export function Game({
  embedded = false,
  startScreen = "menu",
}: {
  embedded?: boolean;
  startScreen?: "menu" | "select";
}) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    screen: startScreen === "select" ? "select" : "menu",
  });
  const { composeCast } = useComposeCast();
  const [best, setBest] = useState(0);
  const {
    champions,
    isLoading: championsLoading,
    isConnected,
    hubConfigured,
  } = useArenaChampions();

  useEffect(() => {
    const v = Number(localStorage.getItem("dw_best") || "0");
    if (v) setBest(v);
  }, []);

  useEffect(() => {
    if (state.screen === "over" && state.wave > best) {
      setBest(state.wave);
      localStorage.setItem("dw_best", String(state.wave));
    }
  }, [state.screen, state.wave, best]);

  useEffect(() => {
    if (state.screen === "battle" && state.turn === "enemy") {
      const t = setTimeout(() => dispatch({ type: "ENEMY" }), 800);
      return () => clearTimeout(t);
    }
  }, [state.screen, state.turn, state.hitKey]);

  const share = () => {
    const p = state.player;
    const nft =
      p?.tokenId != null
        ? ` #${p.tokenId}${p.arenaRating ? ` (${p.arenaRating}% power)` : ""}`
        : "";
    composeCast({
      text: `I survived ${state.wave} waves in Destiny War Arena with my ${p?.hero.name ?? "champion"}${nft}! ⚔️ Beat my run on destinywar.app`,
    });
  };

  // ---------- MENU ----------
  if (state.screen === "menu") {
    return (
      <div className={`screen menu ${embedded ? "embedded" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/logo.png" alt="Destiny War" className="logo" />
        <h1>Arena</h1>
        <p className="muted">
          Deploy your minted champions. Onchain Quest upgrades boost HP, ATK, and
          speed in battle. Climb the onchain leaderboard.
        </p>
        {best > 0 && <p className="best">Best run · Wave {best}</p>}
        <button className="btn gold" onClick={() => dispatch({ type: "GO_SELECT" })}>
          Enter the Arena
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/walking.gif" alt="" className="walker" />
      </div>
    );
  }

  // ---------- SELECT (owned NFT champions) ----------
  if (state.screen === "select") {
    return (
      <div className={`screen select arena-select ${embedded ? "embedded" : ""}`}>
        <header className="arena-select-head">
          <h2>Deploy Champion</h2>
          <p className="muted">
            Only your minted heroes fight. Upgrade stats in Quest for higher Arena
            Power.
          </p>
        </header>

        {!hubConfigured ? (
          <p className="note arena-select-note">
            Set <code>NEXT_PUBLIC_DESTINY_HUB_ADDRESS</code> to load champions.
          </p>
        ) : !isConnected ? (
          <div className="arena-select-connect">
            <p className="muted">Connect wallet to deploy your NFT champions.</p>
            <DestinyWallet variant="cta" disconnectedLabel="Connect Wallet" />
          </div>
        ) : championsLoading ? (
          <p className="muted arena-select-note">Loading your champions…</p>
        ) : champions.length === 0 ? (
          <div className="arena-select-empty card-panel">
            <p>No champions yet.</p>
            <p className="muted">Mint on Realm, upgrade in Quest, then return to fight.</p>
          </div>
        ) : (
          <div className="arena-champion-grid">
            {champions.map((c) => {
              const scaled = applyOnchainStats(c.hero, c);
              return (
                <button
                  key={c.tokenId.toString()}
                  type="button"
                  className="arena-champion-card"
                  onClick={() =>
                    dispatch({
                      type: "START",
                      champion: {
                        tokenId: c.tokenId,
                        classId: c.classId,
                        power: c.power,
                        strength: c.strength,
                        speed: c.speed,
                      },
                    })
                  }
                >
                  <div className="arena-champion-art">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.hero.portrait} alt={c.hero.name} className="portrait" />
                    <span className="arena-champion-rating">{c.rating}%</span>
                  </div>
                  <div className="arena-champion-body">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.hero.title} alt={c.hero.name} className="titleimg" />
                    <p className="arena-champion-id">Champion #{c.tokenId.toString()}</p>
                    <div className="arena-champion-stats">
                      <span title="Power">P {c.power}%</span>
                      <span title="Strength">S {c.strength}%</span>
                      <span title="Speed">D {c.speed}%</span>
                    </div>
                    <div className="arena-champion-combat">
                      <span>HP {scaled.maxHp}</span>
                      <span>ATK {scaled.atk}</span>
                      <span>DEF {scaled.def}</span>
                      <span>SPD {scaled.spd}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!embedded && (
          <button className="btn secondary" onClick={() => dispatch({ type: "MENU" })}>
            Back
          </button>
        )}
      </div>
    );
  }

  const { player, enemy } = state;
  if (!player || !enemy) return null;
  const skillReady = player.energy >= MAX_ENERGY;
  const yourTurn = state.turn === "player" && state.screen === "battle";

  // ---------- UPGRADE OVERLAY ----------
  const upgradeOverlay =
    state.screen === "upgrade" && state.upgrades ? (
      <div className="overlay">
        <div className="upgrade-box">
          <h2>Choose a Power-Up</h2>
          {state.upgrades.map((u) => (
            <button
              key={u.id}
              className="upgrade-card"
              onClick={() => dispatch({ type: "CHOOSE", id: u.id })}
            >
              <span className="ico">{u.icon}</span>
              <span>
                <div className="t">{u.title}</div>
                <div className="d">{u.desc}</div>
              </span>
            </button>
          ))}
        </div>
      </div>
    ) : null;

  // ---------- BATTLE / OVER ----------
  return (
    <div className={`screen battle ${embedded ? "embedded" : ""}`}>
      <div className="wavebar">
        <span>
          Wave {state.wave}
          {state.wave % 5 === 0 && state.screen === "battle" ? (
            <span className="boss-tag"> · BOSS</span>
          ) : null}
        </span>
        <span className="muted">Best {Math.max(best, state.wave)}</span>
      </div>

      {player.tokenId != null && player.onchain && (
        <div className="arena-battle-hud">
          <span className="arena-battle-nft">
            <span className="onchain-pill">ONCHAIN</span>
            Champion #{player.tokenId.toString()} · {player.hero.name}
          </span>
          <span className="arena-battle-stats">{formatOnchainStats(player.onchain)}</span>
          <span className="arena-battle-power">Arena {player.arenaRating}%</span>
        </div>
      )}

      <BattleField
        player={player}
        enemy={enemy}
        wave={state.wave}
        isBoss={enemy.isBoss}
        combatFx={state.combatFx}
        hitTarget={state.hitTarget}
        hitKey={state.hitKey}
        skillReady={skillReady}
        playerClassId={player.hero.id}
      />

      <div className="bf-stats-row">
        <Bars c={player} showChampion />
        <Bars c={enemy} />
      </div>

      <div className="log">
        {state.log.map((l, i) => (
          <div key={i} style={{ opacity: 1 - i * 0.18 }}>
            {l}
          </div>
        ))}
      </div>

      {state.screen === "battle" ? (
        state.playerStunned ? (
          <div className="actions">
            <button
              className="btn secondary"
              style={{ gridColumn: "1 / -1" }}
              onClick={() => dispatch({ type: "PLAYER", kind: "pass" })}
            >
              Stunned — Continue
            </button>
          </div>
        ) : (
          <div className="actions">
            <button
              className="btn"
              disabled={!yourTurn}
              onClick={() => dispatch({ type: "PLAYER", kind: "attack" })}
            >
              Attack
            </button>
            <button
              className="btn gold"
              disabled={!yourTurn || !skillReady}
              onClick={() => dispatch({ type: "PLAYER", kind: "skill" })}
              title={player.hero.skill.desc}
            >
              {skillReady ? player.hero.skill.name : `${player.hero.skill.name} ⚡`}
            </button>
            <button
              className="btn secondary"
              disabled={!yourTurn}
              onClick={() => dispatch({ type: "PLAYER", kind: "defend" })}
            >
              Defend
            </button>
          </div>
        )
      ) : (
        <div className="gameover stack">
          <h2>Defeated · Wave {state.wave}</h2>
          {player.tokenId != null && (
            <p className="arena-run-summary">
              {player.hero.name} #{player.tokenId.toString()} · Arena {player.arenaRating}%
            </p>
          )}
          <Leaderboard wave={state.wave} onShare={share} />
          <button
            className="btn"
            onClick={() => {
              if (!player.tokenId || !player.onchain) return;
              dispatch({
                type: "START",
                champion: {
                  tokenId: player.tokenId,
                  classId: player.hero.id,
                  power: player.onchain.power,
                  strength: player.onchain.strength,
                  speed: player.onchain.speed,
                },
              });
            }}
          >
            Retry {player.hero.name} #{player.tokenId?.toString() ?? ""}
          </button>
          <button className="btn secondary" onClick={() => dispatch({ type: "GO_SELECT" })}>
            Choose another champion
          </button>
        </div>
      )}

      {upgradeOverlay}
    </div>
  );
}
