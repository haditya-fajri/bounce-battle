/**
 * Bounce Battle - Main JavaScript
 * File ini berfungsi sebagai entry point utama untuk game
 */

// Game state
const gameState = {
  currentScreen: "menu",
  isGameRunning: false,
  isPaused: false,
  elapsedTime: 0,
  balls: [],
  items: [],
  arena: null,
};

// DOM Elements
const screens = {
  menu: document.getElementById("menu-screen"),
  setup: document.getElementById("setup-screen"),
  game: document.getElementById("game-screen"),
  result: document.getElementById("result-screen"),
  hallOfFame: document.getElementById("hall-of-fame-screen"),
  about: document.getElementById("about-screen"),
};

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Menginisialisasi game saat halaman dimuat
window.addEventListener("load", initGame);

function initGame() {
  // Set up canvas untuk mencocokkan ukuran parent container
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Inisialisasi UI dan event listeners
  initializeUI();

  // Load assets (akan diimplementasikan nanti)
  // loadAssets();

  console.log("Bounce Battle initialized successfully!");
}

// Fungsi untuk mengatur ukuran canvas
function resizeCanvas() {
  const container = document.getElementById("game-container");
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}

// Menginisialisasi UI dan event handlers
function initializeUI() {
  // Event listeners untuk tombol menu
  document
    .getElementById("start-game-btn")
    .addEventListener("click", () => showScreen("setup"));
  document
    .getElementById("hall-of-fame-btn")
    .addEventListener("click", () => showScreen("hallOfFame"));
  document
    .getElementById("about-btn")
    .addEventListener("click", () => showScreen("about"));

  document
    .getElementById("back-to-menu-btn")
    .addEventListener("click", () => showScreen("menu"));
  document
    .getElementById("back-from-hall-btn")
    .addEventListener("click", () => showScreen("menu"));
  document
    .getElementById("back-from-about-btn")
    .addEventListener("click", () => showScreen("menu"));
  document
    .getElementById("back-to-menu-result-btn")
    .addEventListener("click", () => showScreen("menu"));

  document
    .getElementById("start-battle-btn")
    .addEventListener("click", startGame);
  document
    .getElementById("play-again-btn")
    .addEventListener("click", () => showScreen("setup"));
  document.getElementById("pause-btn").addEventListener("click", togglePause);

  // Event listeners untuk input nama
  document
    .getElementById("ball1-name")
    .addEventListener("input", updateBallPreview);
  document
    .getElementById("ball2-name")
    .addEventListener("input", updateBallPreview);
}

// Fungsi untuk menampilkan layar tertentu dan menyembunyikan yang lain
function showScreen(screenName) {
  // Sembunyikan semua layar terlebih dahulu
  Object.values(screens).forEach((screen) => {
    screen.classList.add("hidden");
  });

  // Tampilkan layar yang dipilih
  screens[screenName].classList.remove("hidden");

  // Update game state
  gameState.currentScreen = screenName;

  // Jika beralih ke layar hall of fame, perbarui daftar
  if (screenName === "hallOfFame") {
    updateHallOfFame();
  }

  // Jika beralih ke layar game, mulai game loop
  if (screenName === "game" && !gameState.isGameRunning) {
    gameState.isGameRunning = true;
    // startGameLoop(); // Akan diimplementasikan nanti
  }

  // Jika beralih dari layar game, hentikan game loop
  if (screenName !== "game" && gameState.isGameRunning) {
    gameState.isGameRunning = false;
    // stopGameLoop(); // Akan diimplementasikan nanti
  }
}

// Memperbarui preview bola berdasarkan nama yang dimasukkan
function updateBallPreview() {
  const ball1Name = document.getElementById("ball1-name").value.trim();
  const ball2Name = document.getElementById("ball2-name").value.trim();

  // Akan diimplementasikan sepenuhnya ketika nameGenerator.js selesai
  console.log("Updating preview for balls:", ball1Name, ball2Name);

  // Preview sementara - hanya mengubah warna
  if (ball1Name) {
    const color1 = getSimpleColorFromName(ball1Name);
    document.getElementById("ball1-preview").style.backgroundColor = color1;
  }

  if (ball2Name) {
    const color2 = getSimpleColorFromName(ball2Name);
    document.getElementById("ball2-preview").style.backgroundColor = color2;
  }
}

// Fungsi sederhana untuk mendapatkan warna dari nama (akan diganti dengan sistem hash yang lebih kompleks)
function getSimpleColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}

// Memulai permainan
function startGame() {
  const ball1Name = document.getElementById("ball1-name").value.trim();
  const ball2Name = document.getElementById("ball2-name").value.trim();

  // Validasi nama
  if (!ball1Name || !ball2Name) {
    alert("Mohon masukkan nama untuk kedua bola!");
    return;
  }

  // Inisialisasi game (akan diimplementasikan lebih lanjut)
  console.log("Starting game with balls:", ball1Name, ball2Name);

  // Tampilkan layar game
  showScreen("game");

  // Setup game (akan diimplementasikan lebih lanjut)
  setupGame(ball1Name, ball2Name);
}

// Setup game dengan bola yang diberi nama
function setupGame(ball1Name, ball2Name) {
  // Reset game state
  gameState.elapsedTime = 0;
  gameState.isPaused = false;
  gameState.balls = [];
  gameState.items = [];

  // Initialize arena
  // gameState.arena = new Arena(canvas.width, canvas.height);

  // Create balls based on names (akan diimplementasikan sepenuhnya nanti)
  // const ball1 = createBallFromName(ball1Name, canvas.width * 0.25, canvas.height * 0.5);
  // const ball2 = createBallFromName(ball2Name, canvas.width * 0.75, canvas.height * 0.5);

  // gameState.balls.push(ball1, ball2);

  // Update UI to show ball info
  updateGameUI();

  // Start game loop (akan diimplementasikan nanti)
  // startGameLoop();

  console.log("Game setup complete. Ready to start game loop.");
}

// Update UI game dengan informasi bola
function updateGameUI() {
  // Implementasi sederhana, akan ditingkatkan nanti
  document.querySelector("#ball1-info .ball-name").textContent =
    document.getElementById("ball1-name").value;
  document.querySelector("#ball2-info .ball-name").textContent =
    document.getElementById("ball2-name").value;

  // Health bars dan informasi passive akan diperbarui nanti
}

// Toggle pause game
function togglePause() {
  gameState.isPaused = !gameState.isPaused;
  document.getElementById("pause-btn").textContent = gameState.isPaused
    ? "Resume"
    : "Pause";

  // Implementasi untuk menghentikan/melanjutkan game loop akan ditambahkan nanti
}

// Update hall of fame
function updateHallOfFame() {
  // Ini akan diimplementasikan sepenuhnya saat storage.js selesai
  console.log("Updating Hall of Fame display");

  // Contoh sementara
  const hallOfFameList = document.getElementById("hall-of-fame-list");
  hallOfFameList.innerHTML =
    '<div class="hall-of-fame-entry"><span>Belum ada data</span></div>';
}

// Fungsi lain yang berhubungan dengan game akan ditambahkan nanti seiring pengembangan
