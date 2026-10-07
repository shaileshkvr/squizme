import { GroqGeneratedQuiz } from '@squizme/shared';

export interface SemanticValidationResult {
  valid: boolean;
  errors: string[];
}

const TRIVIAL_EXPLANATION_WORDS = new Set([
  'correct',
  'incorrect',
  'wrong',
  'true',
  'false',
  'right',
  'yes',
  'no',
  'n/a',
  'none'
]);

export function validateQuizSemantics(
  rawQuiz: GroqGeneratedQuiz,
  targetCount: number
): SemanticValidationResult {
  const errors: string[] = [];

  if (!rawQuiz || !Array.isArray(rawQuiz.questions)) {
    return {
      valid: false,
      errors: ['Invalid quiz object: missing questions array.']
    };
  }

  if (rawQuiz.questions.length !== targetCount) {
    errors.push(
      `Question count mismatch: expected exactly ${targetCount} questions, but received ${rawQuiz.questions.length}.`
    );
  }

  rawQuiz.questions.forEach((q, qIndex) => {
    const qNum = qIndex + 1;

    if (!q.question || q.question.trim().length < 3) {
      errors.push(`Question ${qNum} prompt is missing or too short (must be >= 3 characters).`);
    }

    if (q.type !== 'single_choice' && q.type !== 'true_false') {
      errors.push(
        `Question ${qNum} has unsupported type "${q.type}". Only "single_choice" and "true_false" are supported.`
      );
      return;
    }

    if (!Array.isArray(q.options)) {
      errors.push(`Question ${qNum} options must be an array.`);
      return;
    }

    if (q.type === 'single_choice') {
      if (q.options.length !== 4) {
        errors.push(`Question ${qNum} (single_choice) must have exactly 4 options, but found ${q.options.length}.`);
      }
    } else if (q.type === 'true_false') {
      if (q.options.length !== 2) {
        errors.push(`Question ${qNum} (true_false) must have exactly 2 options, but found ${q.options.length}.`);
      } else {
        const optionLabels = q.options.map((o) => o.label?.trim().toLowerCase());
        const hasTrue = optionLabels.includes('true');
        const hasFalse = optionLabels.includes('false');
        if (!hasTrue || !hasFalse) {
          errors.push(`Question ${qNum} (true_false) options must be "True" and "False".`);
        }
      }
    }

    // Check exactly one correct option
    const trueCount = q.options.filter((o) => o.isTrue === true).length;
    if (trueCount !== 1) {
      errors.push(
        `Question ${qNum} must have exactly 1 correct answer (isTrue: true), but found ${trueCount}.`
      );
    }

    // Check unique option labels
    const seenLabels = new Set<string>();
    const duplicateLabels = new Set<string>();
    for (const opt of q.options) {
      const normalized = (opt.label || '').trim().toLowerCase();
      if (seenLabels.has(normalized)) {
        duplicateLabels.add(opt.label?.trim() || '');
      } else {
        seenLabels.add(normalized);
      }
    }
    if (duplicateLabels.size > 0) {
      errors.push(
        `Question ${qNum} has duplicate option labels: "${Array.from(duplicateLabels).join('", "')}". Every option must have unique text.`
      );
    }

    // Validate substantive explanations
    q.options.forEach((opt, optIndex) => {
      const optNum = optIndex + 1;
      const label = opt.label?.trim() || `Option ${optNum}`;
      const explanation = opt.explanation?.trim() || '';

      if (explanation.length < 5) {
        errors.push(
          `Question ${qNum} option "${label}" explanation is too short (${explanation.length} chars). Explanations must provide educational context.`
        );
      } else if (TRIVIAL_EXPLANATION_WORDS.has(explanation.toLowerCase())) {
        errors.push(
          `Question ${qNum} option "${label}" explanation is a placeholder ("${explanation}"). Explanations must explain why the option is right or wrong.`
        );
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
