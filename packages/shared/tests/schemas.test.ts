import { describe, it, expect } from 'vitest';
import {
  QuizSettingsSchema,
  QuestionSchema,
  GenerateQuizRequestSchema,
  RegisterRequestSchema,
  LoginRequestSchema,
  UpdateApiKeySchema,
  SubmitAttemptSchema
} from '../src/index';

describe('Shared Schemas', () => {
  it('validates a valid single choice question', () => {
    const validQuestion = {
      type: 'single_choice',
      prompt: 'What is the capital of France?',
      options: [
        { id: 'a', text: 'Paris' },
        { id: 'b', text: 'Berlin' }
      ],
      correctAnswers: ['a'],
      explanation: 'Paris is the capital of France.',
      points: 1
    };
    const parsed = QuestionSchema.safeParse(validQuestion);
    expect(parsed.success).toBe(true);
  });

  it('rejects quiz generation request exceeding 50 questions', () => {
    const invalidRequest = {
      prompt: 'Physics basics',
      questionCount: 51,
      difficulty: 'medium',
      depth: 'foundational',
      allowedTypes: ['single_choice']
    };
    const parsed = GenerateQuizRequestSchema.safeParse(invalidRequest);
    expect(parsed.success).toBe(false);
  });

  it('rejects quiz generation request with fewer than 5 questions', () => {
    const invalidRequest = {
      prompt: 'Physics basics',
      questionCount: 4,
      difficulty: 'medium',
      depth: 'foundational',
      allowedTypes: ['single_choice']
    };
    const parsed = GenerateQuizRequestSchema.safeParse(invalidRequest);
    expect(parsed.success).toBe(false);
  });

  it('validates user registration schema and password complexity rules', () => {
    // Valid passwords: min 8 chars, at least 1 letter, 1 number, 1 special char (no mixed case required)
    const valid = {
      email: 'user@example.com',
      password: 'password123!',
      name: 'Test User'
    };
    expect(RegisterRequestSchema.safeParse(valid).success).toBe(true);

    const validUppercase = {
      email: 'user2@example.com',
      password: 'UPPERCASE123!',
      name: 'Uppercase User'
    };
    expect(RegisterRequestSchema.safeParse(validUppercase).success).toBe(true);

    // Invalid passwords
    expect(RegisterRequestSchema.safeParse({ ...valid, password: 'short1!' }).success).toBe(false); // < 8 chars
    expect(RegisterRequestSchema.safeParse({ ...valid, password: 'password123' }).success).toBe(false); // no special char
    expect(RegisterRequestSchema.safeParse({ ...valid, password: 'password!@#' }).success).toBe(false); // no number
    expect(RegisterRequestSchema.safeParse({ ...valid, password: '12345678!@#' }).success).toBe(false); // no letter

    const invalid = {
      email: 'not-an-email',
      password: 'short',
      name: 'A'
    };
    expect(RegisterRequestSchema.safeParse(invalid).success).toBe(false);
  });

  it('validates login schema', () => {
    const valid = { email: 'user@example.com', password: 'secretpassword' };
    expect(LoginRequestSchema.safeParse(valid).success).toBe(true);

    const invalid = { email: 'invalid', password: '' };
    expect(LoginRequestSchema.safeParse(invalid).success).toBe(false);
  });

  it('validates update API key schema', () => {
    expect(UpdateApiKeySchema.safeParse({ apiKey: 'valid-gemini-api-key-123' }).success).toBe(true);
    expect(UpdateApiKeySchema.safeParse({ apiKey: 'short' }).success).toBe(false);
  });

  it('validates quiz attempt submission schema', () => {
    const valid = {
      answers: [
        { questionId: 'q1', submittedAnswer: 'a' },
        { questionId: 'q2', submittedAnswer: ['a', 'b'] }
      ]
    };
    expect(SubmitAttemptSchema.safeParse(valid).success).toBe(true);

    const invalid = {
      answers: [
        { questionId: 'q1', submittedAnswer: 123 }
      ]
    };
    expect(SubmitAttemptSchema.safeParse(invalid).success).toBe(false);
  });

  it('validates quiz settings defaults and constraints', () => {
    const parsed = QuizSettingsSchema.safeParse({});
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.mode).toBe('learning');
      expect(parsed.data.passingPercentage).toBe(70);
      expect(parsed.data.shuffleQuestions).toBe(false);
      expect(parsed.data.showExplanationsDuring).toBe(true);
      expect(parsed.data.timeLimitMinutes).toBeNull();
    }
  });
});
