/**
 * Integration Test untuk Bounce Battle
 * File ini berisi fungsi untuk menguji integrasi semua sistem game
 */

// Menjalankan test saat halaman dimuat jika URL memiliki parameter ?test=true
window.addEventListener("load", function () {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("test") === "true") {
    runIntegrationTests();
  }
});

/**
 * Menjalankan rangkaian test integrasi
 */
function runIntegrationTests() {
  console.log("=== RUNNING INTEGRATION TESTS ===");

  // Buat container untuk output test
  createTestOutputContainer();

  // Jalankan test satu per satu
  testNameGenerator()
    .then(() => testPassiveAbility())
    .then(() => testComebackSystem())
    .then(() => testItemSystem())
    .then(() => testGameLoop())
    .then(() => {
      logTestResult("ALL TESTS COMPLETED", "success");
    })
    .catch((error) => {
      logTestResult(`TEST FAILED: ${error.message}`, "error");
    });
}

/**
 * Test Name Generator system
 */
async function testNameGenerator() {
  logTestResult("Testing Name Generator...", "info");

  // Test beberapa nama dengan pola yang berbeda
  const testNames = [
    "Zeus", // Nama deity
    "racecar", // Palindrome
    "Phi", // Matematika
    "AAAAA", // Repetisi
    "Z3U5", // Kombinasi angka dan huruf
    "Test123", // Nama biasa dengan angka
  ];

  let allPassed = true;

  for (const name of testNames) {
    try {
      // Test analisis nama
      if (!window.NameGenerator) {
        throw new Error("NameGenerator not found");
      }

      const result = window.NameGenerator.analyzeNameCharacteristics(name);

      // Verifikasi result memiliki properti yang diharapkan
      if (!result.powerScore || !result.attributes || !result.passiveTier) {
        throw new Error(`Invalid result for name ${name}`);
      }

      // Verifikasi attributes memiliki total 100%
      const attrTotal =
        result.attributes.hp +
        result.attributes.attack +
        result.attributes.defense +
        result.attributes.speed;

      if (Math.abs(attrTotal - 100) > 1) {
        // Allow tiny rounding errors
        throw new Error(
          `Attributes don't sum to 100% for name ${name}. Got: ${attrTotal}`
        );
      }

      // Log hasil
      logTestResult(
        `Name: ${name} => Power: ${result.powerScore}, Tier: ${result.passiveTier}`,
        "success"
      );
    } catch (error) {
      allPassed = false;
      logTestResult(`Failed on name "${name}": ${error.message}`, "error");
    }
  }

  if (!allPassed) {
    throw new Error("Name Generator tests failed");
  }

  return true;
}

/**
 * Test Passive Ability system
 */
async function testPassiveAbility() {
  logTestResult("Testing Passive Ability System...", "info");

  try {
    // Test passive ability generation
    if (!window.PassiveAbility) {
      throw new Error("PassiveAbility not found");
    }

    // Create test ball
    const testBall = new Ball("TestBall", 100, 100);
    testBall.passiveTier = "Rare"; // Force a specific tier for testing

    // Apply passive ability
    window.PassiveAbility.applyPassiveAbility(testBall);

    // Verify passive ability was applied
    if (!testBall.passiveAbility || !testBall.passiveAbility.name) {
      throw new Error("Passive ability not applied to ball");
    }

    // Test update function
    window.PassiveAbility.updatePassiveAbility(testBall, 0.1, []);

    // Test collision handling
    const result = window.PassiveAbility.handleCollisionPassiveAbility(
      testBall,
      null,
      10
    );

    logTestResult(
      `Applied passive: ${testBall.passiveAbility.name} (${testBall.passiveTier})`,
      "success"
    );

    return true;
  } catch (error) {
    logTestResult(`Passive Ability test failed: ${error.message}`, "error");
    throw error;
  }
}

/**
 * Test Comeback System
 */
async function testComebackSystem() {
  logTestResult("Testing Comeback System...", "info");

  try {
    // Test comeback system
    if (!window.ComebackSystem) {
      throw new Error("ComebackSystem not found");
    }

    // Create two test balls with different power scores
    const weakerBall = new Ball("WeakBall", 100, 100);
    weakerBall.powerScore = 80;

    const strongerBall = new Ball("StrongBall", 200, 200);
    strongerBall.powerScore = 140;

    // Test update function
    window.ComebackSystem.update(weakerBall, strongerBall, 40, null);

    // Verify comeback was applied
    if (!weakerBall.comebackActive) {
      throw new Error("Comeback not applied to weaker ball");
    }

    // Test damage boost
    const normalDamage = 10;
    const boostedDamage = window.ComebackSystem.applyDamageBoost(
      weakerBall,
      normalDamage
    );

    if (boostedDamage <= normalDamage) {
      throw new Error("Damage boost not applied");
    }

    // Test damage reduction
    const incomingDamage = 20;
    const reducedDamage = window.ComebackSystem.applyDamageReduction(
      weakerBall,
      incomingDamage
    );

    if (reducedDamage >= incomingDamage) {
      throw new Error("Damage reduction not applied");
    }

    logTestResult(
      `Comeback active: Damage ${normalDamage} → ${boostedDamage}, Reduction ${incomingDamage} → ${reducedDamage}`,
      "success"
    );

    return true;
  } catch (error) {
    logTestResult(`Comeback System test failed: ${error.message}`, "error");
    throw error;
  }
}

/**
 * Test Item System
 */
async function testItemSystem() {
  logTestResult("Testing Item System...", "info");

  try {
    // Test item spawner
    if (!window.ItemSpawner) {
      throw new Error("ItemSpawner not found");
    }

    // Create mock arena
    const mockArena = {
      width: 800,
      height: 600,
      getRandomPosition: function (margin) {
        return {
          x: margin + Math.random() * (this.width - margin * 2),
          y: margin + Math.random() * (this.height - margin * 2),
        };
      },
    };

    // Initialize spawner
    window.ItemSpawner.init(mockArena);

    // Force spawn item
    window.ItemSpawner.spawnItem();

    // Verify item was created
    if (window.ItemSpawner.activeItems.length === 0) {
      throw new Error("Item not spawned");
    }

    const testItem = window.ItemSpawner.activeItems[0];

    // Create test ball
    const testBall = new Ball("ItemTestBall", testItem.x, testItem.y);

    // Test collision detection
    const collision = window.ItemSpawner.checkCollision(testItem, testBall);

    if (!collision) {
      throw new Error("Item collision detection failed");
    }

    // Test applying item effect
    testItem.applyEffect(testBall, []);

    logTestResult(`Item system works: ${testItem.itemData.name}`, "success");

    return true;
  } catch (error) {
    logTestResult(`Item System test failed: ${error.message}`, "error");
    throw error;
  }
}

/**
 * Test Game Loop
 */
async function testGameLoop() {
  logTestResult("Testing Game Loop...", "info");

  try {
    // Test game loop
    if (!window.GameLoop) {
      throw new Error("GameLoop not found");
    }

    // Create test update and render functions
    let updateCalled = false;
    let renderCalled = false;

    const testUpdate = function (deltaTime) {
      updateCalled = true;
    };

    const testRender = function () {
      renderCalled = true;
    };

    // Start game loop
    window.GameLoop.start(testUpdate, testRender);

    // Wait for a frame to ensure functions are called
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Stop game loop
    window.GameLoop.stop();

    // Verify functions were called
    if (!updateCalled || !renderCalled) {
      throw new Error("Game loop didn't call update or render functions");
    }

    logTestResult("Game loop works correctly", "success");

    return true;
  } catch (error) {
    logTestResult(`Game Loop test failed: ${error.message}`, "error");
    throw error;
  }
}

/**
 * Create container to display test results
 */
function createTestOutputContainer() {
  const container = document.createElement("div");
  container.id = "test-output";
  container.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 300px;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      font-family: monospace;
      padding: 10px;
      overflow-y: auto;
      z-index: 9999;
    `;

  const header = document.createElement("div");
  header.textContent = "BOUNCE BATTLE INTEGRATION TESTS";
  header.style.cssText = `
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #555;
    `;

  const resultsDiv = document.createElement("div");
  resultsDiv.id = "test-results";

  container.appendChild(header);
  container.appendChild(resultsDiv);
  document.body.appendChild(container);
}

/**
 * Log test result with color based on status
 * @param {string} message - Message to log
 * @param {string} status - Status: 'info', 'success', or 'error'
 */
function logTestResult(message, status) {
  const resultsDiv = document.getElementById("test-results");

  if (!resultsDiv) {
    console.log(`[${status.toUpperCase()}] ${message}`);
    return;
  }

  const entry = document.createElement("div");
  entry.textContent = message;

  // Style based on status
  switch (status) {
    case "success":
      entry.style.color = "#4caf50";
      console.log(`[SUCCESS] ${message}`);
      break;
    case "error":
      entry.style.color = "#f44336";
      console.error(`[ERROR] ${message}`);
      break;
    case "info":
    default:
      entry.style.color = "#2196f3";
      console.log(`[INFO] ${message}`);
      break;
  }

  resultsDiv.appendChild(entry);
  resultsDiv.scrollTop = resultsDiv.scrollHeight;
}
