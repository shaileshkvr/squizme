import { describe, expect, it, vi } from "vitest";
import type Groq from "groq-sdk";
import * as groqClientModule from "../../src/modules/generation/integrations/groq-client.js";
import {
  analyzeTopicsAndPlan,
  isObviousNonContent,
  TopicRejectionError,
} from "../../src/modules/generation/planning/topic-analyzer.js";

describe("isObviousNonContent (deterministic pre-flight)", () => {
  it("rejects keyboard mashing", () => {
    expect(isObviousNonContent("asdfjkl qwertyuiop")).toBe(true);
  });

  it("rejects repeated characters", () => {
    expect(isObviousNonContent("aaaaaaaaaaaaaaaaaaaaaa")).toBe(true);
    expect(isObviousNonContent("abcabcabcabcabcabcabc")).toBe(false);
  });

  it("rejects single short word", () => {
    expect(isObviousNonContent("hi")).toBe(true);
  });

  it("accepts real multi-word topics", () => {
    expect(isObviousNonContent("typescript generics and interfaces")).toBe(false);
    expect(isObviousNonContent("quantum mechanics fundamentals")).toBe(false);
  });

  it("accepts interdisciplinary topics", () => {
    expect(isObviousNonContent("bioinformatics protein folding prediction")).toBe(false);
    expect(isObviousNonContent("computational linguistics NLP transformers")).toBe(false);
    expect(isObviousNonContent("quantum computing applied to cryptography")).toBe(false);
  });

  it("accepts unusual but real cross-domain topics", () => {
    expect(isObviousNonContent("music theory and signal processing")).toBe(false);
    expect(isObviousNonContent("psychology of game design")).toBe(false);
  });
});

describe("analyzeTopicsAndPlan", () => {
  const fakeGroq = {} as Groq;

  it("returns structured topic plan for a valid topic", async () => {
    const mockOutput = JSON.stringify({
      topics: [
        { name: "Borrowing & Lifetimes", questionCount: 5 },
        { name: "Concurrency & Send/Sync", questionCount: 5 },
      ],
    });

    vi.spyOn(groqClientModule, "callGroqChat").mockResolvedValueOnce(mockOutput);

    const plan = await analyzeTopicsAndPlan(
      "Rust systems programming and memory safety",
      10,
      "learning",
      "medium",
      fakeGroq
    );

    expect(plan.totalQuestionCount).toBe(10);
    expect(plan.topics).toHaveLength(2);
    expect(plan.topics[0].name).toBe("Borrowing & Lifetimes");
    expect(plan.topics[0].questionCount).toBe(5);
    expect(plan.topics[1].questionCount).toBe(5);
  });

  it("throws TopicRejectionError for keyboard mashing without calling the LLM", async () => {
    const spy = vi.spyOn(groqClientModule, "callGroqChat");

    await expect(
      analyzeTopicsAndPlan("asdfjkl qwertyuiop zxcvbnm", 10, "learning", "medium", fakeGroq)
    ).rejects.toThrow(TopicRejectionError);

    // The LLM should never be called for obvious non-content
    expect(spy).not.toHaveBeenCalled();
  });

  it("includes rejection code and message under 50 chars", async () => {
    try {
      await analyzeTopicsAndPlan("aaaaaaaaaaaaaaaaaaaaaa", 10, "learning", "medium", fakeGroq);
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(TopicRejectionError);
      const rej = err as TopicRejectionError;
      expect(rej.code).toBe("TOPIC_REJECTED");
      expect(rej.message.length).toBeLessThanOrEqual(50);
    }
  });

  it("passes unusual cross-domain topics through to the LLM", async () => {
    const mockOutput = JSON.stringify({
      topics: [
        { name: "Quantum Mechanics Basics", questionCount: 5 },
        { name: "Biological Photosynthesis", questionCount: 5 },
      ],
    });

    vi.spyOn(groqClientModule, "callGroqChat").mockResolvedValueOnce(mockOutput);

    const plan = await analyzeTopicsAndPlan(
      "quantum physics and photosynthesis energy transfer",
      10,
      "learning",
      "medium",
      fakeGroq
    );

    expect(plan.totalQuestionCount).toBe(10);
    expect(plan.topics).toHaveLength(2);
  });

  it("falls back to single topic on network/parse failure", async () => {
    vi.spyOn(groqClientModule, "callGroqChat").mockRejectedValueOnce(
      new Error("Groq upstream timeout")
    );

    const plan = await analyzeTopicsAndPlan(
      "Microbiology and cellular structure overview",
      10,
      "learning",
      "medium",
      fakeGroq
    );

    expect(plan.totalQuestionCount).toBe(10);
    expect(plan.topics).toHaveLength(1);
    expect(plan.topics[0].questionCount).toBe(10);
    expect(plan.topics[0].name).toBe("Microbiology and cellular structure overview");
  });
});
