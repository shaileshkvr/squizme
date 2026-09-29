import { FunctionDeclaration, Type } from '@google/genai';

export function buildQuestionTools(): Array<{ functionDeclarations: FunctionDeclaration[] }> {
  return [
    {
      functionDeclarations: [
        {
          name: 'add_single_choice_question',
          description: 'Adds a multiple-choice question with exactly one correct option',
          parameters: {
            type: Type.OBJECT,
            properties: {
              prompt: { type: Type.STRING, description: 'Question prompt text' },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: 'Option key, e.g. a, b, c, d' },
                    text: { type: Type.STRING, description: 'Option text' }
                  },
                  required: ['id', 'text']
                }
              },
              correct_option_id: { type: Type.STRING, description: 'The ID of the single correct option' },
              explanation: { type: Type.STRING, description: 'Detailed rationale explaining the correct answer' }
            },
            required: ['prompt', 'options', 'correct_option_id', 'explanation']
          }
        },
        {
          name: 'add_multiple_choice_question',
          description: 'Adds a question where one or more options can be correct',
          parameters: {
            type: Type.OBJECT,
            properties: {
              prompt: { type: Type.STRING, description: 'Question prompt text' },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING }
                  },
                  required: ['id', 'text']
                }
              },
              correct_option_ids: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Array of option IDs that are correct'
              },
              explanation: { type: Type.STRING }
            },
            required: ['prompt', 'options', 'correct_option_ids', 'explanation']
          }
        },
        {
          name: 'add_true_false_question',
          description: 'Adds a boolean factual verification question',
          parameters: {
            type: Type.OBJECT,
            properties: {
              prompt: { type: Type.STRING, description: 'Statement to verify' },
              is_true: { type: Type.BOOLEAN, description: 'True if the statement is factually accurate, false otherwise' },
              explanation: { type: Type.STRING }
            },
            required: ['prompt', 'is_true', 'explanation']
          }
        },
        {
          name: 'add_short_answer_question',
          description: 'Adds a brief fill-in-the-blank or short answer question',
          parameters: {
            type: Type.OBJECT,
            properties: {
              prompt: { type: Type.STRING, description: 'Question prompt requiring a concise answer' },
              accepted_answers: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of accepted phrase variations'
              },
              explanation: { type: Type.STRING }
            },
            required: ['prompt', 'accepted_answers', 'explanation']
          }
        }
      ]
    }
  ];
}
