import { describe, expect, it } from "vitest";
import { shuffleArray } from "../../src/modules/generation/jobs/job.repository.js";

describe("Fisher-Yates Shuffle Utility", () => {
  it("handles empty arrays and single-element arrays without error", () => {
    expect(shuffleArray([])).toEqual([]);
    expect(shuffleArray([42])).toEqual([42]);
  });

  it("preserves all elements and length without mutating the original array", () => {
    const original = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10"];
    const originalCopy = [...original];

    const shuffled = shuffleArray(original);

    // Original array must not be mutated
    expect(original).toEqual(originalCopy);

    // Shuffled array must contain the exact same elements
    expect(shuffled).toHaveLength(original.length);
    expect([...shuffled].sort()).toEqual([...original].sort());
  });

  it("preserves option properties and correct answers when shuffling options", () => {
    const options = [
      { id: "A", text: "Alpha", isCorrect: true },
      { id: "B", text: "Beta", isCorrect: false },
      { id: "C", text: "Gamma", isCorrect: false },
      { id: "D", text: "Delta", isCorrect: false },
    ];

    const shuffled = shuffleArray(options);
    expect(shuffled).toHaveLength(4);

    const correctOptions = shuffled.filter((o) => o.isCorrect);
    expect(correctOptions).toHaveLength(1);
    expect(correctOptions[0].text).toBe("Alpha");
  });
});
