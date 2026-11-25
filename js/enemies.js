// js/enemies.js — Enemy definitions, wave stats, and teaser profiles
import { ASSETS } from "./assets.js";

export const ENEMY_TYPES = {
  sporeling: {
    id: "sporeling",
    name: "Sporeling",
    title: "Infected Fungal Swarm",
    hp: 240,
    maxHp: 240,
    speed: 1.25,
    atk: 65,
    def: 0,
    res: 0,
    interval: 1.2,
    flying: false,
    sprite: ASSETS.enemies.slug,
    description: "Fast-moving fungal beast. Weak alone, dangerous in swarms."
  },
  thornbeast: {
    id: "thornbeast",
    name: "Thornbeast",
    title: "Originium Borer",
    hp: 850,
    maxHp: 850,
    speed: 0.75,
    atk: 140,
    def: 45,
    res: 10,
    interval: 1.5,
    flying: false,
    sprite: ASSETS.enemies.warrior,
    description: "Heavily plated valley predator. High physical defense."
  },
  aggeloi_drone: {
    id: "aggeloi_drone",
    name: "Aggeloi Drone",
    title: "Airborne Surveyor",
    hp: 360,
    maxHp: 360,
    speed: 1.15,
    atk: 90,
    def: 15,
    res: 25,
    interval: 1.3,
    flying: true,
    sprite: ASSETS.enemies.winged,
    description: "Hovering Old-Era construct. Flies over ground operators."
  },
  aggeloi_sentinel: {
    id: "aggeloi_sentinel",
    name: "Aggeloi Sentinel",
    title: "Heavy Yard Guardian",
    hp: 1750,
    maxHp: 1750,
    speed: 0.55,
    atk: 220,
    def: 80,
    res: 15,
    interval: 1.8,
    flying: false,
    sprite: ASSETS.enemies.guitarist,
    description: "Massive crystalline automaton guarding the shipyard forge."
  },
  crystal_crawler: {
    id: "crystal_crawler",
    name: "Crystal Crawler",
    title: "Resonant Corruptor",
    hp: 650,
    maxHp: 650,
    speed: 0.95,
    atk: 125,
    def: 25,
    res: 50,
    interval: 1.4,
    flying: false,
    sprite: ASSETS.enemies.caster,
    description: "Crystalline entity high in Originium Arts resistance."
  },
  crystal_titan: {
    id: "crystal_titan",
    name: "Originium Titan",
    title: "Lord of the Crystal Peak",
    hp: 3500,
    maxHp: 3500,
    speed: 0.42,
    atk: 320,
    def: 90,
    res: 40,
    interval: 2.0,
    flying: false,
    boss: true,
    sprite: ASSETS.enemies.sniper,
    description: "Ancient entity awakened by the Great Fracture. Devastating power."
  }
};

export const teaserEnemies = [
  {
    name: "Aggeloi Titan",
    act: "ACT I — THE SHIPYARD",
    line: "A colossal construct that wakes when the forge ignites.",
    reveal: true,
    sprite: ASSETS.enemies.guitarist,
    threat: "THREAT LEVEL: ALPHA"
  },
  {
    name: "The Scourge",
    act: "ACT II — PYRE-4",
    line: "A parasitic swarm that feeds on the heat of worlds.",
    reveal: true,
    sprite: ASSETS.enemies.winged,
    threat: "THREAT LEVEL: CATACLYSM"
  },
  {
    name: "Aether Zealots",
    act: "ACT III — VERIDIA",
    line: "Sky-pirates who believe the storm is a holy cleansing.",
    reveal: true,
    sprite: ASSETS.enemies.caster,
    threat: "THREAT LEVEL: HIGH"
  },
  {
    name: "Shattered Belt Hybrids",
    act: "ACT IV — SHATTERED BELT",
    line: "Alien flesh fused with Stargate crystal anomalies.",
    reveal: true,
    sprite: ASSETS.enemies.warrior,
    threat: "THREAT LEVEL: EXTREME"
  },
  {
    name: "???",
    act: "FINALE — HOMECOMING",
    line: "Something ancient is answering Terra's signal from deep void.",
    reveal: false,
    sprite: ASSETS.enemies.teaserArt,
    threat: "THREAT LEVEL: UNKNOWN"
  }
];
