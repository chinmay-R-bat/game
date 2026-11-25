// js/battle.js — Canvas Tower-Defense Battle Engine
import { operators, levels } from "./levels.js";
import { ENEMY_TYPES } from "./enemies.js";
import { ASSETS } from "./assets.js";

export class BattleEngine {
  constructor(callbacks = {}) {
    this.callbacks = callbacks; // onWin, onLose, onSfx, onRetreat
    this.canvas = document.getElementById("canvas-battle");
    this.ctx = this.canvas.getContext("2d");
    this.wrapper = document.getElementById("battle-canvas-wrapper");

    // HUD elements
    this.hpEl = document.getElementById("battle-hp-val");
    this.enemyEl = document.getElementById("battle-enemy-val");
    this.dpEl = document.getElementById("battle-dp-val");
    this.dpProgressEl = document.getElementById("battle-dp-progress");
    this.deployCountEl = document.getElementById("battle-deploy-count");
    this.stageCodeEl = document.getElementById("battle-stage-code");
    this.stageTitleEl = document.getElementById("battle-stage-title");
    this.hazardBadgeEl = document.getElementById("battle-hazard-badge");
    this.cardsContainer = document.getElementById("operator-cards-container");
    this.inspectPanel = document.getElementById("operator-inspect-panel");
    this.inspectName = document.getElementById("inspect-name");
    this.inspectClass = document.getElementById("inspect-class");
    this.inspectHp = document.getElementById("inspect-hp");
    this.inspectAtk = document.getElementById("inspect-atk");
    this.inspectBlock = document.getElementById("inspect-block");
    this.btnInspectRetreat = document.getElementById("btn-inspect-retreat");
    this.dirOverlay = document.getElementById("direction-select-overlay");

    // Game state
    this.active = false;
    this.paused = false;
    this.speed = 1.0;
    this.currentLevel = null;
    this.baseHp = 3;
    this.maxBaseHp = 3;
    this.dp = 10;
    this.maxDp = 99;
    this.dpAccumulator = 0;
    this.deployedUnits = [];
    this.activeEnemies = [];
    this.enemyQueue = [];
    this.totalEnemies = 0;
    this.defeatedEnemies = 0;
    this.spawnTimer = 0;
    this.floatingTexts = [];
    this.visualEffects = [];
    this.hazardTimer = 0;
    this.surgeDisabledTile = null;

    // Selection & deployment interaction
    this.selectedOp = null;
    this.pendingTile = null;
    this.inspectedOp = null;

    // Grid rendering dimensions
    this.cols = 9;
    this.rows = 5;
    this.tileWidth = 80;
    this.tileHeight = 72;
    this.gridOffsetX = 0;
    this.gridOffsetY = 0;

    // Preloaded image caches
    this.imageCache = {};
    this.preloadAssets();

    this.bindEvents();
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  preloadAssets() {
    const list = [
      ASSETS.operators.vanguard,
      ASSETS.operators.guard,
      ASSETS.operators.sniper,
      ASSETS.operators.medic,
      ASSETS.enemies.slug,
      ASSETS.enemies.warrior,
      ASSETS.enemies.winged,
      ASSETS.enemies.guitarist,
      ASSETS.enemies.caster,
      ASSETS.enemies.sniper,
      ASSETS.levels.factoryBg,
      ASSETS.levels.crystalBg
    ];
    list.forEach(src => {
      if (src && !this.imageCache[src]) {
        const img = new Image();
        img.src = src;
        this.imageCache[src] = img;
      }
    });
  }

  resizeCanvas() {
    if (!this.wrapper) return;
    const rect = this.wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.ctx.scale(dpr, dpr);

    // Compute tile dimensions centered on screen
    const maxGridW = rect.width * 0.94;
    const maxGridH = rect.height * 0.90;
    this.tileWidth = Math.floor(Math.min(maxGridW / this.cols, 110));
    this.tileHeight = Math.floor(Math.min(maxGridH / this.rows, 95));
    this.gridOffsetX = Math.floor((rect.width - this.tileWidth * this.cols) / 2);
    this.gridOffsetY = Math.floor((rect.height - this.tileHeight * this.rows) / 2);
  }

  bindEvents() {
    this.canvas.addEventListener("click", (e) => this.handleCanvasClick(e));

    // Directional buttons in the Rhombus Overlay
    const dirButtons = this.dirOverlay.querySelectorAll(".dir-btn[data-dir]");
    dirButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const dir = btn.getAttribute("data-dir");
        this.confirmDeployment(dir);
      });
    });

    document.getElementById("btn-dir-cancel").addEventListener("click", () => {
      this.cancelDeployment();
    });

    if (this.btnInspectRetreat) {
      this.btnInspectRetreat.addEventListener("click", () => {
        if (this.inspectedOp) {
          this.retreatOperator(this.inspectedOp);
        }
      });
    }

    const btnSpeed = document.getElementById("btn-battle-speed");
    if (btnSpeed) {
      btnSpeed.addEventListener("click", () => {
        this.speed = (this.speed === 1.0) ? 2.0 : 1.0;
        btnSpeed.textContent = `${this.speed}X`;
        btnSpeed.classList.toggle("btn-primary", this.speed > 1.0);
        this.callbacks.onSfx && this.callbacks.onSfx("click");
      });
    }

    const btnPause = document.getElementById("btn-battle-pause");
    if (btnPause) {
      btnPause.addEventListener("click", () => {
        this.paused = !this.paused;
        btnPause.textContent = this.paused ? "▶" : "⏸";
        this.callbacks.onSfx && this.callbacks.onSfx("click");
      });
    }

    const btnAbandon = document.getElementById("btn-battle-abandon");
    if (btnAbandon) {
      btnAbandon.addEventListener("click", () => {
        if (confirm("Abandon current tactical operation? Life points will be lost.")) {
          this.endBattle(false);
        }
      });
    }
  }

  startBattle(levelConfig) {
    this.currentLevel = levelConfig;
    this.active = true;
    this.paused = false;
    this.speed = 1.0;
    this.baseHp = 3;
    this.maxBaseHp = 3;
    this.dp = 10;
    this.dpAccumulator = 0;
    this.deployedUnits = [];
    this.activeEnemies = [];
    this.floatingTexts = [];
    this.visualEffects = [];
    this.selectedOp = null;
    this.pendingTile = null;
    this.inspectedOp = null;
    this.hazardTimer = 0;
    this.surgeDisabledTile = null;
    this.defeatedEnemies = 0;

    this.cols = levelConfig.cols || 9;
    this.rows = levelConfig.rows || 5;

    // Build enemy queue from wave definitions
    this.enemyQueue = [];
    let cumulativeTime = 2.0; // initial prep time
    levelConfig.waves.forEach((wave, wIdx) => {
      const type = ENEMY_TYPES[wave.enemy];
      for (let i = 0; i < wave.count; i++) {
        this.enemyQueue.push({
          typeId: wave.enemy,
          proto: type,
          spawnTime: cumulativeTime,
          waveNumber: wIdx + 1
        });
        cumulativeTime += wave.gap;
      }
      cumulativeTime += 3.5; // inter-wave interval
    });

    this.totalEnemies = this.enemyQueue.length;
    this.spawnTimer = 0;

    // Update HUD
    this.stageCodeEl.textContent = levelConfig.code || "OP-01";
    this.stageTitleEl.textContent = levelConfig.name;
    this.hazardBadgeEl.textContent = levelConfig.hazardDesc || "STANDARD HAZARD";
    this.hazardBadgeEl.style.display = levelConfig.hazardDesc ? "inline-block" : "none";
    this.updateHud();

    // Render operator deployment cards
    this.renderOperatorDeck();
    this.hideInspectPanel();
    this.hideDirectionOverlay();
    this.resizeCanvas();

    this.lastTimestamp = performance.now();
    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  renderOperatorDeck() {
    this.cardsContainer.innerHTML = "";
    operators.forEach(op => {
      const card = document.createElement("div");
      card.className = "op-card";
      card.id = `deck-op-${op.id}`;
      card.innerHTML = `
        <img class="op-card-thumb" src="${op.sprite}" alt="${op.name}">
        <span class="op-cost-badge">${op.cost}</span>
        <span class="op-name-tag">${op.name}</span>
      `;
      card.addEventListener("click", () => this.selectOperatorForDeploy(op));
      this.cardsContainer.appendChild(card);
    });
    this.updateCardAvailability();
  }

  selectOperatorForDeploy(op) {
    if (this.dp < op.cost) {
      this.callbacks.onSfx && this.callbacks.onSfx("alert");
      return;
    }
    const alreadyDeployed = this.deployedUnits.some(u => u.op.id === op.id);
    if (alreadyDeployed) {
      this.callbacks.onSfx && this.callbacks.onSfx("alert");
      return;
    }

    if (this.selectedOp && this.selectedOp.id === op.id) {
      this.selectedOp = null;
    } else {
      this.selectedOp = op;
      this.hideInspectPanel();
      this.callbacks.onSfx && this.callbacks.onSfx("click");
    }
    this.updateCardAvailability();
  }

  updateCardAvailability() {
    operators.forEach(op => {
      const card = document.getElementById(`deck-op-${op.id}`);
      if (!card) return;
      const isDeployed = this.deployedUnits.some(u => u.op.id === op.id);
      const canAfford = this.dp >= op.cost;
      const isSelected = this.selectedOp && this.selectedOp.id === op.id;

      card.classList.toggle("deployed", isDeployed);
      card.classList.toggle("cannot-afford", !canAfford && !isDeployed);
      card.classList.toggle("selected", isSelected);
    });
  }

  handleCanvasClick(e) {
    if (!this.active || this.paused) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked inside grid
    const col = Math.floor((x - this.gridOffsetX) / this.tileWidth);
    const row = Math.floor((y - this.gridOffsetY) / this.tileHeight);

    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      this.hideInspectPanel();
      return;
    }

    // Check if clicked an existing deployed unit
    const unitOnTile = this.deployedUnits.find(u => u.col === col && u.row === row);
    if (unitOnTile) {
      this.inspectOperator(unitOnTile);
      this.selectedOp = null;
      this.updateCardAvailability();
      return;
    }

    // If an operator is selected, check if valid placement tile
    if (this.selectedOp) {
      const tileIndex = row * this.cols + col;
      const tileType = this.currentLevel.map[tileIndex];

      // Check tile suitability
      const isMelee = (this.selectedOp.tile === "path");
      const isValidTile = isMelee ? (tileType === "P") : (tileType === "H");

      // Check if tile is currently disabled by hazard surge
      const isSurged = (this.surgeDisabledTile && this.surgeDisabledTile.col === col && this.surgeDisabledTile.row === row);

      if (isValidTile && !isSurged) {
        this.pendingTile = { col, row };
        this.showDirectionOverlay(col, row);
        this.callbacks.onSfx && this.callbacks.onSfx("click");
      } else {
        this.callbacks.onSfx && this.callbacks.onSfx("alert");
      }
    } else {
      this.hideInspectPanel();
    }
  }

  showDirectionOverlay(col, row) {
    this.dirOverlay.classList.remove("hidden");
  }

  hideDirectionOverlay() {
    this.dirOverlay.classList.add("hidden");
    this.pendingTile = null;
  }

  confirmDeployment(direction) {
    if (!this.selectedOp || !this.pendingTile) {
      this.hideDirectionOverlay();
      return;
    }

    const { col, row } = this.pendingTile;
    const op = this.selectedOp;

    // Deduct DP
    this.dp -= op.cost;

    // Calculate effective stats (apply hazards like Spore Haze)
    let effectiveAtk = op.atk;
    if (this.currentLevel.hazardType === "spore_haze" && op.tile === "high") {
      effectiveAtk = Math.floor(op.atk * 0.90); // 10% ATK loss in fog
    }

    const unit = {
      id: `${op.id}_${Date.now()}`,
      op: op,
      col: col,
      row: row,
      direction: direction, // "up", "down", "left", "right"
      hp: op.hp,
      maxHp: op.maxHp,
      atk: effectiveAtk,
      range: op.range,
      block: op.block,
      interval: op.interval,
      attackCooldown: 0,
      blockedEnemies: [],
      heals: !!op.heals,
      antiAir: !!op.antiAir,
      dpPerAtk: op.dpPerAtk || 0,
      animTime: 0
    };

    this.deployedUnits.push(unit);
    this.addVisualEffect({
      type: "deploy_spark",
      x: this.gridOffsetX + col * this.tileWidth + this.tileWidth / 2,
      y: this.gridOffsetY + row * this.tileHeight + this.tileHeight / 2,
      life: 0.4
    });

    this.callbacks.onSfx && this.callbacks.onSfx("warp");
    this.selectedOp = null;
    this.hideDirectionOverlay();
    this.updateCardAvailability();
    this.updateHud();
  }

  cancelDeployment() {
    this.hideDirectionOverlay();
    this.selectedOp = null;
    this.updateCardAvailability();
  }

  inspectOperator(unit) {
    this.inspectedOp = unit;
    this.inspectName.textContent = unit.op.name;
    this.inspectClass.textContent = unit.op.class.toUpperCase();
    this.inspectHp.textContent = `${Math.max(0, Math.floor(unit.hp))} / ${unit.maxHp}`;
    this.inspectAtk.textContent = unit.atk;
    this.inspectBlock.textContent = unit.block;
    this.inspectPanel.classList.remove("hidden");
    this.callbacks.onSfx && this.callbacks.onSfx("click");
  }

  hideInspectPanel() {
    this.inspectedOp = null;
    this.inspectPanel.classList.add("hidden");
  }

  retreatOperator(unit) {
    const refund = Math.floor(unit.op.cost * 0.5);
    this.dp = Math.min(this.maxDp, this.dp + refund);
    
    // Release blocked enemies
    unit.blockedEnemies.forEach(e => {
      e.blockedBy = null;
    });

    this.deployedUnits = this.deployedUnits.filter(u => u !== unit);
    this.addFloatingText(`RETREAT +${refund} DP`, 
      this.gridOffsetX + unit.col * this.tileWidth + this.tileWidth / 2,
      this.gridOffsetY + unit.row * this.tileHeight + 10,
      "#3ef0c0"
    );

    this.callbacks.onSfx && this.callbacks.onSfx("click");
    this.hideInspectPanel();
    this.updateCardAvailability();
    this.updateHud();
  }

  // Main Loop
  gameLoop(timestamp) {
    if (!this.active) return;
    const dtRaw = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    const dt = Math.min(dtRaw, 0.1) * (this.paused ? 0 : this.speed);

    if (!this.paused) {
      this.update(dt);
    }
    this.render();

    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  update(dt) {
    // 1. DP generation (+1 per second)
    this.dpAccumulator += dt;
    if (this.dpAccumulator >= 1.0) {
      const generated = Math.floor(this.dpAccumulator);
      this.dp = Math.min(this.maxDp, this.dp + generated);
      this.dpAccumulator -= generated;
      this.updateHud();
      this.updateCardAvailability();
    }

    // 2. Wave enemy spawner
    this.spawnTimer += dt;
    while (this.enemyQueue.length > 0 && this.spawnTimer >= this.enemyQueue[0].spawnTime) {
      const spawnItem = this.enemyQueue.shift();
      this.spawnEnemy(spawnItem);
    }

    // 3. Stage Hazard tick
    if (this.currentLevel.hazardType === "crystal_surge") {
      this.hazardTimer += dt;
      if (this.hazardTimer >= 20.0) {
        this.triggerCrystalSurge();
        this.hazardTimer = 0;
      }
      if (this.surgeDisabledTile && performance.now() >= this.surgeDisabledTile.expires) {
        this.surgeDisabledTile = null;
      }
    }

    // 4. Update Enemies
    for (let i = this.activeEnemies.length - 1; i >= 0; i--) {
      const enemy = this.activeEnemies[i];
      enemy.animTime = (enemy.animTime || 0) + dt;

      // Check if blocked by a melee operator
      if (!enemy.blockedBy && !enemy.flying) {
        for (const unit of this.deployedUnits) {
          if (unit.block > 0 && unit.blockedEnemies.length < unit.block) {
            // Check distance to operator center
            const opCenterX = this.gridOffsetX + unit.col * this.tileWidth + this.tileWidth / 2;
            const opCenterY = this.gridOffsetY + unit.row * this.tileHeight + this.tileHeight / 2;
            const dist = Math.hypot(enemy.x - opCenterX, enemy.y - opCenterY);
            if (dist < this.tileWidth * 0.45) {
              enemy.blockedBy = unit;
              unit.blockedEnemies.push(enemy);
              break;
            }
          }
        }
      }

      // If blocked: attack the operator; else move along waypoints
      if (enemy.blockedBy) {
        enemy.attackTimer = (enemy.attackTimer || 0) + dt;
        if (enemy.attackTimer >= enemy.interval) {
          enemy.attackTimer = 0;
          this.enemyAttack(enemy, enemy.blockedBy);
        }
      } else {
        // Move towards next waypoint
        let currentSpeed = enemy.speed * 42; // base movement velocity

        // Conveyor belt hazard boost
        if (this.currentLevel.hazardType === "conveyor") {
          const currentGridCol = Math.floor((enemy.x - this.gridOffsetX) / this.tileWidth);
          if (this.currentLevel.conveyorCols && this.currentLevel.conveyorCols.includes(currentGridCol)) {
            currentSpeed *= 1.35;
          }
        }

        const targetWp = this.currentLevel.waypoints[enemy.wpIndex];
        if (targetWp) {
          const tx = this.gridOffsetX + targetWp.col * this.tileWidth + this.tileWidth / 2;
          const ty = this.gridOffsetY + targetWp.row * this.tileHeight + this.tileHeight / 2;
          const dx = tx - enemy.x;
          const dy = ty - enemy.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 3.0) {
            enemy.wpIndex++;
            if (enemy.wpIndex >= this.currentLevel.waypoints.length) {
              // Reached Objective Base!
              this.activeEnemies.splice(i, 1);
              this.baseHp--;
              this.defeatedEnemies++;
              this.updateHud();
              this.callbacks.onSfx && this.callbacks.onSfx("alert");
              this.addFloatingText("-1 LIFE", tx, ty, "#ff495c");

              if (this.baseHp <= 0) {
                this.endBattle(false);
                return;
              }
              continue;
            }
          } else {
            enemy.x += (dx / dist) * currentSpeed * dt;
            enemy.y += (dy / dist) * currentSpeed * dt;
          }
        }
      }

      // Check if dead
      if (enemy.hp <= 0) {
        if (enemy.blockedBy) {
          const bIdx = enemy.blockedBy.blockedEnemies.indexOf(enemy);
          if (bIdx !== -1) enemy.blockedBy.blockedEnemies.splice(bIdx, 1);
        }
        this.activeEnemies.splice(i, 1);
        this.defeatedEnemies++;
        this.updateHud();
      }
    }

    // 5. Update Operators (attacks / heals)
    for (let uIdx = this.deployedUnits.length - 1; uIdx >= 0; uIdx--) {
      const unit = this.deployedUnits[uIdx];
      unit.animTime = (unit.animTime || 0) + dt;
      unit.attackCooldown -= dt;

      // If defeated
      if (unit.hp <= 0) {
        unit.blockedEnemies.forEach(e => e.blockedBy = null);
        this.deployedUnits.splice(uIdx, 1);
        this.addFloatingText("FALLEN", 
          this.gridOffsetX + unit.col * this.tileWidth + this.tileWidth / 2,
          this.gridOffsetY + unit.row * this.tileHeight + 20,
          "#ff495c"
        );
        this.updateCardAvailability();
        if (this.inspectedOp === unit) this.hideInspectPanel();
        continue;
      }

      if (unit.attackCooldown <= 0) {
        if (unit.heals) {
          // Find most wounded ally in range
          const healTarget = this.findWoundedAllyInRange(unit);
          if (healTarget) {
            unit.attackCooldown = unit.interval;
            this.operatorHeal(unit, healTarget);
          }
        } else {
          // Find enemy target in range
          const target = this.findEnemyTarget(unit);
          if (target) {
            unit.attackCooldown = unit.interval;
            this.operatorAttack(unit, target);
          }
        }
      }
    }

    // 6. Update Floating Text & Visual Effects
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y -= 25 * dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    for (let i = this.visualEffects.length - 1; i >= 0; i--) {
      const vfx = this.visualEffects[i];
      vfx.life -= dt;
      if (vfx.life <= 0) this.visualEffects.splice(i, 1);
    }

    // 7. Check Victory Condition
    if (this.enemyQueue.length === 0 && this.activeEnemies.length === 0 && this.baseHp > 0) {
      this.endBattle(true);
    }
  }

  spawnEnemy(item) {
    const startWp = this.currentLevel.waypoints[0];
    const sx = this.gridOffsetX + startWp.col * this.tileWidth + this.tileWidth / 2;
    const sy = this.gridOffsetY + startWp.row * this.tileHeight + this.tileHeight / 2;

    const enemy = {
      id: `${item.typeId}_${Date.now()}_${Math.random()}`,
      proto: item.proto,
      name: item.proto.name,
      hp: item.proto.hp,
      maxHp: item.proto.maxHp,
      speed: item.proto.speed,
      atk: item.proto.atk,
      def: item.proto.def,
      res: item.proto.res,
      interval: item.proto.interval,
      flying: item.proto.flying,
      boss: item.proto.boss,
      sprite: item.proto.sprite,
      x: sx,
      y: sy,
      wpIndex: 1,
      blockedBy: null,
      attackTimer: 0
    };

    this.activeEnemies.push(enemy);
  }

  findEnemyTarget(unit) {
    const opX = this.gridOffsetX + unit.col * this.tileWidth + this.tileWidth / 2;
    const opY = this.gridOffsetY + unit.row * this.tileHeight + this.tileHeight / 2;
    const maxDist = unit.range * this.tileWidth;

    // Melee units prioritize blocked enemies first
    if (unit.blockedEnemies.length > 0) {
      return unit.blockedEnemies[0];
    }

    // Ranged units: prioritize aerial targets if antiAir
    let bestTarget = null;
    let bestDist = Infinity;

    for (const enemy of this.activeEnemies) {
      const dist = Math.hypot(enemy.x - opX, enemy.y - opY);
      if (dist <= maxDist) {
        if (unit.antiAir && enemy.flying) {
          return enemy;
        }
        if (dist < bestDist) {
          bestDist = dist;
          bestTarget = enemy;
        }
      }
    }
    return bestTarget;
  }

  findWoundedAllyInRange(unit) {
    const opX = this.gridOffsetX + unit.col * this.tileWidth + this.tileWidth / 2;
    const opY = this.gridOffsetY + unit.row * this.tileHeight + this.tileHeight / 2;
    const maxDist = unit.range * this.tileWidth;

    let lowestRatio = 1.0;
    let bestTarget = null;

    for (const ally of this.deployedUnits) {
      const ax = this.gridOffsetX + ally.col * this.tileWidth + this.tileWidth / 2;
      const ay = this.gridOffsetY + ally.row * this.tileHeight + this.tileHeight / 2;
      const dist = Math.hypot(ax - opX, ay - opY);
      if (dist <= maxDist && ally.hp < ally.maxHp) {
        const ratio = ally.hp / ally.maxHp;
        if (ratio < lowestRatio) {
          lowestRatio = ratio;
          bestTarget = ally;
        }
      }
    }
    return bestTarget;
  }

  operatorAttack(unit, enemy) {
    // Arknights Physical Formula: max(5% ATK, ATK - DEF)
    const rawDamage = unit.atk - enemy.def;
    const damage = Math.max(Math.floor(unit.atk * 0.05), rawDamage);

    enemy.hp -= damage;
    this.addFloatingText(`-${damage}`, enemy.x, enemy.y - 10, "#ffffff");

    // Texas generates +1 DP on strikes!
    if (unit.dpPerAtk) {
      this.dp = Math.min(this.maxDp, this.dp + unit.dpPerAtk);
      this.updateHud();
      this.updateCardAvailability();
    }

    // Visual slash / projectile VFX
    this.addVisualEffect({
      type: "slash",
      x: enemy.x,
      y: enemy.y,
      color: "#3ef0c0",
      life: 0.2
    });

    this.callbacks.onSfx && this.callbacks.onSfx(unit.op.tile === "high" ? "shoot" : "slash");
  }

  operatorHeal(unit, target) {
    const healAmount = unit.atk;
    target.hp = Math.min(target.maxHp, target.hp + healAmount);
    
    const tx = this.gridOffsetX + target.col * this.tileWidth + this.tileWidth / 2;
    const ty = this.gridOffsetY + target.row * this.tileHeight + this.tileHeight / 2;
    this.addFloatingText(`+${healAmount}`, tx, ty - 10, "#3ef0c0");

    this.addVisualEffect({
      type: "heal_sparkle",
      x: tx,
      y: ty,
      life: 0.35
    });

    this.callbacks.onSfx && this.callbacks.onSfx("heal");
    if (this.inspectedOp === target) {
      this.inspectHp.textContent = `${Math.floor(target.hp)} / ${target.maxHp}`;
    }
  }

  enemyAttack(enemy, operator) {
    // Enemy damage to operator
    const damage = Math.max(Math.floor(enemy.atk * 0.1), enemy.atk);
    operator.hp -= damage;
    
    const ox = this.gridOffsetX + operator.col * this.tileWidth + this.tileWidth / 2;
    const oy = this.gridOffsetY + operator.row * this.tileHeight + this.tileHeight / 2;
    this.addFloatingText(`-${damage}`, ox, oy - 10, "#ff495c");

    this.addVisualEffect({
      type: "slash",
      x: ox,
      y: oy,
      color: "#ff495c",
      life: 0.2
    });

    if (this.inspectedOp === operator) {
      this.inspectHp.textContent = `${Math.max(0, Math.floor(operator.hp))} / ${operator.maxHp}`;
    }
  }

  triggerCrystalSurge() {
    // Disables a random path or high ground tile for 5s
    const validTiles = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const type = this.currentLevel.map[r * this.cols + c];
        if (type === "P" || type === "H") {
          validTiles.push({ col: c, row: r });
        }
      }
    }
    if (validTiles.length > 0) {
      const pick = validTiles[Math.floor(Math.random() * validTiles.length)];
      this.surgeDisabledTile = {
        col: pick.col,
        row: pick.row,
        expires: performance.now() + 5000
      };
      this.addFloatingText("CRYSTAL SURGE!", 
        this.gridOffsetX + pick.col * this.tileWidth + this.tileWidth / 2,
        this.gridOffsetY + pick.row * this.tileHeight + 15,
        "#c26bff"
      );
      this.callbacks.onSfx && this.callbacks.onSfx("alert");
    }
  }

  addFloatingText(text, x, y, color = "#fff") {
    this.floatingTexts.push({ text, x, y, color, life: 0.8 });
  }

  addVisualEffect(vfx) {
    this.visualEffects.push(vfx);
  }

  updateHud() {
    this.hpEl.textContent = `${Math.max(0, this.baseHp)} / ${this.maxBaseHp}`;
    this.enemyEl.textContent = `${this.defeatedEnemies} / ${this.totalEnemies}`;
    this.dpEl.textContent = Math.floor(this.dp);
    this.dpProgressEl.style.width = `${Math.min(100, (this.dp / this.maxDp) * 100)}%`;
    this.deployCountEl.textContent = `${this.deployedUnits.length} / 4`;
  }

  endBattle(won) {
    this.active = false;
    this.callbacks.onSfx && this.callbacks.onSfx(won ? "victory" : "defeat");
    if (won) {
      this.callbacks.onWin && this.callbacks.onWin({
        levelId: this.currentLevel.id,
        kills: this.defeatedEnemies,
        total: this.totalEnemies,
        hpRemaining: this.baseHp
      });
    } else {
      this.callbacks.onLose && this.callbacks.onLose({
        levelId: this.currentLevel.id,
        kills: this.defeatedEnemies,
        total: this.totalEnemies
      });
    }
  }

  // -----------------------------------------------------------
  // CANVAS RENDERING
  // -----------------------------------------------------------
  render() {
    const ctx = this.ctx;
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Level Background
    if (this.currentLevel.theme.bgImage && this.imageCache[this.currentLevel.theme.bgImage]?.complete) {
      ctx.drawImage(this.imageCache[this.currentLevel.theme.bgImage], 0, 0, w, h);
      ctx.fillStyle = "rgba(4, 8, 16, 0.45)";
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = this.currentLevel.theme.bg || "#050a14";
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Draw Grid Tiles
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const idx = r * this.cols + c;
        const type = this.currentLevel.map[idx];
        const tx = this.gridOffsetX + c * this.tileWidth;
        const ty = this.gridOffsetY + r * this.tileHeight;

        this.renderTile(c, r, type, tx, ty);
      }
    }

    // 3. Draw Path connecting lines
    this.renderPathGuideline();

    // 4. Highlight valid tiles if an operator is selected
    if (this.selectedOp) {
      this.renderPlacementHighlights();
    }

    // 5. Draw Deployed Operators
    this.deployedUnits.forEach(unit => this.renderOperator(unit));

    // 6. Draw Enemies
    this.activeEnemies.forEach(enemy => this.renderEnemy(enemy));

    // 7. Draw Visual Effects (slashes, sparkles)
    this.visualEffects.forEach(vfx => this.renderVfx(vfx));

    // 8. Draw Floating Damage Numbers
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.font = "bold 15px Orbitron, sans-serif";
      ctx.fillStyle = ft.color;
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 4;
      ctx.textAlign = "center";
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  renderTile(c, r, type, tx, ty) {
    const ctx = this.ctx;
    const tw = this.tileWidth;
    const th = this.tileHeight;

    // Check if tile is in crystal surge lockdown
    const isSurged = (this.surgeDisabledTile && this.surgeDisabledTile.col === c && this.surgeDisabledTile.row === r);

    ctx.save();

    if (type === "P") {
      // Walkable Path
      ctx.fillStyle = this.currentLevel.theme.tilePath;
      ctx.fillRect(tx + 2, ty + 2, tw - 4, th - 4);
      
      // Conveyor visual accents if applicable
      if (this.currentLevel.hazardType === "conveyor" && this.currentLevel.conveyorCols?.includes(c)) {
        ctx.strokeStyle = "rgba(255, 138, 61, 0.4)";
        ctx.lineWidth = 2;
        ctx.strokeRect(tx + 4, ty + 4, tw - 8, th - 8);
        ctx.fillStyle = "rgba(255, 138, 61, 0.15)";
        ctx.fillRect(tx + 4, ty + 4, tw - 8, th - 8);
      }
    } else if (type === "H") {
      // Elevated High Ground
      ctx.fillStyle = this.currentLevel.theme.tileHigh;
      ctx.fillRect(tx + 2, ty + 2, tw - 4, th - 4);
      // Top plate highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(tx + 4, ty + 4, tw - 8, 4);
    } else if (type === "S") {
      // Enemy Spawn Gateway
      ctx.fillStyle = "rgba(255, 73, 92, 0.35)";
      ctx.fillRect(tx + 2, ty + 2, tw - 4, th - 4);
      ctx.strokeStyle = "#ff495c";
      ctx.lineWidth = 2;
      ctx.strokeRect(tx + 4, ty + 4, tw - 8, th - 8);

      ctx.font = "bold 11px Orbitron";
      ctx.fillStyle = "#ff495c";
      ctx.textAlign = "center";
      ctx.fillText("IN", tx + tw / 2, ty + th / 2 + 4);
    } else if (type === "O") {
      // Objective Base
      ctx.fillStyle = "rgba(62, 240, 192, 0.35)";
      ctx.fillRect(tx + 2, ty + 2, tw - 4, th - 4);
      ctx.strokeStyle = "#3ef0c0";
      ctx.lineWidth = 2;
      ctx.strokeRect(tx + 4, ty + 4, tw - 8, th - 8);

      ctx.font = "bold 11px Orbitron";
      ctx.fillStyle = "#3ef0c0";
      ctx.textAlign = "center";
      ctx.fillText("BASE", tx + tw / 2, ty + th / 2 + 4);
    } else {
      // Blocked
      ctx.fillStyle = this.currentLevel.theme.tileBlocked;
      ctx.fillRect(tx + 2, ty + 2, tw - 4, th - 4);
    }

    // Grid border line
    ctx.strokeStyle = this.currentLevel.theme.gridLine;
    ctx.lineWidth = 1;
    ctx.strokeRect(tx, ty, tw, th);

    // Hazard surge overlay
    if (isSurged) {
      ctx.fillStyle = "rgba(194, 107, 255, 0.4)";
      ctx.fillRect(tx + 2, ty + 2, tw - 4, th - 4);
      ctx.strokeStyle = "#c26bff";
      ctx.lineWidth = 2;
      ctx.strokeRect(tx + 2, ty + 2, tw - 4, th - 4);
    }

    ctx.restore();
  }

  renderPathGuideline() {
    const ctx = this.ctx;
    const wps = this.currentLevel.waypoints;
    if (!wps || wps.length < 2) return;

    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    wps.forEach((wp, idx) => {
      const x = this.gridOffsetX + wp.col * this.tileWidth + this.tileWidth / 2;
      const y = this.gridOffsetY + wp.row * this.tileHeight + this.tileHeight / 2;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();
  }

  renderPlacementHighlights() {
    const ctx = this.ctx;
    const isMelee = (this.selectedOp.tile === "path");

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const type = this.currentLevel.map[r * this.cols + c];
        const isValid = isMelee ? (type === "P") : (type === "H");
        const alreadyOccupied = this.deployedUnits.some(u => u.col === c && u.row === r);

        if (isValid && !alreadyOccupied) {
          const tx = this.gridOffsetX + c * this.tileWidth;
          const ty = this.gridOffsetY + r * this.tileHeight;

          ctx.save();
          ctx.strokeStyle = isMelee ? "#3ef0c0" : "#ffd15c";
          ctx.lineWidth = 2;
          ctx.strokeRect(tx + 3, ty + 3, this.tileWidth - 6, this.tileHeight - 6);
          ctx.fillStyle = isMelee ? "rgba(62, 240, 192, 0.18)" : "rgba(255, 209, 92, 0.18)";
          ctx.fillRect(tx + 3, ty + 3, this.tileWidth - 6, this.tileHeight - 6);
          ctx.restore();
        }
      }
    }
  }

  renderOperator(unit) {
    const ctx = this.ctx;
    const cx = this.gridOffsetX + unit.col * this.tileWidth + this.tileWidth / 2;
    const cy = this.gridOffsetY + unit.row * this.tileHeight + this.tileHeight / 2;
    const img = this.imageCache[unit.op.sprite];

    ctx.save();

    // Attack range circle if inspected
    if (this.inspectedOp === unit) {
      ctx.strokeStyle = "rgba(62, 240, 192, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.fillStyle = "rgba(62, 240, 192, 0.08)";
      ctx.beginPath();
      ctx.arc(cx, cy, unit.range * this.tileWidth, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Draw sprite (flipped if facing left)
    const size = Math.floor(this.tileHeight * 0.95);
    ctx.translate(cx, cy);
    if (unit.direction === "left") {
      ctx.scale(-1, 1);
    }
    
    // Idle gentle bobbing
    const bob = Math.sin(unit.animTime * 3) * 2;

    if (img && img.complete) {
      ctx.drawImage(img, -size / 2, -size / 2 + bob, size, size);
    } else {
      ctx.fillStyle = "#3ef0c0";
      ctx.beginPath();
      ctx.arc(0, bob, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Directional indicator arrow
    this.renderDirectionArrow(cx, cy + this.tileHeight / 2 - 8, unit.direction);

    // Operator HP bar
    const barW = this.tileWidth * 0.7;
    const barH = 4;
    const bx = cx - barW / 2;
    const by = cy - this.tileHeight / 2 + 6;
    const hpRatio = Math.max(0, unit.hp / unit.maxHp);

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(bx, by, barW, barH);
    ctx.fillStyle = hpRatio > 0.4 ? "#3ef0c0" : "#ff495c";
    ctx.fillRect(bx, by, barW * hpRatio, barH);

    // Block count tag for melee
    if (unit.block > 0) {
      ctx.font = "bold 9px Orbitron";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(`${unit.blockedEnemies.length}/${unit.block}`, cx, by - 2);
    }
  }

  renderDirectionArrow(x, y, dir) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    let symbol = "▲";
    if (dir === "down") symbol = "▼";
    if (dir === "left") symbol = "◀";
    if (dir === "right") symbol = "▶";
    ctx.fillText(symbol, x, y);
    ctx.restore();
  }

  renderEnemy(enemy) {
    const ctx = this.ctx;
    const img = this.imageCache[enemy.sprite];
    const size = Math.floor(this.tileHeight * (enemy.boss ? 1.2 : 0.8));

    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    // Flying altitude shadow / bob
    const bob = enemy.flying ? Math.sin(enemy.animTime * 5) * 4 - 6 : 0;

    if (img && img.complete) {
      ctx.drawImage(img, -size / 2, -size / 2 + bob, size, size);
    } else {
      ctx.fillStyle = enemy.boss ? "#ffd15c" : "#ff495c";
      ctx.beginPath();
      ctx.arc(0, bob, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Enemy HP Bar
    const barW = this.tileWidth * 0.6;
    const barH = 3;
    const bx = enemy.x - barW / 2;
    const by = enemy.y - size / 2 - 4 + (enemy.flying ? -6 : 0);
    const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(bx, by, barW, barH);
    ctx.fillStyle = enemy.boss ? "#ffd15c" : "#ff495c";
    ctx.fillRect(bx, by, barW * hpRatio, barH);
  }

  renderVfx(vfx) {
    const ctx = this.ctx;
    ctx.save();
    if (vfx.type === "slash") {
      ctx.strokeStyle = vfx.color || "#fff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(vfx.x, vfx.y, 16 * (1 - vfx.life / 0.2), 0, Math.PI * 1.5);
      ctx.stroke();
    } else if (vfx.type === "heal_sparkle") {
      ctx.fillStyle = "#3ef0c0";
      ctx.shadowColor = "#3ef0c0";
      ctx.shadowBlur = 8;
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI / 2) + (1 - vfx.life) * 4;
        const dist = 14 * (1 - vfx.life);
        ctx.fillRect(vfx.x + Math.cos(angle) * dist, vfx.y + Math.sin(angle) * dist, 3, 3);
      }
    } else if (vfx.type === "deploy_spark") {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(vfx.x, vfx.y, 25 * (1 - vfx.life / 0.4), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}
