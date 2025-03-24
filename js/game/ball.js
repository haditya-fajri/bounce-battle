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

    // Generate atribut berdasarkan nama
    this.generateAttributes();

    // Setup health points
    this.maxHp = 100; // HP maksimum default
    this.hp = this.maxHp; // HP saat ini

    // Status efek
    this.effects = [];

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
    if (window.NameUtils) {
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

      // Generate passive ability berdasarkan tier
      this.generatePassiveAbility();
    } else {
      console.warn("NameUtils tidak tersedia, menggunakan atribut default");

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

    // Fallback jika MathUtils tidak tersedia - warna berdasarkan hash nama
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
   * Generate passive ability berdasarkan tier dan nama
   */
  generatePassiveAbility() {
    // Akan diimplementasikan dengan passiveAbility.js
    // Untuk sementara, tetapkan dummy passive ability
    this.passiveAbility = {
      name: `${this.passiveTier} Ability`,
      description: `A ${this.passiveTier.toLowerCase()} passive ability`,
    };
  }

  /**
   * Perbarui posisi bola berdasarkan kecepatan dan waktu yang berlalu
   * @param {number} deltaTime - Waktu yang berlalu dalam detik
   * @param {Object} arena - Objek arena dengan width dan height
   */
  update(deltaTime, arena) {
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
   * Handle tumbukan dengan dinding arena
   * @param {Object} arena - Objek arena dengan width dan height
   */
  handleWallCollision(arena) {
    // Tumbukan dengan dinding kiri
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = -this.vx * 0.9;
    }
    // Tumbukan dengan dinding kanan
    else if (this.x + this.radius > arena.width) {
      this.x = arena.width - this.radius;
      this.vx = -this.vx * 0.9;
    }

    // Tumbukan dengan dinding atas
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy = -this.vy * 0.9;
    }
    // Tumbukan dengan dinding bawah
    else if (this.y + this.radius > arena.height) {
      this.y = arena.height - this.radius;
      this.vy = -this.vy * 0.9;
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
    this.effects = this.effects.filter((effect) => {
      // Perbarui timer efek
      effect.duration -= deltaTime;

      // Kembalikan false untuk menghapus efek yang telah berakhir
      return effect.duration > 0;
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
      this.effects[existingEffectIndex] = effect;
    } else {
      // Tambahkan efek baru
      this.effects.push(effect);
    }
  }

  /**
   * Terima damage dari tumbukan atau sumber lain
   * @param {number} amount - Jumlah damage yang diterima
   * @param {Ball} [source] - Bola sumber damage (opsional)
   * @returns {boolean} True jika bola masih hidup, false jika HP <= 0
   */
  takeDamage(amount, source) {
    // Catat tumbukan dalam riwayat
    this.recordCollision(source, amount);

    // Kurangi HP
    this.hp -= amount;

    // Trigger efek visual
    this.triggerDamageEffect(amount);

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
    // Implementasi efek visual akan ditambahkan nanti
    // Misalnya flash warna, perubahan ukuran, dll.
  }

  /**
   * Pulihkan HP
   * @param {number} amount - Jumlah HP yang dipulihkan
   */
  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  /**
   * Render bola ke canvas
   * @param {CanvasRenderingContext2D} ctx - Context canvas
   */
  render(ctx) {
    // Render trail jika aktif
    this.renderTrail(ctx);

    // Render bola
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Render efek aktif
    this.renderEffects(ctx);

    // Render nama di atas bola
    ctx.font = "12px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(this.name, this.x, this.y - this.radius - 5);
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
   */
  renderEffects(ctx) {
    // Implementasi rendering efek status
    // Akan diimplementasikan nanti
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

// Expose Ball class untuk digunakan oleh modul lain
window.Ball = Ball;
