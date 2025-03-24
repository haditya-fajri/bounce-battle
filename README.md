# Bounce Battle

A physics-based simulation game where two balls compete in a shrinking arena. Each ball gets unique attributes and abilities based on its name.

![Bounce Battle Screenshot](assets/images/ui/screenshot.png)

## Overview

Bounce Battle is a web-based game where two balls with unique abilities battle in an enclosed arena. The game features:

- A name-based attribute generation system where each name produces unique stats
- Five tiers of passive abilities: Common, Uncommon, Rare, Epic, and Legendary
- A comeback system that helps weaker balls remain competitive
- Various power-ups and items that appear in the arena
- A physics system with realistic collisions and interactions
- A Hall of Fame to track game results

## Getting Started

1. Clone the repository
2. Open `index.html` in a modern web browser
3. Enter names for both balls
4. Start the battle!

## Game Mechanics

### Name-based Attributes

Each ball has four primary attributes derived from its name:

- **HP**: Determines how much damage the ball can take
- **Attack**: Affects how much damage the ball deals on collision
- **Defense**: Reduces incoming damage
- **Speed**: Affects how fast the ball moves

The name's characteristics affect these attributes:

- Vowels increase HP and Defense
- Consonants increase Attack and Speed
- Special names (deities, mathematical terms) provide bonuses
- Palindromes and other patterns boost overall power

### Passive Abilities

Each ball receives a passive ability based on its name and tier:

- **Common**: Basic abilities with minor effects (50% chance)
- **Uncommon**: More powerful abilities with unique mechanics (30% chance)
- **Rare**: Strong abilities with significant advantages/disadvantages (15% chance)
- **Epic**: Very powerful abilities that can change gameplay drastically (4% chance)
- **Legendary**: Game-changing abilities that can turn the tide of battle (1% chance)

### Item System

Items spawn randomly in the arena and provide temporary effects when collected:

- **Attribute Items**: Boost basic attributes (attack, defense, speed, health)
- **Special Effect Items**: Provide unique effects like damage reflection or invisibility
- **Arena Manipulation Items**: Create gravity wells, vortexes, or slick areas
- **Super Items**: Rare and powerful items that can dramatically change battle dynamics

### Comeback System

To keep matches competitive, the game features a comeback system that activates when:

- There's a significant power difference between balls
- The match has been ongoing for at least 30 seconds

Comeback effects include:

- Progressive damage boost for the weaker ball
- Damage reduction for the weaker ball
- Increased speed after successful hits
- Critical hit chance
- Better item luck

## Project Structure

```
bounce-battle/
│
├── index.html                  # Main HTML file
├── favicon.ico                 # Website icon
│
├── assets/                     # Game assets
│   ├── audio/                  # Audio files
│   ├── images/                 # Images and sprites
│   └── fonts/                  # Custom fonts
│
├── css/                        # Stylesheets
│   ├── main.css                # Main styles
│   ├── ui.css                  # UI styles
│   └── animations.css          # Animation definitions
│
├── js/                         # JavaScript files
│   ├── main.js                 # Main game logic
│   │
│   ├── engine/                 # Game engine
│   │   ├── physics.js          # Physics system
│   │   ├── renderer.js         # Canvas rendering
│   │   └── loop.js             # Game loop
│   │
│   ├── game/                   # Game components
│   │   ├── ball.js             # Ball class
│   │   ├── arena.js            # Arena class
│   │   ├── item.js             # Item system
│   │   └── collision.js        # Collision handling
│   │
│   ├── systems/                # Game systems
│   │   ├── nameGenerator.js    # Name analysis
│   │   ├── passiveAbility.js   # Passive abilities
│   │   ├── comebackSystem.js   # Comeback mechanism
│   │   ├── itemSpawner.js      # Item spawning
│   │   └── storage.js          # Local storage
│   │
│   ├── utils/                  # Utilities
│   │   ├── hash.js             # Name hashing
│   │   ├── math.js             # Math helpers
│   │   ├── vector.js           # Vector operations
│   │   └── random.js           # RNG utilities
│   │
│   ├── ui/                     # UI components
│   │   ├── menu.js             # Menu handling
│   │   └── ...                 # Other UI modules
│   │
│   └── test/                   # Tests
│       └── integrationTest.js  # Integration testing
│
└── lib/                        # Third-party libraries
    ├── matter.min.js           # Physics library
    ├── howler.min.js           # Audio library
    └── crypto-js.min.js        # For name hashing
```

## Customization

### Adding New Passive Abilities

Add new passive abilities in `js/systems/passiveAbility.js`:

```javascript
// Example: Adding a new Epic tier passive
PASSIVE_ABILITIES.Epic.push({
  name: "Time Warp",
  description: "Periodically slows time for all other entities",
  onInit: function (ball) {
    ball.timeWarpCooldown = 0;
  },
  onUpdate: function (ball, deltaTime, opponents) {
    // Implementation
  },
  onCollision: null,
});
```

### Adding New Items

Add new items in `js/game/item.js`:

```javascript
// Example: Adding a new Arena manipulation item
ITEMS.ARENA.push({
  id: "time_bubble",
  name: "Time Bubble",
  description: "Creates a zone where time flows differently",
  color: "#3399ff",
  icon: "⏱️",
  effect: function (ball, opponents, arena) {
    // Implementation
  },
});
```

### Modifying the Comeback System

Adjust comeback mechanics in `js/systems/comebackSystem.js`:

```javascript
// Example: Change the minimum power difference required
COMEBACK.MIN_POWER_DIFF = 40; // Default is 50
```

## Browser Compatibility

Bounce Battle works in all modern browsers that support:

- HTML5 Canvas
- ES6 JavaScript
- LocalStorage

## License

MIT License - See LICENSE file for details

## Credits

- Physics calculations inspired by [Matter.js](https://brm.io/matter-js/)
- Name analysis algorithm concepts from various procedural generation techniques
- Special thanks to all testers and contributors
