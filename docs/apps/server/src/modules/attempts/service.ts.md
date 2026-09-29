# Documentation: @/apps/server/src/modules/attempts/service.ts

### Purpose
Executes automated grading across all four question types, records user responses, and compiles attempt scorecards.

### What happens without it
Quiz takers cannot submit answers or receive graded results.

### Functions
- `gradeQuestionAnswer(type, correctAnswers, submitted, points)`: Evaluates answer correctness based on format:
  - `single_choice` & `true_false`: Exact match.
  - `multiple_choice`: Symmetric array equality.
  - `short_answer`: Trimmed, case-insensitive substring match against accepted variations.
- `startQuizAttempt(userId, quizId)`: Initializes a quiz attempt session record.
- `submitQuizAttempt(attemptId, answers)`: Evaluates answers in a transaction, computes overall percentage, sets pass/fail status against quiz threshold, and finalizes the attempt.
- `getAttemptScorecard(attemptId)`: Retrieves the scorecard and breakdown of question submissions with explanations.

### Dependency graph
- Depends on:
  - `drizzle-orm`
  - `@/apps/server/src/db/schema.ts`
  - `@/apps/server/src/db/index.ts`
  - `@squizme/shared`
- Depended on by:
  - `@/apps/server/src/modules/attempts/routes.ts`
