/**
 * Ball class
 * Representasi bola dalam game dengan semua properti dan perilakunya
 */

// Ukuran default radius bola
const DEFAULT_BALL_RADIUS = 20;

/**
 * Class Ball - mewakili bola dalam game
 */
class Ball {
  /**
   * Membuat instance bola baru
   * @param {string} name - Nama bola untuk menentukan atribut
   * @param {number} x - Posisi awal X
   * @param {number} y - Posisi awal Y
   * @param {number} [radius=DEFAULT_BALL_RADIUS] - Radius bola
   */
  constructor(name, x, y, radius = DEFAULT_BALL_RADIUS) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.radius = radius;

    // Inisialisasi kecepatan default
    this.vx = 0;
    this.vy = 0;

    // Properti fisika
    this.mass = Math.PI * radius * radius * 0.1; // Mass berdasarkan ukuran
    this.frictionMultiplier = 1.0; // Default friction multiplier
    this.bounceMultiplier = 1.0; // Default bounce multiplier
    this.knockbackResistance = 0; // Default knockback resistance

    // Flags untuk efek special
    this.phaseShift = false; // For wall phasing
    this.doubleStrike = false; // For double damage
    this.itemDisabled = false; // For EMP effect
    this.opacity = 1.0; // For visual transparency effects

    // Generate atribut berdasarkan nama
    this.generateAttributes();

    // Setup health points
    this.maxHp = 100; // HP maksimum default
    this.hp = this.maxHp; // HP saat ini

    // Status efek
    this.effects = [];
    this.healTimer = 0; // For regeneration effects

    // Visual properties
    this.color = this.generateColor();
    this.trailEffect = {
      active: false,
      color: this.color,
      opacity: 0.5,
      length: 5,
      positions: [],
    };

    // Collision history untuk passive ability dan status lainnya
    this.collisionHistory = [];

    // Comeback system properties
    this.comebackActive = false;
    this.damageBoost = 0;
    this.damageReduction = 0;
    this.criticalChance = 0;
    this.momentumSwingStacks = 0;
    this.momentumSwingTimer = 0;
    this.itemLuckBoost = 0;
    this.itemDurationBoost = 0;

    // Item effect modifiers
    this.itemEffectMultiplier = 1.0;
    this.itemDurationMultiplier = 1.0;

    // Animation timing
    this.flashTime = 0;
    this.pulseTime = 0;
    this.hitAnimationTime = 0;
  }

  /**
   * Generate atribut bola berdasarkan nama
   * Menggunakan NameUtils.analyzeNameCharacteristics
   */
  generateAttributes() {
    // Default atribut jika NameUtils belum tersedia
    const defaultAttributes = {
      powerScore: 100,
      attributes: {
        hp: 25,
        attack: 25,
        defense: 25,
        speed: 25,
      },
      passiveTier: "Common",
      nameFactors: {},
    };

    // Generate atribut menggunakan NameUtils jika tersedia
    if (window.NameGenerator) {
      const nameAnalysis = window.NameGenerator.analyzeNameCharacteristics(
        this.name
      );

      this.powerScore = nameAnalysis.powerScore;
      this.attributes = nameAnalysis.attributes;
      this.passiveTier = nameAnalysis.passiveTier;
      this.nameFactors = nameAnalysis.nameFactors;

      // Sesuaikan max HP berdasarkan power score dan atribut HP
      this.maxHp = Math.round(
        100 * (this.powerScore / 100) * (this.attributes.hp / 25)
      );
      this.hp = this.maxHp;
    } else if (window.NameUtils) {
      // Fallback to NameUtils
      const nameAnalysis = window.NameUtils.analyzeNameCharacteristics(
        this.name
      );

      this.powerScore = nameAnalysis.powerScore;
      this.attributes = nameAnalysis.attributes;
      this.passiveTier = nameAnalysis.passiveTier;
      this.nameFactors = nameAnalysis.nameFactors;

      // Sesuaikan max HP berdasarkan power score dan atribut HP
      this.maxHp = Math.round(
        100 * (this.powerScore / 100) * (this.attributes.hp / 25)
      );
      this.hp = this.maxHp;
    } else {
      console.warn(
        "NameGenerator dan NameUtils tidak tersedia, menggunakan atribut default"
      );

      this.powerScore = defaultAttributes.powerScore;
      this.attributes = defaultAttributes.attributes;
      this.passiveTier = defaultAttributes.passiveTier;
      this.nameFactors = defaultAttributes.nameFactors;
      this.passiveAbility = { name: "None", description: "No passive ability" };
    }
  }

  /**
   * Generate warna bola berdasarkan atribut
   * @returns {string} Warna dalam format CSS
   */
  generateColor() {
    // Jika NameGenerator tersedia, gunakan fungsi generateBallColor
    if (window.NameGenerator) {
      return window.NameGenerator.generateBallColor(this);
    }

    // Jika MathUtils tersedia, gunakan randomColorInRange
    if (window.MathUtils) {
      // Pasangkan tier passive dengan range hue
      const tierHueRanges = {
        Common: [180, 240], // Biru
        Uncommon: [90, 150], // Hijau
        Rare: [270, 330], // Ungu
        Epic: [30, 60], // Oranye
        Legendary: [0, 30], // Merah
      };

      // Ambil range untuk tier passive ability saat ini
      const hueRange = tierHueRanges[this.passiveTier] || [0, 360];

      // Generate warna dengan range hue berdasarkan tier
      return MathUtils.randomColorInRange(hueRange[0], hueRange[1]);
    }

    // Fallback jika tidak ada utils yang tersedia - warna berdasarkan hash nama
    if (window.NameUtils) {
      const hash = window.NameUtils.simpleHash(this.name);
      return `hsl(${hash % 360}, 80%, 60%)`;
    }

    // Default jika tidak ada utils yang tersedia
    return `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
  }

  /**
   * Perbarui posisi bola berdasarkan kecepatan dan waktu yang berlalu
   * @param {number} deltaTime - Waktu yang berlalu dalam detik
   * @param {Object} arena - Objek arena dengan width dan height
   */
  update(deltaTime, arena) {
    // Update animation timers
    this.updateAnimationTimers(deltaTime);

    // Jika Physics tersedia, gunakan updateBallPosition
    if (window.Physics) {
      window.Physics.updateBallPosition(this, deltaTime, arena);
    } else {
      // Implementasi fallback
      this.x += this.vx * deltaTime;
      this.y += this.vy * deltaTime;

      // Cek tumbukan dengan dinding
      this.handleWallCollision(arena);
    }

    // Perbaharui trail effect
    this.updateTrail();

    // Perbarui timer efek
    this.updateEffects(deltaTime);
  }

  /**
   * Update timers for visual animations
   * @param {number} deltaTime - Time elapsed in seconds
   */
  updateAnimationTimers(deltaTime) {
    // Update flash timer
    if (this.flashTime > 0) {
      this.flashTime -= deltaTime;
    }

    // Update pulse timer
    if (this.pulseTime > 0) {
      this.pulseTime -= deltaTime;
    }

    // Update hit animation timer
    if (this.hitAnimationTime > 0) {
      this.hitAnimationTime -= deltaTime;
    }
  }

  /**
   * Handle tumbukan dengan dinding arena
   * @param {Object} arena - Objek arena dengan width dan height
   */
  handleWallCollision(arena) {
    // Skip wall collision if phase shift is active
    if (this.phaseShift) {
      return;
    }

    // Apply bounce multiplier (from effects, items, etc)
    const bounceFactor = PHYSICS.RESTITUTION * this.bounceMultiplier;

    // Tumbukan dengan dinding kiri
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = -this.vx * bounceFactor;
    }
    // Tumbukan dengan dinding kanan
    else if (this.x + this.radius > arena.width) {
      this.x = arena.width - this.radius;
      this.vx = -this.vx * bounceFactor;
    }

    // Tumbukan dengan dinding atas
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy = -this.vy * bounceFactor;
    }
    // Tumbukan dengan dinding bawah
    else if (this.y + this.radius > arena.height) {
      this.y = arena.height - this.radius;
      this.vy = -this.vy * bounceFactor;
    }
  }

  /**
   * Perbaharui efek jejak (trail)
   */
  updateTrail() {
    if (!this.trailEffect.active) return;

    // Tambahkan posisi saat ini ke riwayat posisi
    this.trailEffect.positions.push({ x: this.x, y: this.y });

    // Batasi panjang trail
    if (this.trailEffect.positions.length > this.trailEffect.length) {
      this.trailEffect.positions.shift();
    }
  }

  /**
   * Perbarui timer dan status semua efek aktif
   * @param {number} deltaTime - Waktu yang berlalu dalam detik
   */
  updateEffects(deltaTime) {
    // Process each effect
    this.effects = this.effects.filter((effect) => {
      // Skip processing if effect is already done
      if (effect.duration <= 0) return false;

      // Update effect duration
      if (effect.duration > 0) {
        effect.duration -= deltaTime;
      }

      // Call effect's update function if exists
      if (effect.onUpdate) {
        effect.onUpdate(this, deltaTime);
      }

      // If effect just expired, call onRemove
      if (effect.duration <= 0 && effect.duration + deltaTime > 0) {
        if (effect.onRemove) {
          effect.onRemove(this);
        }
        return false;
      }

      // Keep effect if duration is still positive or permanent (-1)
      return effect.duration > 0 || effect.duration === -1;
    });
  }

  /**
   * Tambahkan efek ke bola
   * @param {Object} effect - Objek efek dengan name, duration, dan modifier function
   */
  addEffect(effect) {
    // Cek apakah efek dengan nama yang sama sudah ada
    const existingEffectIndex = this.effects.findIndex(
      (e) => e.name === effect.name
    );

    // Jika efek sudah ada, timpa atau refresh durasinya
    if (existingEffectIndex !== -1) {
      // Call onRemove if effect being replaced had one
      const oldEffect = this.effects[existingEffectIndex];
      if (oldEffect.onRemove) {
        oldEffect.onRemove(this);
      }

      this.effects[existingEffectIndex] = effect;
    } else {
      // Tambahkan efek baru
      this.effects.push(effect);
    }

    // Call onApply if effect has one
    if (effect.onApply) {
      effect.onApply(this);
    }
  }

  /**
   * Terima damage dari tumbukan atau sumber lain
   * @param {number} amount - Jumlah damage yang diterima
   * @param {Ball} [source] - Bola sumber damage (opsional)
   * @returns {boolean} True jika bola masih hidup, false jika HP <= 0
   */
  takeDamage(amount, source) {
    // Check for damage dodge from effects (like Phantom or Invisibility)
    let dodgeDamage = false;

    // Check for dodge chance from effects
    for (const effect of this.effects) {
      if (effect.dodgeChance && Math.random() < effect.dodgeChance) {
        dodgeDamage = true;
        break;
      }
    }

    if (dodgeDamage) {
      console.log(`${this.name} dodged damage!`);
      this.triggerDodgeEffect();
      return true;
    }

    // Apply damage reduction from defense and effects
    let reducedAmount = amount;

    // Reduce damage based on defense stat
    reducedAmount = reducedAmount * (1 - this.attributes.defense / 200);

    // Apply additional damage reduction from effects
    for (const effect of this.effects) {
      if (effect.defenseBoost) {
        reducedAmount = reducedAmount * (1 - effect.defenseBoost);
      }
    }

    // Apply damage reflection if any
    if (source && this.effects.some((e) => e.damageReflect)) {
      let reflectAmount = 0;

      for (const effect of this.effects) {
        if (effect.damageReflect) {
          reflectAmount += amount * effect.damageReflect;
        }
      }

      if (reflectAmount > 0) {
        source.takeDamage(Math.round(reflectAmount), this);
        console.log(
          `${this.name} reflected ${Math.round(reflectAmount)} damage to ${
            source.name
          }`
        );
      }
    }

    // Ensure minimum damage of 1
    reducedAmount = Math.max(1, Math.round(reducedAmount));

    // Catat tumbukan dalam riwayat
    this.recordCollision(source, reducedAmount);

    // Kurangi HP
    this.hp -= reducedAmount;

    // Trigger efek visual
    this.triggerDamageEffect(reducedAmount);

    // Cek apakah bola masih hidup
    return this.hp > 0;
  }

  /**
   * Catat tumbukan dalam riwayat
   * @param {Ball} opponent - Bola lawan
   * @param {number} damage - Damage yang diterima
   */
  recordCollision(opponent, damage) {
    this.collisionHistory.push({
      timestamp: Date.now(),
      opponentName: opponent ? opponent.name : "wall",
      damage: damage,
    });

    // Batasi panjang riwayat
    if (this.collisionHistory.length > 10) {
      this.collisionHistory.shift();
    }
  }

  /**
   * Trigger efek visual saat menerima damage
   * @param {number} amount - Jumlah damage yang diterima
   */
  triggerDamageEffect(amount) {
    // Set hit animation timer based on damage amount
    this.hitAnimationTime = Math.min(0.5, 0.1 + amount / 30);

    // Flash effect
    this.flashTime = 0.15;

    // Shake effect proportional to damage
    this.shakeIntensity = Math.min(5, amount / 5);
    this.shakeTime = 0.2;
  }

  /**
   * Trigger visual effect for dodging damage
   */
  triggerDodgeEffect() {
    // Flash with different color
    this.flashTime = 0.3;
    this.flashColor = "rgba(100, 200, 255, 0.7)";

    // Add a brief phasing visual
    this.addEffect({
      name: "DodgeEffect",
      duration: 0.5,
      visual: {
        type: "phaseShift",
        opacity: 0.5,
      },
    });
  }

  /**
   * Pulihkan HP
   * @param {number} amount - Jumlah HP yang dipulihkan
   */
  heal(amount) {
    const oldHp = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);

    // Only show heal effect if actually healed
    if (this.hp > oldHp) {
      // Visual effect for healing
      this.addEffect({
        name: "HealEffect",
        duration: 0.5,
        visual: {
          type: "particles",
          color: "#22ff22",
          duration: 0.5,
        },
      });
    }
  }

  /**
   * Render bola ke canvas
   * @param {CanvasRenderingContext2D} ctx - Context canvas
   */
  render(ctx) {
    ctx.save();

    // Apply opacity
    ctx.globalAlpha = this.opacity;

    // Apply shake effect if active
    let drawX = this.x;
    let drawY = this.y;

    if (this.shakeTime > 0) {
      drawX += (Math.random() - 0.5) * this.shakeIntensity * 2;
      drawY += (Math.random() - 0.5) * this.shakeIntensity * 2;
    }

    // Render trail jika aktif
    this.renderTrail(ctx);

    // Apply pulse effect if active
    let displayRadius = this.radius;
    if (this.pulseTime > 0) {
      const pulseScale = 1 + 0.2 * Math.sin(this.pulseTime * 10);
      displayRadius *= pulseScale;
    }

    // Render bola
    ctx.beginPath();
    ctx.arc(drawX, drawY, displayRadius, 0, Math.PI * 2);

    // Apply flash effect if active
    if (this.flashTime > 0) {
      ctx.fillStyle = this.flashColor || "rgba(255, 255, 255, 0.8)";
    } else {
      ctx.fillStyle = this.color;
    }

    ctx.fill();

    // Draw border
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    // Render efek aktif
    this.renderEffects(ctx, drawX, drawY);

    // Render nama di atas bola
    ctx.font = "12px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(this.name, drawX, drawY - displayRadius - 5);

    // Render HP jika tidak full
    if (this.hp < this.maxHp) {
      const hpText = `${Math.max(0, Math.round(this.hp))}/${this.maxHp}`;
      ctx.font = "10px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(hpText, drawX, drawY + 4);
    }

    ctx.restore();
  }

  /**
   * Render efek jejak (trail)
   * @param {CanvasRenderingContext2D} ctx - Context canvas
   */
  renderTrail(ctx) {
    if (!this.trailEffect.active || this.trailEffect.positions.length < 2)
      return;

    ctx.beginPath();
    ctx.moveTo(
      this.trailEffect.positions[0].x,
      this.trailEffect.positions[0].y
    );

    for (let i = 1; i < this.trailEffect.positions.length; i++) {
      ctx.lineTo(
        this.trailEffect.positions[i].x,
        this.trailEffect.positions[i].y
      );
    }

    ctx.strokeStyle = this.trailEffect.color;
    ctx.globalAlpha = this.trailEffect.opacity;
    ctx.lineWidth = this.radius / 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /**
   * Render efek visual untuk efek status aktif
   * @param {CanvasRenderingContext2D} ctx - Context canvas
   * @param {number} x - X position to render at
   * @param {number} y - Y position to render at
   */
  renderEffects(ctx, x, y) {
    for (const effect of this.effects) {
      if (effect.visual) {
        switch (effect.visual.type) {
          case "aura":
            this.renderAuraEffect(ctx, x, y, effect.visual);
            break;
          case "particles":
            this.renderParticleEffect(ctx, x, y, effect.visual);
            break;
          case "shield":
            this.renderShieldEffect(ctx, x, y, effect.visual);
            break;
          case "trail":
            // Trail is handled separately in renderTrail
            break;
          case "spikes":
            this.renderSpikesEffect(ctx, x, y, effect.visual);
            break;
          case "flames":
            this.renderFlamesEffect(ctx, x, y, effect.visual);
            break;
          case "text":
            this.renderTextEffect(ctx, x, y, effect.visual);
            break;
        }
      }
    }
  }

  /**
   * Render aura effect
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} visual - Visual properties
   */
  renderAuraEffect(ctx, x, y, visual) {
    const radius = visual.radius || this.radius * 1.5;
    const opacity = visual.opacity || 0.3;
    const color = visual.color || "rgba(255, 255, 255, 0.3)";

    // Create radial gradient
    const gradient = ctx.createRadialGradient(x, y, this.radius, x, y, radius);

    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /**
   * Render particle effect
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} visual - Visual properties
   */
  renderParticleEffect(ctx, x, y, visual) {
    const color = visual.color || "#ffffff";
    const count = visual.count || 8;
    const size = visual.size || 3;

    ctx.fillStyle = color;

    // Simple particle system
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const distance = this.radius * 1.2;
      const particleX = x + Math.cos(angle) * distance;
      const particleY = y + Math.sin(angle) * distance;

      ctx.beginPath();
      ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Render shield effect
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} visual - Visual properties
   */
  renderShieldEffect(ctx, x, y, visual) {
    const color = visual.color || "rgba(100, 150, 255, 0.5)";
    const radius = this.radius * 1.2;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  /**
   * Render spikes effect
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} visual - Visual properties
   */
  renderSpikesEffect(ctx, x, y, visual) {
    const color = visual.color || "#aa5522";
    const count = visual.count || 8;
    const length = visual.length || this.radius * 0.5;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const innerX = x + Math.cos(angle) * this.radius;
      const innerY = y + Math.sin(angle) * this.radius;
      const outerX = x + Math.cos(angle) * (this.radius + length);
      const outerY = y + Math.sin(angle) * (this.radius + length);

      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(outerX, outerY);
      ctx.stroke();
    }
  }

  /**
   * Render flames effect
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} visual - Visual properties
   */
  renderFlamesEffect(ctx, x, y, visual) {
    const color = visual.color || "#ff3300";
    const intensity = visual.intensity || 1.0;
    const flameCount = Math.floor(12 * intensity);

    // Draw flame particles
    for (let i = 0; i < flameCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = this.radius * (1 + Math.random() * 0.5);
      const flameX = x + Math.cos(angle) * distance;
      const flameY = y + Math.sin(angle) * distance;
      const flameSize = this.radius * 0.3 * (0.5 + Math.random() * 0.5);

      // Create gradient for flame
      const gradient = ctx.createRadialGradient(
        flameX,
        flameY,
        0,
        flameX,
        flameY,
        flameSize
      );

      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.beginPath();
      ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  /**
   * Render text effect
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} visual - Visual properties
   */
  renderTextEffect(ctx, x, y, visual) {
    const content = visual.content || "";
    const color = visual.color || "#ffffff";
    const position = visual.position || "top";

    ctx.font = "14px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";

    let textY;
    switch (position) {
      case "top":
        textY = y - this.radius - 15;
        break;
      case "bottom":
        textY = y + this.radius + 15;
        break;
      default:
        textY = y - this.radius - 15;
    }

    ctx.fillText(content, x, textY);
  }

  /**
   * Ambil status bola sebagai object
   * @returns {Object} Status bola
   */
  getStatus() {
    return {
      name: this.name,
      hp: this.hp,
      maxHp: this.maxHp,
      attributes: this.attributes,
      passiveAbility: this.passiveAbility,
      effects: this.effects.map((e) => e.name),
    };
  }
}
