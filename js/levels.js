// js/levels.js — Level data, tile maps, wave schedules, and hazards
import { ASSETS } from "./assets.js";

export const operators = [
  {
    id: "vanguard",
    name: "Texas",
    class: "Vanguard",
    cost: 6,
    hp: 600,
    maxHp: 600,
    atk: 85,
    range: 1,
    block: 1,
    interval: 1.0,
    tile: "path",
    dpPerAtk: 1,
    note: "Rapid deployment, generates +1 DP on strikes",
    sprite: ASSETS.operators.vanguard
  },
  {
    id: "guard",
    name: "Lappland",
    class: "Guard",
    cost: 12,
    hp: 950,
    maxHp: 950,
    atk: 160,
    range: 1,
    block: 2,
    interval: 1.15,
    tile: "path",
    note: "High melee damage, holds up to 2 ground enemies",
    sprite: ASSETS.operators.guard
  },
  {
    id: "sniper",
    name: "Mayer",
    class: "Sniper",
    cost: 11,
    hp: 520,
    maxHp: 520,
    atk: 130,
    range: 3,
    block: 0,
    interval: 0.95,
    tile: "high",
    antiAir: true,
    note: "High-ground marksman, prioritizes aerial drones",
    sprite: ASSETS.operators.sniper
  },
  {
    id: "medic",
    name: "Reed",
    class: "Medic",
    cost: 10,
    hp: 480,
    maxHp: 480,
    atk: 95,
    range: 2,
    block: 0,
    interval: 1.4,
    tile: "high",
    heals: true,
    note: "High-ground healer, restores HP to nearby wounded operators",
    sprite: ASSETS.operators.medic
  },
  {
    id: "riko",
    name: "Riko",
    class: "Defender",
    cost: 16,
    hp: 1650,
    maxHp: 1650,
    atk: 95,
    def: 70,
    range: 1,
    block: 3,
    interval: 1.3,
    tile: "path",
    note: "Heavy armored fortress, holds up to 3 ground hostiles",
    sprite: ASSETS.operators.riko
  },
  {
    id: "dracula",
    name: "Dracula",
    class: "Caster",
    cost: 14,
    hp: 560,
    maxHp: 560,
    atk: 220,
    range: 3,
    block: 0,
    interval: 1.35,
    tile: "high",
    isArts: true,
    note: "Originium Arts caster, pierces high-DEF targets with magic",
    sprite: ASSETS.operators.dracula
  },
  {
    id: "dragun",
    name: "Dragun",
    class: "Guard",
    cost: 15,
    hp: 1150,
    maxHp: 1150,
    atk: 180,
    range: 2,
    block: 2,
    interval: 1.1,
    tile: "path",
    note: "Noble swordmaster, long-range melee blade waves",
    sprite: ASSETS.operators.dragun
  },
  {
    id: "satashi",
    name: "Satashi",
    class: "Guard",
    cost: 13,
    hp: 920,
    maxHp: 920,
    atk: 175,
    range: 2,
    block: 2,
    interval: 0.95,
    tile: "path",
    note: "Destreza swordsman, rapid ranged physical strikes",
    sprite: ASSETS.operators.satashi
  },
  {
    id: "kira",
    name: "Kira",
    class: "Specialist",
    cost: 8,
    hp: 680,
    maxHp: 680,
    atk: 150,
    range: 1,
    block: 1,
    interval: 0.75,
    tile: "path",
    note: "Fast agile operative with rapid dual-blade attacks",
    sprite: ASSETS.operators.kira
  },
  {
    id: "neeraj",
    name: "Neeraj",
    class: "Medic",
    cost: 12,
    hp: 520,
    maxHp: 520,
    atk: 115,
    range: 3,
    block: 0,
    interval: 1.25,
    tile: "high",
    heals: true,
    note: "Wide-range field doctor, rapid targeted life support",
    sprite: ASSETS.operators.neeraj
  }
];

export const briefings = [
  {
    id: 1,
    title: "Dense Forest",
    code: "OP-01",
    subtitle: "The Jerna Perimeter",
    text: "An advance team from Rhodes Island and Endfield descends into the Jerna valley. Spores corrode standard armor and the mist hides everything. Clear the sectors and set up a perimeter.",
    hazard: "Spore Haze: Ranged operators lose 10% ATK in fog tiles.",
    enemies: ["sporeling", "thornbeast"]
  },
  {
    id: 2,
    title: "Abandoned Factory",
    code: "OP-02",
    subtitle: "Old-Era Shipyard",
    text: "Deep in the valley lies an Old-Era shipyard, still guarded by Aggeloi. Retake the forge and establish a forward base so the ark can be built.",
    hazard: "Conveyors: Active transport tracks propel enemies forward 35% faster.",
    enemies: ["aggeloi_drone", "aggeloi_sentinel"]
  },
  {
    id: 3,
    title: "Purple Crystal Planet",
    code: "OP-03",
    subtitle: "Resonance Peak",
    text: "Beyond the valley, a world humming with Originium crystal. The same energy that shattered the Stargate still pulses here. Hold the line and learn what it wants.",
    hazard: "Crystal Surges: Every 20 seconds, Originium discharge disables a random tile for 5s.",
    enemies: ["crystal_crawler", "aggeloi_sentinel", "crystal_titan"]
  }
];

export const levels = [
  {
    id: 1,
    code: "OP-01",
    name: "Dense Forest",
    subtitle: "Jerna Valley Expedition",
    theme: {
      bg: "#04160d",
      accent: "#3ef0c0",
      gridLine: "rgba(62, 240, 192, 0.15)",
      tilePath: "#0b2a1c",
      tileHigh: "#123c28",
      tileBlocked: "#04140b",
      bgImage: null
    },
    hazardType: "spore_haze",
    hazardDesc: "Spore Haze: -10% Ranged ATK",
    cols: 9,
    rows: 5,
    // P = Path, H = High ground, B = Blocked, S = Spawn, O = Objective
    map: [
      "B", "H", "H", "B", "H", "H", "B", "B", "B",
      "S", "P", "P", "P", "P", "P", "P", "P", "O",
      "B", "H", "B", "H", "B", "H", "B", "H", "B",
      "B", "B", "P", "P", "P", "P", "P", "B", "B",
      "B", "B", "H", "H", "B", "B", "H", "B", "B"
    ],
    // Primary path waypoints (grid col, row coordinates)
    waypoints: [
      { col: 0, row: 1 },
      { col: 2, row: 1 },
      { col: 2, row: 3 },
      { col: 6, row: 3 },
      { col: 6, row: 1 },
      { col: 8, row: 1 }
    ],
    waves: [
      { enemy: "sporeling", count: 6, gap: 2.0 },
      { enemy: "thornbeast", count: 3, gap: 3.5 },
      { enemy: "sporeling", count: 10, gap: 1.2 }
    ]
  },
  {
    id: 2,
    code: "OP-02",
    name: "Abandoned Factory",
    subtitle: "Shipyard Assembly Line",
    theme: {
      bg: "#160b06",
      accent: "#ff8a3d",
      gridLine: "rgba(255, 138, 61, 0.18)",
      tilePath: "#28170e",
      tileHigh: "#3c2317",
      tileBlocked: "#130904",
      bgImage: ASSETS.levels.factoryBg
    },
    hazardType: "conveyor",
    hazardDesc: "Conveyors: Enemies speed +35% on track",
    conveyorCols: [3, 4, 5],
    cols: 9,
    rows: 5,
    // Spawn at right, Objective at left matching abandon_factory.png
    map: [
      "B", "B", "H", "H", "B", "H", "H", "B", "B",
      "O", "P", "P", "P", "P", "P", "P", "P", "S",
      "B", "H", "B", "H", "B", "H", "B", "H", "B",
      "B", "P", "P", "P", "P", "P", "P", "P", "S",
      "B", "B", "H", "H", "B", "H", "H", "B", "B"
    ],
    waypoints: [
      { col: 8, row: 1 },
      { col: 5, row: 1 },
      { col: 5, row: 3 },
      { col: 1, row: 3 },
      { col: 1, row: 1 },
      { col: 0, row: 1 }
    ],
    waves: [
      { enemy: "aggeloi_drone", count: 8, gap: 1.8 },
      { enemy: "aggeloi_sentinel", count: 3, gap: 4.0 },
      { enemy: "aggeloi_drone", count: 12, gap: 1.0 }
    ]
  },
  {
    id: 3,
    code: "OP-03",
    name: "Purple Crystal Planet",
    subtitle: "Resonance Crucible",
    theme: {
      bg: "#0d041a",
      accent: "#c26bff",
      gridLine: "rgba(194, 107, 255, 0.2)",
      tilePath: "#1f0c38",
      tileHigh: "#311457",
      tileBlocked: "#0b0316",
      bgImage: ASSETS.levels.crystalBg
    },
    hazardType: "crystal_surge",
    hazardDesc: "Crystal Surge: Periodic tile lockdown",
    cols: 9,
    rows: 5,
    // Spawns on top and right, base on left
    map: [
      "B", "B", "B", "S", "B", "B", "H", "H", "B",
      "B", "H", "P", "P", "P", "P", "P", "P", "S",
      "O", "P", "P", "H", "H", "P", "H", "B", "B",
      "B", "H", "P", "P", "P", "P", "P", "P", "S",
      "B", "B", "H", "H", "B", "H", "H", "B", "B"
    ],
    waypoints: [
      { col: 8, row: 1 },
      { col: 4, row: 1 },
      { col: 4, row: 2 },
      { col: 2, row: 2 },
      { col: 0, row: 2 }
    ],
    waves: [
      { enemy: "crystal_crawler", count: 8, gap: 1.6 },
      { enemy: "aggeloi_sentinel", count: 4, gap: 3.0 },
      { enemy: "crystal_titan", count: 1, gap: 0 }
    ]
  }
];
