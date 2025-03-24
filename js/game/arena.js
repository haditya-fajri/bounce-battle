/**
 * Arena untuk Bounce Battle
 * Mengelola area tempat bola-bola bergerak dan bertabrakan
 */

class Arena {
  /**
   * Membuat instance arena baru
   * @param {number} width - Lebar arena
   * @param {number} height - Tinggi arena
   * @param {Object} options - Opsi tambahan untuk arena
   */
  constructor(width, height, options = {}) {
    this.initialWidth = width;
    this.initialHeight = height;
    this.width = width;
    this.height = height;
    this.color = options.color || "#0a0a0a";
    this.borderColor = options.borderColor || "#333333";

    // Pengaturan untuk arena yang menyempit
    this.shrinking = options.shrinking !== undefined ? options.shrinking : true;
    this.shrinkRate = options.shrinkRate || 0.01; // Persentase per detik
    this.minWidth = options.minWidth || width * 0.3;
    this.minHeight = options.minHeight || height * 0.3;

    // Posisi arena (untuk arena yang menyempit dari tengah)
    this.x = 0;
    this.y = 0;

    // Item dalam arena
    this.items = [];

    console.log("Arena created with size:", this.width, "x", this.height);
  }

  /**
   * Update state arena berdasarkan waktu yang berlalu
   * @param {number} deltaTime - Waktu yang berlalu sejak update terakhir (dalam detik)
   */
  update(deltaTime) {
    // Update ukuran arena jika shrinking diaktifkan
    if (this.shrinking) {
      this.shrink(deltaTime);
    }

    // Update item-item dalam arena
    this.updateItems(deltaTime);
  }

  /**
   * Menyempitkan arena sesuai dengan shrink rate
   * @param {number} deltaTime - Waktu yang berlalu sejak update terakhir (dalam detik)
   */
  shrink(deltaTime) {
    // Hitung pengurangan ukuran berdasarkan waktu
    const widthReduction = this.initialWidth * this.shrinkRate * deltaTime;
    const heightReduction = this.initialHeight * this.shrinkRate * deltaTime;

    // Update ukuran arena
    this.width = Math.max(this.minWidth, this.width - widthReduction);
    this.height = Math.max(this.minHeight, this.height - heightReduction);

    // Update posisi arena agar tetap berada di tengah
    this.x = (this.initialWidth - this.width) / 2;
    this.y = (this.initialHeight - this.height) / 2;
  }

  /**
   * Update semua item dalam arena
   * @param {number} deltaTime - Waktu yang berlalu sejak update terakhir (dalam detik)
   */
  updateItems(deltaTime) {
    // Implementasi update item akan ditambahkan nanti
    // ...
  }

  /**
   * Memeriksa apakah posisi tertentu berada dalam batas arena
   * @param {Object} position - Posisi yang akan diperiksa {x, y}
   * @param {number} radius - Radius objek (opsional)
   * @returns {boolean} True jika posisi dalam arena
   */
  isInBounds(position, radius = 0) {
    return (
      position.x - radius >= this.x &&
      position.x + radius <= this.x + this.width &&
      position.y - radius >= this.y &&
      position.y + radius <= this.y + this.height
    );
  }

  /**
   * Mendapatkan posisi acak dalam arena
   * @param {number} margin - Margin dari tepi arena
   * @returns {Object} Posisi acak {x, y}
   */
  getRandomPosition(margin = 0) {
    return {
      x: this.x + margin + Math.random() * (this.width - 2 * margin),
      y: this.y + margin + Math.random() * (this.height - 2 * margin),
    };
  }

  /**
   * Menambahkan item ke arena
   * @param {Object} item - Item yang akan ditambahkan
   */
  addItem(item) {
    this.items.push(item);
  }

  /**
   * Menghapus item dari arena
   * @param {Object} item - Item yang akan dihapus
   */
  removeItem(item) {
    const index = this.items.indexOf(item);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }

  /**
   * Reset arena ke ukuran dan kondisi awal
   */
  reset() {
    this.width = this.initialWidth;
    this.height = this.initialHeight;
    this.x = 0;
    this.y = 0;
    this.items = [];
  }
}

// Ekspos Arena ke window agar bisa diakses dari file lain
window.Arena = Arena;
