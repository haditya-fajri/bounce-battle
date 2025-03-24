/**
 * Item class dan sistem untuk Bounce Battle
 * Mengimplementasikan berbagai item yang dapat memberikan efek pada bola
 */

// Konstanta untuk item
const ITEM_CONSTANTS = {
  DEFAULT_RADIUS: 10,
  DEFAULT_DURATION: 10, // Durasi dalam detik untuk efek sementara
  SPAWN_INTERVAL: 15, // Interval spawn item dalam detik
  DESPAWN_TIME: 8, // Waktu item menghilang jika tidak diambil

  // Probabilitas untuk setiap kategori item
  PROBABILITIES: {
    ATTRIBUTE: 50, // 50% chance untuk item atribut dasar
    SPECIAL: 30, // 30% chance untuk item efek spesial
    ARENA: 15, // 15% chance untuk item manipulasi arena
    SUPER: 5, // 5% chance untuk item super
  },
};

/**
 * Definisi item yang tersedia dalam game
 */
const ITEMS = {
  // Item Atribut Dasar (50% chance)
  ATTRIBUTE: [
    {
      id: "attack_boost",
      name: "Attack Boost",
      description: "Meningkatkan damage yang diberikan (+25% selama 10 detik)",
      color: "#ff5555",
      icon: "⚔️",
      effect: function (ball) {
        const duration =
          ITEM_CONSTANTS.DEFAULT_DURATION * (ball.itemDurationMultiplier || 1);
        const boostValue = 25 * (ball.itemEffectMultiplier || 1);

        ball.addEffect({
          name: "AttackBoost",
          duration: duration,
          attackBoost: boostValue / 100,
          onApply: function (target) {
            console.log(
              `${target.name} mendapatkan Attack Boost: +${boostValue}% selama ${duration} detik`
            );
          },
          onRemove: function (target) {
            console.log(`Efek Attack Boost pada ${target.name} telah berakhir`);
          },
          visual: {
            type: "aura",
            color: "#ff3300",
            opacity: 0.6,
            pulsing: true,
          },
        });
      },
    },
    {
      id: "defense_shield",
      name: "Defense Shield",
      description: "Mengurangi damage yang diterima (-30% selama 8 detik)",
      color: "#5555ff",
      icon: "🛡️",
      effect: function (ball) {
        const duration = 8 * (ball.itemDurationMultiplier || 1);
        const defenseValue = 30 * (ball.itemEffectMultiplier || 1);

        ball.addEffect({
          name: "DefenseShield",
          duration: duration,
          defenseBoost: defenseValue / 100,
          onApply: function (target) {
            console.log(
              `${target.name} mendapatkan Defense Shield: -${defenseValue}% damage selama ${duration} detik`
            );
          },
          onRemove: function (target) {
            console.log(
              `Efek Defense Shield pada ${target.name} telah berakhir`
            );
          },
          visual: {
            type: "shield",
            color: "#0033aa",
            opacity: 0.5,
          },
        });
      },
    },
    {
      id: "speed_pill",
      name: "Speed Pill",
      description: "Meningkatkan kecepatan bola (+20% selama 5 detik)",
      color: "#55ff55",
      icon: "💨",
      effect: function (ball) {
        const duration = 5 * (ball.itemDurationMultiplier || 1);
        const speedValue = 20 * (ball.itemEffectMultiplier || 1);

        ball.addEffect({
          name: "SpeedBoost",
          duration: duration,
          speedBoost: speedValue / 100,
          onApply: function (target) {
            console.log(
              `${target.name} mendapatkan Speed Pill: +${speedValue}% kecepatan selama ${duration} detik`
            );
          },
          onRemove: function (target) {
            console.log(`Efek Speed Pill pada ${target.name} telah berakhir`);
          },
          visual: {
            type: "trail",
            color: "#00ff33",
            length: 10,
          },
        });
      },
    },
    {
      id: "health_orb",
      name: "Health Orb",
      description: "Memulihkan sebagian darah (regenerasi +15 HP)",
      color: "#ff9955",
      icon: "❤️",
      effect: function (ball) {
        const healValue = Math.ceil(15 * (ball.itemEffectMultiplier || 1));

        ball.heal(healValue);

        ball.addEffect({
          name: "Healing",
          duration: 1.0,
          onApply: function (target) {
            console.log(
              `${target.name} mendapatkan Health Orb: +${healValue} HP`
            );
          },
          visual: {
            type: "particles",
            color: "#ff9955",
            duration: 1.0,
          },
        });
      },
    },
  ],

  // Item Efek Spesial (30% chance)
  SPECIAL: [
    {
      id: "spike_armor",
      name: "Spike Armor",
      description:
        "Memberikan damage balik ketika diserang (25% damage dikirim kembali)",
      color: "#aa5522",
      icon: "🔄",
      effect: function (ball) {
        const duration = 8 * (ball.itemDurationMultiplier || 1);
        const reflectValue = 25 * (ball.itemEffectMultiplier || 1);

        ball.addEffect({
          name: "SpikeArmor",
          duration: duration,
          damageReflect: reflectValue / 100,
          onApply: function (target) {
            console.log(
              `${target.name} mendapatkan Spike Armor: ${reflectValue}% damage reflect selama ${duration} detik`
            );
          },
          onRemove: function (target) {
            console.log(`Efek Spike Armor pada ${target.name} telah berakhir`);
          },
          visual: {
            type: "spikes",
            color: "#aa5522",
            count: 8,
          },
        });
      },
    },
    {
      id: "invisibility_cloak",
      name: "Invisibility Cloak",
      description:
        "Membuat bola semi-transparan dan mengurangi kemungkinan terkena serangan",
      color: "#aaaaaa",
      icon: "👻",
      effect: function (ball) {
        const duration = 6 * (ball.itemDurationMultiplier || 1);
        const dodgeChance = 20 * (ball.itemEffectMultiplier || 1);

        ball.addEffect({
          name: "Invisibility",
          duration: duration,
          dodgeChance: dodgeChance / 100,
          onApply: function (target) {
            console.log(
              `${target.name} mendapatkan Invisibility Cloak: ${dodgeChance}% dodge chance selama ${duration} detik`
            );
            target.opacity = 0.4;
          },
          onRemove: function (target) {
            console.log(
              `Efek Invisibility Cloak pada ${target.name} telah berakhir`
            );
            target.opacity = 1.0;
          },
          visual: {
            type: "opacity",
            value: 0.4,
          },
        });
      },
    },
    {
      id: "growth_ray",
      name: "Growth Ray",
      description:
        "Meningkatkan ukuran bola untuk sementara (lebih mudah mengenai lawan)",
      color: "#ff55ff",
      icon: "📏",
      effect: function (ball) {
        const duration = 7 * (ball.itemDurationMultiplier || 1);
        const growthFactor = 1.5 * (ball.itemEffectMultiplier || 1);
        const originalRadius = ball.radius;

        ball.addEffect({
          name: "Growth",
          duration: duration,
          onApply: function (target) {
            console.log(
              `${target.name} mendapatkan Growth Ray: ukuran ×${growthFactor} selama ${duration} detik`
            );
            target.radius = originalRadius * growthFactor;
          },
          onRemove: function (target) {
            console.log(`Efek Growth Ray pada ${target.name} telah berakhir`);
            target.radius = originalRadius;
          },
          visual: {
            type: "scale",
            factor: growthFactor,
          },
        });
      },
    },
    {
      id: "shrink_ray",
      name: "Shrink Ray",
      description: "Membuat bola lebih kecil (lebih sulit terkena serangan)",
      color: "#5555ff",
      icon: "🔍",
      effect: function (ball) {
        const duration = 7 * (ball.itemDurationMultiplier || 1);
        const shrinkFactor = 0.6 * (2 - (ball.itemEffectMultiplier || 1));
        const originalRadius = ball.radius;

        ball.addEffect({
          name: "Shrink",
          duration: duration,
          onApply: function (target) {
            console.log(
              `${target.name} mendapatkan Shrink Ray: ukuran ×${shrinkFactor} selama ${duration} detik`
            );
            target.radius = originalRadius * shrinkFactor;
          },
          onRemove: function (target) {
            console.log(`Efek Shrink Ray pada ${target.name} telah berakhir`);
            target.radius = originalRadius;
          },
          visual: {
            type: "scale",
            factor: shrinkFactor,
          },
        });
      },
    },
  ],

  // Item Manipulasi Arena (15% chance)
  ARENA: [
    {
      id: "gravity_well",
      name: "Gravity Well",
      description:
        "Menciptakan titik gravitasi temporer yang menarik bola lawan",
      color: "#aa00aa",
      icon: "🌀",
      effect: function (ball, opponents, arena) {
        const duration = 5;
        const radius = ball.radius * 10;
        const strength = 150;
        const position = { x: ball.x, y: ball.y };

        // Buat gravitational well sebagai entitas terpisah di arena
        arena.addEntity({
          type: "GravityWell",
          position: position,
          radius: radius,
          strength: strength,
          duration: duration,
          createdBy: ball.name,
          update: function (dt, balls) {
            this.duration -= dt;

            // Tarik semua bola ke arah gravity well
            balls.forEach((targetBall) => {
              const dx = this.position.x - targetBall.x;
              const dy = this.position.y - targetBall.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance > 0 && distance < this.radius) {
                // Direction vector
                const nx = dx / distance;
                const ny = dy / distance;

                // Force stronger when closer
                const forceFactor =
                  (1 - distance / this.radius) * this.strength * dt;

                // Apply force
                targetBall.vx += nx * forceFactor;
                targetBall.vy += ny * forceFactor;
              }
            });

            return this.duration > 0; // Return false to remove entity when expired
          },
          render: function (ctx) {
            // Render gravitational field
            const gradient = ctx.createRadialGradient(
              this.position.x,
              this.position.y,
              0,
              this.position.x,
              this.position.y,
              this.radius
            );
            gradient.addColorStop(0, "rgba(170, 0, 170, 0.7)");
            gradient.addColorStop(1, "rgba(170, 0, 170, 0)");

            ctx.beginPath();
            ctx.arc(
              this.position.x,
              this.position.y,
              this.radius,
              0,
              Math.PI * 2
            );
            ctx.fillStyle = gradient;
            ctx.fill();
          },
        });

        console.log(`${ball.name} mengaktifkan Gravity Well!`);
      },
    },
    {
      id: "bounce_pad",
      name: "Bounce Pad",
      description: "Meningkatkan kekuatan pantul untuk sementara waktu",
      color: "#ffaa00",
      icon: "🔄",
      effect: function (ball) {
        const duration = 6 * (ball.itemDurationMultiplier || 1);
        const bounceMultiplier = 1.5 * (ball.itemEffectMultiplier || 1);

        ball.addEffect({
          name: "BouncePad",
          duration: duration,
          bounceMultiplier: bounceMultiplier,
          onApply: function (target) {
            console.log(
              `${target.name} mendapatkan Bounce Pad: ×${bounceMultiplier} bounce selama ${duration} detik`
            );
          },
          onRemove: function (target) {
            console.log(`Efek Bounce Pad pada ${target.name} telah berakhir`);
          },
          visual: {
            type: "particles",
            color: "#ffaa00",
            trigger: "collision",
          },
        });
      },
    },
    {
      id: "slick_oil",
      name: "Slick Oil",
      description:
        "Mengurangi gesekan di area tertentu, membuat kontrol menjadi sulit",
      color: "#000000",
      icon: "🛢️",
      effect: function (ball, opponents, arena) {
        const duration = 8;
        const radius = 100;
        const position = { x: ball.x, y: ball.y };

        // Buat oil slick sebagai entitas terpisah di arena
        arena.addEntity({
          type: "OilSlick",
          position: position,
          radius: radius,
          duration: duration,
          createdBy: ball.name,
          update: function (dt, balls) {
            this.duration -= dt;

            // Kurangi gesekan semua bola di area oil slick
            balls.forEach((targetBall) => {
              const dx = this.position.x - targetBall.x;
              const dy = this.position.y - targetBall.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < this.radius) {
                // Temporarily reduce friction for ball
                targetBall.frictionMultiplier = 0.2;
              } else {
                // Reset friction multiplier
                targetBall.frictionMultiplier = 1.0;
              }
            });

            return this.duration > 0; // Return false to remove entity when expired
          },
          render: function (ctx) {
            // Render oil slick
            ctx.beginPath();
            ctx.arc(
              this.position.x,
              this.position.y,
              this.radius,
              0,
              Math.PI * 2
            );
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.fill();
          },
        });

        console.log(`${ball.name} mengaktifkan Slick Oil!`);
      },
    },
    {
      id: "vortex",
      name: "Vortex",
      description: "Memunculkan pusaran kecil yang mengubah arah pergerakan",
      color: "#00aaff",
      icon: "🌪️",
      effect: function (ball, opponents, arena) {
        const duration = 7;
        const radius = 80;
        const position = { x: ball.x, y: ball.y };
        const rotationSpeed = 5;

        // Buat vortex sebagai entitas terpisah di arena
        arena.addEntity({
          type: "Vortex",
          position: position,
          radius: radius,
          duration: duration,
          rotationSpeed: rotationSpeed,
          createdBy: ball.name,
          update: function (dt, balls) {
            this.duration -= dt;

            // Rotate all balls in vortex area
            balls.forEach((targetBall) => {
              const dx = targetBall.x - this.position.x;
              const dy = targetBall.y - this.position.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < this.radius) {
                // Calculate tangential vector (perpendicular to radial vector)
                const tx = -dy / distance;
                const ty = dx / distance;

                // Force weaker at center and edge, stronger in middle
                const distanceFactor =
                  (1 - Math.abs((2 * distance) / this.radius - 1)) *
                  this.rotationSpeed;

                // Apply tangential force
                targetBall.vx += tx * distanceFactor * dt * 100;
                targetBall.vy += ty * distanceFactor * dt * 100;
              }
            });

            return this.duration > 0; // Return false to remove entity when expired
          },
          render: function (ctx) {
            // Render vortex with swirl effect
            ctx.save();

            const gradient = ctx.createRadialGradient(
              this.position.x,
              this.position.y,
              0,
              this.position.x,
              this.position.y,
              this.radius
            );
            gradient.addColorStop(0, "rgba(0, 170, 255, 0.1)");
            gradient.addColorStop(0.5, "rgba(0, 170, 255, 0.3)");
            gradient.addColorStop(1, "rgba(0, 170, 255, 0.1)");

            ctx.beginPath();
            ctx.arc(
              this.position.x,
              this.position.y,
              this.radius,
              0,
              Math.PI * 2
            );
            ctx.fillStyle = gradient;
            ctx.fill();

            // Draw swirl lines
            ctx.translate(this.position.x, this.position.y);
            const time = Date.now() / 1000;

            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * Math.PI * 2 + (time % (Math.PI * 2));

              ctx.beginPath();
              ctx.moveTo(0, 0);

              // Spiral curve
              for (let r = 1; r <= this.radius; r += 5) {
                const a = angle + (r / this.radius) * Math.PI;
                ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
              }

              ctx.strokeStyle = "rgba(0, 170, 255, 0.5)";
              ctx.lineWidth = 2;
              ctx.stroke();
            }

            ctx.restore();
          },
        });

        console.log(`${ball.name} mengaktifkan Vortex!`);
      },
    },
  ],

  // Item Super (5% chance)
  SUPER: [
    {
      id: "berserk_mode",
      name: "Berserk Mode",
      description:
        "Meningkatkan semua stat secara drastis tapi juga menurunkan pertahanan",
      color: "#ff0000",
      icon: "🔥",
      effect: function (ball) {
        const duration = 5 * (ball.itemDurationMultiplier || 1);
        const boostMultiplier = ball.itemEffectMultiplier || 1;

        ball.addEffect({
          name: "BerserkMode",
          duration: duration,
          onApply: function (target) {
            console.log(
              `${target.name} mendapatkan Berserk Mode selama ${duration} detik!`
            );

            // Boost attack and speed drastically
            target.attributes.attack += 50 * boostMultiplier;
            target.attributes.speed += 30 * boostMultiplier;

            // Reduce defense
            target.attributes.defense = Math.max(
              5,
              target.attributes.defense - 20
            );
          },
          onRemove: function (target) {
            console.log(`Efek Berserk Mode pada ${target.name} telah berakhir`);

            // Revert stat changes
            target.attributes.attack -= 50 * boostMultiplier;
            target.attributes.speed -= 30 * boostMultiplier;
            target.attributes.defense += 20;
          },
          visual: {
            type: "flames",
            color: "#ff0000",
            intensity: 1.0,
          },
        });
      },
    },
    {
      id: "emp_blast",
      name: "EMP Blast",
      description: "Menonaktifkan item lawan untuk sementara waktu",
      color: "#0088ff",
      icon: "⚡",
      effect: function (ball, opponents) {
        const duration = 7 * (ball.itemEffectMultiplier || 1);

        // Apply EMP to all opponents
        opponents.forEach((opponent) => {
          opponent.addEffect({
            name: "EMPDisabled",
            duration: duration,
            onApply: function (target) {
              console.log(
                `${target.name} terkena EMP Blast dari ${ball.name}! Item dinonaktifkan selama ${duration} detik.`
              );

              // Disable all active item effects
              target.effects = target.effects.filter((effect) => {
                if (effect.isItemEffect) {
                  console.log(
                    `Efek ${effect.name} pada ${target.name} dinonaktifkan oleh EMP`
                  );
                  if (effect.onRemove) effect.onRemove(target);
                  return false;
                }
                return true;
              });

              // Mark as item-disabled
              target.itemDisabled = true;
            },
            onRemove: function (target) {
              console.log(`Efek EMP pada ${target.name} telah berakhir`);
              target.itemDisabled = false;
            },
            visual: {
              type: "electricity",
              color: "#0088ff",
              intensity: 0.7,
            },
          });
        });

        // Visual effect for the caster
        ball.addEffect({
          name: "EMPCaster",
          duration: 1.5,
          visual: {
            type: "explosion",
            color: "#0088ff",
            radius: 150,
            duration: 1.5,
          },
        });
      },
    },
    {
      id: "double_strike",
      name: "Double Strike",
      description: "Setiap tumbukan memberikan damage dua kali",
      color: "#ffaa00",
      icon: "⚔️",
      effect: function (ball) {
        const duration = 6 * (ball.itemDurationMultiplier || 1);

        ball.addEffect({
          name: "DoubleStrike",
          duration: duration,
          isItemEffect: true,
          onApply: function (target) {
            console.log(
              `${target.name} mendapatkan Double Strike selama ${duration} detik!`
            );
            target.doubleStrike = true;
          },
          onRemove: function (target) {
            console.log(
              `Efek Double Strike pada ${target.name} telah berakhir`
            );
            target.doubleStrike = false;
          },
          visual: {
            type: "duplicateShadow",
            color: "#ffaa00",
            offset: 10,
          },
        });
      },
    },
    {
      id: "phase_shift",
      name: "Phase Shift",
      description:
        "Memungkinkan bola menembus dinding arena (tapi tetap terkena damage jika bersentuhan dengan bola lain)",
      color: "#aa00ff",
      icon: "👻",
      effect: function (ball) {
        const duration = 4 * (ball.itemDurationMultiplier || 1);

        ball.addEffect({
          name: "PhaseShift",
          duration: duration,
          isItemEffect: true,
          onApply: function (target) {
            console.log(
              `${target.name} mendapatkan Phase Shift selama ${duration} detik!`
            );
            target.phaseShift = true;
            target.opacity = 0.6;
          },
          onRemove: function (target) {
            console.log(`Efek Phase Shift pada ${target.name} telah berakhir`);
            target.phaseShift = false;
            target.opacity = 1.0;

            // Pastikan bola kembali ke dalam arena jika masih di luar
            const arena = target.arena;
            if (arena) {
              if (target.x < target.radius) target.x = target.radius;
              if (target.x > arena.width - target.radius)
                target.x = arena.width - target.radius;
              if (target.y < target.radius) target.y = target.radius;
              if (target.y > arena.height - target.radius)
                target.y = arena.height - target.radius;
            }
          },
          visual: {
            type: "phaseEffect",
            color: "#aa00ff",
            opacity: 0.6,
          },
        });
      },
    },
  ],
};

/**
 * Class Item - Mewakili item yang dapat diambil oleh bola
 */
class Item {
  /**
   * Membuat instance item baru
   * @param {string} type - Tipe item (ATTRIBUTE, SPECIAL, ARENA, SUPER)
   * @param {number} x - Posisi X item
   * @param {number} y - Posisi Y item
   * @param {Object} [arena] - Referensi ke arena (opsional)
   */
  constructor(type, x, y, arena) {
    // Pilih item secara acak dari tipe yang ditentukan
    this.itemType = type;
    this.itemData = this.selectRandomItem(type);

    // Posisi
    this.x = x;
    this.y = y;

    // Properti fisik
    this.radius = ITEM_CONSTANTS.DEFAULT_RADIUS;
    this.color = this.itemData.color;
    this.icon = this.itemData.icon;

    // Referensi arena
    this.arena = arena;

    // Timer untuk despawn
    this.despawnTimer = ITEM_CONSTANTS.DESPAWN_TIME;

    // Visual effects
    this.pulsePhase = 0;
    this.opacity = 1.0;
  }

  /**
   * Memilih item secara acak dari kategori tertentu
   * @param {string} type - Tipe item (ATTRIBUTE, SPECIAL, ARENA, SUPER)
   * @returns {Object} Data item yang dipilih
   */
  selectRandomItem(type) {
    const itemsList = ITEMS[type];
    if (!itemsList || itemsList.length === 0) {
      console.error(`Invalid item type: ${type}`);
      return ITEMS.ATTRIBUTE[0]; // Fallback ke item pertama dari ATTRIBUTE
    }

    const randomIndex = Math.floor(Math.random() * itemsList.length);
    return itemsList[randomIndex];
  }

  /**
   * Update state item berdasarkan waktu yang berlalu
   * @param {number} deltaTime - Waktu yang berlalu sejak update terakhir (dalam detik)
   * @returns {boolean} True jika item masih aktif, false jika harus dihapus
   */
  update(deltaTime) {
    // Update despawn timer
    this.despawnTimer -= deltaTime;

    // Update visual effects
    this.pulsePhase += deltaTime * 3;

    // Fade out effect saat mendekati despawn
    if (this.despawnTimer < 2) {
      this.opacity = this.despawnTimer / 2;
    }

    // Return false when item should be removed
    return this.despawnTimer > 0;
  }

  /**
   * Render item ke canvas
   * @param {CanvasRenderingContext2D} ctx - Context canvas
   */
  render(ctx) {
    // Save context state
    ctx.save();

    // Apply pulse effect
    const pulse = 1 + 0.1 * Math.sin(this.pulsePhase);
    const displayRadius = this.radius * pulse;

    // Draw item with opacity
    ctx.globalAlpha = this.opacity;

    // Draw item background
    ctx.beginPath();
    ctx.arc(this.x, this.y, displayRadius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Draw item border
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    // Draw item icon (if unicode emoji)
    if (this.icon) {
      const fontSize = displayRadius * 1.2;
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.icon, this.x, this.y);
    }

    // Restore context state
    ctx.restore();
  }

  /**
   * Aplikasikan efek item pada bola
   * @param {Object} ball - Bola yang mengambil item
   * @param {Array} opponents - Array bola lawan (untuk item yang perlu mempengaruhi lawan)
   */
  applyEffect(ball, opponents) {
    // Check if ball has item disabled effect
    if (ball.itemDisabled) {
      console.log(
        `${ball.name} tidak dapat menggunakan item karena dinonaktifkan oleh EMP!`
      );
      return;
    }

    // Apply the item effect
    if (this.itemData.effect) {
      this.itemData.effect(ball, opponents, this.arena);
    }

    console.log(`${ball.name} mengambil item: ${this.itemData.name}`);
  }
}

/**
 * ItemSpawner - Mengelola spawn item dalam arena
 */
const ItemSpawner = {
  // Timer untuk spawn item berikutnya
  spawnTimer: 0,

  // List item aktif dalam arena
  activeItems: [],

  /**
   * Inisialisasi spawner dengan arena
   * @param {Object} arena - Referensi ke arena game
   */
  init: function (arena) {
    this.arena = arena;
    this.spawnTimer = ITEM_CONSTANTS.SPAWN_INTERVAL / 2; // Spawn item pertama lebih cepat
    this.activeItems = [];
  },

  /**
   * Update state spawner dan semua item aktif
   * @param {number} deltaTime - Waktu yang berlalu sejak update terakhir (dalam detik)
   * @param {Array} balls - Array bola untuk pengecekan collision
   */
  update: function (deltaTime, balls) {
    // Update spawn timer
    this.spawnTimer -= deltaTime;

    // Spawn item baru jika timer habis
    if (this.spawnTimer <= 0) {
      this.spawnItem();
      this.spawnTimer = ITEM_CONSTANTS.SPAWN_INTERVAL;
    }

    // Update items aktif
    this.updateItems(deltaTime, balls);
  },

  /**
   * Update semua item aktif dan periksa collision dengan bola
   * @param {number} deltaTime - Waktu yang berlalu sejak update terakhir (dalam detik)
   * @param {Array} balls - Array bola untuk pengecekan collision
   */
  updateItems: function (deltaTime, balls) {
    const itemsToKeep = [];

    for (let i = 0; i < this.activeItems.length; i++) {
      const item = this.activeItems[i];

      // Update item
      if (item.update(deltaTime)) {
        // Check for collision with any ball
        let collisionOccurred = false;

        for (let j = 0; j < balls.length; j++) {
          const ball = balls[j];

          if (this.checkCollision(item, ball)) {
            // Apply item effect
            const opponents = balls.filter((b) => b !== ball);
            item.applyEffect(ball, opponents);

            collisionOccurred = true;
            break;
          }
        }

        // Keep item if no collision occurred
        if (!collisionOccurred) {
          itemsToKeep.push(item);
        }
      }
    }

    // Update active items list
    this.activeItems = itemsToKeep;
  },

  /**
   * Spawn item baru pada posisi acak dalam arena
   */
  spawnItem: function () {
    // Pilih tipe item berdasarkan probabilitas
    const itemType = this.selectItemType();

    // Tentukan posisi acak dalam arena
    const position = this.getRandomSpawnPosition();

    // Buat item baru
    const newItem = new Item(itemType, position.x, position.y, this.arena);

    // Tambahkan ke list item aktif
    this.activeItems.push(newItem);

    console.log(
      `Item baru ditambahkan: ${newItem.itemData.name} (${itemType})`
    );
  },

  /**
   * Pilih tipe item berdasarkan probabilitas
   * @returns {string} Tipe item (ATTRIBUTE, SPECIAL, ARENA, SUPER)
   */
  selectItemType: function () {
    const roll = Math.random() * 100;
    const probs = ITEM_CONSTANTS.PROBABILITIES;

    if (roll < probs.ATTRIBUTE) {
      return "ATTRIBUTE";
    } else if (roll < probs.ATTRIBUTE + probs.SPECIAL) {
      return "SPECIAL";
    } else if (roll < probs.ATTRIBUTE + probs.SPECIAL + probs.ARENA) {
      return "ARENA";
    } else {
      return "SUPER";
    }
  },

  /**
   * Dapatkan posisi acak untuk spawn item baru
   * @returns {Object} Posisi {x, y}
   */
  getRandomSpawnPosition: function () {
    const margin = ITEM_CONSTANTS.DEFAULT_RADIUS * 2;

    if (this.arena) {
      // Use arena-provided method if available
      if (typeof this.arena.getRandomPosition === "function") {
        return this.arena.getRandomPosition(margin);
      }

      // Fallback to manual calculation
      return {
        x: margin + Math.random() * (this.arena.width - margin * 2),
        y: margin + Math.random() * (this.arena.height - margin * 2),
      };
    }

    // Default values if arena not available
    return {
      x: 100 + Math.random() * 600,
      y: 100 + Math.random() * 400,
    };
  },

  /**
   * Periksa collision antara item dan bola
   * @param {Object} item - Item yang diperiksa
   * @param {Object} ball - Bola yang diperiksa
   * @returns {boolean} True jika terjadi collision
   */
  checkCollision: function (item, ball) {
    const dx = item.x - ball.x;
    const dy = item.y - ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < item.radius + ball.radius;
  },

  /**
   * Render semua item aktif
   * @param {CanvasRenderingContext2D} ctx - Context canvas
   */
  render: function (ctx) {
    for (let i = 0; i < this.activeItems.length; i++) {
      this.activeItems[i].render(ctx);
    }
  },

  /**
   * Reset spawner state
   */
  reset: function () {
    this.spawnTimer = ITEM_CONSTANTS.SPAWN_INTERVAL / 2;
    this.activeItems = [];
  },
};

// Ekspos class dan objek ke window agar bisa diakses dari file lain
window.Item = Item;
window.ItemSpawner = ItemSpawner;
window.ITEMS = ITEMS;
