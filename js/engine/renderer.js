/**
 * Renderer untuk Bounce Battle
 * Menangani rendering semua elemen game ke canvas
 */

const Renderer = {
  // Canvas context
  ctx: null,

  // Ukuran canvas
  width: 0,
  height: 0,

  /**
   * Menginisialisasi renderer
   * @param {HTMLCanvasElement} canvas - Elemen canvas yang akan digunakan untuk render
   */
  init: function (canvas) {
    this.ctx = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
    console.log(
      "Renderer initialized with canvas size:",
      this.width,
      "x",
      this.height
    );
  },

  /**
   * Membersihkan seluruh canvas
   */
  clear: function () {
    this.ctx.clearRect(0, 0, this.width, this.height);
  },

  /**
   * Menggambar background arena
   * @param {Object} arena - Objek arena dengan properti width, height, dan warna
   */
  drawArena: function (arena) {
    // Gambar background
    this.ctx.fillStyle = arena.color || "#0a0a0a";
    this.ctx.fillRect(0, 0, arena.width, arena.height);

    // Gambar batas arena (opsional)
    this.ctx.strokeStyle = "#333333";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, 0, arena.width, arena.height);
  },

  /**
   * Menggambar bola
   * @param {Object} ball - Objek bola dengan properti x, y, radius, color
   */
  drawBall: function (ball) {
    this.ctx.beginPath();
    this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = ball.color;
    this.ctx.fill();

    // Menggambar outline bola
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Menggambar nama bola di atas bola
    if (ball.name) {
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "12px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(ball.name, ball.x, ball.y - ball.radius - 5);
    }

    // Menggambar efek-efek visual lain jika ada
    this.drawBallEffects(ball);
  },

  /**
   * Menggambar efek-efek visual pada bola (trail, particles, dll)
   * @param {Object} ball - Objek bola dengan properti efek
   */
  drawBallEffects: function (ball) {
    // Gambar trail jika diaktifkan
    if (
      ball.trailEffect &&
      ball.trailEffect.active &&
      ball.trailEffect.positions.length > 1
    ) {
      this.ctx.beginPath();
      this.ctx.moveTo(
        ball.trailEffect.positions[0].x,
        ball.trailEffect.positions[0].y
      );

      for (let i = 1; i < ball.trailEffect.positions.length; i++) {
        this.ctx.lineTo(
          ball.trailEffect.positions[i].x,
          ball.trailEffect.positions[i].y
        );
      }

      this.ctx.strokeStyle = ball.trailEffect.color || ball.color;
      this.ctx.globalAlpha = ball.trailEffect.opacity || 0.5;
      this.ctx.lineWidth = ball.radius / 2;
      this.ctx.stroke();
      this.ctx.globalAlpha = 1.0; // Reset opacity
    }
  },

  /**
   * Menggambar item di arena
   * @param {Object} item - Objek item dengan properti x, y, radius, color, type
   */
  drawItem: function (item) {
    this.ctx.beginPath();
    this.ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = item.color || "#ffcc00";
    this.ctx.fill();

    // Tambahkan icon atau label sesuai jenis item
    if (item.type) {
      this.ctx.fillStyle = "#000000";
      this.ctx.font = "10px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(item.type.charAt(0).toUpperCase(), item.x, item.y + 3);
    }
  },

  /**
   * Menggambar health bar di atas bola
   * @param {Object} ball - Objek bola dengan properti hp dan maxHp
   */
  drawHealthBar: function (ball) {
    const barWidth = ball.radius * 2;
    const barHeight = 5;
    const x = ball.x - ball.radius;
    const y = ball.y - ball.radius - 10;

    // Background health bar
    this.ctx.fillStyle = "#333333";
    this.ctx.fillRect(x, y, barWidth, barHeight);

    // Foreground health bar (representing current health)
    const healthPercentage = ball.hp / ball.maxHp;
    this.ctx.fillStyle = this.getHealthColor(healthPercentage);
    this.ctx.fillRect(x, y, barWidth * healthPercentage, barHeight);
  },

  /**
   * Mendapatkan warna berdasarkan persentase health
   * @param {number} percentage - Persentase health (0-1)
   * @returns {string} Warna dalam format CSS
   */
  getHealthColor: function (percentage) {
    if (percentage > 0.6) return "#4caf50"; // Green
    if (percentage > 0.3) return "#ffc107"; // Yellow
    return "#f44336"; // Red
  },

  /**
   * Menggambar UI game
   * @param {Object} gameState - State game dengan informasi yang akan ditampilkan
   */
  drawUI: function (gameState) {
    // Tampilkan waktu permainan
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "center";

    const minutes = Math.floor(gameState.elapsedTime / 60);
    const seconds = Math.floor(gameState.elapsedTime % 60);
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    this.ctx.fillText(formattedTime, this.width / 2, 30);

    // Tampilkan informasi tambahan jika dibutuhkan
    // ...
  },

  /**
   * Menggambar efek saat terjadi collision
   * @param {Object} position - Posisi collision {x, y}
   * @param {number} intensity - Intensitas collision (0-1)
   */
  drawCollisionEffect: function (position, intensity) {
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, 5 + intensity * 15, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * intensity})`;
    this.ctx.fill();
  },
};

// Ekspos Renderer ke window agar bisa diakses dari file lain
window.Renderer = Renderer;
