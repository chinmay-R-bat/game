# Agent.md — Stars of Talos: The Aether Bridge (Browser Game)

> Instructions for the coding agent. Build exactly what is described here. Keep it simple, working, and playable in a browser with no build step.

---

## 1. Project Summary

A single-page browser game with an **Arknights / Endfield sci-fi space theme**.

**Player flow (Prologue — Chapter 1):**

1. **Story Page** — one page, cinematic text. Player clicks **NEXT** to hear the next line of the story.
2. **Incoming Call** — Warfarin calls **Endmin** (the player) asking for help.
3. **Teleport Button** — player presses it and is sent to the Levels page.
4. **Levels Page** — 3 levels:
   1. Dense Forest
   2. Abandoned Factory
   3. Space Purple Crystal Planet
5. **End of Prologue Chapter 1** — closing screen.
6. **Enemy Teaser** — silhouettes and names of upcoming enemies.

---

## 2. Tech Stack and Rules

- Plain **HTML + CSS + JavaScript** (ES modules allowed). No framework, no bundler.
- Files:
  ```
  /index.html
  /style.css
  /js/main.js        # screen manager + state
  /js/story.js       # story + call dialogue data
  /js/levels.js      # level data
  /js/battle.js      # tower-defense engine (canvas)
  /js/enemies.js     # enemy + teaser data
  /js/assets.js      # single place for all asset paths
  /assets/story/             # story + lore documents (provided)
  /assets/operators/         # operator art (provided)
  /assets/reference/ui/      # UI design references (provided)
  /assets/reference/levels/  # level layout references (provided)
  /assets/audio/             # optional sounds
  ```
- Must run by opening `index.html` or with `npx serve`.
- Responsive: works on desktop and phone (min width 360px).
- Save progress in `localStorage` (try/catch around every access).
- **Use the provided assets and references** (see Section 2A) for operator design, UI design, and level layout design. Only fall back to simple placeholders (CSS shapes, gradients, SVG) where an asset has not been provided yet, and mark each placeholder with a `// TODO: replace with provided asset` comment.
- Add a footer: *"Fan-made, non-commercial project inspired by Arknights / Arknights: Endfield. Not affiliated with Hypergryph/Gryphline."*

---

## 2A. Assets and References (IMPORTANT)

The project owner supplies assets and reference images. **Read them before writing any UI, operator, or map code**, and match them as closely as possible.

| Purpose | Folder | How to use it |
|---------|--------|---------------|
| **Operator design** | `/assets/operators/` | Use these images/sprites as the operator art: deploy cards, battle sprites on the grid, call portrait (Warfarin), and the player portrait (Endmin). File name = operator id (e.g. `vanguard.png`, `guard.png`, `warfarin.png`). |
| **UI design reference** | `/assets/reference/ui/` | Reference screenshots for look and feel. Match layout, colors, fonts, button shapes, HUD placement, and icon style for the story page, call screen, levels page, battle HUD, and teaser screen. Rebuild the UI in HTML/CSS to match; do not just paste the screenshots as the UI. |
| **Level layout reference** | `/assets/reference/levels/` | Reference images for each map: `level1_forest.*`, `level2_factory.*`, `level3_crystal.*`. Recreate the tile grid (path, high-ground, blocked tiles), enemy entry point, and objective position from the image, and encode it in `levels.js` as a tile matrix. |
| **Story and lore** | `/assets/story/` | `stars_of_talos_story.md` (full story: Prologue, Acts I-IV, Finale) and `arknights_lore_and_gameplay.md` (world of Terra, Originium, factions, mechanics). These are the source of truth for all story text, names, enemies, and mechanics. |

Rules:
- **Operators:** if an operator asset exists, use it; the stats in Section 8 stay as defined unless told otherwise. If a sprite sheet or multiple poses are provided (idle, attack), animate with them.
- **UI:** the reference images decide the final look. Where they conflict with the style notes in Section 11, **the references win**.
- **Level layouts:** the reference images decide the map shape. Where they conflict with the 9×5 grid mentioned in Section 8, **the reference wins**. Store each map as a matrix, for example:
  ```js
  // P = path, H = high ground, B = blocked, S = enemy spawn, O = objective
  map: [
    "SPPPPB...",
    "BBHPHB...",
    "..HPPPPO."
  ]
  ```
- If an asset or reference is missing, unclear, or unreadable, **do not guess silently**: use a placeholder, add a TODO comment, and list it in your final report.
- Keep asset paths in one file (`/js/assets.js`) so swapping an image never needs changes elsewhere.
- Optimize images for the web (reasonable size, `.png`/`.webp`) and preload battle sprites before a level starts.

---

## 2B. Story and Lore Assets (use all of them)

The two provided documents are the **canon for this game**. Put them in `/assets/story/` and read both fully before writing any text, enemy, or mechanic.

**Rules**
- Story page lines, Warfarin's call, level briefings, enemy names, and teaser text must come from these documents. Expand or rephrase for pacing, but do **not** rename factions, planets, enemies, or ships, and do not contradict them.
- Keep all story/lore text in `story.js` and `enemies.js` so it can be edited without touching game logic.
- If the documents conflict with this file, the **documents win** for story, names, and lore; this file wins for screen flow and features.

**Glossary (must stay consistent everywhere)**

| Term | Meaning |
|------|---------|
| Terra | Ancient cradle of humanity, dying from the Originium Surge |
| Talos-II | Frontier moon where the player's factions live |
| Great Fracture | Cosmic surge that destroyed the Stargate between Talos-II and Terra |
| Stargate | Old-Era orbital structures that linked worlds instantly |
| Originium | Crystalline mineral that powers technology and Originium Arts, and spreads the blight |
| Oripathy / Infected | Progressive illness from Originium; the Infected face discrimination |
| Rhodes Island | Medical-tactical organization searching for a cure (player's faction) |
| Endfield Industries | Industrial faction that builds beacons, pads, and the ark |
| Aggeloi | Crystalline geometric constructs born from energy anomalies |
| Vanguard-01 | The interstellar ark-ship being built |
| Shuttle Pad / Relay Beacon | Structures built on each world to form the bridge to Terra |
| Warfarin | Ally who calls the player for help |
| Endmin | The player character (the Doctor-style commander) |

**Chapter map (what is built now vs. teased)**

| Part | Source | In this build |
|------|--------|---------------|
| Prologue: The Severed Sky | Story doc, Prologue | Story page (Section 4) |
| Act I: The Valley of Jerna | Story doc, Act I | Levels 1 and 2: the overgrown valley and the Old-Era shipyard/factory. Level briefings use Act I beats: *The Expedition*, *Reclaiming the Forge*, *The Launch* |
| Corrupted crystal world | Lore doc (Originium, Collapsals, Terra's blight) | Level 3: the purple Originium crystal planet, a foreshadowing of Terra's fate |
| Act II: Pyre-4 (Vaelen vs the Scourge) | Story doc | **Teaser only** |
| Act III: Veridia (Aether-Born, storm plague, sky-pirates) | Story doc | **Teaser only** |
| Act IV: The Shattered Belt (Aggeloi-alien hybrids) | Story doc | **Teaser only** |
| Finale: Homecoming on Terra | Story doc | Mentioned in the closing line only (no spoilers) |

**Level briefing text** (shown in the briefing modal; derived from Act I):

```js
export const briefings = [
  { id: 1, title: "Dense Forest", text: "An advance team from Rhodes Island and Endfield descends into the Jerna valley. Spores corrode standard armor and the mist hides everything. Clear the sectors and set up a perimeter." },
  { id: 2, title: "Abandoned Factory", text: "Deep in the valley lies an Old-Era shipyard, still guarded by Aggeloi. Retake the forge and establish a forward base so the ark can be built." },
  { id: 3, title: "Purple Crystal Planet", text: "Beyond the valley, a world humming with Originium crystal. The same energy that shattered the Stargate still pulses here. Hold the line and learn what it wants." }
];
```

**Beacon progress (from the story's Shuttle Pad idea):** on the Levels page show a small "Bridge to Terra" strip with 3 beacon nodes. Each cleared level lights one node, with the text *"Relay Beacon established."* This teases the persistent progression idea (pads built earlier send support to later acts).

**Gameplay mechanics taken from the lore doc** (apply in `battle.js`):
- **Deployment Points (DP)** generate over time; retreating returns part of the cost. Vanguards can generate extra DP.
- **Classes:** Vanguard, Guard, Defender, Sniper, Caster, Medic, Specialist, Supporter. Build the four starters in Section 8 first, then add Defender and Caster if time allows.
- **Damage types:** *Physical* (reduced by enemy DEF) and *Arts* (reduced by enemy RES). Give enemies both `def` and `res`. Casters deal Arts damage; Guards, Snipers, and Vanguards deal Physical.
- **Block count:** melee operators block a limited number of ground enemies.
- **Anti-air:** some enemies fly; only ranged operators can hit them.
- **Stage hazards:** use the hazards in the level table (spore haze, conveyors, crystal surges).
- Later-chapter systems (Headhunting, promotions, modules, Integrated Strategies roguelike mode) are **out of scope** for this build.

---

## 3. Screen State Machine

```
STORY → CALL → TELEPORT → LEVELS → BATTLE(level) → LEVELS → ... → PROLOGUE_END → ENEMY_TEASER
```

Implement `showScreen(name)` which hides all `<section class="screen">` and shows one with a fade transition (300ms).

Global state:

```js
const state = {
  screen: "story",
  storyIndex: 0,
  callIndex: 0,
  levelsCleared: [false, false, false],
  unlocked: [true, false, false],
};
```

---

## 4. Screen 1 — Story Page

**Look:** full-screen dark space background (animated star field on canvas or CSS), a faint planet silhouette, centered text box with typewriter effect (30ms/char). Title at top: **Stars of Talos — The Aether Bridge**.

**Controls:**
- **NEXT ▶** button (also Space / Enter / click anywhere on the text box).
- Clicking NEXT while text is typing completes the line instantly.
- Small **SKIP** link top-right jumps to the call.

**Story lines** (put in `story.js`, one array item per click). These are drawn from the Prologue in the story asset; keep them faithful to `/assets/story/stars_of_talos_story.md` and add more lines if needed:

```js
export const storyLines = [
  { title: "Prologue: The Severed Sky", text: "Long ago, humanity's ancestors spanned the cosmos, linking distant worlds through massive orbital structures called Stargates." },
  { text: "Two worlds sat at the heart of the network: Terra, the ancient cradle of civilization, and Talos-II, a lush frontier moon circling a gas giant." },
  { text: "Then came the Great Fracture. A surge of unstable cosmic energy shattered the Stargate anchoring Talos-II to Terra." },
  { text: "Overnight, the pioneers of Talos-II were marooned. Centuries passed. Their descendants rebuilt from the ashes, forming new factions — Endfield Industries and the medical-tactical nomads of Rhodes Island." },
  { text: "For generations, Terra became a myth — a ghost signal lost in the static of deep space." },
  { text: "Until Endfield's deep-space arrays caught a faint, rhythmic distress beacon from Terra's coordinates." },
  { text: "Terra is dying, consumed by a crystalline blight known as the Originium Surge. Its last survivors are running out of time." },
  { text: "With the Stargate destroyed, instant travel is impossible. The only way home is to build a bridge — world by world, beacon by beacon." },
  { text: "And that bridge needs a leader. It needs you, Endmin." , last: true }
];
```

When `last: true` is finished, the **NEXT** button text changes to **ANSWER THE SIGNAL 📡** and goes to the Call screen.

---

## 5. Screen 2 — Incoming Call (Warfarin → Endmin)

**Look:** a communicator UI.
- Pulsing ring + "📞 INCOMING TRANSMISSION — WARFARIN" for 2 seconds with a ringing animation (optional beep via WebAudio).
- **ACCEPT** button starts the call.
- After accepting: chat-style dialogue panel with Warfarin's portrait placeholder (circle with initial "W") on the left, line-by-line, NEXT to advance. Subtle radio-static / scanline overlay.

**Dialogue** (`story.js`):

```js
export const callLines = [
  { who: "Warfarin", text: "Endmin! Can you hear me? The signal is weak — stay on the line." },
  { who: "Warfarin", text: "Rhodes Island and Endfield have found an old-era shipyard deep in the Jerna valley. It's our only chance to build the ark." },
  { who: "Warfarin", text: "But the way is blocked. Forests choking the paths, a dead factory full of Aggeloi, and a crystal world that's been humming strangely since the Fracture." },
  { who: "Warfarin", text: "We can't clear them without you. Every operator is pinned down. We need your command, Endmin." },
  { who: "Warfarin", text: "I've locked a teleport beacon onto your position. Press it, and I'll bring you straight to the front line." },
  { who: "Warfarin", text: "Hurry. Terra is waiting.", last: true }
];
```

After the last line, show a big glowing **⚡ TELEPORT** button (see Section 6).

---

## 6. Screen 3 — Teleport

- Big circular **TELEPORT** button with pulsing glow.
- On click: play a 1.5s effect — screen flashes white/cyan, stars stretch into warp lines (canvas or CSS), a "whoosh" sound (WebAudio, optional).
- Then `showScreen("levels")`.

---

## 7. Screen 4 — Levels Page

Title: **Prologue — Chapter 1: The Valley Calls**

Show **3 level cards** in a horizontal row (stacked on mobile). Each card has a gradient/illustration, level number, name, short description, difficulty stars, and status (Locked 🔒 / Available / Cleared ✔).

| # | Name | Theme / Colors | Description | Hazard |
|---|------|----------------|-------------|--------|
| 1 | **Dense Forest** | Deep greens, bioluminescent teal glow, mist | Overgrown Jerna valley. Glowing flora hides the paths. | Spore haze: ranged operators lose 10% ATK in fog tiles |
| 2 | **Abandoned Factory** | Rust orange, steel gray, sparks | A dead Old-Era assembly line, still guarded by Aggeloi. | Conveyor belts push enemies faster |
| 3 | **Purple Crystal Planet** | Violet, magenta, deep space black | A world of humming purple Originium crystals. | Crystal surges: every 20s, a random tile is disabled for 5s |

Rules:
- Level 1 unlocked at start; clearing N unlocks N+1.
- Clicking an available card opens a small briefing modal (name, enemy types, **START** button).
- After clearing **all 3**, show a glowing banner **"Complete Prologue ▶"** which goes to the Prologue End screen.

---

## 8. Battle Engine (`battle.js`)

Keep it a **lightweight tower-defense** on an HTML canvas (Arknights-style grid).

**Core rules:**
- Grid map (e.g., 9×5 tiles). Enemies spawn at an entry tile, follow a fixed path to the **Objective** (base), which has 3 HP.
- Tiles: `path` (melee operators), `high` (ranged operators), `blocked`.
- **Deployment Points (DP):** start 10, +1 per second (max 99). Operators cost DP.
- Player selects an operator card from the bottom bar, then clicks a valid tile to deploy. Click a deployed operator → **Retreat** (refunds 50% DP).
- Operators have `hp`, `atk`, `range`, `block`, `attackInterval`, `cost`, `class`.
- Enemies have `hp`, `speed`, `damage`, `def`, `res` (and optional `flying: true`), and are **blocked** by melee operators (up to `block` count).
- Win: survive all waves. Lose: Objective HP reaches 0.
- HUD: DP counter, Objective HP (♥), wave counter, pause button, speed toggle (1× / 2×).

**Starter operators** (stats are defaults; art comes from `/assets/operators/`):

```js
export const operators = [
  { id: "vanguard", name: "Vanguard", class: "Vanguard", cost: 6,  hp: 600, atk: 80,  range: 1, block: 1, interval: 1.0, tile: "path", note: "Cheap, fast to deploy" },
  { id: "guard",    name: "Guard",    class: "Guard",    cost: 12, hp: 900, atk: 150, range: 1, block: 2, interval: 1.2, tile: "path", note: "Strong melee" },
  { id: "sniper",   name: "Sniper",   class: "Sniper",   cost: 11, hp: 500, atk: 120, range: 3, block: 0, interval: 1.0, tile: "high", note: "Ranged damage" },
  { id: "medic",    name: "Medic",    class: "Medic",    cost: 10, hp: 450, atk: 90,  range: 2, block: 0, interval: 1.5, tile: "high", note: "Heals allies", heals: true }
];
```

**Per-level enemy waves** (`levels.js`). Enemy names are placeholders for the Act I creatures and Aggeloi described in the story asset; rename to match the lore if it gives better names:

```js
export const levels = [
  {
    id: 1, name: "Dense Forest",
    theme: { bg: "#06210f", accent: "#3ef0c0" },
    waves: [
      { enemy: "sporeling", count: 6,  gap: 2.0 },
      { enemy: "thornbeast", count: 3, gap: 3.5 },
      { enemy: "sporeling", count: 10, gap: 1.2 }
    ]
  },
  {
    id: 2, name: "Abandoned Factory",
    theme: { bg: "#241008", accent: "#ff8a3d" },
    waves: [
      { enemy: "aggeloi_drone", count: 8, gap: 1.8 },
      { enemy: "aggeloi_sentinel", count: 3, gap: 4 },
      { enemy: "aggeloi_drone", count: 12, gap: 1.0 }
    ]
  },
  {
    id: 3, name: "Purple Crystal Planet",
    theme: { bg: "#14052b", accent: "#c26bff" },
    waves: [
      { enemy: "crystal_crawler", count: 8, gap: 1.6 },
      { enemy: "aggeloi_sentinel", count: 4, gap: 3 },
      { enemy: "crystal_titan", count: 1, gap: 0 }   // mini-boss
    ]
  }
];
```

**Level end:** show Victory / Defeat modal. Victory → mark cleared, unlock next, return to Levels page. Defeat → Retry / Back.

If time is short, a simplified fallback is acceptable: each level is a short auto-resolving wave defense with player-triggered abilities — but the grid-based deployment is preferred.

---

## 9. Screen 5 — End of Prologue Chapter 1

Triggered after clearing level 3.

- Dark screen, slow fade-in text:
  > **PROLOGUE — CHAPTER 1 COMPLETE**
  > *The Valley Calls*
- Short closing narration (Warfarin on comm):
  - "You did it, Endmin. The path to the shipyard is open."
  - "But the crystals are still humming... something out there is waking up."
- Button: **WHAT'S COMING ▶** → Enemy Teaser.

---

## 10. Screen 6 — Enemy Teaser

Each teaser card links to a future Act from the story asset (Aggeloi Titan to Act I, Scourge and Vaelen to Act II, Aether Zealots to Act III, hybrids to Act IV). Use the lore text only; no spoilers beyond the one-line warnings below.

**Look:** dark, ominous. Horizontal scroll or grid of **silhouette cards** with red/violet glow. Heading: **"THEY ARE COMING…"** Each card shows a black silhouette (CSS/SVG), a name, and a one-line warning. Some cards are fully hidden as **"???"** for mystery. Hover/tap makes the silhouette flicker.

```js
export const teaserEnemies = [
  { name: "Aggeloi Titan", line: "A colossal construct that wakes when the forge ignites.", reveal: true },
  { name: "The Scourge", line: "A parasitic swarm that feeds on the heat of worlds.", reveal: true },
  { name: "Aether Zealots", line: "Sky-pirates who believe the storm is a cleansing.", reveal: true },
  { name: "Shattered Belt Hybrids", line: "Alien flesh fused with Stargate crystal.", reveal: true },
  { name: "???", line: "Something is answering Terra's signal.", reveal: false }
];
```

Bottom text: **"Chapter 1: Pyre-4 — Coming Soon"** with a **RESTART** button (resets state) and a **BACK TO LEVELS** button.

---

## 11. Visual and Audio Style

- These are defaults. The UI references in `/assets/reference/ui/` override them.
- Palette: near-black navy `#05070f`, cyan accent `#3ef0c0`, violet `#9b5cff`, warning orange `#ff8a3d`.
- Fonts: Google Fonts is fine (e.g., *Orbitron* for titles, *Rajdhani* for body), unless the UI references show a different style.
- UI feel: thin glowing borders, angular/cut-corner buttons (`clip-path`), subtle scanlines, HUD-like labels.
- Audio (optional): ambient loop + click SFX via WebAudio or `<audio>`; mute toggle top-right. Never autoplay before first click.

---

## 12. Acceptance Checklist

- [ ] Story page plays all lines with typewriter + NEXT.
- [ ] Call screen shows Warfarin → Endmin dialogue, then the TELEPORT button.
- [ ] TELEPORT plays an effect and opens the Levels page.
- [ ] 3 levels exist with correct names and themes; locking/unlocking works.
- [ ] Each level is playable and can be won or lost.
- [ ] Clearing all 3 shows the Prologue Chapter 1 end screen.
- [ ] Enemy teaser screen appears with silhouettes and a "Coming Soon" note.
- [ ] Operator art, UI, and level layouts match the provided assets and references.
- [ ] All story text, names, and enemies match the provided story and lore documents; glossary terms are consistent.
- [ ] Beacon progress strip lights up as levels are cleared.
- [ ] Works on desktop and mobile; no console errors.
- [ ] Progress saved and restorable; RESTART resets it.

---

## 13. Agent Working Instructions

1. Read everything in `/assets/` first: story and lore documents, operators, UI references, level references.
2. Build screens first (story → call → teleport → levels → end → teaser) using stub battles that instantly win, so the full flow works end to end.
3. Then implement the real battle engine in `battle.js` and plug it in.
4. Keep code small and commented; data (text, levels, enemies) lives in the data files, not in logic.
5. Do not add features beyond this spec. After finishing, list any assumptions made and any missing assets or references that were replaced with placeholders.

## 14. Future Chapters (do not build now)

Follow the story asset: Act II Pyre-4 (Vaelen vs the Scourge) → Act III Veridia (Aether-Born sky-cities) → Act IV The Shattered Belt → Finale Homecoming on Terra. Each planet's loop is: Explore and Survive → Diplomacy and Aid → Base Building (Shuttle Pad) → Launch. Each cleared planet adds a Shuttle Pad that sends passive resources and support abilities to later acts.
