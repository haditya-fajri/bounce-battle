/**
 * Utilitas untuk hashing dan konversi nama
 * Digunakan untuk mengkonversi nama menjadi nilai numerik
 * yang konsisten untuk digunakan dalam perhitungan atribut
 */

// Fungsi hash sederhana untuk mengkonversi string menjadi nilai numerik
function simpleHash(str) {
  let hash = 0;
  if (str.length === 0) return hash;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash);
}

// Fungsi hash yang lebih kompleks dengan CryptoJS (akan digunakan jika library tersedia)
function complexHash(str) {
  try {
    // Cek apakah CryptoJS tersedia
    if (typeof CryptoJS !== "undefined") {
      // Gunakan SHA-256 untuk konsistensi yang lebih baik
      const hash = CryptoJS.SHA256(str).toString();
      // Konversi 10 karakter pertama dari hex ke decimal
      return parseInt(hash.substring(0, 10), 16);
    } else {
      // Jika tidak tersedia, gunakan simpleHash sebagai fallback
      console.warn(
        "CryptoJS tidak tersedia, menggunakan simple hash sebagai fallback"
      );
      return simpleHash(str);
    }
  } catch (e) {
    console.error("Error saat melakukan hash:", e);
    return simpleHash(str);
  }
}

// Konversi string menjadi seed yang dapat digunakan untuk random generator
function stringToSeed(str) {
  return complexHash(str);
}

// Menghitung nilai "kualitas" dari sebuah nama berdasarkan berbagai pola
function calculateNameQuality(name) {
  let quality = 0;
  const lowerName = name.toLowerCase();

  // Faktor 1: Panjang nama (nama pendek atau panjang bisa spesial)
  if (name.length <= 3) quality += 10;
  else if (name.length >= 15) quality += 5;
  else quality += Math.min(8, name.length / 2);

  // Faktor 2: Palindrom atau simetri
  if (isPalindrome(lowerName)) quality += 20;

  // Faktor 3: Karakter khusus dan angka
  const specialChars = name.match(/[^a-zA-Z0-9]/g) || [];
  const numbers = name.match(/[0-9]/g) || [];
  quality += specialChars.length * 2;
  quality += numbers.length * 3;

  // Faktor 4: Repetisi karakter (misalnya "aaa")
  const repetitions = countCharRepetitions(name);
  quality += repetitions * 5;

  // Faktor 5: Keberadaan kata-kata khusus (mitologi, matematis, dll)
  const specialWords = [
    "zeus",
    "thor",
    "gaia",
    "apollo",
    "titan",
    "pi",
    "phi",
    "omega",
  ];
  for (const word of specialWords) {
    if (lowerName.includes(word)) {
      quality += 15;
      break; // Hanya tambahkan bonus sekali
    }
  }

  // Faktor 6: Rasio vokal:konsonan mendekati golden ratio (1:1.618)
  const vowels = (lowerName.match(/[aeiou]/gi) || []).length;
  const consonants = lowerName.replace(/[^a-z]/gi, "").length - vowels;
  const ratio = consonants === 0 ? 999 : vowels / consonants;
  const goldenRatio = 1.618;
  const ratioDistance = Math.abs(ratio - 1 / goldenRatio);
  if (ratioDistance < 0.1) quality += 25;
  else if (ratioDistance < 0.3) quality += 10;

  return quality;
}

// Fungsi untuk mengecek apakah string adalah palindrom
function isPalindrome(str) {
  const processed = str.replace(/[^a-z0-9]/gi, "").toLowerCase();
  const reversed = processed.split("").reverse().join("");
  return processed === reversed;
}

// Menghitung repetisi karakter dalam string
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

// Menganalisis karakteristik nama untuk menentukan atribut dan passive ability
function analyzeNameCharacteristics(name) {
  if (!name || name.length === 0) {
    return {
      powerScore: 60, // Nilai default minimum
      attributes: {
        hp: 25,
        attack: 25,
        defense: 25,
        speed: 25,
      },
      passiveTier: "Common",
      nameFactors: {},
    };
  }

  const lowerName = name.toLowerCase();
  const nameHash = complexHash(name);
  const nameQuality = calculateNameQuality(name);

  // Hitung faktor-faktor yang memengaruhi atribut
  const vowels = (lowerName.match(/[aeiou]/gi) || []).length;
  const consonants = lowerName.replace(/[^a-z]/gi, "").length - vowels;
  const numbers = (lowerName.match(/[0-9]/g) || []).length;
  const specialChars = (lowerName.match(/[^a-z0-9]/gi) || []).length;
  const nameLength = name.length;

  // Faktor tambahan
  const isPalindromeValue = isPalindrome(lowerName);
  const repetitions = countCharRepetitions(name);
  const hasSpecialWord = /zeus|thor|gaia|apollo|titan|pi|phi|omega|sirius/.test(
    lowerName
  );

  // Menghitung Power Score (60-150, atau 175 untuk kasus ekstrim)
  let powerScore = 100; // Nilai default

  // Faktor positif
  if (isPalindromeValue) powerScore += 15;
  if (hasSpecialWord) powerScore += 20;
  if (nameLength <= 3) powerScore += 10;
  if (repetitions > 2) powerScore += 15;

  // Faktor negatif
  if (nameLength > 20) powerScore -= 10;
  if (specialChars > 5) powerScore -= 15;

  // Batasi power score dalam range yang diizinkan
  powerScore = Math.max(60, Math.min(150, powerScore));

  // Kasus ekstrim - peluang kecil untuk mencapai 175
  if (
    (isPalindromeValue && hasSpecialWord && nameQuality > 50) ||
    (nameQuality > 70 && Math.random() < 0.005)
  ) {
    powerScore = 175;
  }

  // Tentukan distribusi atribut (total 100%)
  const attributeDistribution = calculateAttributeDistribution(
    name,
    nameHash,
    vowels,
    consonants,
    numbers,
    powerScore
  );

  // Tentukan tier passive ability
  const passiveTier = determinePassiveTier(
    nameQuality,
    hasSpecialWord,
    isPalindromeValue,
    nameLength
  );

  return {
    powerScore,
    attributes: attributeDistribution,
    passiveTier,
    nameFactors: {
      vowels,
      consonants,
      numbers,
      specialChars,
      isPalindrome: isPalindromeValue,
      repetitions,
      hasSpecialWord,
      nameQuality,
    },
  };
}

// Menghitung distribusi atribut berdasarkan karakteristik nama
function calculateAttributeDistribution(
  name,
  nameHash,
  vowels,
  consonants,
  numbers,
  powerScore
) {
  // Basis distribusi dari hash
  const hashMod = nameHash % 100;

  // Base values
  let hp = 25;
  let attack = 25;
  let defense = 25;
  let speed = 25;

  // Pengaruh vokal (meningkatkan HP dan Defense)
  const vowelFactor = vowels / name.length;
  hp += vowelFactor * 20;
  defense += vowelFactor * 15;

  // Pengaruh konsonan (meningkatkan Attack dan Speed)
  const consonantFactor = consonants / name.length;
  attack += consonantFactor * 20;
  speed += consonantFactor * 15;

  // Pengaruh angka (meningkatkan semua atribut sedikit)
  if (numbers > 0) {
    const numBoost = numbers * 2;
    hp += numBoost;
    attack += numBoost;
    defense += numBoost;
    speed += numBoost;
  }

  // Pengaruh hash untuk randomisasi tambahan
  hp += (hashMod % 10) - 5;
  attack += ((hashMod >> 1) % 10) - 5;
  defense += ((hashMod >> 2) % 10) - 5;
  speed += ((hashMod >> 3) % 10) - 5;

  // Sesuaikan berdasarkan power score
  const powerFactor = powerScore / 100;
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
  const adjustedTotal = hp + attack + defense + speed;
  if (adjustedTotal < 100) hp += 100 - adjustedTotal;
  else if (adjustedTotal > 100) hp -= adjustedTotal - 100;

  return { hp, attack, defense, speed };
}

// Menentukan tier passive ability berdasarkan karakteristik nama
function determinePassiveTier(
  nameQuality,
  hasSpecialWord,
  isPalindrome,
  nameLength
) {
  // Base chance untuk setiap tier
  const baseChances = {
    Common: 50,
    Uncommon: 30,
    Rare: 15,
    Epic: 4,
    Legendary: 1,
  };

  // Bonus berdasarkan kualitas nama
  let qualityBonus = 0;
  if (nameQuality > 60) qualityBonus = 20;
  else if (nameQuality > 40) qualityBonus = 10;
  else if (nameQuality > 20) qualityBonus = 5;

  // Bonus untuk kata spesial atau palindrom
  if (hasSpecialWord) qualityBonus += 15;
  if (isPalindrome) qualityBonus += 10;

  // Bonus/penalti untuk panjang nama
  if (nameLength <= 3) qualityBonus += 15; // Nama pendek punya peluang lebih tinggi untuk tier ekstrim

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

  if (roll < legendaryChance) return "Legendary";
  if (roll < legendaryChance + epicChance) return "Epic";
  if (roll < legendaryChance + epicChance + rareChance) return "Rare";
  if (roll < legendaryChance + epicChance + rareChance + uncommonChance)
    return "Uncommon";
  return "Common";
}

// Export fungsi-fungsi yang akan digunakan di file lain
window.NameUtils = {
  simpleHash,
  complexHash,
  stringToSeed,
  isPalindrome,
  calculateNameQuality,
  analyzeNameCharacteristics,
};
