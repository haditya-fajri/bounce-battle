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
  lastUpdateTime: 0,
  gameEntities: [],
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
  loadAssets();

  console.log("Bounce Battle initialized successfully!");
}

// Fungsi untuk mengatur ukuran canvas
function resizeCanvas() {
  const container = document.getElementById("game-container");
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;

  // Perbarui ukuran arena jika sedang dalam game
  if (gameState.arena) {
    gameState.arena.initialWidth = canvas.width;
    gameState.arena.initialHeight = canvas.height;
    gameState.arena.width = canvas.width;
    gameState.arena.height = canvas.height;
  }
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
    .addEventListener("input", updateBall1Preview);
  document
    .getElementById("ball2-name")
    .addEventListener("input", updateBall2Preview);
}

// Load aset game (sounds, images, etc)
function loadAssets() {
  // Untuk implementasi sederhana ini, kita akan menunda load asset yang sebenarnya
  console.log("Loading game assets...");

  // Simulasi loading assets
  setTimeout(() => {
    console.log("Assets loaded successfully!");
  }, 500);
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
    startGameLoop();
  }

  // Jika beralih dari layar game, hentikan game loop
  if (screenName !== "game" && gameState.isGameRunning) {
    gameState.isGameRunning = false;
    stopGameLoop();
  }
}

const ballPassives = {
  ball1: null,
  ball2: null,
};

// Completely separate and simplified update functions for each ball
function updateBall1Preview() {
  const ball1Name = document.getElementById("ball1-name").value.trim();
  if (!ball1Name) return;

  // Generate attributes
  const ballData = window.NameGenerator.analyzeNameCharacteristics(ball1Name);

  // Get color
  const color = window.NameGenerator.generateBallColor(ballData);
  document.getElementById("ball1-preview").style.backgroundColor = color;

  // Select passive ability only for ball 1
  const passiveAbility = selectPassiveAbility(ball1Name, ballData.passiveTier);
  ballPassives.ball1 = passiveAbility;

  // Ensure ball attributes are valid numbers - add safety checks
  const safeAttributes = ensureValidAttributes(ballData.attributes);

  // Update UI with safe values
  updateBallStatsUI(
    "ball1-stats",
    {
      ...ballData,
      attributes: safeAttributes,
    },
    passiveAbility
  );
}

function updateBall2Preview() {
  const ball2Name = document.getElementById("ball2-name").value.trim();
  if (!ball2Name) return;

  // Generate attributes
  const ballData = window.NameGenerator.analyzeNameCharacteristics(ball2Name);

  // Get color
  const color = window.NameGenerator.generateBallColor(ballData);
  document.getElementById("ball2-preview").style.backgroundColor = color;

  // Select passive ability only for ball 2
  const passiveAbility = selectPassiveAbility(ball2Name, ballData.passiveTier);
  ballPassives.ball2 = passiveAbility;

  // Ensure ball attributes are valid numbers - add safety checks
  const safeAttributes = ensureValidAttributes(ballData.attributes);

  // Update UI with safe values
  updateBallStatsUI(
    "ball2-stats",
    {
      ...ballData,
      attributes: safeAttributes,
    },
    passiveAbility
  );
}

function ensureValidAttributes(attributes) {
  // Set default values if attributes doesn't exist
  if (!attributes) {
    return {
      hp: 25,
      attack: 25,
      defense: 25,
      speed: 25,
    };
  }

  // Process each attribute to ensure it's a valid number
  return {
    hp: isNaN(attributes.hp) ? 25 : attributes.hp,
    attack: isNaN(attributes.attack) ? 25 : attributes.attack,
    defense: isNaN(attributes.defense) ? 25 : attributes.defense,
    speed: isNaN(attributes.speed) ? 25 : attributes.speed,
  };
}

function updateBallStatsUI(statsId, ballData, passiveAbility) {
  const statsElement = document.getElementById(statsId);

  // Ensure power score is a valid number
  const powerScore = isNaN(ballData.powerScore) ? 100 : ballData.powerScore;

  // Extract attributes with safety checks
  const hp = ballData.attributes.hp;
  const attack = ballData.attributes.attack;
  const defense = ballData.attributes.defense;
  const speed = ballData.attributes.speed;

  // Double-check passive ability
  if (!passiveAbility) {
    passiveAbility = {
      name: "Unknown",
      description: "Unknown passive ability",
      tier: "Common",
    };
  }

  // Make sure tier exists
  const tier = passiveAbility.tier || "Common";

  statsElement.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Power Score:</span>
      <span class="stat-value">${powerScore}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">HP:</span>
      <span class="stat-value">${hp}%</span>
      <div class="stat-bar">
        <div class="stat-bar-fill" style="width: ${hp}%;"></div>
      </div>
    </div>
    <div class="stat-item">
      <span class="stat-label">Attack:</span>
      <span class="stat-value">${attack}%</span>
      <div class="stat-bar">
        <div class="stat-bar-fill" style="width: ${attack}%;"></div>
      </div>
    </div>
    <div class="stat-item">
      <span class="stat-label">Defense:</span>
      <span class="stat-value">${defense}%</span>
      <div class="stat-bar">
        <div class="stat-bar-fill" style="width: ${defense}%;"></div>
      </div>
    </div>
    <div class="stat-item">
      <span class="stat-label">Speed:</span>
      <span class="stat-value">${speed}%</span>
      <div class="stat-bar">
        <div class="stat-bar-fill" style="width: ${speed}%;"></div>
      </div>
    </div>
    <div class="passive-ability">
      <span class="passive-tier ${tier.toLowerCase()}">${tier}</span>
      <span class="passive-name">${passiveAbility.name}</span>
      <div class="passive-desc">${passiveAbility.description}</div>
    </div>
  `;
}

// Function to select passive ability without side effects
function selectPassiveAbility(name, tier) {
  // Safety check
  if (!window.PassiveAbility || !window.PassiveAbility.ABILITIES) {
    console.warn("PassiveAbility system not available");
    return {
      name: "Unknown",
      description: "Unknown passive ability",
      tier: "Common",
    };
  }

  // Default to Common tier if tier is invalid
  tier = tier || "Common";

  // Make sure the requested tier exists
  const tierAbilities =
    window.PassiveAbility.ABILITIES[tier] ||
    window.PassiveAbility.ABILITIES.Common;

  // Safety check for empty ability arrays
  if (!tierAbilities || tierAbilities.length === 0) {
    console.warn("No abilities found for tier:", tier);
    return {
      name: "Unknown",
      description: "Unknown passive ability",
      tier: tier,
    };
  }

  // Generate a consistent index based on name
  let nameHash = 0;
  for (let i = 0; i < name.length; i++) {
    nameHash = name.charCodeAt(i) + ((nameHash << 5) - nameHash);
  }
  nameHash = Math.abs(nameHash);

  const index = nameHash % tierAbilities.length;
  const ability = tierAbilities[index];

  // Check if we got a valid ability
  if (!ability || !ability.name) {
    console.warn("Invalid ability selected");
    return {
      name: "Unknown",
      description: "Unknown passive ability",
      tier: tier,
    };
  }

  // Return a new object with just the display properties
  return {
    name: ability.name,
    description: ability.description,
    tier: tier,
  };
}

function debugNameGenerator() {
  try {
    // Try calling with a test name
    const testName = "TestBall";
    console.log("Testing NameGenerator with name:", testName);

    // Check if NameGenerator exists
    if (!window.NameGenerator) {
      console.error("NameGenerator not found in window object");
      return;
    }

    // Check if the analyze function exists
    if (typeof window.NameGenerator.analyzeNameCharacteristics !== "function") {
      console.error(
        "analyzeNameCharacteristics function not found in NameGenerator"
      );
      return;
    }

    // Try to get attributes
    const result = window.NameGenerator.analyzeNameCharacteristics(testName);
    console.log("Result from NameGenerator:", result);

    // Check attributes
    if (!result.attributes) {
      console.error("No attributes returned from NameGenerator");
    } else {
      console.log("Attributes:", result.attributes);
      console.log("HP is NaN?", isNaN(result.attributes.hp));
      console.log("Attack is NaN?", isNaN(result.attributes.attack));
      console.log("Defense is NaN?", isNaN(result.attributes.defense));
      console.log("Speed is NaN?", isNaN(result.attributes.speed));
    }
  } catch (error) {
    console.error("Error in debugNameGenerator:", error);
  }
}

const ballDataCache = {
  ball1: null,
  ball2: null,
};

// Memperbarui preview bola berdasarkan nama yang dimasukkan
function updateBallPreview() {
  // Get the active input element to determine which ball to update
  const activeElement = document.activeElement;

  if (activeElement && activeElement.id === "ball2-name") {
    // Only update ball 2 if ball 2's input is active
    updateBall2Preview();
  } else if (activeElement && activeElement.id === "ball1-name") {
    // Only update ball 1 if ball 1's input is active
    updateBall1Preview();
  } else {
    // If neither is specifically active, update both independently
    updateBall1Preview();
    updateBall2Preview();
  }

  // Enable/disable start button
  const ball1Name = document.getElementById("ball1-name").value.trim();
  const ball2Name = document.getElementById("ball2-name").value.trim();
  document.getElementById("start-battle-btn").disabled = !(
    ball1Name && ball2Name
  );
}

function generateBallData(name) {
  // Use NameGenerator to get attributes based on name
  const nameAnalysis = window.NameGenerator.analyzeNameCharacteristics(name);

  // Get the color
  const color = window.NameGenerator.generateBallColor(nameAnalysis);

  // Determine passive ability for this ball
  let passiveAbility = { name: "Unknown", description: "Unknown" };

  if (window.PassiveAbility && window.PassiveAbility.ABILITIES) {
    // Get available abilities for this tier
    const tierAbilities =
      window.PassiveAbility.ABILITIES[nameAnalysis.passiveTier];
    if (tierAbilities && tierAbilities.length > 0) {
      // Use name hash to select ability deterministically
      const nameHash = window.NameUtils.simpleHash(name);
      const abilityIndex = nameHash % tierAbilities.length;
      // Deep clone the ability to ensure no shared state
      const selectedAbility = tierAbilities[abilityIndex];
      passiveAbility = {
        name: selectedAbility.name,
        description: selectedAbility.description,
        tier: nameAnalysis.passiveTier,
        // Don't include functions in preview data
      };
    }
  }

  // Return a complete data object for this ball
  return {
    name: name,
    color: color,
    powerScore: nameAnalysis.powerScore,
    attributes: { ...nameAnalysis.attributes }, // Clone to prevent shared reference
    passiveTier: nameAnalysis.passiveTier,
    passiveAbility: passiveAbility,
  };
}

function updateBallUI(previewId, statsId, ballData) {
  // Update preview color
  const previewElement = document.getElementById(previewId);
  previewElement.style.backgroundColor = ballData.color;

  // Update stats display
  const statsElement = document.getElementById(statsId);
  statsElement.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Power Score:</span>
      <span class="stat-value">${ballData.powerScore}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">HP:</span>
      <span class="stat-value">${ballData.attributes.hp}%</span>
      <div class="stat-bar">
        <div class="stat-bar-fill" style="width: ${
          ballData.attributes.hp
        }%;"></div>
      </div>
    </div>
    <div class="stat-item">
      <span class="stat-label">Attack:</span>
      <span class="stat-value">${ballData.attributes.attack}%</span>
      <div class="stat-bar">
        <div class="stat-bar-fill" style="width: ${
          ballData.attributes.attack
        }%;"></div>
      </div>
    </div>
    <div class="stat-item">
      <span class="stat-label">Defense:</span>
      <span class="stat-value">${ballData.attributes.defense}%</span>
      <div class="stat-bar">
        <div class="stat-bar-fill" style="width: ${
          ballData.attributes.defense
        }%;"></div>
      </div>
    </div>
    <div class="stat-item">
      <span class="stat-label">Speed:</span>
      <span class="stat-value">${ballData.attributes.speed}%</span>
      <div class="stat-bar">
        <div class="stat-bar-fill" style="width: ${
          ballData.attributes.speed
        }%;"></div>
      </div>
    </div>
    <div class="passive-ability">
      <span class="passive-tier ${ballData.passiveTier.toLowerCase()}">${
    ballData.passiveTier
  }</span>
      <span class="passive-name">${ballData.passiveAbility.name}</span>
      <div class="passive-desc">${ballData.passiveAbility.description}</div>
    </div>
  `;
}

// Update preview untuk satu bola
function updateSingleBallPreview(name, previewId, statsId) {
  // Avoid processing empty names
  if (!name.trim()) return;

  // Use NameGenerator to get attributes and passive based on name
  const ballData = window.NameGenerator.analyzeNameCharacteristics(name);

  // Get the color for this specific ball
  const color = window.NameGenerator.generateBallColor(ballData);

  // Update the preview element's background color
  const previewElement = document.getElementById(previewId);
  previewElement.style.backgroundColor = color;

  // Get passive ability for this specific ball based on its name and tier
  let passiveAbility = { name: "Unknown", description: "Unknown" };

  if (window.PassiveAbility) {
    // Generate a deterministic passive based on the ball's name
    const tierAbilities = window.PassiveAbility.ABILITIES[ballData.passiveTier];
    if (tierAbilities) {
      // Use hash from name for this specific ball to select passive deterministically
      // Important: Use a dedicated hash for EACH ball to maintain isolation
      const nameHash = window.NameUtils.simpleHash(name);
      const abilityIndex = nameHash % tierAbilities.length;
      passiveAbility = tierAbilities[abilityIndex];
    }
  }

  // Update stats display for this specific ball
  const statsElement = document.getElementById(statsId);
  statsElement.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Power Score:</span>
      <span class="stat-value">${ballData.powerScore}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">HP:</span>
      <span class="stat-value">${ballData.attributes.hp}%</span>
      <div class="stat-bar">
        <div class="stat-bar-fill" style="width: ${
          ballData.attributes.hp
        }%;"></div>
      </div>
    </div>
    <div class="stat-item">
      <span class="stat-label">Attack:</span>
      <span class="stat-value">${ballData.attributes.attack}%</span>
      <div class="stat-bar">
        <div class="stat-bar-fill" style="width: ${
          ballData.attributes.attack
        }%;"></div>
      </div>
    </div>
    <div class="stat-item">
      <span class="stat-label">Defense:</span>
      <span class="stat-value">${ballData.attributes.defense}%</span>
      <div class="stat-bar">
        <div class="stat-bar-fill" style="width: ${
          ballData.attributes.defense
        }%;"></div>
      </div>
    </div>
    <div class="stat-item">
      <span class="stat-label">Speed:</span>
      <span class="stat-value">${ballData.attributes.speed}%</span>
      <div class="stat-bar">
        <div class="stat-bar-fill" style="width: ${
          ballData.attributes.speed
        }%;"></div>
      </div>
    </div>
    <div class="passive-ability">
      <span class="passive-tier ${ballData.passiveTier.toLowerCase()}">${
    ballData.passiveTier
  }</span>
      <span class="passive-name">${passiveAbility.name}</span>
      <div class="passive-desc">${passiveAbility.description}</div>
    </div>
  `;
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

  // Tampilkan layar game
  showScreen("game");

  // Setup game
  setupGame(ball1Name, ball2Name);
}

// Setup game dengan bola yang diberi nama
function setupGame(ball1Name, ball2Name) {
  // Reset game state
  gameState.elapsedTime = 0;
  gameState.isPaused = false;
  gameState.balls = [];
  gameState.items = [];
  gameState.gameEntities = [];
  gameState.lastUpdateTime = performance.now();

  // Initialize arena
  gameState.arena = new Arena(canvas.width, canvas.height, {
    shrinking: true,
    shrinkRate: 0.01,
    color: "#0a0a0a",
  });

  // Create balls based on names
  const ball1 = createBallFromName(
    ball1Name,
    canvas.width * 0.25,
    canvas.height * 0.5
  );
  const ball2 = createBallFromName(
    ball2Name,
    canvas.width * 0.75,
    canvas.height * 0.5
  );

  // Give initial velocity
  const speed = 200;
  const angle1 = Math.random() * Math.PI * 2;
  const angle2 = Math.random() * Math.PI * 2;

  ball1.vx = Math.cos(angle1) * speed;
  ball1.vy = Math.sin(angle1) * speed;

  ball2.vx = Math.cos(angle2) * speed;
  ball2.vy = Math.sin(angle2) * speed;

  // Add balls to game state
  gameState.balls.push(ball1, ball2);

  // Initialize item spawner
  if (window.ItemSpawner) {
    ItemSpawner.init(gameState.arena);
  }

  // Update UI to show ball info
  updateGameUI();

  // Initialize renderer
  if (window.Renderer) {
    Renderer.init(canvas);
  }

  console.log("Game setup complete. Ready to start game loop.");
}

// Create ball with properties derived from name
function createBallFromName(name, x, y) {
  // Create new ball
  const ball = new Ball(name, x, y);

  // Set ball's arena reference
  ball.arena = gameState.arena;

  // Apply passive ability with complete isolation
  if (window.PassiveAbility) {
    // Completely regenerate the passive ability
    const passiveData = generateBallPassive(name, ball.passiveTier);
    ball.passiveAbility = passiveData.ability;

    // Apply the initialization effect
    if (ball.passiveAbility.onInit) {
      ball.passiveAbility.onInit(ball);
    }
  }

  // Enable trail effect
  ball.trailEffect.active = true;

  return ball;
}

function generateBallPassive(name, tier) {
  if (!window.PassiveAbility || !window.PassiveAbility.ABILITIES) {
    return {
      ability: { name: "None", description: "No passive ability" },
      index: -1,
    };
  }

  const tierAbilities =
    window.PassiveAbility.ABILITIES[tier] ||
    window.PassiveAbility.ABILITIES.Common;

  // Get deterministic index from name
  const nameHash = window.NameUtils.simpleHash(name);
  const abilityIndex = nameHash % tierAbilities.length;

  // Get the ability template
  const template = tierAbilities[abilityIndex];

  // Create a deep clone with all functions
  const ability = {
    name: template.name,
    description: template.description,
    tier: tier,
    onUpdate: template.onUpdate
      ? function (ball, deltaTime, opponents) {
          return template.onUpdate(ball, deltaTime, opponents);
        }
      : null,
    onCollision: template.onCollision
      ? function (ball, opponent, damage) {
          return template.onCollision(ball, opponent, damage);
        }
      : null,
    onInit: template.onInit
      ? function (ball) {
          return template.onInit(ball);
        }
      : null,
  };

  return {
    ability: ability,
    index: abilityIndex,
  };
}

// Update UI game dengan informasi bola
function updateGameUI() {
  if (gameState.balls.length >= 2) {
    // Update ball 1 info
    const ball1Info = document.querySelector("#ball1-info");
    const ball1 = gameState.balls[0];

    ball1Info.querySelector(".ball-name").textContent = ball1.name;
    updateHealthBar(
      ball1Info.querySelector(".health-bar"),
      ball1.hp / ball1.maxHp
    );
    ball1Info.querySelector(
      ".passive-ability"
    ).textContent = `${ball1.passiveAbility.name} (${ball1.passiveTier})`;

    // Update ball 2 info
    const ball2Info = document.querySelector("#ball2-info");
    const ball2 = gameState.balls[1];

    ball2Info.querySelector(".ball-name").textContent = ball2.name;
    updateHealthBar(
      ball2Info.querySelector(".health-bar"),
      ball2.hp / ball2.maxHp
    );
    ball2Info.querySelector(
      ".passive-ability"
    ).textContent = `${ball2.passiveAbility.name} (${ball2.passiveTier})`;
  }
}

// Update health bar UI
function updateHealthBar(barElement, percentage) {
  const fill = barElement.querySelector(".health-bar-fill") || barElement;

  if (fill) {
    fill.style.width = `${percentage * 100}%`;

    // Update color based on health percentage
    if (percentage > 0.6) {
      fill.style.backgroundColor = "#4caf50"; // Green
    } else if (percentage > 0.3) {
      fill.style.backgroundColor = "#ffc107"; // Yellow
    } else {
      fill.style.backgroundColor = "#f44336"; // Red
    }
  } else {
    // If no fill element, use pseudo-element
    barElement.style.setProperty("--health-percentage", `${percentage * 100}%`);
  }
}

// Toggle pause game
function togglePause() {
  gameState.isPaused = !gameState.isPaused;
  document.getElementById("pause-btn").textContent = gameState.isPaused
    ? "Resume"
    : "Pause";
}

// Start the game loop
function startGameLoop() {
  // Reset last update time
  gameState.lastUpdateTime = performance.now();

  // Use the GameLoop module if available
  if (window.GameLoop) {
    window.GameLoop.start(updateGame, renderGame);
  } else {
    // Fallback to requestAnimationFrame
    gameState.animFrameId = requestAnimationFrame(gameLoopFallback);
  }
}

// Stop the game loop
function stopGameLoop() {
  if (window.GameLoop) {
    window.GameLoop.stop();
  } else if (gameState.animFrameId) {
    cancelAnimationFrame(gameState.animFrameId);
    gameState.animFrameId = null;
  }
}

// Fallback game loop using requestAnimationFrame directly
function gameLoopFallback(timestamp) {
  // Calculate delta time
  const deltaTime = (timestamp - gameState.lastUpdateTime) / 1000; // Convert to seconds
  gameState.lastUpdateTime = timestamp;

  // Update
  updateGame(deltaTime);

  // Render
  renderGame();

  // Schedule next frame
  gameState.animFrameId = requestAnimationFrame(gameLoopFallback);
}

// Update game state
function updateGame(deltaTime) {
  // Skip update if game is paused
  if (gameState.isPaused) return;

  // Update elapsed time
  gameState.elapsedTime += deltaTime;

  // Update arena
  if (gameState.arena) {
    gameState.arena.update(deltaTime);
  }

  // Update balls
  for (let i = 0; i < gameState.balls.length; i++) {
    const ball = gameState.balls[i];

    // Update ball position and physics
    ball.update(deltaTime, gameState.arena);

    // Update passive ability
    if (window.PassiveAbility) {
      const opponents = gameState.balls.filter((b) => b !== ball);
      window.PassiveAbility.updatePassiveAbility(ball, deltaTime, opponents);
    }

    // Update comeback mechanics
    if (window.ComebackSystem && gameState.balls.length >= 2) {
      // Determine which ball is weaker and stronger
      const otherBall = gameState.balls[1 - i]; // Get the other ball

      if (ball.powerScore < otherBall.powerScore) {
        // Current ball is weaker, apply comeback
        window.ComebackSystem.update(
          ball,
          otherBall,
          gameState.elapsedTime,
          gameState.arena
        );
      }

      // Update momentum swing if active
      if (ball.comebackActive) {
        window.ComebackSystem.updateMomentumSwing(ball, deltaTime);
      }
    }
  }

  // Check for collisions between balls
  handleBallCollisions();

  // Update items
  if (window.ItemSpawner) {
    ItemSpawner.update(deltaTime, gameState.balls);
  }

  // Update game entities
  updateGameEntities(deltaTime);

  // Update UI
  updateGameUI();
  updateTimer();

  // Check for game over
  checkGameOver();
}

// Handle collisions between balls
function handleBallCollisions() {
  if (gameState.balls.length < 2) return;

  const ball1 = gameState.balls[0];
  const ball2 = gameState.balls[1];

  // Check for collision
  if (window.Physics && window.Physics.checkCollision(ball1, ball2)) {
    // Resolve physics collision
    const collisionResult = window.Physics.resolveCollision(ball1, ball2);

    // Apply damage
    let damage1 = collisionResult.ball1DamageDealt;
    let damage2 = collisionResult.ball2DamageDealt;

    // Apply comeback damage adjustments if active
    if (window.ComebackSystem) {
      if (ball1.comebackActive) {
        damage1 = window.ComebackSystem.applyDamageBoost(ball1, damage1);
        damage2 = window.ComebackSystem.applyDamageReduction(ball1, damage2);
        window.ComebackSystem.addMomentumStack(ball1);
      }

      if (ball2.comebackActive) {
        damage2 = window.ComebackSystem.applyDamageBoost(ball2, damage2);
        damage1 = window.ComebackSystem.applyDamageReduction(ball2, damage1);
        window.ComebackSystem.addMomentumStack(ball2);
      }
    }

    // Apply double strike if active
    if (ball1.doubleStrike) damage1 *= 2;
    if (ball2.doubleStrike) damage2 *= 2;

    // Apply damage
    let ball1Survived = ball1.takeDamage(damage2, ball2);
    let ball2Survived = ball2.takeDamage(damage1, ball1);

    // Check for passive ability effects that might prevent damage
    if (window.PassiveAbility) {
      // Let passive abilities handle collision reactions
      const ball1PassiveEffect =
        window.PassiveAbility.handleCollisionPassiveAbility(
          ball1,
          ball2,
          damage2
        );
      const ball2PassiveEffect =
        window.PassiveAbility.handleCollisionPassiveAbility(
          ball2,
          ball1,
          damage1
        );

      // If passive ability prevented death
      if (ball1PassiveEffect) ball1Survived = true;
      if (ball2PassiveEffect) ball2Survived = true;
    }

    // Adjust comeback based on damage dealt
    if (window.ComebackSystem) {
      if (ball1.comebackActive) {
        window.ComebackSystem.adjustAfterDamageDealt(ball1, ball2, damage1);
      }

      if (ball2.comebackActive) {
        window.ComebackSystem.adjustAfterDamageDealt(ball2, ball1, damage2);
      }
    }
  }
}

// Update all game entities
function updateGameEntities(deltaTime) {
  // Filter out expired entities
  gameState.gameEntities = gameState.gameEntities.filter((entity) => {
    if (typeof entity.update === "function") {
      return entity.update(deltaTime, gameState.balls);
    }
    return true;
  });
}

// Update timer display
function updateTimer() {
  const minutes = Math.floor(gameState.elapsedTime / 60);
  const seconds = Math.floor(gameState.elapsedTime % 60);

  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
  document.getElementById("timer").textContent = formattedTime;
}

// Check if game is over
function checkGameOver() {
  if (gameState.balls.length < 2) return;

  const ball1 = gameState.balls[0];
  const ball2 = gameState.balls[1];

  if (ball1.hp <= 0 || ball2.hp <= 0) {
    // Determine winner
    let winner;

    if (ball1.hp <= 0 && ball2.hp <= 0) {
      winner = null; // Draw
    } else if (ball1.hp <= 0) {
      winner = ball2;
    } else {
      winner = ball1;
    }

    // End game with result
    endGame(winner);
  }
}

// Render game
function renderGame() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Use renderer if available
  if (window.Renderer) {
    // Render arena
    if (gameState.arena) {
      Renderer.drawArena(gameState.arena);
    }

    // Render game entities
    renderGameEntities();

    // Render items
    if (window.ItemSpawner) {
      ItemSpawner.render(ctx);
    }

    // Render balls
    for (const ball of gameState.balls) {
      Renderer.drawBall(ball);
      Renderer.drawHealthBar(ball);
    }

    // Render UI
    Renderer.drawUI(gameState);
  } else {
    // Fallback rendering
    fallbackRendering();
  }
}

// Render all game entities
function renderGameEntities() {
  for (const entity of gameState.gameEntities) {
    if (typeof entity.render === "function") {
      entity.render(ctx);
    }
  }
}

// Fallback rendering if Renderer not available
function fallbackRendering() {
  // Draw black background
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw balls
  for (const ball of gameState.balls) {
    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();

    // Draw name
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(ball.name, ball.x, ball.y - ball.radius - 5);
  }
}

// End game and show results
function endGame(winner) {
  // Stop game loop
  stopGameLoop();

  // Save result to hall of fame
  saveGameResult(winner);

  // Show result screen
  showResultScreen(winner);
}

// Show the result screen
function showResultScreen(winner) {
  const winnerDisplay = document.getElementById("winner-display");
  const matchStats = document.getElementById("match-stats");

  if (winner) {
    winnerDisplay.textContent = `${winner.name} WINS!`;
    winnerDisplay.style.color = winner.color;
  } else {
    winnerDisplay.textContent = "DRAW!";
    winnerDisplay.style.color = "#ffffff";
  }

  // Create match statistics
  matchStats.innerHTML = `
    <div class="match-stat">
      <span class="stat-label">Match Time:</span>
      <span class="stat-value">${formatTime(gameState.elapsedTime)}</span>
    </div>
    ${gameState.balls
      .map(
        (ball) => `
      <div class="ball-result ${ball === winner ? "winner" : ""}">
        <div class="ball-name">${ball.name}</div>
        <div class="ball-hp">HP: ${Math.max(0, ball.hp)}/${ball.maxHp}</div>
        <div class="ball-passive">${ball.passiveAbility.name} (${
          ball.passiveTier
        })</div>
      </div>
    `
      )
      .join("")}
  `;

  // Show result screen
  showScreen("result");
}

// Format time in MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

// Save game result to Hall of Fame
function saveGameResult(winner) {
  // Get existing hall of fame data
  let hallOfFame = JSON.parse(
    localStorage.getItem("bounceBattleHallOfFame") || "[]"
  );

  // Add new result
  const result = {
    date: new Date().toISOString(),
    duration: gameState.elapsedTime,
    balls: gameState.balls.map((ball) => ({
      name: ball.name,
      powerScore: ball.powerScore,
      finalHp: Math.max(0, ball.hp),
      maxHp: ball.maxHp,
      passive: ball.passiveAbility.name,
      tier: ball.passiveTier,
      isWinner: ball === winner,
    })),
  };

  // Add to hall of fame
  hallOfFame.unshift(result);

  // Limit to 20 entries
  if (hallOfFame.length > 20) {
    hallOfFame = hallOfFame.slice(0, 20);
  }

  // Save back to local storage
  localStorage.setItem("bounceBattleHallOfFame", JSON.stringify(hallOfFame));

  console.log("Game result saved to Hall of Fame");
}

// Update hall of fame display
function updateHallOfFame() {
  const hallOfFameList = document.getElementById("hall-of-fame-list");

  // Get data from localStorage
  const hallOfFame = JSON.parse(
    localStorage.getItem("bounceBattleHallOfFame") || "[]"
  );

  if (hallOfFame.length === 0) {
    hallOfFameList.innerHTML =
      '<div class="hall-of-fame-entry"><span>Belum ada data</span></div>';
    return;
  }

  // Create HTML for each entry
  hallOfFameList.innerHTML = hallOfFame
    .map((entry, index) => {
      const winner = entry.balls.find((ball) => ball.isWinner);
      const winnerName = winner ? winner.name : "Draw";

      const dateObj = new Date(entry.date);
      const formattedDate = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`;

      return `
      <div class="hall-of-fame-entry">
        <div class="entry-header">
          <span class="entry-number">#${index + 1}</span>
          <span class="entry-date">${formattedDate}</span>
          <span class="entry-duration">${formatTime(entry.duration)}</span>
        </div>
        <div class="entry-result">
          ${entry.balls
            .map(
              (ball) => `
            <div class="entry-ball ${ball.isWinner ? "winner" : ""}">
              <span class="ball-name">${ball.name}</span>
              <span class="ball-hp">${ball.finalHp}/${ball.maxHp} HP</span>
              <span class="ball-passive">${ball.passive} (${ball.tier})</span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
    })
    .join("");
}

window.addEventListener("load", function () {
  debugNameGenerator();
});
