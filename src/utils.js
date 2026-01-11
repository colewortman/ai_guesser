// utils.js

// Returns a random selection of unique pairs from the given array
export function getRandomPairs(pairs) {
  if (pairs.length <= 10) return [...pairs];

  const arr = [...pairs];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 10);
}
