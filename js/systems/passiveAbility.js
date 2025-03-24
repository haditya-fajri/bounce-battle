/**
 * Passive Ability System
 * Mengimplementasikan kemampuan pasif bola berdasarkan tier dan nama
 */

// Konfigurasi sistem passive ability
const PASSIVE_ABILITIES = {
  // Tier Common (50% chance)
  Common: [
    {
      name: "Regenerator",
      description:
        "Memulihkan 1% HP setiap 5 detik, tetapi memiliki attack 5% lebih rendah",
      onInit: function (ball) {
        // Penalti serangan
        ball.attributes.attack = Math.max(5, ball.attributes.attack - 5);
      },
      onUpdate: function (ball, deltaTime) {
        // Regenerasi setiap 5 detik
        ball.healTimer = (ball.healTimer || 0) + deltaTime;
        if (ball.healTimer >= 5) {
          ball.healTimer = 0;
          const healAmount = Math.ceil(ball.maxHp * 0.01);
          ball.heal(healAmount);
        }
      },
      onCollision: null,
    },
    {
      name: "Sturdy",
      description: "Defense +10%, tetapi speed -5%",
      onInit: function (ball) {
        ball.attributes.defense += 10;
        ball.attributes.speed = Math.max(5, ball.attributes.speed - 5);
      },
      onUpdate: null,
      onCollision: null,
    },
    {
      name: "Rapid",
      description: "Speed +10%, tetapi max HP -5%",
      onInit: function (ball) {
        ball.attributes.speed += 10;
        ball.maxHp *= 0.95;
        ball.hp = Math.min(ball.hp, ball.maxHp);
      },
      onUpdate: null,
      onCollision: null,
    },
    {
      name: "Focused",
      description: "Damage +10%, tetapi defense -5%",
      onInit: function (ball) {
        ball.attributes.attack += 10;
        ball.attributes.defense = Math.max(5, ball.attributes.defense - 5);
      },
      onUpdate: null,
      onCollision: null,
    },
    {
      name: "Balanced",
      description: "Semua atribut +3%",
      onInit: function (ball) {
        ball.attributes.hp += 3;
        ball.attributes.attack += 3;
        ball.attributes.defense += 3;
        ball.attributes.speed += 3;
      },
      onUpdate: null,
      onCollision: null,
    },
  ],

  // Tier Uncommon (30% chance)
  Uncommon: [
    {
      name: "Vampiric",
      description:
        "Menyerap 5% dari damage yang diberikan sebagai HP, tetapi base speed 5% lebih rendah",
      onInit: function (ball) {
        ball.attributes.speed = Math.max(5, ball.attributes.speed - 5);
      },
      onUpdate: null,
      onCollision: function (ball, opponent, damageDealt) {
        if (damageDealt > 0) {
          const healAmount = Math.ceil(damageDealt * 0.05);
          ball.heal(healAmount);

          // Visual effect
          ball.addEffect({
            name: "LifeSteal",
            duration: 0.5,
            visual: {
              type: "particles",
              color: "#ff0000",
              duration: 0.5,
            },
          });
        }
      },
    },
    {
      name: "Momentum",
      description:
        "Damage meningkat hingga +20% berdasarkan jarak yang ditempuh sebelum tumbukan, tetapi awalnya damage -5%",
      onInit: function (ball) {
        ball.attributes.attack = Math.max(5, ball.attributes.attack - 5);

        // Tambahkan property untuk tracking jarak
        ball.distanceTraveled = 0;
        ball.lastPosition = { x: ball.x, y: ball.y };
      },
      onUpdate: function (ball, deltaTime) {
        // Track jarak yang ditempuh
        const dx = ball.x - ball.lastPosition.x;
        const dy = ball.y - ball.lastPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        ball.distanceTraveled += distance;

        // Reset setelah jarak tertentu untuk bonus maksimum
        if (ball.distanceTraveled > 300) {
          ball.distanceTraveled = 300;
        }

        // Update posisi terakhir
        ball.lastPosition = { x: ball.x, y: ball.y };
      },
      onCollision: function (ball, opponent, damageDealt) {
        // Bonus damage berdasarkan jarak yang ditempuh
        const bonusPercent = Math.min(20, ball.distanceTraveled / 15);

        // Apply bonus damage
        const bonusDamage = Math.ceil(damageDealt * (bonusPercent / 100));
        if (bonusDamage > 0 && opponent) {
          opponent.takeDamage(bonusDamage, ball);
        }

        // Reset jarak setelah tumbukan
        ball.distanceTraveled = 0;
      },
    },
    {
      name: "Adaptive",
      description:
        "Setelah menerima damage, defense meningkat 2% (max +10%), tetapi speed berkurang 1% untuk setiap peningkatan",
      onInit: function (ball) {
        ball.adaptiveStacks = 0;
      },
      onUpdate: null,
      onCollision: function (ball, opponent, damageReceived) {
        if (damageReceived > 0 && ball.adaptiveStacks < 5) {
          // Tambahkan stack adaptive
          ball.adaptiveStacks++;

          // Tingkatkan defense, kurangi speed
          ball.attributes.defense += 2;
          ball.attributes.speed = Math.max(5, ball.attributes.speed - 1);

          // Visual effect
          ball.addEffect({
            name: "AdaptiveShield",
            duration: 1.0,
            visual: {
              type: "pulse",
              color: "#00aaff",
              duration: 1.0,
            },
          });
        }
      },
    },
    {
      name: "Reflector",
      description:
        "Memantulkan 10% damage yang diterima kembali ke penyerang, tetapi max HP 10% lebih rendah",
      onInit: function (ball) {
        ball.maxHp *= 0.9;
        ball.hp = Math.min(ball.hp, ball.maxHp);
      },
      onUpdate: null,
      onCollision: function (ball, opponent, damageReceived) {
        if (damageReceived > 0 && opponent) {
          const reflectedDamage = Math.ceil(damageReceived * 0.1);
          opponent.takeDamage(reflectedDamage, ball);

          // Visual effect
          ball.addEffect({
            name: "DamageReflection",
            duration: 0.5,
            visual: {
              type: "flash",
              color: "#ffaa00",
              duration: 0.5,
            },
          });
        }
      },
    },
    {
      name: "Opportunist",
      description:
        "Damage +15% terhadap bola dengan HP di bawah 40%, tetapi -5% terhadap bola dengan HP di atas 40%",
      onInit: function (ball) {
        // No initialization needed
      },
      onUpdate: null,
      onCollision: function (ball, opponent, damageDealt) {
        if (opponent) {
          const healthPercent = opponent.hp / opponent.maxHp;

          if (healthPercent < 0.4) {
            // Target HP rendah, bonus damage
            const bonusDamage = Math.ceil(damageDealt * 0.15);
            opponent.takeDamage(bonusDamage, ball);

            // Visual effect
            ball.addEffect({
              name: "OpportunistStrike",
              duration: 0.5,
              visual: {
                type: "flash",
                color: "#ff0000",
                duration: 0.5,
              },
            });
          }
        }
      },
    },
  ],

  // Tier Rare (15% chance)
  Rare: [
    {
      name: "Glass Cannon",
      description: "Damage +20%, tetapi defense -15%",
      onInit: function (ball) {
        ball.attributes.attack += 20;
        ball.attributes.defense = Math.max(5, ball.attributes.defense - 15);
      },
      onUpdate: null,
      onCollision: null,
    },
    {
      name: "Tank",
      description: "Max HP +25%, tetapi speed -15%",
      onInit: function (ball) {
        ball.maxHp *= 1.25;
        ball.hp *= 1.25;
        ball.attributes.speed = Math.max(5, ball.attributes.speed - 15);
      },
      onUpdate: null,
      onCollision: null,
    },
    {
      name: "Swift Striker",
      description: "Speed +20%, tetapi max HP -15%",
      onInit: function (ball) {
        ball.attributes.speed += 20;
        ball.maxHp *= 0.85;
        ball.hp = Math.min(ball.hp, ball.maxHp);
      },
      onUpdate: null,
      onCollision: null,
    },
    {
      name: "Berserker",
      description:
        "Saat HP di bawah 30%, attack meningkat 25%, tetapi defense berkurang 15%",
      onInit: function (ball) {
        ball.berserkerActive = false;
      },
      onUpdate: function (ball, deltaTime) {
        const healthPercent = ball.hp / ball.maxHp;

        if (healthPercent < 0.3 && !ball.berserkerActive) {
          // Activate berserker mode
          ball.berserkerActive = true;
          ball.attributes.attack += 25;
          ball.attributes.defense = Math.max(5, ball.attributes.defense - 15);

          // Visual effect
          ball.addEffect({
            name: "BerserkerRage",
            duration: -1, // Permanant until deactivated
            visual: {
              type: "aura",
              color: "#ff3300",
              duration: -1,
            },
          });
        } else if (healthPercent >= 0.3 && ball.berserkerActive) {
          // Deactivate berserker mode
          ball.berserkerActive = false;
          ball.attributes.attack -= 25;
          ball.attributes.defense += 15;

          // Remove visual effect
          ball.effects = ball.effects.filter((e) => e.name !== "BerserkerRage");
        }
      },
      onCollision: null,
    },
    {
      name: "Energizer",
      description:
        "Item boost bertahan 30% lebih lama, tetapi efeknya 10% lebih lemah",
      onInit: function (ball) {
        ball.itemDurationMultiplier = 1.3;
        ball.itemEffectMultiplier = 0.9;
      },
      onUpdate: null,
      onCollision: null,
    },
  ],

  // Tier Epic (4% chance)
  Epic: [
    {
      name: "Phoenix",
      description:
        "Sekali per pertandingan, pulih dengan 25% HP saat darah mencapai 0",
      onInit: function (ball) {
        ball.phoenixReady = true;
      },
      onUpdate: null,
      onCollision: function (ball, opponent, damageReceived) {
        // Check if ball would die from this damage
        if (ball.hp <= 0 && ball.phoenixReady) {
          // Resurrect with 25% health
          ball.hp = Math.ceil(ball.maxHp * 0.25);
          ball.phoenixReady = false; // Can only use once

          // Visual effect
          ball.addEffect({
            name: "PhoenixRebirth",
            duration: 2.0,
            visual: {
              type: "explosion",
              color: "#ffaa00",
              duration: 2.0,
            },
          });

          return true; // Signal that ball survives
        }
        return false;
      },
    },
    {
      name: "Graviton",
      description:
        "Menciptakan medan gravitasi lemah yang menarik bola lain, tetapi speed -10%",
      onInit: function (ball) {
        ball.attributes.speed = Math.max(5, ball.attributes.speed - 10);
        ball.gravitonRadius = ball.radius * 8;
        ball.gravitonStrength = 50;
      },
      onUpdate: function (ball, deltaTime, opponents) {
        // Apply gravitational pull to other balls
        if (opponents && opponents.length > 0) {
          opponents.forEach((opponent) => {
            const dx = ball.x - opponent.x;
            const dy = ball.y - opponent.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0 && distance < ball.gravitonRadius) {
              // Calculate normalized direction vector
              const nx = dx / distance;
              const ny = dy / distance;

              // Force becomes weaker with distance
              const forceFactor =
                (1 - distance / ball.gravitonRadius) *
                ball.gravitonStrength *
                deltaTime;

              // Apply force
              opponent.vx += nx * forceFactor;
              opponent.vy += ny * forceFactor;
            }
          });
        }

        // Visual effect - constant aura
        if (!ball.effects.find((e) => e.name === "GravitonAura")) {
          ball.addEffect({
            name: "GravitonAura",
            duration: -1, // Permanent
            visual: {
              type: "aura",
              color: "#9900ff",
              radius: ball.gravitonRadius,
              opacity: 0.2,
              duration: -1,
            },
          });
        }
      },
      onCollision: null,
    },
    {
      name: "Unstable",
      description:
        "Setiap 20 detik, meledak dan memberikan damage area, tetapi juga kehilangan 5% HP",
      onInit: function (ball) {
        ball.unstableTimer = 0;
        ball.explosionRadius = ball.radius * 5;
      },
      onUpdate: function (ball, deltaTime, opponents) {
        ball.unstableTimer += deltaTime;

        // Explosion every 20 seconds
        if (ball.unstableTimer >= 20) {
          ball.unstableTimer = 0;

          // Self damage
          const selfDamage = Math.ceil(ball.maxHp * 0.05);
          ball.takeDamage(selfDamage, null);

          // Area damage to opponents
          if (opponents && opponents.length > 0) {
            opponents.forEach((opponent) => {
              const dx = ball.x - opponent.x;
              const dy = ball.y - opponent.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < ball.explosionRadius) {
                // Damage falls off with distance
                const damageMultiplier = 1 - distance / ball.explosionRadius;
                const areaDamage = Math.ceil(10 * damageMultiplier);

                opponent.takeDamage(areaDamage, ball);

                // Knockback effect
                const knockbackPower = 200 * damageMultiplier;
                const nx = dx / distance;
                const ny = dy / distance;

                opponent.vx -= nx * knockbackPower;
                opponent.vy -= ny * knockbackPower;
              }
            });
          }

          // Visual effect
          ball.addEffect({
            name: "UnstableExplosion",
            duration: 1.0,
            visual: {
              type: "explosion",
              color: "#ff9900",
              radius: ball.explosionRadius,
              duration: 1.0,
            },
          });
        }

        // Visual warning as explosion approaches
        if (
          ball.unstableTimer >= 15 &&
          !ball.effects.find((e) => e.name === "UnstableWarning")
        ) {
          ball.addEffect({
            name: "UnstableWarning",
            duration: 5.0,
            visual: {
              type: "pulse",
              color: "#ff3300",
              frequency: 4,
              duration: 5.0,
            },
          });
        }
      },
      onCollision: null,
    },
    {
      name: "Chameleon",
      description:
        "Secara berkala berubah jenis passive (dari tier Uncommon) setiap 15 detik",
      onInit: function (ball) {
        ball.chameleonTimer = 0;
        ball.currentChameleonPassive = null;

        // Apply first random passive
        this.switchPassive(ball);
      },
      onUpdate: function (ball, deltaTime) {
        ball.chameleonTimer += deltaTime;

        // Switch passive every 15 seconds
        if (ball.chameleonTimer >= 15) {
          ball.chameleonTimer = 0;
          this.switchPassive(ball);
        }
      },
      switchPassive: function (ball) {
        // Remove effects from current passive
        if (ball.currentChameleonPassive) {
          // Reset stats if needed
          // This is a simplified version - a complete implementation would need to
          // track what changes were made by the previous passive
        }

        // Select a random Uncommon passive
        const uncommonPassives = PASSIVE_ABILITIES.Uncommon;
        const randomIndex = Math.floor(Math.random() * uncommonPassives.length);
        ball.currentChameleonPassive = uncommonPassives[randomIndex];

        // Apply the new passive's init effect
        if (ball.currentChameleonPassive.onInit) {
          ball.currentChameleonPassive.onInit(ball);
        }

        // Visual effect
        ball.addEffect({
          name: "ChameleonShift",
          duration: 2.0,
          visual: {
            type: "colorShift",
            colors: ["#ff3300", "#33ff00", "#0033ff", "#ff00ff"],
            duration: 2.0,
          },
        });
      },
      onCollision: function (ball, opponent, damageDealt) {
        // Delegate to current passive
        if (
          ball.currentChameleonPassive &&
          ball.currentChameleonPassive.onCollision
        ) {
          return ball.currentChameleonPassive.onCollision(
            ball,
            opponent,
            damageDealt
          );
        }
        return false;
      },
    },
    {
      name: "Disruptor",
      description:
        "Mengurangi efektivitas buff lawan sebesar 15% dalam radius tertentu",
      onInit: function (ball) {
        ball.disruptorRadius = ball.radius * 7;
      },
      onUpdate: function (ball, deltaTime, opponents) {
        // Apply disruptor effect to nearby opponents
        if (opponents && opponents.length > 0) {
          opponents.forEach((opponent) => {
            const dx = ball.x - opponent.x;
            const dy = ball.y - opponent.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < ball.disruptorRadius) {
              // Apply disruption effect
              if (!opponent.effects.find((e) => e.name === "Disrupted")) {
                opponent.addEffect({
                  name: "Disrupted",
                  duration: 1.0, // Refreshed as long as in range
                  disruptionFactor: 0.15,
                  visual: {
                    type: "particles",
                    color: "#aa00ff",
                    duration: 1.0,
                  },
                });
              }
            }
          });
        }

        // Visual indicator of disruptor field
        if (!ball.effects.find((e) => e.name === "DisruptorField")) {
          ball.addEffect({
            name: "DisruptorField",
            duration: -1, // Permanent
            visual: {
              type: "aura",
              color: "#aa00ff",
              radius: ball.disruptorRadius,
              opacity: 0.15,
              duration: -1,
            },
          });
        }
      },
      onCollision: null,
    },
  ],

  // Tier Legendary (1% chance)
  Legendary: [
    {
      name: "Avatar",
      description:
        "Secara acak memperoleh 3 passive tier Common sekaligus, tanpa penalti",
      onInit: function (ball) {
        // Select 3 random Common passives
        const commonPassives = [...PASSIVE_ABILITIES.Common];
        ball.avatarPassives = [];

        for (let i = 0; i < 3; i++) {
          if (commonPassives.length > 0) {
            const randomIndex = Math.floor(
              Math.random() * commonPassives.length
            );
            const selectedPassive = commonPassives.splice(randomIndex, 1)[0];

            // Modify the passive to remove penalties
            const modifiedPassive = { ...selectedPassive };
            modifiedPassive.onInit = function (target) {
              // Create a modified version that only applies bonuses
              if (selectedPassive.name === "Regenerator") {
                // Only add regen, no attack penalty
                target.healTimer = 0;
              } else if (selectedPassive.name === "Sturdy") {
                // Only defense bonus, no speed penalty
                target.attributes.defense += 10;
              } else if (selectedPassive.name === "Rapid") {
                // Only speed bonus, no HP penalty
                target.attributes.speed += 10;
              } else if (selectedPassive.name === "Focused") {
                // Only attack bonus, no defense penalty
                target.attributes.attack += 10;
              } else if (selectedPassive.name === "Balanced") {
                // Full bonuses
                target.attributes.hp += 3;
                target.attributes.attack += 3;
                target.attributes.defense += 3;
                target.attributes.speed += 3;
              }
            };

            // Apply the passive immediately
            modifiedPassive.onInit(ball);

            // Store for future use
            ball.avatarPassives.push(modifiedPassive);
          }
        }

        // Visual effect
        ball.addEffect({
          name: "AvatarAura",
          duration: -1, // Permanent
          visual: {
            type: "compositeAura",
            colors: ["#33ff00", "#ff3300", "#0033ff"],
            duration: -1,
          },
        });
      },
      onUpdate: function (ball, deltaTime) {
        // Apply all avatar passives' update effects
        if (ball.avatarPassives) {
          ball.avatarPassives.forEach((passive) => {
            if (passive.onUpdate) {
              passive.onUpdate(ball, deltaTime);
            }
          });
        }
      },
      onCollision: function (ball, opponent, damageDealt) {
        // Apply all avatar passives' collision effects
        let result = false;
        if (ball.avatarPassives) {
          ball.avatarPassives.forEach((passive) => {
            if (passive.onCollision) {
              const passiveResult = passive.onCollision(
                ball,
                opponent,
                damageDealt
              );
              result = result || passiveResult;
            }
          });
        }
        return result;
      },
    },
    {
      name: "Equalizer",
      description:
        "Menyesuaikan atribut untuk menyamai bola lawan, plus bonus 5% di semua stat",
      onInit: function (ball) {
        ball.equalizerActive = false;
        ball.originalAttributes = { ...ball.attributes };
      },
      onUpdate: function (ball, deltaTime, opponents) {
        if (opponents && opponents.length > 0) {
          // Get the opponent
          const opponent = opponents[0];

          // Reset to original attributes
          if (ball.equalizerActive) {
            ball.attributes = { ...ball.originalAttributes };
            ball.equalizerActive = false;
          }

          // Calculate weighted attributes to match opponent
          const targetHp = opponent.attributes.hp * 1.05;
          const targetAttack = opponent.attributes.attack * 1.05;
          const targetDefense = opponent.attributes.defense * 1.05;
          const targetSpeed = opponent.attributes.speed * 1.05;

          // Apply adjustments gradually
          ball.attributes.hp = Math.max(ball.attributes.hp, targetHp);
          ball.attributes.attack = Math.max(
            ball.attributes.attack,
            targetAttack
          );
          ball.attributes.defense = Math.max(
            ball.attributes.defense,
            targetDefense
          );
          ball.attributes.speed = Math.max(ball.attributes.speed, targetSpeed);

          // Mark as active
          ball.equalizerActive = true;

          // Visual effect
          if (!ball.effects.find((e) => e.name === "EqualizerAura")) {
            ball.addEffect({
              name: "EqualizerAura",
              duration: -1, // Permanent
              visual: {
                type: "aura",
                color: "#ffffff",
                opacity: 0.3,
                pulsing: true,
                duration: -1,
              },
            });
          }
        }
      },
      onCollision: null,
    },
    {
      name: "Nemesis",
      description:
        "Damage +30% terhadap bola yang terakhir kali melukai, tetapi -10% terhadap lainnya",
      onInit: function (ball) {
        ball.nemesisTarget = null;
      },
      onUpdate: null,
      onCollision: function (ball, opponent, damageDealt) {
        // When taking damage, mark the attacker as nemesis
        if (damageDealt > 0 && opponent) {
          ball.nemesisTarget = opponent.name;

          // Visual effect
          ball.addEffect({
            name: "NemesisTargeting",
            duration: 2.0,
            visual: {
              type: "targetingLine",
              color: "#ff0000",
              target: opponent,
              duration: 2.0,
            },
          });
        }

        // When dealing damage, check if target is nemesis
        if (opponent && ball.nemesisTarget === opponent.name) {
          // Bonus damage against nemesis
          const bonusDamage = Math.ceil(damageDealt * 0.3);
          opponent.takeDamage(bonusDamage, ball);

          // Visual effect
          ball.addEffect({
            name: "NemesisStrike",
            duration: 0.5,
            visual: {
              type: "flash",
              color: "#ff0000",
              duration: 0.5,
            },
          });
        } else if (opponent) {
          // Reduced damage against non-nemesis (applied as negative value)
          const penaltyDamage = -Math.floor(damageDealt * 0.1);
          if (penaltyDamage < 0) {
            opponent.takeDamage(penaltyDamage, ball);
          }
        }

        return false;
      },
    },
    {
      name: "Catalyst",
      description:
        "Item memberikan efek 25% lebih kuat, tetapi durasi 20% lebih singkat",
      onInit: function (ball) {
        ball.itemEffectMultiplier = 1.25;
        ball.itemDurationMultiplier = 0.8;
      },
      onUpdate: null,
      onCollision: null,
    },
    {
      name: "Phantom",
      description:
        "10% kemungkinan menghindari damage, tetapi memberikan 10% lebih sedikit damage",
      onInit: function (ball) {
        ball.damageMultiplier = 0.9; // 10% less damage
      },
      onUpdate: null,
      onCollision: function (ball, opponent, damageReceived) {
        // When receiving damage, 10% chance to avoid it
        if (damageReceived > 0 && Math.random() < 0.1) {
          // Visual effect
          ball.addEffect({
            name: "PhantomDodge",
            duration: 1.0,
            visual: {
              type: "phaseShift",
              color: "#aaeeff",
              opacity: 0.7,
              duration: 1.0,
            },
          });

          return true; // Signal that damage is avoided
        }
        return false;
      },
    },
  ],
};

/**
 * Menghasilkan passive ability untuk bola berdasarkan tier dan nama
 * @param {Object} ball - Objek bola yang akan menerima passive ability
 * @returns {Object} - Objek passive ability yang dipilih
 */
function generatePassiveAbility(ball) {
  const tier = ball.passiveTier || "Common";
  const tierAbilities = PASSIVE_ABILITIES[tier] || PASSIVE_ABILITIES.Common;

  // Use the ball's name to deterministically select an ability
  let nameHash = 0;
  if (window.NameUtils) {
    // Important: Use an isolated hash for each ball instance
    nameHash = window.NameUtils.simpleHash(ball.name);
  } else {
    // Simple hash if NameUtils not available
    for (let i = 0; i < ball.name.length; i++) {
      nameHash = ball.name.charCodeAt(i) + ((nameHash << 5) - nameHash);
    }
    nameHash = Math.abs(nameHash);
  }

  // Select a passive ability deterministically based on the name hash
  const abilityIndex = nameHash % tierAbilities.length;
  const selectedAbility = tierAbilities[abilityIndex];

  // Create a deep clone of the ability to prevent shared state between balls
  const passiveAbility = {
    name: selectedAbility.name,
    description: selectedAbility.description,
    tier: tier,
    onUpdate: selectedAbility.onUpdate,
    onCollision: selectedAbility.onCollision,
    onInit: selectedAbility.onInit,
  };

  return passiveAbility;
}

/**
 * Menerapkan passive ability ke bola
 * @param {Object} ball - Objek bola yang akan menerima passive ability
 */
function applyPassiveAbility(ball) {
  // Generate passive ability jika belum ada
  if (!ball.passiveAbility || !ball.passiveAbility.name) {
    ball.passiveAbility = generatePassiveAbility(ball);
  }

  // Terapkan efek inisialisasi
  if (ball.passiveAbility.onInit) {
    ball.passiveAbility.onInit(ball);
  }

  console.log(
    `Applied passive ability: ${ball.passiveAbility.name} (${ball.passiveAbility.tier}) to ${ball.name}`
  );
}

/**
 * Memperbarui efek passive ability pada update loop
 * @param {Object} ball - Objek bola yang memiliki passive ability
 * @param {number} deltaTime - Waktu yang berlalu sejak update terakhir
 * @param {Array} opponents - Array berisi bola lawan (opsional)
 */
function updatePassiveAbility(ball, deltaTime, opponents) {
  if (ball.passiveAbility && ball.passiveAbility.onUpdate) {
    ball.passiveAbility.onUpdate(ball, deltaTime, opponents);
  }
}

/**
 * Menjalankan efek passive ability saat terjadi tumbukan
 * @param {Object} ball - Bola yang memiliki passive ability
 * @param {Object} opponent - Bola lawan (bisa null jika tumbukan dengan dinding)
 * @param {number} damageValue - Jumlah damage yang terlibat dalam tumbukan
 * @returns {boolean} True jika passive ability berhasil mengatasi efek tumbukan
 */
function handleCollisionPassiveAbility(ball, opponent, damageValue) {
  if (ball.passiveAbility && ball.passiveAbility.onCollision) {
    return (
      ball.passiveAbility.onCollision(ball, opponent, damageValue) || false
    );
  }
  return false;
}

// Ekspos fungsi-fungsi untuk digunakan oleh modul lain
window.PassiveAbility = {
  generatePassiveAbility,
  applyPassiveAbility,
  updatePassiveAbility,
  handleCollisionPassiveAbility,
  ABILITIES: PASSIVE_ABILITIES,
};
