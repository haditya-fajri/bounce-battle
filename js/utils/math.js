/**
 * Utility functions for mathematical operations
 * Used throughout the game for various calculations
 */

// Clamp a value between a minimum and maximum
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Linear interpolation between two values
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Convert degrees to radians
function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

// Convert radians to degrees
function radToDeg(radians) {
  return radians * (180 / Math.PI);
}

// Calculate angle between two points
function angleBetweenPoints(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

// Calculate distance between two points
function distanceBetweenPoints(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Generate a random number between min and max
function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

// Generate a random integer between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

// Generate a random color
function randomColor() {
  return `rgb(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(
    0,
    255
  )})`;
}

// Generate a random color with a specific hue range
function randomColorInRange(hueMin, hueMax, saturation = 80, lightness = 60) {
  const hue = randomRange(hueMin, hueMax);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Map a value from one range to another
function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

// Check if a point is inside a rectangle
function pointInRect(x, y, rectX, rectY, rectWidth, rectHeight) {
  return (
    x >= rectX &&
    x <= rectX + rectWidth &&
    y >= rectY &&
    y <= rectY + rectHeight
  );
}

// Check if a point is inside a circle
function pointInCircle(x, y, circleX, circleY, circleRadius) {
  const dx = x - circleX;
  const dy = y - circleY;
  return dx * dx + dy * dy <= circleRadius * circleRadius;
}

// Calculate the normalized direction vector from point 1 to point 2
function directionVector(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: dx / length,
    y: dy / length,
  };
}

// Create a seeded random number generator
function createSeededRandom(seed) {
  let currentSeed = seed;

  // Simple implementation of a seeded random generator
  return function () {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
}

// Remap seeded random to specific range
function seededRandomRange(seededRandom, min, max) {
  return min + seededRandom() * (max - min);
}

// Remap seeded random to specific integer range
function seededRandomInt(seededRandom, min, max) {
  return Math.floor(min + seededRandom() * (max - min + 1));
}

// Expose functions to the global scope
window.MathUtils = {
  clamp,
  lerp,
  degToRad,
  radToDeg,
  angleBetweenPoints,
  distanceBetweenPoints,
  randomRange,
  randomInt,
  randomColor,
  randomColorInRange,
  mapRange,
  pointInRect,
  pointInCircle,
  directionVector,
  createSeededRandom,
  seededRandomRange,
  seededRandomInt,
};
