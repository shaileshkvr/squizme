export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqRequestOptions {
  apiKey?: string;
  messages: GroqMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: any;
}

export interface GroqCompletionResponse {
  content: string;
  raw: any;
}

export const GROQ_QUIZ_JSON_SCHEMA = {
  name: 'quiz_generation_response',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Short descriptive title for the quiz'
      },
      questions: {
        type: 'array',
        description: 'List of educational quiz questions',
        items: {
          type: 'object',
          properties: {
            question: {
              type: 'string',
              description: 'The prompt or question text'
            },
            type: {
              type: 'string',
              enum: ['single_choice', 'true_false'],
              description: 'Question format'
            },
            options: {
              type: 'array',
              description: 'All possible answer choices with correctness and explanations',
              items: {
                type: 'object',
                properties: {
                  label: {
                    type: 'string',
                    description: 'The answer option text'
                  },
                  isTrue: {
                    type: 'boolean',
                    description: 'True if this is the single correct answer, false otherwise'
                  },
                  explanation: {
                    type: 'string',
                    description: 'Substantive explanation of why this option is correct or incorrect'
                  }
                },
                required: ['label', 'isTrue', 'explanation'],
                additionalProperties: false
              }
            }
          },
          required: ['question', 'type', 'options'],
          additionalProperties: false
        }
      }
    },
    required: ['title', 'questions'],
    additionalProperties: false
  }
};

export async function callGroqCompletions(
  options: GroqRequestOptions
): Promise<GroqCompletionResponse> {
  const apiKey = options.apiKey || process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('Groq API key is not configured.');
  }

  const model = options.model || process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  const temperature = options.temperature ?? 0.2;
  const maxTokens = options.maxTokens ?? 4096;
  const responseFormat = options.responseFormat ?? {
    type: 'json_schema',
    json_schema: GROQ_QUIZ_JSON_SCHEMA
  };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      temperature,
      max_tokens: maxTokens,
      response_format: responseFormat
    })
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error?.message || response.statusText || 'Unknown Groq error';
    if (response.status === 429) {
      throw new Error(`Groq rate limit exceeded: ${errorMsg}`);
    }
    if (response.status === 401) {
      throw new Error(`Groq authentication failed: Invalid API key.`);
    }
    if (response.status === 403 || data?.error?.code === 'model_permission_blocked_project') {
      throw new Error(`Groq model permission denied: ${errorMsg}`);
    }
    throw new Error(`Groq API request failed (${response.status}): ${errorMsg}`);
  }

  const messageContent = data?.choices?.[0]?.message?.content;
  if (typeof messageContent !== 'string') {
    throw new Error('Groq returned an empty or invalid completion response.');
  }

  return {
    content: messageContent,
    raw: data
  };
}
