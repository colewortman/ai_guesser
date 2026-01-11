import { getRandomPairs } from "./utils";

const samplePairs = Array.from({ length: 20 }, (_, i) => `pair${i + 1}`);

test("getRandomPairs returns 10 unique pairs when more than 10 are available", () => {
  const result = getRandomPairs(samplePairs);
  expect(result.length).toBe(10);
});

test("getRandomPairs returns all pairs when 10 or fewer are available", () => {
  const smallSample = samplePairs.slice(0, 8);
  const result = getRandomPairs(smallSample);
  expect(result.length).toBe(8);
});

test("does not mutate the original array", () => {
  const original = [...samplePairs];
  getRandomPairs(samplePairs);
  expect(samplePairs).toEqual(original);
});

// Test could fail occasionally due to randomness, but very unlikely
test("returns random pairs", () => {
  const firstRun = getRandomPairs(samplePairs);
  const secondRun = getRandomPairs(samplePairs);
  expect(firstRun).not.toEqual(secondRun);
});
