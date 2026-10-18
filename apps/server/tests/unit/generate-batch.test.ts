import { describe, expect, it, vi } from "vitest";
import type Groq from "groq-sdk";
import * as groqClientModule from "../../src/modules/generation/integrations/groq-client.js";
import {
  generateBatchQuestions,
  type BatchGenerationContext,
} from "../../src/modules/generation/question-generation/generate-batch.js";

describe("Batch Generation with Targeted Replacement", () => {
  const fakeGroq = {} as Groq;

  const context: BatchGenerationContext = {
    prompt: "Cellular Biology",
    mode: "learning",
    difficulty: "medium",
    batchNumber: 1,
    plannedTopics: [
      { topicName: "Mitochondria", questionCount: 2 },
      { topicName: "Nucleus", questionCount: 1 },
    ],
    previousQuestionPrompts: [],
  };

  it("completes on first attempt when all questions pass validation", async () => {
    const mockOutput = JSON.stringify({
      questions: [
        {
          prompt: "Mitochondria function?",
          topic: "Mitochondria",
          options: [
            { text: "Energy generation", isCorrect: true },
            { text: "Protein synthesis", isCorrect: false },
          ],
        },
        {
          prompt: "Mitochondria DNA presence?",
          topic: "Mitochondria",
          options: [
            { text: "Contains circular mtDNA", isCorrect: true },
            { text: "No DNA present", isCorrect: false },
          ],
        },
        {
          prompt: "Nucleus function?",
          topic: "Nucleus",
          options: [
            { text: "Houses genome", isCorrect: true },
            { text: "Digests wastes", isCorrect: false },
          ],
        },
      ],
    });

    vi.spyOn(groqClientModule, "callGroqChat").mockResolvedValueOnce(mockOutput);

    const questions = await generateBatchQuestions(context, fakeGroq);

    expect(questions).toHaveLength(3);
    expect(questions.filter((q) => q.topic === "Mitochondria")).toHaveLength(2);
    expect(questions.filter((q) => q.topic === "Nucleus")).toHaveLength(1);
  });

  it("performs targeted retry when one question fails and succeeds on repair attempt", async () => {
    // Attempt 1: Mitochondria has 1 good, 1 invalid question (duplicate options); Nucleus has 1 good
    const attempt1 = JSON.stringify({
      questions: [
        {
          prompt: "Mitochondria function?",
          topic: "Mitochondria",
          options: [
            { text: "Energy generation", isCorrect: true },
            { text: "Protein synthesis", isCorrect: false },
          ],
        },
        {
          prompt: "Invalid question with duplicate options",
          topic: "Mitochondria",
          options: [
            { text: "Same choice", isCorrect: true },
            { text: "Same choice", isCorrect: false },
          ],
        },
        {
          prompt: "Nucleus function?",
          topic: "Nucleus",
          options: [
            { text: "Houses genome", isCorrect: true },
            { text: "Digests wastes", isCorrect: false },
          ],
        },
      ],
    });

    // Attempt 2 (Repair): Only provides the 1 missing Mitochondria question
    const attempt2 = JSON.stringify({
      questions: [
        {
          prompt: "Mitochondria matrix function?",
          topic: "Mitochondria",
          options: [
            { text: "Hosts Krebs cycle", isCorrect: true },
            { text: "Houses ribosomes only", isCorrect: false },
          ],
        },
      ],
    });

    const callSpy = vi
      .spyOn(groqClientModule, "callGroqChat")
      .mockResolvedValueOnce(attempt1)
      .mockResolvedValueOnce(attempt2);

    const questions = await generateBatchQuestions(context, fakeGroq);

    expect(callSpy).toHaveBeenCalledTimes(2);
    expect(questions).toHaveLength(3);
  });
});
