// js/story.js — Story prologue and communicator dialogue data
import { ASSETS } from "./assets.js";

export const storyLines = [
  {
    title: "Prologue: The Severed Sky",
    text: "Long ago, humanity's ancestors spanned the cosmos, linking distant worlds through massive orbital structures called Stargates.",
    image: ASSETS.story.terraSpaceship,
    caption: "OLD-ERA ORBITAL STARGATE NETWORK"
  },
  {
    title: "Prologue: The Severed Sky",
    text: "Two worlds sat at the heart of the network: Terra, the ancient cradle of civilization, and Talos-II, a lush frontier moon circling a gas giant.",
    image: ASSETS.story.terra,
    caption: "TERRA — CRADLE OF HUMANITY"
  },
  {
    title: "The Great Fracture",
    text: "Then came the Great Fracture. A surge of unstable cosmic energy shattered the Stargate anchoring Talos-II to Terra.",
    image: ASSETS.story.terraSpaceship,
    caption: "CATACLYSMIC RUPTURE AT THE GATE"
  },
  {
    title: "The Long Isolation",
    text: "Overnight, the pioneers of Talos-II were marooned. Centuries passed. Their descendants rebuilt from the ashes, forming new factions — Endfield Industries and the medical-tactical nomads of Rhodes Island.",
    image: ASSETS.story.taloSpaceship,
    caption: "VANGUARD-01 RECONSTRUCTION PROJECT"
  },
  {
    title: "The Ghost Signal",
    text: "For generations, Terra became a myth — a ghost signal lost in the static of deep space.",
    image: ASSETS.story.taloSpaceship,
    caption: "DEEP SPACE MONITORING ARRAY"
  },
  {
    title: "Transmission Received",
    text: "Until Endfield's deep-space arrays caught a faint, rhythmic distress beacon from Terra's coordinates.",
    image: ASSETS.story.terra,
    caption: "DISTRESS BEACON DETECTED"
  },
  {
    title: "The Blight of Terra",
    text: "Terra is dying, consumed by a crystalline blight known as the Originium Surge. Its last survivors are running out of time.",
    image: ASSETS.story.purplePlanet,
    caption: "THE SPREAD OF ORIGINIUM"
  },
  {
    title: "The Aether Bridge",
    text: "With the Stargate destroyed, instant travel is impossible. The only way home is to build a bridge — world by world, beacon by beacon.",
    image: ASSETS.story.taloSpaceship,
    caption: "THE EXPEDITION COMMENCES"
  },
  {
    title: "Command Awaits",
    text: "And that bridge needs a leader. It needs you, Endmin.",
    image: ASSETS.story.terra,
    caption: "SYNCHRONIZING CONSCIOUSNESS...",
    last: true
  }
];

export const callLines = [
  { who: "Warfarin", text: "Endmin! Can you hear me? The signal is weak — stay on the line." },
  { who: "Warfarin", text: "Rhodes Island and Endfield have found an old-era shipyard deep in the Jerna valley. It's our only chance to build the ark." },
  { who: "Warfarin", text: "But the way is blocked. Forests choking the paths, a dead factory full of Aggeloi, and a crystal world that's been humming strangely since the Fracture." },
  { who: "Warfarin", text: "We can't clear them without you. Every operator is pinned down. We need your command, Endmin." },
  { who: "Warfarin", text: "I've locked a teleport beacon onto your position. Press it, and I'll bring you straight to the front line." },
  { who: "Warfarin", text: "Hurry. Terra is waiting.", last: true }
];

export const epilogueLines = [
  { who: "Warfarin", text: "You did it, Endmin! The forward perimeter is secure, and the shipyard forge is firing up." },
  { who: "Warfarin", text: "Relay Beacons 1, 2, and 3 are synced. The first span of the Aether Bridge to Terra is open." },
  { who: "Warfarin", text: "But... the Originium crystals are still resonating across the void. Deep-space telemetry is detecting something monumental stirring." },
  { who: "Warfarin", text: "Prepare yourself, Doctor. The real trial begins on the next world.", last: true }
];
