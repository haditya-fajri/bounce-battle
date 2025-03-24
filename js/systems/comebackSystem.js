/**
 * Comeback System
 * Sistem yang memberikan kesempatan bagi bola yang lebih lemah untuk tetap kompetitif
 * melawan bola yang jauh lebih kuat.
 */

// Konstanta untuk sistem comeback
const COMEBACK = {
  // Perbedaan power score minimum untuk mengaktifkan comeback
  MIN_POWER_DIFF: 50,

  // Waktu permainan minimum sebelum comeback diaktifkan (dalam detik)
  ACTIVATION_TIME: 30,

  // Faktor maksimum untuk tiap mekanisme comeback
  MAX_DAMAGE_BOOST: 0.3, // Maksimum +30% damage
  MAX_DAMAGE_REDUCTION: 0.3, // Maksimum -30% damage
  MAX_SPEED_BOOST: 0.25, // Maksimum +25% speed
  MAX_CRIT_CHANCE: 0.1, // Maksimum 10% critical chance

  // Faktor reduksi comeback saat bola lemah memberikan damage signifikan
  REDUCTION_ON_DAMAGE: 0.05, // Kurangi 5% kekuatan comeback setiap 10% damage
  REDUCTION_ON_HP_LEAD: 0.5, // Kurangi 50% kekuatan comeback jika HP lebih tinggi

  // Pengaturan arena untuk mempercepat pertandingan tidak seimbang
  ARENA_SHRINK_BOOST: 1.5, // Arena menyempit 50% lebih cepat
};

/**
 * ComebackSystem - Sistem untuk memberikan kemampuan comeback pada bola yang lebih lemah
 */
const ComebackSystem = {
  /**
   * Memeriksa dan memperbarui status comeback
   * @param {Object} weakerBall - Objek bola yang lebih lemah
   * @param {Object} strongerBall - Objek bola yang lebih kuat
   * @param {number} gameTime - Waktu permainan yang telah berlalu dalam detik
   * @param {Object} arena - Objek arena game
   */
  update: function (weakerBall, strongerBall, gameTime, arena) {
    // Hitung perbedaan power score
    const powerDifference = strongerBall.powerScore - weakerBall.powerScore;

    // Cek waktu permainan dan perbedaan power untuk mengaktifkan comeback
    if (
      gameTime < COMEBACK.ACTIVATION_TIME ||
      powerDifference < COMEBACK.MIN_POWER_DIFF
    ) {
      this.resetComebackEffects(weakerBall);
      return;
    }

    // Menghitung faktor comeback berdasarkan perbedaan power dan relatif HP
    let comebackFactor = this.calculateComebackFactor(
      weakerBall,
      strongerBall,
      powerDifference
    );

    // Terapkan mekanisme comeback
    this.applyAdaptiveStrength(weakerBall, comebackFactor);
    this.applyResilienceShield(weakerBall, comebackFactor);
    this.applyMomentumSwing(weakerBall, comebackFactor);
    this.applyItemFavoritism(weakerBall, comebackFactor);
    this.applyCriticalStrike(weakerBall, comebackFactor, powerDifference);

    // Mempercepat arena shrink jika pertandingan sangat tidak seimbang
    if (powerDifference > COMEBACK.MIN_POWER_DIFF * 1.5 && arena) {
      arena.shrinkRate *= COMEBACK.ARENA_SHRINK_BOOST;
    }

    // Perbarui visual feedback
    this.updateVisualFeedback(weakerBall, comebackFactor);
  },

  /**
   * Menghitung faktor comeback berdasarkan berbagai faktor
   * @param {Object} weakerBall - Objek bola yang lebih lemah
   * @param {Object} strongerBall - Objek bola yang lebih kuat
   * @param {number} powerDifference - Perbedaan power score
   * @returns {number} Faktor comeback antara 0 dan 1
   */
  calculateComebackFactor: function (
    weakerBall,
    strongerBall,
    powerDifference
  ) {
    // Base comeback factor berdasarkan perbedaan power
    let factor = Math.min(1, (powerDifference - COMEBACK.MIN_POWER_DIFF) / 100);

    // Faktor HP - kurangi comeback jika HP lemah > HP kuat
    if (weakerBall.hp > strongerBall.hp) {
      factor *= 1 - COMEBACK.REDUCTION_ON_HP_LEAD;
    }

    // Faktor berdasarkan perbedaan HP
    const weakerHpPercent = weakerBall.hp / weakerBall.maxHp;
    const strongerHpPercent = strongerBall.hp / strongerBall.maxHp;

    // Tingkatkan comeback jika HP bola lemah jauh lebih rendah
    if (weakerHpPercent < 0.5 && weakerHpPercent < strongerHpPercent) {
      factor *= 1 + (0.5 - weakerHpPercent);
    }

    // Batasi faktor antara 0 dan 1
    return Math.max(0, Math.min(1, factor));
  },

  /**
   * Reset semua efek comeback pada bola
   * @param {Object} ball - Bola yang akan di-reset efek comebacknya
   */
  resetComebackEffects: function (ball) {
    ball.comebackActive = false;
    ball.damageBoost = 0;
    ball.damageReduction = 0;
    ball.speedBoost = 0;
    ball.criticalChance = 0;
    ball.itemLuckBoost = 0;

    // Hapus efek visual
    if (ball.effects) {
      ball.effects = ball.effects.filter(
        (effect) => !effect.name.includes("Comeback")
      );
    }
  },

  /**
   * Terapkan peningkatan damage progresif
   * @param {Object} ball - Bola yang menerima boost
   * @param {number} factor - Faktor comeback (0-1)
   */
  applyAdaptiveStrength: function (ball, factor) {
    // Hitung boost berdasarkan faktor
    ball.damageBoost = factor * COMEBACK.MAX_DAMAGE_BOOST;

    // Simpan status comeback
    ball.comebackActive = true;
  },

  /**
   * Terapkan pengurangan damage yang diterima
   * @param {Object} ball - Bola yang menerima shield
   * @param {number} factor - Faktor comeback (0-1)
   */
  applyResilienceShield: function (ball, factor) {
    // Base damage reduction
    let reduction = factor * COMEBACK.MAX_DAMAGE_REDUCTION;

    // Extra reduction pada HP rendah
    if (ball.hp / ball.maxHp < 0.3) {
      reduction += 0.1; // +10% damage reduction
    }

    ball.damageReduction = reduction;
  },

  /**
   * Terapkan efek kecepatan dan damage setelah tumbukan
   * @param {Object} ball - Bola yang menerima efek momentum
   * @param {number} factor - Faktor comeback (0-1)
   */
  applyMomentumSwing: function (ball, factor) {
    // Set base swing boost
    ball.momentumSwingFactor = 0.05 * (1 + factor);
    ball.momentumSwingMaxStacks = 5;
    ball.momentumSwingDuration = 3; // detik

    // Initialize stack tracking if needed
    if (!ball.momentumSwingStacks) {
      ball.momentumSwingStacks = 0;
      ball.momentumSwingTimer = 0;
    }
  },

  /**
   * Terapkan keberuntungan khusus untuk item
   * @param {Object} ball - Bola yang menerima favoritism
   * @param {number} factor - Faktor comeback (0-1)
   */
  applyItemFavoritism: function (ball, factor) {
    // Peluang spawn item lebih tinggi
    ball.itemLuckBoost = 0.25 * factor;

    // Durasi efek item lebih lama
    ball.itemDurationBoost = 0.2 * factor;
  },

  /**
   * Terapkan kemungkinan critical hit
   * @param {Object} ball - Bola yang menerima crit chance
   * @param {number} factor - Faktor comeback (0-1)
   * @param {number} powerDifference - Perbedaan power score
   */
  applyCriticalStrike: function (ball, factor, powerDifference) {
    // Critical chance berdasarkan perbedaan power
    const baseCritChance = Math.min(
      COMEBACK.MAX_CRIT_CHANCE,
      powerDifference / 500
    );
    ball.criticalChance = baseCritChance * factor;
  },

  /**
   * Perbarui visual feedback untuk efek comeback
   * @param {Object} ball - Bola yang mendapatkan feedback visual
   * @param {number} factor - Faktor comeback (0-1)
   */
  updateVisualFeedback: function (ball, factor) {
    // Hapus efek visual lama
    if (ball.effects) {
      ball.effects = ball.effects.filter(
        (effect) => !effect.name.includes("Comeback")
      );
    }

    // Tidak perlu visual jika faktor terlalu kecil
    if (factor < 0.1) return;

    // Tambahkan efek visual aura comeback
    ball.addEffect({
      name: "ComebackAura",
      duration: -1, // Permanent until reset
      visual: {
        type: "aura",
        color: `rgba(255, 165, 0, ${factor * 0.7})`,
        pulsing: true,
        intensity: factor,
        duration: -1,
      },
    });

    // Tambahkan text indicator
    ball.addEffect({
      name: "ComebackIndicator",
      duration: -1,
      visual: {
        type: "text",
        content: `+${Math.round(factor * 100)}%`,
        color: "#ffaa00",
        position: "top",
        duration: -1,
      },
    });
  },

  /**
   * Berikan damage boost pada tumbukan
   * @param {Object} ball - Bola yang memberikan damage
   * @param {number} baseDamage - Damage dasar sebelum boost
   * @returns {number} Damage setelah boost
   */
  applyDamageBoost: function (ball, baseDamage) {
    // Check if comeback is active
    if (!ball.comebackActive) return baseDamage;

    // Apply damage boost
    let boostedDamage = baseDamage * (1 + ball.damageBoost);

    // Apply momentum swing if active
    if (ball.momentumSwingStacks && ball.momentumSwingStacks > 0) {
      const momentumBoost = ball.momentumSwingStacks * ball.momentumSwingFactor;
      boostedDamage *= 1 + momentumBoost;
    }

    // Check for critical hit
    if (ball.criticalChance && Math.random() < ball.criticalChance) {
      // Critical hit - double damage
      boostedDamage *= 2;

      // Trigger critical hit effect
      ball.addEffect({
        name: "CriticalHit",
        duration: 0.5,
        visual: {
          type: "flash",
          color: "#ff3300",
          duration: 0.5,
        },
      });

      console.log(
        `CRITICAL HIT by ${ball.name}! Damage: ${baseDamage} -> ${boostedDamage}`
      );
    }

    return Math.round(boostedDamage);
  },

  /**
   * Berikan damage reduction saat menerima damage
   * @param {Object} ball - Bola yang menerima damage
   * @param {number} incomingDamage - Damage yang akan diterima
   * @returns {number} Damage setelah reduction
   */
  applyDamageReduction: function (ball, incomingDamage) {
    // Check if comeback is active
    if (!ball.comebackActive) return incomingDamage;

    // Apply damage reduction
    const reducedDamage = incomingDamage * (1 - ball.damageReduction);

    return Math.max(1, Math.round(reducedDamage));
  },

  /**
   * Perbarui efek momentum swing setelah tumbukan
   * @param {Object} ball - Bola yang memiliki momentum swing
   * @param {number} deltaTime - Waktu yang berlalu sejak update terakhir
   */
  updateMomentumSwing: function (ball, deltaTime) {
    // Check if momentum swing is active
    if (!ball.momentumSwingStacks) return;

    // Update timer
    if (ball.momentumSwingStacks > 0) {
      ball.momentumSwingTimer += deltaTime;

      // Check if momentum effect expired
      if (ball.momentumSwingTimer >= ball.momentumSwingDuration) {
        ball.momentumSwingStacks = 0;
        ball.momentumSwingTimer = 0;

        // Remove momentum swing visual effect
        if (ball.effects) {
          ball.effects = ball.effects.filter(
            (effect) => effect.name !== "MomentumSwing"
          );
        }
      }
    }
  },

  /**
   * Tambahkan stack momentum swing setelah tumbukan berhasil
   * @param {Object} ball - Bola yang mendapatkan momentum
   */
  addMomentumStack: function (ball) {
    // Check if comeback is active
    if (!ball.comebackActive) return;

    // Reset timer
    ball.momentumSwingTimer = 0;

    // Add stack up to max
    ball.momentumSwingStacks = Math.min(
      (ball.momentumSwingStacks || 0) + 1,
      ball.momentumSwingMaxStacks
    );

    // Update visual effect
    const intensity = ball.momentumSwingStacks / ball.momentumSwingMaxStacks;

    // Add/update momentum swing visual
    ball.addEffect({
      name: "MomentumSwing",
      duration: ball.momentumSwingDuration,
      visual: {
        type: "trail",
        color: `rgba(255, 100, 0, ${intensity * 0.8})`,
        length: Math.min(10, 3 + ball.momentumSwingStacks * 2),
        duration: ball.momentumSwingDuration,
      },
    });
  },

  /**
   * Perbarui faktor comeback setelah memberikan damage ke bola kuat
   * @param {Object} weakerBall - Bola yang lebih lemah
   * @param {Object} strongerBall - Bola yang lebih kuat
   * @param {number} damageDealt - Damage yang diberikan
   */
  adjustAfterDamageDealt: function (weakerBall, strongerBall, damageDealt) {
    // Check if comeback is active
    if (!weakerBall.comebackActive) return;

    // Calculate percentage of stronger ball's max HP
    const damagePercent = damageDealt / strongerBall.maxHp;

    // Adjust comeback for each 10% damage dealt
    if (damagePercent >= 0.1) {
      // Reduce all comeback effects
      weakerBall.damageBoost *= 1 - COMEBACK.REDUCTION_ON_DAMAGE;
      weakerBall.damageReduction *= 1 - COMEBACK.REDUCTION_ON_DAMAGE;
      weakerBall.criticalChance *= 1 - COMEBACK.REDUCTION_ON_DAMAGE;

      // Update visuals
      this.updateVisualFeedback(
        weakerBall,
        weakerBall.damageBoost / COMEBACK.MAX_DAMAGE_BOOST
      );

      console.log(
        `Comeback reduced for ${weakerBall.name} after dealing ${Math.round(
          damagePercent * 100
        )}% damage`
      );
    }

    // Check if weaker ball now has more HP
    if (weakerBall.hp > strongerBall.hp) {
      // Significantly reduce comeback
      weakerBall.damageBoost *= 1 - COMEBACK.REDUCTION_ON_HP_LEAD;
      weakerBall.damageReduction *= 1 - COMEBACK.REDUCTION_ON_HP_LEAD;
      weakerBall.criticalChance *= 1 - COMEBACK.REDUCTION_ON_HP_LEAD;

      // Update visuals
      this.updateVisualFeedback(
        weakerBall,
        weakerBall.damageBoost / COMEBACK.MAX_DAMAGE_BOOST
      );

      console.log(
        `Comeback significantly reduced for ${weakerBall.name} after taking HP lead`
      );
    }
  },
};

// Ekspos ComebackSystem ke window agar bisa diakses dari file lain
window.ComebackSystem = ComebackSystem;
