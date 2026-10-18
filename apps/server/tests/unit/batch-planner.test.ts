import { describe, expect, it } from "vitest";
import { planBatches, type PlanBatchesInput } from "../../src/modules/generation/planning/batch-planner.js";

describe("Deterministic Batch Planner", () => {
  it("divides 50 questions with maxBatchSize 17 into [17, 17, 16]", () => {
    const input: PlanBatchesInput = {
      totalQuestions: 50,
      maxBatchSize: 17,
      topics: [
        { name: "Topic A", questionCount: 20 },
        { name: "Topic B", questionCount: 20 },
        { name: "Topic C", questionCount: 10 },
      ],
    };

    const batches = planBatches(input);

    expect(batches).toHaveLength(3);
    expect(batches[0].plannedQuestionCount).toBe(17);
    expect(batches[1].plannedQuestionCount).toBe(17);
    expect(batches[2].plannedQuestionCount).toBe(16);

    const totalPlanned = batches.reduce((acc, b) => acc + b.plannedQuestionCount, 0);
    expect(totalPlanned).toBe(50);
  });

  it("handles a single batch when totalQuestions <= maxBatchSize", () => {
    const input: PlanBatchesInput = {
      totalQuestions: 10,
      maxBatchSize: 17,
      topics: [
        { name: "Topic A", questionCount: 6 },
        { name: "Topic B", questionCount: 4 },
      ],
    };

    const batches = planBatches(input);

    expect(batches).toHaveLength(1);
    expect(batches[0].batchNumber).toBe(1);
    expect(batches[0].plannedQuestionCount).toBe(10);
    expect(batches[0].topicAllocation).toEqual([
      { topicName: "Topic A", questionCount: 6 },
      { topicName: "Topic B", questionCount: 4 },
    ]);
  });

  it("correctly splits topics across batch boundaries without losing slots", () => {
    const input: PlanBatchesInput = {
      totalQuestions: 50,
      maxBatchSize: 17,
      topics: [
        { name: "Topic Alpha", questionCount: 25 },
        { name: "Topic Beta", questionCount: 25 },
      ],
    };

    const batches = planBatches(input);

    expect(batches).toHaveLength(3);
    expect(batches[0].batchNumber).toBe(1);
    expect(batches[1].batchNumber).toBe(2);
    expect(batches[2].batchNumber).toBe(3);

    // Sum across batches for Alpha and Beta
    let alphaCount = 0;
    let betaCount = 0;

    for (const b of batches) {
      const sumInBatch = b.topicAllocation.reduce((acc, t) => acc + t.questionCount, 0);
      expect(sumInBatch).toBe(b.plannedQuestionCount);
      expect(b.plannedQuestionCount).toBeLessThanOrEqual(17);

      for (const t of b.topicAllocation) {
        if (t.topicName === "Topic Alpha") alphaCount += t.questionCount;
        if (t.topicName === "Topic Beta") betaCount += t.questionCount;
      }
    }

    expect(alphaCount).toBe(25);
    expect(betaCount).toBe(25);
  });

  it("throws error when sum of topic counts does not equal totalQuestions", () => {
    const input: PlanBatchesInput = {
      totalQuestions: 20,
      maxBatchSize: 10,
      topics: [{ name: "Topic A", questionCount: 15 }],
    };

    expect(() => planBatches(input)).toThrow(/sum of topic counts.*must equal total questions/i);
  });

  it("throws error on non-positive input counts", () => {
    expect(() =>
      planBatches({
        totalQuestions: 0,
        maxBatchSize: 10,
        topics: [],
      })
    ).toThrow();
  });
});
