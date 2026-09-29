# Documentation: @/apps/server/src/modules/generator/tools.ts

### Purpose
Defines typed Gemini tool declarations (`FunctionDeclaration`) that force the Gemini AI model to return structured, typed questions.

### What happens without it
Gemini returns unstructured natural language prose, causing parsing failures, missing question properties, and malformed quiz generation.

### Tool Declarations
- `add_single_choice_question`: Choice prompt, options array, single correct ID, explanation.
- `add_multiple_choice_question`: Choice prompt, options array, multiple correct IDs, explanation.
- `add_true_false_question`: Assertion prompt, boolean flag, explanation.
- `add_short_answer_question`: Query prompt, accepted answer array, explanation.

### Dependency graph
- Depends on:
  - `@google/genai`
- Depended on by:
  - `@/apps/server/src/modules/generator/service.ts`
