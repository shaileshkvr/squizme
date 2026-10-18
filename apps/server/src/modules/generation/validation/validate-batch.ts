export interface RawOption {
  id?: string;
  text: string;
  isCorrect: boolean;
}

export interface RawGeneratedQuestion {
  prompt: string;
  topic: string;
  options: RawOption[];
  explanation?: string;
}

export interface ValidatedQuestion {
  prompt: string;
  topic: string;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation?: string;
}

export interface ValidationFailure {
  question: RawGeneratedQuestion;
  reason: string;
}

export interface BatchValidationResult {
  accepted: ValidatedQuestion[];
  rejected: ValidationFailure[];
  topicCounts: Record<string, number>;
}

export interface ValidateBatchOptions {
  questions: RawGeneratedQuestion[];
  expectedTopics: Array<{ topicName: string; questionCount: number }>;
  previousQuestionPrompts?: string[];
}

export function validateSingleQuestion(
  q: RawGeneratedQuestion,
  validTopicNames: Set<string>,
  seenPromptsInRun: Set<string>,
  previousPrompts: Set<string>
): { valid: true; question: ValidatedQuestion } | { valid: false; reason: string } {
  // 1. Prompt text
  if (!q.prompt || typeof q.prompt !== "string" || q.prompt.trim().length === 0) {
    return { valid: false, reason: "Question prompt is empty" };
  }
  const normalizedPrompt = q.prompt.trim().toLowerCase();

  // 2. Topic assignment
  if (!q.topic || typeof q.topic !== "string" || !validTopicNames.has(q.topic.trim())) {
    return {
      valid: false,
      reason: `Topic '${q.topic}' is not in the planned batch topics: [${Array.from(validTopicNames).join(", ")}]`,
    };
  }

  // 3. Duplicate checks
  if (seenPromptsInRun.has(normalizedPrompt)) {
    return { valid: false, reason: "Duplicate question prompt within current batch" };
  }
  if (previousPrompts.has(normalizedPrompt)) {
    return { valid: false, reason: "Question prompt duplicates a previously accepted question" };
  }

  // 4. Options validation
  if (!Array.isArray(q.options) || q.options.length < 2) {
    return { valid: false, reason: "Question must have at least 2 options" };
  }

  const optionTexts = new Set<string>();
  let correctCount = 0;

  for (let i = 0; i < q.options.length; i++) {
    const opt = q.options[i];
    if (!opt || typeof opt.text !== "string" || opt.text.trim().length === 0) {
      return { valid: false, reason: `Option ${i + 1} text is empty` };
    }
    const normOpt = opt.text.trim().toLowerCase();
    if (optionTexts.has(normOpt)) {
      return { valid: false, reason: `Duplicate option text found: '${opt.text.trim()}'` };
    }
    optionTexts.add(normOpt);

    if (opt.isCorrect === true) {
      correctCount++;
    }
  }

  // 5. Exactly one correct answer
  if (correctCount !== 1) {
    return {
      valid: false,
      reason: `Question must have exactly 1 correct option, but found ${correctCount}`,
    };
  }

  // Build validated question with normalized options
  const validated: ValidatedQuestion = {
    prompt: q.prompt.trim(),
    topic: q.topic.trim(),
    options: q.options.map((opt, idx) => ({
      id: opt.id || String.fromCharCode(65 + idx), // A, B, C, D fallback
      text: opt.text.trim(),
      isCorrect: Boolean(opt.isCorrect),
    })),
    explanation: q.explanation?.trim() || undefined,
  };

  seenPromptsInRun.add(normalizedPrompt);
  return { valid: true, question: validated };
}

export function validateBatchQuestions(options: ValidateBatchOptions): BatchValidationResult {
  const { questions, expectedTopics, previousQuestionPrompts = [] } = options;

  const validTopicNames = new Set(expectedTopics.map((t) => t.topicName));
  const previousPrompts = new Set(
    previousQuestionPrompts.map((p) => p.trim().toLowerCase())
  );
  const seenPromptsInRun = new Set<string>();

  const accepted: ValidatedQuestion[] = [];
  const rejected: ValidationFailure[] = [];
  const topicCounts: Record<string, number> = {};

  for (const t of expectedTopics) {
    topicCounts[t.topicName] = 0;
  }

  for (const q of questions) {
    const result = validateSingleQuestion(
      q,
      validTopicNames,
      seenPromptsInRun,
      previousPrompts
    );

    if (result.valid) {
      accepted.push(result.question);
      topicCounts[result.question.topic] = (topicCounts[result.question.topic] || 0) + 1;
    } else {
      rejected.push({ question: q, reason: result.reason });
    }
  }

  return { accepted, rejected, topicCounts };
}
