"use client";

import { useEffect, useReducer, useState } from "react";
import { useComposeCast } from "@coinbase/onchainkit/minikit";
import { HEROES, Hero } from "@/lib/heroes";
import { Leaderboard } from "@/components/Leaderboard";

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
  // run modifiers (player only)
  lifesteal: number;
  thorns: number;
  energyStart: number;
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
  playerStunned: boolean;
  upgrades: Upgrade[] | null;
};

type Action =
  | { type: "GO_SELECT" }
  | { type: "START"; heroId: number }
  | { type: "PLAYER"; kind: "attack" | "skill" | "defend" | "pass" }
  | { type: "ENEMY" }
  | { type: "CHOOSE"; id: string }
  | { type: "MENU" };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const r = Math.round;
const emptySt = (): Status => ({ burn: 0, poison: 0, weaken: 0, stun: 0, shield: 0 });

function makeCombatant(hero: Hero, scale = 1, boss = false): Combatant {
  const s = scale * (boss ? 1.55 : 1);
  return {
    hero,
    maxHp: r(hero.maxHp * s),
    hp: r(hero.maxHp * s),
    atk: r(hero.atk * (boss ? scale * 1.25 : scale)),
    baseAtk: r(hero.atk * (boss ? scale * 1.25 : scale)),
    def: r(hero.def * scale),
    spd: hero.spd,
    crit: hero.crit,
    energy: START_ENERGY,
    st: emptySt(),
    isBoss: boss,
    lifesteal: 0,
    thorns: 0,
    energyStart: START_ENERGY,
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
      const hero = HEROES.find((h) => h.id === action.heroId) ?? HEROES[0];
      const player = makeCombatant(hero);
      const enemy = spawnEnemy(1, hero.id, false);
      const playerFirst = player.spd >= enemy.spd;
      const log = [
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

      if (action.kind === "attack") {
        const { dmg, crit } = computeHit(player, enemy, 1);
        enemy = applyHit(enemy, dmg);
        lifesteal(dmg);
        gain(25);
        log = pushLog(
          log,
          `${player.hero.name} strikes for ${dmg}${crit ? " (CRIT!)" : ""}.`
        );
      } else if (action.kind === "defend") {
        player = {
          ...player,
          st: { ...player.st, shield: player.st.shield + r(player.maxHp * 0.2) },
        };
        heal(r(player.maxHp * 0.05));
        gain(20);
        log = pushLog(log, `${player.hero.name} guards and gains a shield.`);
      } else {
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
            log = pushLog(log, `${name}! 3 hits for ${total}${crits ? ` (${crits} crit)` : ""}.`);
            break;
          }
          case "Mage": {
            const h = computeHit(player, enemy, 1.8, { ignoreDef: true });
            enemy = applyHit(enemy, h.dmg);
            enemy = { ...enemy, st: { ...enemy.st, burn: 3 } };
            lifesteal(h.dmg);
            log = pushLog(log, `${name} blasts ${h.dmg} and ignites a Burn!`);
            break;
          }
          case "Ninja": {
            const h = computeHit(player, enemy, 1.4, { forceCrit: true });
            enemy = applyHit(enemy, h.dmg);
            enemy = { ...enemy, st: { ...enemy.st, poison: 3 } };
            lifesteal(h.dmg);
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
            log = pushLog(log, `${name} smashes for ${h.dmg}${h.crit ? " (CRIT!)" : ""}.`);
          }
        }
      }

      const damagedEnemy = action.kind === "attack" || action.kind === "skill";

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
        hitKey: damagedEnemy ? state.hitKey + 1 : state.hitKey,
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

      return handToPlayer(
        { ...state, hitTarget: didDamage ? "player" : null, hitKey: didDamage ? state.hitKey + 1 : state.hitKey },
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

function Bars({ c }: { c: Combatant }) {
  const hpPct = clamp((c.hp / c.maxHp) * 100, 0, 100);
  const enPct = clamp((c.energy / MAX_ENERGY) * 100, 0, 100);
  return (
    <div className="fighter-meta">
      <div className="row">
        <strong>
          {c.isBoss ? "👑 " : ""}
          {c.hero.name}
        </strong>
        <span className="muted">
          {c.hp}/{c.maxHp}
        </span>
      </div>
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

export function Game({ embedded = false }: { embedded?: boolean }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { composeCast } = useComposeCast();
  const [best, setBest] = useState(0);

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

  const share = () =>
    composeCast({
      text: `I survived ${state.wave} waves in Destiny War: Arena with my ${
        state.player?.hero.name ?? "hero"
      }! ⚔️ Beat my run.`,
    });

  // ---------- MENU ----------
  if (state.screen === "menu") {
    return (
      <div className={`screen menu ${embedded ? "embedded" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/logo.png" alt="Destiny War" className="logo" />
        <h1>Arena</h1>
        <p className="muted">
          Choose a hero. Battle endless waves. Pick power-ups, beat bosses, and
          climb the onchain leaderboard.
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

  // ---------- SELECT ----------
  if (state.screen === "select") {
    return (
      <div className={`screen select ${embedded ? "embedded" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/choose_class.png" alt="Choose your class" className="choose" />
        <div className="grid">
          {HEROES.map((h) => (
            <button
              key={h.id}
              className="herocard"
              onClick={() => dispatch({ type: "START", heroId: h.id })}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={h.portrait} alt={h.name} className="portrait" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={h.title} alt={h.name} className="titleimg" />
              <div className="stats">
                <span>HP {h.maxHp}</span>
                <span>ATK {h.atk}</span>
                <span>DEF {h.def}</span>
                <span>SPD {h.spd}</span>
              </div>
              <p className="blurb">{h.blurb}</p>
            </button>
          ))}
        </div>
        <button className="btn secondary" onClick={() => dispatch({ type: "MENU" })}>
          Back
        </button>
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
    <div className="screen battle">
      <div className="wavebar">
        <span>
          Wave {state.wave}
          {state.wave % 5 === 0 && state.screen === "battle" ? (
            <span className="boss-tag"> · BOSS</span>
          ) : null}
        </span>
        <span className="muted">Best {Math.max(best, state.wave)}</span>
      </div>

      <div
        className="arena"
        style={{
          backgroundImage: `linear-gradient(rgba(7,39,29,0.35),rgba(7,39,29,0.6)), url(/art/class${Math.min(enemy.hero.id, 7)}.png)`,
        }}
      >
        <div className={`side ${state.hitTarget === "player" ? "hit" : ""}`} key={`p${state.hitKey}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={player.hero.portrait} alt={player.hero.name} className="fighter you" />
          <Bars c={player} />
        </div>
        <div className="vs">VS</div>
        <div className={`side ${state.hitTarget === "enemy" ? "hit" : ""}`} key={`e${state.hitKey}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={enemy.hero.portrait}
            alt={enemy.hero.name}
            className={`fighter foe ${enemy.isBoss ? "boss" : ""}`}
          />
          <Bars c={enemy} />
        </div>
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
          <Leaderboard wave={state.wave} onShare={share} />
          <button
            className="btn"
            onClick={() => dispatch({ type: "START", heroId: player.hero.id })}
          >
            Retry as {player.hero.name}
          </button>
          <button className="btn secondary" onClick={() => dispatch({ type: "GO_SELECT" })}>
            Choose another hero
          </button>
        </div>
      )}

      {upgradeOverlay}
    </div>
  );
}
