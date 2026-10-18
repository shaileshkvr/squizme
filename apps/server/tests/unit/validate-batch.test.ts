import { describe, expect, it } from "vitest";
import {
  validateBatchQuestions,
  type RawGeneratedQuestion,
} from "../../src/modules/generation/validation/validate-batch.js";

describe("Batch Validation Pipeline", () => {
  const expectedTopics = [
    { topicName: "Mitochondria", questionCount: 2 },
    { topicName: "Chloroplasts", questionCount: 1 },
  ];

  it("accepts valid questions meeting all business rules", () => {
    const questions: RawGeneratedQuestion[] = [
      {
        prompt: "What is the primary function of mitochondria?",
        topic: "Mitochondria",
        options: [
          { text: "ATP synthesis", isCorrect: true },
          { text: "Protein degradation", isCorrect: false },
          { text: "Lipid packaging", isCorrect: false },
          { text: "DNA transcription only", isCorrect: false },
        ],
        explanation: "Mitochondria generate ATP through oxidative phosphorylation.",
      },
      {
        prompt: "Where does the citric acid cycle occur?",
        topic: "Mitochondria",
        options: [
          { text: "Mitochondrial matrix", isCorrect: true },
          { text: "Outer membrane", isCorrect: false },
        ],
      },
    ];

    const result = validateBatchQuestions({
      questions,
      expectedTopics,
    });

    expect(result.accepted).toHaveLength(2);
    expect(result.rejected).toHaveLength(0);
    expect(result.topicCounts["Mitochondria"]).toBe(2);
  });

  it("rejects questions with duplicate option texts", () => {
    const questions: RawGeneratedQuestion[] = [
      {
        prompt: "Identify the organelle:",
        topic: "Mitochondria",
        options: [
          { text: "Ribosome", isCorrect: true },
          { text: "ribosome", isCorrect: false }, // Duplicate
        ],
      },
    ];

    const result = validateBatchQuestions({
      questions,
      expectedTopics,
    });

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0].reason).toMatch(/duplicate option text/i);
  });

  it("rejects questions with multiple or zero correct options", () => {
    const questions: RawGeneratedQuestion[] = [
      {
        prompt: "Question with no correct option:",
        topic: "Mitochondria",
        options: [
          { text: "Option A", isCorrect: false },
          { text: "Option B", isCorrect: false },
        ],
      },
      {
        prompt: "Question with two correct options:",
        topic: "Mitochondria",
        options: [
          { text: "Option A", isCorrect: true },
          { text: "Option B", isCorrect: true },
        ],
      },
    ];

    const result = validateBatchQuestions({
      questions,
      expectedTopics,
    });

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(2);
    expect(result.rejected[0].reason).toMatch(/exactly 1 correct option/i);
    expect(result.rejected[1].reason).toMatch(/exactly 1 correct option/i);
  });

  it("rejects question prompts that duplicate previously accepted questions", () => {
    const previousPrompts = ["What is photosynthesis?"];
    const questions: RawGeneratedQuestion[] = [
      {
        prompt: "what is photosynthesis?  ", // Duplicate (normalized)
        topic: "Chloroplasts",
        options: [
          { text: "Energy conversion", isCorrect: true },
          { text: "Cell respiration", isCorrect: false },
        ],
      },
    ];

    const result = validateBatchQuestions({
      questions,
      expectedTopics,
      previousQuestionPrompts: previousPrompts,
    });

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0].reason).toMatch(/duplicates a previously accepted question/i);
  });

  it("rejects questions assigned to topics not in planned batch", () => {
    const questions: RawGeneratedQuestion[] = [
      {
        prompt: "What is Golgi apparatus?",
        topic: "Golgi", // Not in planned topics
        options: [
          { text: "Protein packaging", isCorrect: true },
          { text: "ATP creation", isCorrect: false },
        ],
      },
    ];

    const result = validateBatchQuestions({
      questions,
      expectedTopics,
    });

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0].reason).toMatch(/not in the planned batch topics/i);
  });
});
