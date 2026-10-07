import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import crypto from 'node:crypto';
import { encryptApiKey } from '../src/utils/encryption.js';
import {
  resolveApiKeyAndEnforceQuota,
  generateQuizWithGroq
} from '../src/modules/generator/service.js';
import { validateQuizSemantics } from '../src/modules/generator/validator.js';
import { GroqGeneratedQuiz } from '@squizme/shared';

let mockUsersStore: any[] = [];

vi.mock('../src/db/index.js', () => {
  return {
    db: {
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn((count: number) => {
              return Promise.resolve(mockUsersStore.slice(0, count));
            })
          }))
        }))
      })),
      update: vi.fn(() => ({
        set: vi.fn((data: any) => ({
          where: vi.fn(() => {
            if (mockUsersStore[0]) {
              if (data.freeGenerationsUsed) {
                mockUsersStore[0].freeGenerationsUsed = (mockUsersStore[0].freeGenerationsUsed || 0) + 1;
              }
            }
            return Promise.resolve();
          })
        }))
      }))
    }
  };
});

describe('Generator Module', () => {
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    process.env.GROQ_API_KEY = 'gsk_test_mock_groq_key_123';
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    mockUsersStore = [];
  });

  describe('Semantic Validator', () => {
    const validSampleQuiz: GroqGeneratedQuiz = {
      title: 'Operating Systems Quiz',
      questions: [
        {
          question: 'What is the primary role of an operating system kernel?',
          type: 'single_choice',
          options: [
            {
              label: 'Manage hardware resources and system calls',
              isTrue: true,
              explanation: 'The kernel is the core software handling CPU scheduling, memory, and devices.'
            },
            {
              label: 'Render high-resolution graphics on screen',
              isTrue: false,
              explanation: 'Rendering display pixels is handled by the window manager or GPU driver.'
            },
            {
              label: 'Compile source code into native machine binaries',
              isTrue: false,
              explanation: 'Compilers like gcc or clang translate source code, not the OS kernel.'
            },
            {
              label: 'Host web servers and public API endpoints',
              isTrue: false,
              explanation: 'Web applications run in user space above the operating system kernel.'
            }
          ]
        },
        {
          question: 'Virtual memory allows an OS to address more memory than physically installed RAM.',
          type: 'true_false',
          options: [
            {
              label: 'True',
              isTrue: true,
              explanation: 'Virtual memory pages inactive memory chunks out to disk swap space.'
            },
            {
              label: 'False',
              isTrue: false,
              explanation: 'This statement is factually accurate because page tables map virtual addresses.'
            }
          ]
        }
      ]
    };

    it('passes for valid single_choice and true_false questions', () => {
      const result = validateQuizSemantics(validSampleQuiz, 2);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails when question count does not match target count', () => {
      const result = validateQuizSemantics(validSampleQuiz, 5);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Question count mismatch'))).toBe(true);
    });

    it('fails when single_choice does not have exactly 4 options', () => {
      const invalidQuiz: GroqGeneratedQuiz = {
        title: 'Broken Single Choice',
        questions: [
          {
            question: 'What is 2 + 2?',
            type: 'single_choice',
            options: [
              { label: '4', isTrue: true, explanation: 'Basic mathematical addition holds.' },
              { label: '5', isTrue: false, explanation: 'Five is incorrect for 2 plus 2.' }
            ]
          }
        ]
      };

      const result = validateQuizSemantics(invalidQuiz, 1);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('must have exactly 4 options'))).toBe(true);
    });

    it('fails when true_false options are not True and False', () => {
      const invalidQuiz: GroqGeneratedQuiz = {
        title: 'Broken True False',
        questions: [
          {
            question: 'Is the sky blue?',
            type: 'true_false',
            options: [
              { label: 'Yes', isTrue: true, explanation: 'Rayleigh scattering makes daylight sky appear blue.' },
              { label: 'No', isTrue: false, explanation: 'Sky is not non-blue during a clear daytime sky.' }
            ]
          }
        ]
      };

      const result = validateQuizSemantics(invalidQuiz, 1);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('options must be "True" and "False"'))).toBe(true);
    });

    it('fails when question has zero or multiple true options', () => {
      const invalidQuiz: GroqGeneratedQuiz = {
        title: 'Ambiguous Question',
        questions: [
          {
            question: 'Pick the right option.',
            type: 'single_choice',
            options: [
              { label: 'A', isTrue: true, explanation: 'Option A is technically true here.' },
              { label: 'B', isTrue: true, explanation: 'Option B is also marked true here.' },
              { label: 'C', isTrue: false, explanation: 'Option C is incorrect here.' },
              { label: 'D', isTrue: false, explanation: 'Option D is incorrect here.' }
            ]
          }
        ]
      };

      const result = validateQuizSemantics(invalidQuiz, 1);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('must have exactly 1 correct answer'))).toBe(true);
    });

    it('fails when options contain duplicate labels', () => {
      const invalidQuiz: GroqGeneratedQuiz = {
        title: 'Duplicate Options',
        questions: [
          {
            question: 'What is the capital of France?',
            type: 'single_choice',
            options: [
              { label: 'Paris', isTrue: true, explanation: 'Paris is the official capital.' },
              { label: 'Paris', isTrue: false, explanation: 'Duplicate option label.' },
              { label: 'Lyon', isTrue: false, explanation: 'Lyon is another major city.' },
              { label: 'Nice', isTrue: false, explanation: 'Nice is on the French Riviera.' }
            ]
          }
        ]
      };

      const result = validateQuizSemantics(invalidQuiz, 1);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('duplicate option labels'))).toBe(true);
    });

    it('fails when option explanation is a placeholder or too short', () => {
      const invalidQuiz: GroqGeneratedQuiz = {
        title: 'Trivial Explanations',
        questions: [
          {
            question: 'What is 1 + 1?',
            type: 'single_choice',
            options: [
              { label: '2', isTrue: true, explanation: 'correct' },
              { label: '3', isTrue: false, explanation: 'wrong' },
              { label: '4', isTrue: false, explanation: 'no' },
              { label: '5', isTrue: false, explanation: 'bad' }
            ]
          }
        ]
      };

      const result = validateQuizSemantics(invalidQuiz, 1);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some(
          (e) => e.includes('explanation is a placeholder') || e.includes('explanation is too short')
        )
      ).toBe(true);
    });
  });

  describe('Quota and API Key Enforcement', () => {
    it('resolves host key and caps question count to 10 for free users', async () => {
      const userId = crypto.randomUUID();
      mockUsersStore = [
        {
          id: userId,
          email: 'free@example.com',
          customGeminiApiKey: null,
          freeGenerationsUsed: 0
        }
      ];

      const result = await resolveApiKeyAndEnforceQuota(userId, 25);
      expect(result.apiKey).toBe('gsk_test_mock_groq_key_123');
      expect(result.isCustomKey).toBe(false);
      expect(result.allowedCount).toBe(10);
    });

    it('blocks quiz generation when free quota is exhausted', async () => {
      const userId = crypto.randomUUID();
      mockUsersStore = [
        {
          id: userId,
          email: 'exhausted@example.com',
          customGeminiApiKey: null,
          freeGenerationsUsed: 2
        }
      ];

      await expect(resolveApiKeyAndEnforceQuota(userId, 5)).rejects.toThrow('QUOTA_EXHAUSTED');
    });

    it('uses decrypted custom key and allows up to 50 questions', async () => {
      const userId = crypto.randomUUID();
      const rawCustomKey = 'gsk_custom_user_key_999';
      const encryptedKey = encryptApiKey(rawCustomKey);

      mockUsersStore = [
        {
          id: userId,
          email: 'custom@example.com',
          customGeminiApiKey: encryptedKey,
          freeGenerationsUsed: 2
        }
      ];

      const result = await resolveApiKeyAndEnforceQuota(userId, 40);
      expect(result.apiKey).toBe(rawCustomKey);
      expect(result.isCustomKey).toBe(true);
      expect(result.allowedCount).toBe(40);
    });
  });

  describe('generateQuizWithGroq', () => {
    it('immediately throws DOCUMENT_UPLOADS_DISABLED when extractedDocumentText is passed', async () => {
      const userId = crypto.randomUUID();
      await expect(
        generateQuizWithGroq(
          userId,
          { questionCount: 5, prompt: 'Test' } as any,
          'Extracted PDF Content'
        )
      ).rejects.toThrow('DOCUMENT_UPLOADS_DISABLED');
    });

    it('succeeds on first attempt with valid Groq structured output', async () => {
      const userId = crypto.randomUUID();
      mockUsersStore = [
        {
          id: userId,
          email: 'gen@example.com',
          customGeminiApiKey: null,
          freeGenerationsUsed: 0
        }
      ];

      const validGroqQuiz: GroqGeneratedQuiz = {
        title: 'Linux Fundamentals',
        questions: Array.from({ length: 5 }, (_, i) => ({
          question: `What does command ${i + 1} do in POSIX?`,
          type: 'single_choice',
          options: [
            {
              label: `Option A for Q${i + 1}`,
              isTrue: true,
              explanation: `Valid explanation describing why option A is correct for question ${i + 1}.`
            },
            {
              label: `Option B for Q${i + 1}`,
              isTrue: false,
              explanation: `Valid explanation describing why option B is incorrect for question ${i + 1}.`
            },
            {
              label: `Option C for Q${i + 1}`,
              isTrue: false,
              explanation: `Valid explanation describing why option C is incorrect for question ${i + 1}.`
            },
            {
              label: `Option D for Q${i + 1}`,
              isTrue: false,
              explanation: `Valid explanation describing why option D is incorrect for question ${i + 1}.`
            }
          ]
        }))
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(validGroqQuiz) } }]
        })
      } as any);

      const result = await generateQuizWithGroq(userId, {
        prompt: 'Linux Basics',
        questionCount: 5,
        difficulty: 'medium',
        depth: 'foundational',
        allowedTypes: ['single_choice'],
        researchEnabled: false,
        settings: {} as any
      });

      expect(result.title).toBe('Linux Fundamentals');
      expect(result.questions).toHaveLength(5);
      expect(result.questions[0].options).toHaveLength(4);
      expect(result.questions[0].correctAnswers).toHaveLength(1);
      expect(result.questions[0].options[0].id).toBeDefined();

      // Free user count incremented
      expect(mockUsersStore[0].freeGenerationsUsed).toBe(1);
    });

    it('recovers via repair loop when attempt 1 fails semantic validation', async () => {
      const userId = crypto.randomUUID();
      mockUsersStore = [
        {
          id: userId,
          email: 'repair@example.com',
          customGeminiApiKey: null,
          freeGenerationsUsed: 0
        }
      ];

      // Attempt 1: only 3 options (fails semantic validation)
      const invalidAttempt1 = {
        title: 'Broken Attempt',
        questions: [
          {
            question: 'Sample question text?',
            type: 'single_choice',
            options: [
              { label: 'Option A', isTrue: true, explanation: 'Valid explanation for option A.' },
              { label: 'Option B', isTrue: false, explanation: 'Valid explanation for option B.' },
              { label: 'Option C', isTrue: false, explanation: 'Valid explanation for option C.' }
            ]
          },
          ...Array.from({ length: 4 }, (_, i) => ({
            question: `Valid question ${i + 2}?`,
            type: 'single_choice',
            options: [
              { label: `A${i}`, isTrue: true, explanation: `Explanation A for question ${i + 2}.` },
              { label: `B${i}`, isTrue: false, explanation: `Explanation B for question ${i + 2}.` },
              { label: `C${i}`, isTrue: false, explanation: `Explanation C for question ${i + 2}.` },
              { label: `D${i}`, isTrue: false, explanation: `Explanation D for question ${i + 2}.` }
            ]
          }))
        ]
      };

      // Attempt 2: corrected with 4 options
      const correctedAttempt2: GroqGeneratedQuiz = {
        title: 'Corrected Quiz',
        questions: Array.from({ length: 5 }, (_, i) => ({
          question: `Fixed question ${i + 1}?`,
          type: 'single_choice',
          options: [
            { label: `Choice A${i}`, isTrue: true, explanation: `Detailed educational explanation for option A${i}.` },
            { label: `Choice B${i}`, isTrue: false, explanation: `Detailed educational explanation for option B${i}.` },
            { label: `Choice C${i}`, isTrue: false, explanation: `Detailed educational explanation for option C${i}.` },
            { label: `Choice D${i}`, isTrue: false, explanation: `Detailed educational explanation for option D${i}.` }
          ]
        }))
      };

      const fetchSpy = vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            choices: [{ message: { content: JSON.stringify(invalidAttempt1) } }]
          })
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            choices: [{ message: { content: JSON.stringify(correctedAttempt2) } }]
          })
        } as any);

      const result = await generateQuizWithGroq(userId, {
        prompt: 'Testing Repair Loop',
        questionCount: 5,
        difficulty: 'medium',
        depth: 'foundational',
        allowedTypes: ['single_choice'],
        researchEnabled: false,
        settings: {} as any
      });

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(result.title).toBe('Corrected Quiz');
      expect(result.questions).toHaveLength(5);
    });

    it('throws QUIZ_VALIDATION_FAILED after exhausting 3 repair attempts', async () => {
      const userId = crypto.randomUUID();
      mockUsersStore = [
        {
          id: userId,
          email: 'exhaust@example.com',
          customGeminiApiKey: null,
          freeGenerationsUsed: 0
        }
      ];

      const invalidPayload = {
        title: 'Always Broken',
        questions: [
          {
            question: 'Broken forever?',
            type: 'single_choice',
            options: [
              { label: 'A', isTrue: true, explanation: 'Short' }
            ]
          }
        ]
      };

      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(invalidPayload) } }]
        })
      } as any);

      await expect(
        generateQuizWithGroq(userId, {
          prompt: 'Failing Quiz',
          questionCount: 5,
          difficulty: 'medium',
          depth: 'foundational',
          allowedTypes: ['single_choice'],
          researchEnabled: false,
          settings: {} as any
        })
      ).rejects.toThrow('QUIZ_VALIDATION_FAILED');
    });
  });
});
