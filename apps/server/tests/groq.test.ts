import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callGroqCompletions, GROQ_QUIZ_JSON_SCHEMA } from '../src/modules/generator/groq.js';

describe('Groq Client & Structured Output Schema', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('exposes a valid strict JSON Schema for quiz generation', () => {
    expect(GROQ_QUIZ_JSON_SCHEMA.name).toBe('quiz_generation_response');
    expect(GROQ_QUIZ_JSON_SCHEMA.strict).toBe(true);
    expect(GROQ_QUIZ_JSON_SCHEMA.schema.type).toBe('object');
    expect(GROQ_QUIZ_JSON_SCHEMA.schema.required).toContain('title');
    expect(GROQ_QUIZ_JSON_SCHEMA.schema.required).toContain('questions');
    expect(GROQ_QUIZ_JSON_SCHEMA.schema.additionalProperties).toBe(false);
  });

  it('throws an error if no API key is provided', async () => {
    const origKey = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;

    await expect(
      callGroqCompletions({
        messages: [{ role: 'user', content: 'test' }]
      })
    ).rejects.toThrow('Groq API key is not configured');

    process.env.GROQ_API_KEY = origKey;
  });

  it('calls Groq API and returns parsed response content', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: 'Sample Quiz',
              questions: [
                {
                  question: 'Sample Q',
                  type: 'single_choice',
                  options: [
                    { label: 'A', isTrue: true, explanation: 'Right' },
                    { label: 'B', isTrue: false, explanation: 'Wrong' }
                  ]
                }
              ]
            })
          }
        }
      ]
    };

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse
    } as any);

    const result = await callGroqCompletions({
      apiKey: 'gsk_test_key_123',
      messages: [{ role: 'user', content: 'generate quiz' }]
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result.content).toContain('Sample Quiz');
    expect(result.raw).toEqual(mockResponse);
  });

  it('handles Groq API rate limits (429) gracefully', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({
        error: { message: 'Rate limit exceeded', code: 'rate_limit_exceeded' }
      })
    } as any);

    await expect(
      callGroqCompletions({
        apiKey: 'gsk_test_key_123',
        messages: [{ role: 'user', content: 'test' }]
      })
    ).rejects.toThrow('Groq rate limit exceeded');
  });
});
