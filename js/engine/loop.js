/**
 * Game Loop untuk Bounce Battle
 * Menangani update dan render pada setiap frame
 */

// Konfigurasi game loop
const GameLoop = {
  // Waktu terakhir frame dijalankan
  lastTime: 0,

  // Flag untuk menandakan apakah game loop berjalan
  running: false,

  // Fungsi yang dipanggil untuk update game
  update: null,

  // Fungsi yang dipanggil untuk render game
  render: null,

  // ID dari requestAnimationFrame
  requestId: null,

  /**
   * Memulai game loop
   * @param {Function} updateFn - Fungsi update yang akan dipanggil setiap frame
   * @param {Function} renderFn - Fungsi render yang akan dipanggil setiap frame
   */
  start: function (updateFn, renderFn) {
    this.update = updateFn;
    this.render = renderFn;
    this.running = true;
    this.lastTime = performance.now();
    this.requestId = requestAnimationFrame(this.loop.bind(this));
    console.log("Game loop started");
  },

  /**
   * Menghentikan game loop
   */
  stop: function () {
    this.running = false;
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
      this.requestId = null;
    }
    console.log("Game loop stopped");
  },

  /**
   * Fungsi utama game loop yang dipanggil setiap frame
   * @param {number} timestamp - Waktu saat ini dalam millisecond
   */
  loop: function (timestamp) {
    // Hitung delta time (waktu yang berlalu sejak frame sebelumnya)
    const deltaTime = (timestamp - this.lastTime) / 1000; // Konversi ke detik
    this.lastTime = timestamp;

    // Batasi deltaTime maksimum untuk menghindari "spiral of death"
    // jika game berjalan sangat lambat
    const cappedDeltaTime = Math.min(deltaTime, 0.1);

    if (this.running) {
      // Update game state
      if (this.update) {
        this.update(cappedDeltaTime);
      }

      // Render game
      if (this.render) {
        this.render();
      }

      // Jadwalkan frame berikutnya
      this.requestId = requestAnimationFrame(this.loop.bind(this));
    }
  },
};

// Ekspos GameLoop ke window agar bisa diakses dari file lain
window.GameLoop = GameLoop;
