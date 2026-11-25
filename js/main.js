// js/main.js — Master Screen Manager, Audio Synthesizer, and Game State
import { storyLines, callLines, epilogueLines } from "./story.js";
import { levels, briefings } from "./levels.js";
import { teaserEnemies, ENEMY_TYPES } from "./enemies.js";
import { BattleEngine } from "./battle.js";

class SoundSystem {
  constructor() {
    this.muted = false;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  play(type) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    switch (type) {
      case "click":
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;

      case "beep":
        osc.type = "sine";
        osc.frequency.setValueAtTime(950, t);
        osc.frequency.setValueAtTime(1200, t + 0.08);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;

      case "warp":
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(1800, t + 0.6);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.6);
        osc.start(t);
        osc.stop(t + 0.6);
        break;

      case "slash":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.start(t);
        osc.stop(t + 0.12);
        break;

      case "shoot":
        osc.type = "square";
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(250, t + 0.09);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        osc.start(t);
        osc.stop(t + 0.09);
        break;

      case "heal":
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, t);
        osc.frequency.exponentialRampToValueAtTime(1040, t + 0.25);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.start(t);
        osc.stop(t + 0.25);
        break;

      case "alert":
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(450, t);
        osc.frequency.setValueAtTime(320, t + 0.1);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.start(t);
        osc.stop(t + 0.25);
        break;

      case "victory":
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const vOsc = this.ctx.createOscillator();
          const vGain = this.ctx.createGain();
          vOsc.connect(vGain);
          vGain.connect(this.ctx.destination);
          vOsc.type = "sine";
          vOsc.frequency.setValueAtTime(freq, t + idx * 0.12);
          vGain.gain.setValueAtTime(0.18, t + idx * 0.12);
          vGain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.3);
          vOsc.start(t + idx * 0.12);
          vOsc.stop(t + idx * 0.12 + 0.3);
        });
        break;

      case "defeat":
        [320, 260, 200].forEach((freq, idx) => {
          const dOsc = this.ctx.createOscillator();
          const dGain = this.ctx.createGain();
          dOsc.connect(dGain);
          dGain.connect(this.ctx.destination);
          dOsc.type = "sawtooth";
          dOsc.frequency.setValueAtTime(freq, t + idx * 0.18);
          dGain.gain.setValueAtTime(0.18, t + idx * 0.18);
          dGain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.18 + 0.25);
          dOsc.start(t + idx * 0.18);
          dOsc.stop(t + idx * 0.18 + 0.25);
        });
        break;
    }
  }
}

class GameManager {
  constructor() {
    this.sound = new SoundSystem();
    this.state = {
      screen: "story",
      storyIndex: 0,
      callIndex: 0,
      epilogueIndex: 0,
      levelsCleared: [false, false, false],
      unlocked: [true, false, false],
      activeLevelId: 1
    };

    this.typewriterInterval = null;
    this.isTyping = false;
    this.currentTypedFullText = "";

    this.loadState();
    this.initBattleEngine();
    this.bindDomEvents();
    this.initStarfieldCanvas();
    this.renderLevelHub();
    this.renderTeaserCards();
    this.showScreen(this.state.screen || "story");
    this.updateBeaconIndicators();
  }

  loadState() {
    try {
      const saved = localStorage.getItem("stars_of_talos_save");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.levelsCleared) this.state.levelsCleared = parsed.levelsCleared;
        if (parsed.unlocked) this.state.unlocked = parsed.unlocked;
      }
    } catch (err) {
      console.warn("localStorage unavailable or corrupted:", err);
    }
  }

  saveState() {
    try {
      localStorage.setItem("stars_of_talos_save", JSON.stringify({
        levelsCleared: this.state.levelsCleared,
        unlocked: this.state.unlocked
      }));
    } catch (err) {
      console.warn("Could not save to localStorage:", err);
    }
  }

  resetProgress() {
    if (confirm("Reset all game progress back to the Prologue?")) {
      try {
        localStorage.removeItem("stars_of_talos_save");
      } catch (e) {}
      this.state.levelsCleared = [false, false, false];
      this.state.unlocked = [true, false, false];
      this.state.storyIndex = 0;
      this.state.callIndex = 0;
      this.state.epilogueIndex = 0;
      this.updateBeaconIndicators();
      this.renderLevelHub();
      this.showScreen("story");
      this.sound.play("click");
    }
  }

  initBattleEngine() {
    this.battleEngine = new BattleEngine({
      onWin: (res) => this.handleBattleWin(res),
      onLose: (res) => this.handleBattleLose(res),
      onSfx: (type) => this.sound.play(type)
    });
  }

  showScreen(screenName) {
    this.state.screen = screenName;
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(`screen-${screenName}`);
    if (target) {
      target.classList.add("active");
    }

    if (screenName === "story") {
      this.setupStoryScreen();
    } else if (screenName === "call") {
      this.setupCallScreen();
    } else if (screenName === "teleport") {
      this.setupTeleportScreen();
    } else if (screenName === "levels") {
      this.renderLevelHub();
      this.updateBeaconIndicators();
    } else if (screenName === "epilogue") {
      this.setupEpilogueScreen();
    }
  }

  bindDomEvents() {
    // Sound toggle
    const btnAudio = document.getElementById("btn-audio-toggle");
    const audioIcon = document.getElementById("audio-icon");
    btnAudio.addEventListener("click", () => {
      this.sound.muted = !this.sound.muted;
      audioIcon.textContent = this.sound.muted ? "🔇" : "🔊";
      if (!this.sound.muted) this.sound.play("click");
    });

    // Reset button
    document.getElementById("btn-reset-game").addEventListener("click", () => {
      this.resetProgress();
    });

    // Story controls
    const btnStoryNext = document.getElementById("btn-story-next");
    const btnStorySkip = document.getElementById("btn-story-skip");
    const storyBox = document.querySelector(".story-dialogue-box");

    btnStoryNext.addEventListener("click", (e) => {
      e.stopPropagation();
      this.advanceStory();
    });
    storyBox.addEventListener("click", () => this.advanceStory());
    btnStorySkip.addEventListener("click", (e) => {
      e.stopPropagation();
      this.sound.play("click");
      this.showScreen("call");
    });

    // Keyboard support (Space / Enter)
    window.addEventListener("keydown", (e) => {
      if (this.state.screen === "story" && (e.code === "Space" || e.code === "Enter")) {
        e.preventDefault();
        this.advanceStory();
      }
    });

    // Call controls
    document.getElementById("btn-accept-call").addEventListener("click", () => {
      this.acceptCall();
    });
    document.getElementById("btn-call-next").addEventListener("click", () => {
      this.advanceCall();
    });
    document.getElementById("btn-call-teleport").addEventListener("click", () => {
      this.sound.play("warp");
      this.showScreen("teleport");
    });

    // Teleport controls
    document.getElementById("btn-warp-engage").addEventListener("click", () => {
      this.triggerTeleportWarp();
    });

    // Briefing modal
    document.getElementById("btn-briefing-close").addEventListener("click", () => {
      this.hideModal("modal-briefing");
    });
    document.getElementById("btn-briefing-cancel").addEventListener("click", () => {
      this.hideModal("modal-briefing");
    });
    document.getElementById("btn-briefing-start").addEventListener("click", () => {
      this.hideModal("modal-briefing");
      this.launchMission(this.state.activeLevelId);
    });

    // Battle result modal buttons
    document.getElementById("btn-result-hub").addEventListener("click", () => {
      this.hideModal("modal-battle-result");
      this.showScreen("levels");
    });
    document.getElementById("btn-result-retry").addEventListener("click", () => {
      this.hideModal("modal-battle-result");
      this.launchMission(this.state.activeLevelId);
    });

    // Epilogue controls
    document.getElementById("btn-to-epilogue").addEventListener("click", () => {
      this.showScreen("epilogue");
    });
    document.getElementById("btn-epilogue-next").addEventListener("click", () => {
      this.advanceEpilogue();
    });
    document.getElementById("btn-to-teaser").addEventListener("click", () => {
      this.showScreen("teaser");
    });

    // Teaser buttons
    document.getElementById("btn-teaser-back-levels").addEventListener("click", () => {
      this.showScreen("levels");
    });
    document.getElementById("btn-teaser-restart").addEventListener("click", () => {
      this.resetProgress();
    });
  }

  // -----------------------------------------------------------
  // SCREEN 1: STORY PROLOGUE
  // -----------------------------------------------------------
  setupStoryScreen() {
    this.state.storyIndex = 0;
    this.renderStoryStep();
  }

  renderStoryStep() {
    const item = storyLines[this.state.storyIndex];
    if (!item) return;

    document.getElementById("story-title").textContent = item.title || "Prologue: The Severed Sky";
    document.getElementById("story-art-img").src = item.image;
    document.getElementById("story-art-caption").textContent = item.caption || "PLANETARY TELEMETRY";

    const btnNext = document.getElementById("btn-story-next");
    if (item.last) {
      btnNext.innerHTML = "ANSWER THE SIGNAL 📡";
      btnNext.classList.add("btn-primary");
    } else {
      btnNext.innerHTML = "NEXT ▶";
    }

    this.typewriteText("story-text", item.text);
  }

  advanceStory() {
    if (this.isTyping) {
      this.finishTypingEarly("story-text");
      return;
    }

    this.sound.play("click");
    const currentItem = storyLines[this.state.storyIndex];
    if (currentItem.last) {
      this.showScreen("call");
      return;
    }

    this.state.storyIndex++;
    if (this.state.storyIndex < storyLines.length) {
      this.renderStoryStep();
    }
  }

  typewriteText(elementId, fullText, callback = null) {
    clearInterval(this.typewriterInterval);
    const el = document.getElementById(elementId);
    if (!el) return;

    this.isTyping = true;
    this.currentTypedFullText = fullText;
    el.textContent = "";

    let charIdx = 0;
    this.typewriterInterval = setInterval(() => {
      el.textContent += fullText[charIdx];
      charIdx++;
      if (charIdx >= fullText.length) {
        clearInterval(this.typewriterInterval);
        this.isTyping = false;
        callback && callback();
      }
    }, 28);
  }

  finishTypingEarly(elementId) {
    clearInterval(this.typewriterInterval);
    this.isTyping = false;
    const el = document.getElementById(elementId);
    if (el) el.textContent = this.currentTypedFullText;
  }

  // -----------------------------------------------------------
  // SCREEN 2: INCOMING TRANSMISSION (WARFARIN)
  // -----------------------------------------------------------
  setupCallScreen() {
    document.getElementById("call-incoming-alert").classList.remove("hidden");
    document.getElementById("call-dialogue-panel").classList.add("hidden");
    this.state.callIndex = 0;
    this.sound.play("beep");
  }

  acceptCall() {
    this.sound.play("beep");
    document.getElementById("call-incoming-alert").classList.add("hidden");
    document.getElementById("call-dialogue-panel").classList.remove("hidden");
    this.renderCallStep();
  }

  renderCallStep() {
    const item = callLines[this.state.callIndex];
    if (!item) return;

    const btnNext = document.getElementById("btn-call-next");
    const btnTeleport = document.getElementById("btn-call-teleport");

    if (item.last) {
      btnNext.classList.add("hidden");
      btnTeleport.classList.remove("hidden");
    } else {
      btnNext.classList.remove("hidden");
      btnTeleport.classList.add("hidden");
    }

    this.typewriteText("call-text", item.text);
  }

  advanceCall() {
    if (this.isTyping) {
      this.finishTypingEarly("call-text");
      return;
    }

    this.sound.play("click");
    this.state.callIndex++;
    if (this.state.callIndex < callLines.length) {
      this.renderCallStep();
    }
  }

  // -----------------------------------------------------------
  // SCREEN 3: TELEPORT TRANSITION
  // -----------------------------------------------------------
  setupTeleportScreen() {
    this.initWarpCanvas();
  }

  triggerTeleportWarp() {
    this.sound.play("warp");
    const warpCanvas = document.getElementById("canvas-warp");
    if (warpCanvas) {
      warpCanvas.style.filter = "brightness(2) contrast(1.5)";
    }

    setTimeout(() => {
      this.showScreen("levels");
      if (warpCanvas) warpCanvas.style.filter = "none";
    }, 1500);
  }

  // -----------------------------------------------------------
  // SCREEN 4: LEVEL MAP HUB
  // -----------------------------------------------------------
  renderLevelHub() {
    for (let i = 1; i <= 3; i++) {
      const card = document.getElementById(`card-level-${i}`);
      const badge = document.getElementById(`badge-lvl-${i}`);
      const btn = card.querySelector(".btn-card-action");
      if (!card) continue;

      const isCleared = this.state.levelsCleared[i - 1];
      const isUnlocked = this.state.unlocked[i - 1];

      card.classList.toggle("cleared", isCleared);
      card.classList.toggle("locked", !isUnlocked);

      if (isCleared) {
        badge.textContent = "CLEARED ✔";
        badge.style.color = "#3ef0c0";
        badge.style.borderColor = "#3ef0c0";
        btn.disabled = false;
        btn.textContent = "REPLAY ▶";
      } else if (isUnlocked) {
        badge.textContent = "AVAILABLE";
        badge.style.color = "#ff8a3d";
        badge.style.borderColor = "#ff8a3d";
        btn.disabled = false;
        btn.textContent = "BRIEFING ▶";
      } else {
        badge.textContent = "LOCKED 🔒";
        badge.style.color = "#8e9bb5";
        badge.style.borderColor = "rgba(255,255,255,0.1)";
        btn.disabled = true;
        btn.textContent = "LOCKED";
      }

      // Re-attach card click
      btn.onclick = (e) => {
        e.stopPropagation();
        this.openBriefingModal(i);
      };
      card.onclick = () => {
        if (isUnlocked) this.openBriefingModal(i);
      };
    }

    // Check if all 3 cleared for prologue banner
    const allCleared = this.state.levelsCleared.every(v => v === true);
    const banner = document.getElementById("banner-prologue-complete");
    if (banner) {
      banner.classList.toggle("hidden", !allCleared);
    }
  }

  updateBeaconIndicators() {
    let clearedCount = 0;
    for (let i = 1; i <= 3; i++) {
      const node = document.getElementById(`beacon-${i}`);
      const line = document.getElementById(`bline-${i}`);
      const isCleared = this.state.levelsCleared[i - 1];
      if (isCleared) clearedCount++;

      if (node) node.classList.toggle("active", isCleared);
      if (line) line.classList.toggle("active", isCleared);
    }

    const statusText = document.getElementById("beacon-status-text");
    if (statusText) {
      if (clearedCount === 0) {
        statusText.textContent = "OFFLINE";
        statusText.classList.remove("synced");
      } else if (clearedCount < 3) {
        statusText.textContent = `SYNCED ${clearedCount}/3`;
        statusText.classList.add("synced");
      } else {
        statusText.textContent = "ONLINE (ALL SYNCED)";
        statusText.classList.add("synced");
      }
    }
  }

  openBriefingModal(levelId) {
    this.sound.play("click");
    this.state.activeLevelId = levelId;
    const briefing = briefings.find(b => b.id === levelId);
    if (!briefing) return;

    document.getElementById("briefing-code").textContent = briefing.code;
    document.getElementById("briefing-title").textContent = briefing.title;
    document.getElementById("briefing-text").textContent = briefing.text;
    document.getElementById("briefing-hazard").textContent = briefing.hazard;

    // Detected enemy chips
    const enemiesRow = document.getElementById("briefing-enemies-list");
    enemiesRow.innerHTML = "";
    briefing.enemies.forEach(eKey => {
      const eProto = ENEMY_TYPES[eKey];
      if (eProto) {
        const chip = document.createElement("div");
        chip.className = "enemy-chip";
        chip.innerHTML = `
          <img src="${eProto.sprite}" alt="${eProto.name}">
          <span>${eProto.name}</span>
        `;
        enemiesRow.appendChild(chip);
      }
    });

    document.getElementById("modal-briefing").classList.remove("hidden");
  }

  launchMission(levelId) {
    const levelConfig = levels.find(l => l.id === levelId);
    if (!levelConfig) return;

    this.showScreen("battle");
    this.battleEngine.startBattle(levelConfig);
  }

  handleBattleWin(result) {
    const idx = result.levelId - 1;
    this.state.levelsCleared[idx] = true;
    if (idx + 1 < this.state.unlocked.length) {
      this.state.unlocked[idx + 1] = true;
    }
    this.saveState();
    this.updateBeaconIndicators();

    // Show victory modal
    const banner = document.getElementById("result-status-banner");
    banner.className = "result-banner victory";
    document.getElementById("result-title").textContent = "OPERATION COMPLETED";
    document.getElementById("result-subtitle").textContent = "MISSION ACCOMPLISHED // PERIMETER SECURED";
    document.getElementById("res-kills").textContent = `${result.kills} / ${result.total}`;
    document.getElementById("res-hp").textContent = `${result.hpRemaining} / 3`;
    document.getElementById("res-beacon").textContent = `RELAY BEACON ${result.levelId} SYNCHRONIZED`;
    document.getElementById("result-summary-text").textContent = 
      "Tactical parameters achieved. Planetary relay beacon established and transmitting coordinates to the Aether Bridge.";

    document.getElementById("btn-result-retry").classList.add("hidden");
    document.getElementById("modal-battle-result").classList.remove("hidden");
  }

  handleBattleLose(result) {
    const banner = document.getElementById("result-status-banner");
    banner.className = "result-banner defeat";
    document.getElementById("result-title").textContent = "OPERATION FAILED";
    document.getElementById("result-subtitle").textContent = "TACTICAL WITHDRAWAL REQUIRED";
    document.getElementById("res-kills").textContent = `${result.kills} / ${result.total}`;
    document.getElementById("res-hp").textContent = "0 / 3";
    document.getElementById("res-beacon").textContent = "DISCONNECTED";
    document.getElementById("result-summary-text").textContent = 
      "Hostile forces breached the perimeter defense. Regroup operators and adapt tactical placement.";

    document.getElementById("btn-result-retry").classList.remove("hidden");
    document.getElementById("modal-battle-result").classList.remove("hidden");
  }

  hideModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add("hidden");
  }

  // -----------------------------------------------------------
  // SCREEN 6: PROLOGUE COMPLETE EPILOGUE
  // -----------------------------------------------------------
  setupEpilogueScreen() {
    this.state.epilogueIndex = 0;
    this.renderEpilogueStep();
  }

  renderEpilogueStep() {
    const item = epilogueLines[this.state.epilogueIndex];
    if (!item) return;

    const btnNext = document.getElementById("btn-epilogue-next");
    const btnToTeaser = document.getElementById("btn-to-teaser");

    if (item.last) {
      btnNext.classList.add("hidden");
      btnToTeaser.classList.remove("hidden");
    } else {
      btnNext.classList.remove("hidden");
      btnToTeaser.classList.add("hidden");
    }

    this.typewriteText("epilogue-text", item.text);
  }

  advanceEpilogue() {
    if (this.isTyping) {
      this.finishTypingEarly("epilogue-text");
      return;
    }
    this.sound.play("click");
    this.state.epilogueIndex++;
    if (this.state.epilogueIndex < epilogueLines.length) {
      this.renderEpilogueStep();
    }
  }

  // -----------------------------------------------------------
  // SCREEN 7: ENEMY TEASER ("THEY ARE COMING...")
  // -----------------------------------------------------------
  renderTeaserCards() {
    const container = document.getElementById("teaser-cards-container");
    if (!container) return;
    container.innerHTML = "";

    teaserEnemies.forEach(item => {
      const card = document.createElement("div");
      card.className = "teaser-card";
      card.innerHTML = `
        <div class="teaser-silhouette-box">
          <img class="teaser-img" src="${item.sprite}" alt="${item.name}">
        </div>
        <div class="teaser-threat">${item.threat}</div>
        <h3 class="teaser-name">${item.name}</h3>
        <div class="teaser-act">${item.act}</div>
        <p class="teaser-line">${item.line}</p>
      `;
      card.addEventListener("mouseenter", () => {
        this.sound.play("click");
      });
      container.appendChild(card);
    });
  }

  // -----------------------------------------------------------
  // CANVAS BACKGROUNDS: STARFIELD & WARP
  // -----------------------------------------------------------
  initStarfieldCanvas() {
    const canvas = document.getElementById("canvas-stars");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let stars = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: 120 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random(),
        speed: Math.random() * 0.02 + 0.005
      }));
    };
    window.addEventListener("resize", resize);
    resize();

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.alpha += s.speed;
        const opacity = (Math.sin(s.alpha) + 1) / 2;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(loop);
    };
    loop();
  }

  initWarpCanvas() {
    const canvas = document.getElementById("canvas-warp");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const numStars = 200;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const warpStars = Array.from({ length: numStars }, () => ({
      x: (Math.random() - 0.5) * canvas.width * 2,
      y: (Math.random() - 0.5) * canvas.height * 2,
      z: Math.random() * canvas.width
    }));

    const renderWarp = () => {
      if (this.state.screen !== "teleport") return;
      ctx.fillStyle = "rgba(4, 7, 14, 0.35)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      warpStars.forEach(s => {
        s.z -= 18; // Warp forward velocity
        if (s.z <= 0) s.z = canvas.width;

        const k = 180 / s.z;
        const px = s.x * k + cx;
        const py = s.y * k + cy;

        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          const size = (1 - s.z / canvas.width) * 3;
          ctx.fillStyle = "#3ef0c0";
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.8, size), 0, Math.PI * 2);
          ctx.fill();
        }
      });
      requestAnimationFrame(renderWarp);
    };
    renderWarp();
  }
}

// Boot application when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  window.game = new GameManager();
});
