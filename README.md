# Bounce Battle

Bounce Battle adalah game simulasi di mana dua bola bertarung di dalam arena tertutup. Setiap bola memiliki atribut unik yang diacak berdasarkan nama yang diberikan.

## Konsep Game

- 2 bola di dalam kotak tertutup
- Bola saling memantul pada dinding kotak dan satu sama lain
- Setiap tumbukan antar bola memberikan damage
- Arena mengecil seiring berjalannya waktu untuk mempercepat pertempuran
- Setiap permainan baru menghasilkan bola dengan atribut dan passive yang diacak berdasarkan nama bola

## Fitur Utama

- **Sistem Randomisasi Berbasis Nama**: Mengkonversi nama menjadi atribut dan kemampuan unik
- **Passive Abilities**: Kemampuan khusus berdasarkan tier (Common, Uncommon, Rare, Epic, Legendary)
- **Sistem Item**: Item spawn secara berkala dalam arena untuk memberikan efek khusus
- **Sistem Comeback**: Mekanisme dinamis yang memberikan kesempatan bagi bola yang lebih lemah
- **Arena Dinamis**: Arena yang mengecil seiring waktu untuk mempercepat pertandingan

## Teknologi

- HTML5 Canvas untuk rendering
- JavaScript vanilla untuk game logic
- Matter.js untuk fisika
- Howler.js untuk audio
- CryptoJS untuk hashing nama

## Setup Pengembangan

1. Clone repository ini

   ```
   git clone https://github.com/yourusername/bounce-battle.git
   ```

2. Buka folder project

   ```
   cd bounce-battle
   ```

3. Buka `index.html` di browser Anda

4. Untuk pengembangan lebih lanjut, Anda dapat menggunakan live server
   ```
   npx live-server
   ```

## Struktur Project

```
bounce-battle/
│
├── index.html                  # File utama HTML
├── favicon.ico                 # Ikon website
│
├── assets/                     # Aset game
│   ├── audio/                  # File audio
│   ├── images/                 # Gambar dan sprite
│   └── fonts/                  # Font custom
│
├── css/                        # Style sheets
│   ├── main.css                # Style utama
│   ├── ui.css                  # Style untuk UI
│   └── animations.css          # Definisi animasi
│
├── js/                         # JavaScript files
│   ├── main.js                 # File utama, inisialisasi game
│   ├── engine/                 # Core engine (physics, renderer, loop)
│   ├── game/                   # Game logic (ball, arena, item, collision)
│   ├── systems/                # Game systems (nameGenerator, passiveAbility, etc.)
│   ├── utils/                  # Utilities (hash, math, vector, random)
│   └── ui/                     # UI components
│
├── lib/                        # Third-party libraries
│
└── README.md                   # Dokumentasi project
```

## Kontribusi

Kontribusi sangat diterima! Jika Anda ingin berkontribusi:

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan Anda (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## Pengembang

Nama Anda - [GitHub](https://github.com/yourusername)

## Acknowledgments

- Terima kasih kepada Matter.js, Howler.js, dan CryptoJS untuk libraries yang luar biasa
- Inspirasi dari berbagai battler games dan simulasi fisika
