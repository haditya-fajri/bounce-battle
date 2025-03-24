/**
 * Name Generator System for Bounce Battle
 * Mengkonversi nama menjadi atribut dan kemampuan unik untuk bola
 */

// Konstanta untuk tiering dan ranges
const NAME_GENERATOR = {
  // Range tiering dan kemungkinan untuk passive abilities
  PASSIVE_TIER_CHANCES: {
    Common: 50, // 50% chance
    Uncommon: 30, // 30% chance
    Rare: 15, // 15% chance
    Epic: 4, // 4% chance
    Legendary: 1, // 1% chance
  },

  // Range atribut (persentase)
  ATTRIBUTE_RANGES: {
    hp: { min: 10, max: 40 }, // Health Points
    attack: { min: 10, max: 40 }, // Attack Power
    defense: { min: 10, max: 40 }, // Defense
    speed: { min: 10, max: 40 }, // Speed
  },

  // Kata-kata khusus yang memberikan bonus
  SPECIAL_WORDS: [
    // Mitos dan deity
    "zeus",
    "thor",
    "gaia",
    "apollo",
    "titan",
    "atlas",
    "odin",
    "athena",
    "ares",
    // Matematika
    "pi",
    "phi",
    "omega",
    "alpha",
    "beta",
    "gamma",
    "delta",
    "sigma",
    "infinity",
    // Kecepatan
    "flash",
    "sonic",
    "dash",
    "bolt",
    "swift",
    "quick",
    "speedy",
    "rapid",
    "velocity",
    // Kekuatan
    "hulk",
    "titan",
    "giant",
    "mega",
    "ultra",
    "power",
    "force",
    "strong",
    "mighty",
  ],

  // Power score boundaries
  POWER_SCORE: {
    min: 60, // Minimum power score
    normal: 100, // Standard power score
    max: 150, // Maximum regular power score
    extreme: 175, // Extreme rare maximum
  },
};

/**
 * Menganalisis karakteristik nama untuk menentukan atribut dan passive ability
 * @param {string} name - Nama bola
 * @returns {Object} Hasil analisis dengan atribut, tier passive ability, dan power score
 */
function analyzeNameCharacteristics(name) {
  // Default values jika nama kosong
  if (!name || name.trim().length === 0) {
    return getDefaultCharacteristics();
  }

  // Normalisasi nama
  const normalizedName = name.trim();

  // Konversi nama menjadi hash number menggunakan algoritma hash
  const nameHash = generateNameHash(normalizedName);

  // Hitung faktor nama (jumlah vokal, konsonan, dll)
  const nameFactors = calculateNameFactors(normalizedName);

  // Hitung kualitas nama berdasarkan pola khusus
  const nameQuality = calculateNameQuality(normalizedName, nameFactors);

  // Tentukan power score berdasarkan kualitas nama
  const powerScore = calculatePowerScore(nameQuality, nameFactors);

  // Distribusikan atribut berdasarkan karakteristik nama
  const attributes = calculateAttributeDistribution(
    normalizedName,
    nameHash,
    nameFactors,
    powerScore
  );

  // Tentukan tier passive ability berdasarkan kualitas nama
  const passiveTier = determinePassiveTier(nameQuality, nameFactors);

  return {
    powerScore: powerScore,
    attributes: attributes,
    passiveTier: passiveTier,
    nameFactors: nameFactors,
  };
}

/**
 * Mendapatkan nilai default untuk karakteristik bola
 * @returns {Object} Karakteristik default
 */
function getDefaultCharacteristics() {
  return {
    powerScore: NAME_GENERATOR.POWER_SCORE.min,
    attributes: {
      hp: 25,
      attack: 25,
      defense: 25,
      speed: 25,
    },
    passiveTier: "Common",
    nameFactors: {
      vowels: 0,
      consonants: 0,
      numbers: 0,
      specialChars: 0,
      isPalindrome: false,
      repetitions: 0,
      hasSpecialWord: false,
      nameQuality: 0,
    },
  };
}

/**
 * Menghasilkan hash numerik dari nama menggunakan algoritma hash sederhana
 * Atau menggunakan CryptoJS jika tersedia
 * @param {string} name - Nama yang akan di-hash
 * @returns {number} Nilai hash
 */
function generateNameHash(name) {
  // Jika CryptoJS tersedia, gunakan itu untuk hash yang lebih baik
  if (window.CryptoJS) {
    try {
      // Gunakan SHA-256 untuk hash yang lebih konsisten
      const hash = CryptoJS.SHA256(name).toString();
      // Konversi 10 karakter pertama dari hex ke decimal
      return parseInt(hash.substring(0, 10), 16);
    } catch (e) {
      console.warn("CryptoJS error, falling back to simple hash algorithm");
      return simpleHash(name);
    }
  }

  // Fallback ke algoritma hash sederhana jika CryptoJS tidak tersedia
  return simpleHash(name);
}

/**
 * Algoritma hash sederhana untuk string
 * @param {string} str - String yang akan di-hash
 * @returns {number} Nilai hash
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Menghitung berbagai faktor dari nama (vokal, konsonan, dll)
 * @param {string} name - Nama untuk dianalisis
 * @returns {Object} Faktor-faktor nama
 */
function calculateNameFactors(name) {
  const lowerName = name.toLowerCase();

  // Hitung vokal dan konsonan
  const vowels = (lowerName.match(/[aeiou]/gi) || []).length;
  const consonants = lowerName.replace(/[^a-z]/gi, "").length - vowels;

  // Hitung angka dan karakter khusus
  const numbers = (lowerName.match(/[0-9]/g) || []).length;
  const specialChars = (lowerName.match(/[^a-z0-9]/gi) || []).length;

  // Cek apakah palindrome
  const isPalindrome = checkPalindrome(lowerName);

  // Hitung repetisi karakter (misalnya 'aaa')
  const repetitions = countCharRepetitions(lowerName);

  // Cek apakah mengandung kata khusus
  const hasSpecialWord = checkSpecialWords(lowerName);

  return {
    vowels: vowels,
    consonants: consonants,
    numbers: numbers,
    specialChars: specialChars,
    isPalindrome: isPalindrome,
    repetitions: repetitions,
    hasSpecialWord: hasSpecialWord,
    nameLength: name.length,
  };
}

/**
 * Mengecek apakah string adalah palindrome (sama jika dibaca dari belakang)
 * @param {string} str - String yang akan dicek
 * @returns {boolean} True jika palindrome
 */
function checkPalindrome(str) {
  // Preprocess string, hapus non-alphanumeric
  const processed = str.replace(/[^a-z0-9]/gi, "").toLowerCase();
  const reversed = processed.split("").reverse().join("");
  return processed === reversed;
}

/**
 * Menghitung repetisi karakter dalam string
 * @param {string} str - String yang akan dicek
 * @returns {number} Nilai repetisi
 */
function countCharRepetitions(str) {
  let repetitions = 0;
  let currentChar = "";
  let currentCount = 1;

  for (let i = 0; i < str.length; i++) {
    if (str[i] === currentChar) {
      currentCount++;
      if (currentCount === 3) {
        repetitions++;
      } else if (currentCount > 3) {
        repetitions += 0.5; // Tambahan untuk repetisi yang lebih panjang
      }
    } else {
      currentChar = str[i];
      currentCount = 1;
    }
  }

  return repetitions;
}

/**
 * Memeriksa apakah nama mengandung kata-kata khusus
 * @param {string} name - Nama yang akan diperiksa
 * @returns {boolean} True jika mengandung kata khusus
 */
function checkSpecialWords(name) {
  for (let i = 0; i < NAME_GENERATOR.SPECIAL_WORDS.length; i++) {
    if (name.indexOf(NAME_GENERATOR.SPECIAL_WORDS[i]) !== -1) {
      return true;
    }
  }
  return false;
}

/**
 * Menghitung nilai kualitas nama berdasarkan berbagai pola
 * @param {string} name - Nama yang akan dievaluasi
 * @param {Object} factors - Faktor-faktor nama dari calculateNameFactors
 * @returns {number} Nilai kualitas (0-100)
 */
function calculateNameQuality(name, factors) {
  let quality = 0;

  // Faktor 1: Panjang nama (nama pendek atau panjang bisa spesial)
  if (name.length <= 3) {
    quality += 10;
  } else if (name.length >= 15) {
    quality += 5;
  } else {
    quality += Math.min(8, name.length / 2);
  }

  // Faktor 2: Palindrome atau simetri
  if (factors.isPalindrome) {
    quality += 20;
  }

  // Faktor 3: Karakter khusus dan angka
  quality += factors.specialChars * 2;
  quality += factors.numbers * 3;

  // Faktor 4: Repetisi karakter
  quality += factors.repetitions * 5;

  // Faktor 5: Keberadaan kata-kata khusus
  if (factors.hasSpecialWord) {
    quality += 15;
  }

  // Faktor 6: Rasio vokal:konsonan mendekati golden ratio (1:1.618)
  if (factors.consonants > 0) {
    const ratio = factors.vowels / factors.consonants;
    const goldenRatio = 1 / 1.618;
    const ratioDistance = Math.abs(ratio - goldenRatio);

    if (ratioDistance < 0.1) {
      quality += 25;
    } else if (ratioDistance < 0.3) {
      quality += 10;
    }
  }

  return Math.min(100, quality);
}

/**
 * Menghitung power score berdasarkan kualitas nama
 * @param {number} nameQuality - Kualitas nama (0-100)
 * @param {Object} factors - Faktor-faktor nama
 * @returns {number} Power score (60-175)
 */
function calculatePowerScore(nameQuality, factors) {
  // Nilai default
  let powerScore = NAME_GENERATOR.POWER_SCORE.normal;

  // Faktor positif
  if (factors.isPalindrome) powerScore += 15;
  if (factors.hasSpecialWord) powerScore += 20;
  if (factors.nameLength <= 3) powerScore += 10;
  if (factors.repetitions > 2) powerScore += 15;

  // Faktor negatif
  if (factors.nameLength > 20) powerScore -= 10;
  if (factors.specialChars > 5) powerScore -= 15;

  // Batasi power score dalam range yang diizinkan
  powerScore = Math.max(
    NAME_GENERATOR.POWER_SCORE.min,
    Math.min(NAME_GENERATOR.POWER_SCORE.max, powerScore)
  );

  // Kasus ekstrim - peluang kecil untuk mencapai 175
  if (
    (factors.isPalindrome && factors.hasSpecialWord && nameQuality > 50) ||
    (nameQuality > 70 && Math.random() < 0.005)
  ) {
    powerScore = NAME_GENERATOR.POWER_SCORE.extreme;
  }

  return powerScore;
}

/**
 * Menghitung distribusi atribut berdasarkan karakteristik nama
 * @param {string} name - Nama bola
 * @param {number} nameHash - Hash value dari nama
 * @param {Object} factors - Faktor-faktor nama
 * @param {number} powerScore - Power score yang dihitung
 * @returns {Object} Distribusi atribut (hp, attack, defense, speed)
 */
function calculateAttributeDistribution(name, nameHash, factors, powerScore) {
  // Basis distribusi dari hash
  const hashMod = nameHash % 100;

  // Base values
  let hp = 25;
  let attack = 25;
  let defense = 25;
  let speed = 25;

  // Pengaruh vokal (meningkatkan HP dan Defense)
  const vowelFactor = factors.vowels / name.length;
  hp += vowelFactor * 20;
  defense += vowelFactor * 15;

  // Pengaruh konsonan (meningkatkan Attack dan Speed)
  const consonantFactor = factors.consonants / name.length;
  attack += consonantFactor * 20;
  speed += consonantFactor * 15;

  // Pengaruh angka (meningkatkan semua atribut sedikit)
  if (factors.numbers > 0) {
    const numBoost = factors.numbers * 2;
    hp += numBoost;
    attack += numBoost;
    defense += numBoost;
    speed += numBoost;
  }

  // Pengaruh karakter khusus
  if (factors.specialChars > 0) {
    const boost = factors.specialChars * 1.5;
    // Distribusikan boost secara acak
    const random = nameHash % 4;
    switch (random) {
      case 0:
        hp += boost;
        break;
      case 1:
        attack += boost;
        break;
      case 2:
        defense += boost;
        break;
      case 3:
        speed += boost;
        break;
    }
  }

  // Pengaruh hash untuk randomisasi tambahan
  hp += (hashMod % 10) - 5;
  attack += ((hashMod >> 1) % 10) - 5;
  defense += ((hashMod >> 2) % 10) - 5;
  speed += ((hashMod >> 3) % 10) - 5;

  // Pengaruh kata khusus
  if (factors.hasSpecialWord) {
    // Cek kata khusus mana yang ada
    for (let word of NAME_GENERATOR.SPECIAL_WORDS) {
      if (name.toLowerCase().includes(word)) {
        // Berbeda kata khusus memberi boost ke attribute yang berbeda
        if (["zeus", "thor", "odin", "ares"].includes(word)) {
          attack += 10; // Dewa perang/petir -> attack boost
        } else if (["gaia", "atlas", "titan", "hulk"].includes(word)) {
          hp += 10; // Dewa bumi/titan -> HP boost
        } else if (["athena", "shield", "guard"].includes(word)) {
          defense += 10; // Dewa kebijaksanaan/pelindung -> defense boost
        } else if (["flash", "sonic", "dash", "swift", "bolt"].includes(word)) {
          speed += 10; // Kata kecepatan -> speed boost
        } else {
          // Kata khusus lainnya, boost semua atribut sedikit
          hp += 3;
          attack += 3;
          defense += 3;
          speed += 3;
        }
        break; // Hanya ambil pengaruh dari satu kata khusus
      }
    }
  }

  // Sesuaikan berdasarkan power score
  const powerFactor = powerScore / NAME_GENERATOR.POWER_SCORE.normal;
  hp *= powerFactor;
  attack *= powerFactor;
  defense *= powerFactor;
  speed *= powerFactor;

  // Normalisasi total menjadi 100%
  const total = hp + attack + defense + speed;
  hp = Math.round((hp / total) * 100);
  attack = Math.round((attack / total) * 100);
  defense = Math.round((defense / total) * 100);
  speed = Math.round((speed / total) * 100);

  // Koreksi untuk memastikan total 100%
  let adjustedTotal = hp + attack + defense + speed;
  if (adjustedTotal < 100) {
    hp += 100 - adjustedTotal;
  } else if (adjustedTotal > 100) {
    hp -= adjustedTotal - 100;
  }

  return { hp, attack, defense, speed };
}

/**
 * Menentukan tier passive ability berdasarkan karakteristik nama
 * @param {number} nameQuality - Kualitas nama (0-100)
 * @param {Object} factors - Faktor-faktor nama
 * @returns {string} Tier passive ability (Common, Uncommon, Rare, Epic, Legendary)
 */
function determinePassiveTier(nameQuality, factors) {
  // Base chance untuk setiap tier
  const baseChances = NAME_GENERATOR.PASSIVE_TIER_CHANCES;

  // Bonus berdasarkan kualitas nama
  let qualityBonus = 0;
  if (nameQuality > 60) qualityBonus = 20;
  else if (nameQuality > 40) qualityBonus = 10;
  else if (nameQuality > 20) qualityBonus = 5;

  // Bonus untuk kata spesial atau palindrom
  if (factors.hasSpecialWord) qualityBonus += 15;
  if (factors.isPalindrome) qualityBonus += 10;

  // Bonus/penalti untuk panjang nama
  if (factors.nameLength <= 3) {
    qualityBonus += 15; // Nama pendek punya peluang lebih tinggi untuk tier ekstrim
  }

  // Hitung peluang final
  const legendaryChance = Math.min(
    15,
    baseChances.Legendary + qualityBonus * 0.2
  );
  const epicChance = Math.min(25, baseChances.Epic + qualityBonus * 0.5);
  const rareChance = Math.min(35, baseChances.Rare + qualityBonus * 0.8);
  const uncommonChance = Math.min(
    50,
    baseChances.Uncommon + qualityBonus * 0.5
  );

  // Roll untuk menentukan tier
  const roll = Math.random() * 100;

  if (roll < legendaryChance) {
    return "Legendary";
  } else if (roll < legendaryChance + epicChance) {
    return "Epic";
  } else if (roll < legendaryChance + epicChance + rareChance) {
    return "Rare";
  } else if (
    roll <
    legendaryChance + epicChance + rareChance + uncommonChance
  ) {
    return "Uncommon";
  } else {
    return "Common";
  }
}

/**
 * Menghasilkan warna bola berdasarkan atribut dan tier
 * @param {Object} ballData - Data bola dengan atribut dan tier
 * @returns {string} Warna dalam format CSS
 */
function generateBallColor(ballData) {
  const tier = ballData.passiveTier;
  let hue,
    saturation = 80,
    lightness = 60;

  // Tentukan range hue berdasarkan tier
  switch (tier) {
    case "Legendary":
      hue = Math.random() * 30; // Merah (0-30)
      saturation = 90;
      lightness = 50;
      break;
    case "Epic":
      hue = 270 + Math.random() * 60; // Ungu (270-330)
      saturation = 85;
      lightness = 55;
      break;
    case "Rare":
      hue = 210 + Math.random() * 60; // Biru (210-270)
      break;
    case "Uncommon":
      hue = 90 + Math.random() * 60; // Hijau (90-150)
      break;
    case "Common":
    default:
      hue = 180 + Math.random() * 60; // Cyan (180-240)
      break;
  }

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Ekspos fungsi-fungsi untuk digunakan oleh modul lain
window.NameGenerator = {
  analyzeNameCharacteristics,
  generateBallColor,
  CONSTANTS: NAME_GENERATOR,
};
