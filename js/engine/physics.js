/**
 * Physics Engine untuk Bounce Battle
 * Menangani semua perhitungan fisika termasuk tumbukan dan pergerakan
 */

// Konstanta fisika
const PHYSICS = {
  GRAVITY: 0, // Tidak ada gravitasi dalam game ini
  FRICTION: 0.01, // Faktor gesekan (0 berarti tidak ada gesekan)
  RESTITUTION: 0.9, // Elastisitas tumbukan (1 berarti memantul sempurna)
  MIN_VELOCITY: 0.1, // Kecepatan minimum sebelum objek dianggap diam
  COLLISION_DAMAGE_FACTOR: 0.05, // Faktor untuk menghitung damage dari tumbukan
};

/**
 * Menghitung jarak antara dua objek lingkaran
 * @param {Object} obj1 - Objek pertama dengan properti x, y
 * @param {Object} obj2 - Objek kedua dengan properti x, y
 * @returns {number} Jarak antara pusat kedua objek
 */
function distance(obj1, obj2) {
  const dx = obj2.x - obj1.x;
  const dy = obj2.y - obj1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Memeriksa apakah terjadi tumbukan antara dua bola
 * @param {Object} ball1 - Bola pertama dengan properti x, y, radius
 * @param {Object} ball2 - Bola kedua dengan properti x, y, radius
 * @returns {boolean} True jika terjadi tumbukan
 */
function checkCollision(ball1, ball2) {
  const dist = distance(ball1, ball2);
  return dist < ball1.radius + ball2.radius;
}

/**
 * Menangani resolusi tumbukan antara dua bola
 * Menghitung dan memperbarui kecepatan bola berdasarkan hukum konservasi momentum
 * @param {Object} ball1 - Bola pertama dengan properti x, y, vx, vy, mass, radius
 * @param {Object} ball2 - Bola kedua dengan properti x, y, vx, vy, mass, radius
 * @returns {Object} Object yang berisi damage yang diberikan oleh kedua bola
 */
function resolveCollision(ball1, ball2) {
  // Hitung vektor normal dari tumbukan
  const nx = ball2.x - ball1.x;
  const ny = ball2.y - ball1.y;

  // Jarak antara bola
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Normalisasi vektor normal
  const nx_norm = nx / dist;
  const ny_norm = ny / dist;

  // Proyeksikan kecepatan ke vektor normal
  const v1n = ball1.vx * nx_norm + ball1.vy * ny_norm;
  const v2n = ball2.vx * nx_norm + ball2.vy * ny_norm;

  // Hitung kecepatan relatif
  const relativeVelocity = Math.abs(v1n - v2n);

  // Hitung kecepatan setelah tumbukan berdasarkan hukum konservasi momentum
  // dan koefisien restitusi
  const m1 = ball1.mass;
  const m2 = ball2.mass;
  const v1n_after = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
  const v2n_after = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

  // Perbarui kecepatan bola
  ball1.vx += (v1n_after - v1n) * nx_norm * PHYSICS.RESTITUTION;
  ball1.vy += (v1n_after - v1n) * ny_norm * PHYSICS.RESTITUTION;
  ball2.vx += (v2n_after - v2n) * nx_norm * PHYSICS.RESTITUTION;
  ball2.vy += (v2n_after - v2n) * ny_norm * PHYSICS.RESTITUTION;

  // Koreksi posisi untuk menghindari overlapping
  const overlap = (ball1.radius + ball2.radius - dist) / 2;
  if (overlap > 0) {
    ball1.x -= overlap * nx_norm;
    ball1.y -= overlap * ny_norm;
    ball2.x += overlap * nx_norm;
    ball2.y += overlap * ny_norm;
  }

  // Hitung damage berdasarkan kecepatan relatif dan atribut bola
  const ball1Momentum =
    relativeVelocity * ball1.mass * (ball1.attributes.attack / 100);
  const ball2Momentum =
    relativeVelocity * ball2.mass * (ball2.attributes.attack / 100);

  const ball1Damage =
    ball1Momentum *
    PHYSICS.COLLISION_DAMAGE_FACTOR *
    (1 - ball2.attributes.defense / 200);
  const ball2Damage =
    ball2Momentum *
    PHYSICS.COLLISION_DAMAGE_FACTOR *
    (1 - ball1.attributes.defense / 200);

  return {
    ball1DamageDealt: Math.max(1, Math.round(ball1Damage)), // Minimum 1 damage
    ball2DamageDealt: Math.max(1, Math.round(ball2Damage)), // Minimum 1 damage
  };
}

/**
 * Memperbarui posisi dan kecepatan bola berdasarkan waktu yang berlalu
 * @param {Object} ball - Bola dengan properti x, y, vx, vy, radius
 * @param {number} deltaTime - Waktu yang berlalu dalam detik
 * @param {Object} arena - Batas arena dengan properti width, height
 */
function updateBallPosition(ball, deltaTime, arena) {
  // Perbarui posisi berdasarkan kecepatan
  ball.x += ((ball.vx * ball.attributes.speed) / 100) * deltaTime;
  ball.y += ((ball.vy * ball.attributes.speed) / 100) * deltaTime;

  // Terapkan gesekan
  ball.vx *= 1 - PHYSICS.FRICTION;
  ball.vy *= 1 - PHYSICS.FRICTION;

  // Hentikan bola jika kecepatannya terlalu kecil
  if (Math.abs(ball.vx) < PHYSICS.MIN_VELOCITY) ball.vx = 0;
  if (Math.abs(ball.vy) < PHYSICS.MIN_VELOCITY) ball.vy = 0;

  // Cek tumbukan dengan dinding
  checkWallCollision(ball, arena);
}

/**
 * Memeriksa dan menangani tumbukan bola dengan dinding arena
 * @param {Object} ball - Bola dengan properti x, y, vx, vy, radius
 * @param {Object} arena - Batas arena dengan properti width, height
 */
function checkWallCollision(ball, arena) {
  // Tumbukan dengan dinding kiri
  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.vx = -ball.vx * PHYSICS.RESTITUTION;
  }
  // Tumbukan dengan dinding kanan
  else if (ball.x + ball.radius > arena.width) {
    ball.x = arena.width - ball.radius;
    ball.vx = -ball.vx * PHYSICS.RESTITUTION;
  }

  // Tumbukan dengan dinding atas
  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.vy = -ball.vy * PHYSICS.RESTITUTION;
  }
  // Tumbukan dengan dinding bawah
  else if (ball.y + ball.radius > arena.height) {
    ball.y = arena.height - ball.radius;
    ball.vy = -ball.vy * PHYSICS.RESTITUTION;
  }
}

/**
 * Mengaplikasikan impuls (dorongan) pada bola
 * @param {Object} ball - Bola dengan properti vx, vy, mass
 * @param {number} impulseX - Komponen X dari impuls
 * @param {number} impulseY - Komponen Y dari impuls
 */
function applyImpulse(ball, impulseX, impulseY) {
  ball.vx += impulseX / ball.mass;
  ball.vy += impulseY / ball.mass;
}

/**
 * Memeriksa apakah bola mengenai item
 * @param {Object} ball - Bola dengan properti x, y, radius
 * @param {Object} item - Item dengan properti x, y, radius
 * @returns {boolean} True jika bola mengenai item
 */
function checkItemCollision(ball, item) {
  return distance(ball, item) < ball.radius + item.radius;
}

// Mengekspos fungsi-fungsi untuk digunakan oleh modul lain
window.Physics = {
  distance,
  checkCollision,
  resolveCollision,
  updateBallPosition,
  checkWallCollision,
  applyImpulse,
  checkItemCollision,
  CONSTANTS: PHYSICS,
};
