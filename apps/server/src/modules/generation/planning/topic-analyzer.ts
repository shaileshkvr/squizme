import type Groq from "groq-sdk";
import type { TopicPlan } from "@squizme/shared";
import { env } from "../../../config/env.js";
import { callGroqChat } from "../integrations/groq-client.js";

export async function analyzeTopicsAndPlan(
  prompt: string,
  totalQuestions: number,
  mode: string,
  difficulty: string,
  groqClient: Groq,
  sourceContext?: string
): Promise<TopicPlan> {
  const systemPrompt = `You are a curriculum architect and pedagogical planner.
Analyze the user's topic and create a topic distribution plan for a ${totalQuestions}-question quiz.

CRITICAL INVARIANTS:
1. Return ONLY a valid JSON object matching:
   {
     "topics": [
       { "name": "Topic name", "questionCount": 5 }
     ]
   }
2. The sum of all questionCount values in "topics" MUST equal EXACTLY ${totalQuestions}.
3. Create between 2 and 6 balanced topics.
4. Each questionCount must be a positive integer.`;

  const userPrompt = `Topic / Request: ${prompt}
Mode: ${mode}
Difficulty: ${difficulty}
Total Questions Required: ${totalQuestions}
${sourceContext ? `\nSource Material Context:\n${sourceContext}\n` : ""}`;

  let parsed: { topics?: Array<{ name: string; questionCount: number }> } = {};

  try {
    const raw = await callGroqChat(groqClient, {
      model: env.GROQ_MODEL_PLANNING,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    });
    parsed = JSON.parse(raw);
  } catch {
    // Fallback if model failed or invalid JSON: generate a default single/dual topic plan
    parsed = {
      topics: [{ name: prompt.slice(0, 50), questionCount: totalQuestions }],
    };
  }

  const rawTopics = Array.isArray(parsed.topics) && parsed.topics.length > 0
    ? parsed.topics
    : [{ name: prompt.slice(0, 50), questionCount: totalQuestions }];

  // Deterministic arithmetic enforcement
  // Guarantee sum equals totalQuestions exactly
  let currentSum = 0;
  const cleanedTopics = rawTopics.map((t, idx) => {
    const count = Math.max(1, Math.floor(Number(t.questionCount) || 1));
    currentSum += count;
    return {
      name: (t.name && String(t.name).trim()) || `Topic ${idx + 1}`,
      questionCount: count,
    };
  });

  const diff = totalQuestions - currentSum;
  if (diff !== 0) {
    // Add/subtract diff from the largest topic
    cleanedTopics.sort((a, b) => b.questionCount - a.questionCount);
    cleanedTopics[0].questionCount += diff;
    if (cleanedTopics[0].questionCount <= 0) {
      cleanedTopics[0].questionCount = 1;
    }
  }

  // Final sanity assertion
  const finalSum = cleanedTopics.reduce((acc, t) => acc + t.questionCount, 0);
  if (finalSum !== totalQuestions) {
    cleanedTopics[0].questionCount += totalQuestions - finalSum;
  }

  return {
    topics: cleanedTopics,
    totalQuestionCount: totalQuestions,
  };
}
