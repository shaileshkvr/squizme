import { pgTable, varchar, text, timestamp, integer, numeric, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const quizSourceTypeEnum = pgEnum('quiz_source_type', ['prompt', 'pdf', 'docx', 'manual']);
export const questionTypeEnum = pgEnum('question_type', ['single_choice', 'multiple_choice', 'true_false', 'short_answer']);
export const attemptStatusEnum = pgEnum('attempt_status', ['in_progress', 'completed', 'timed_out', 'abandoned']);

export const users = pgTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  customGeminiApiKey: text('custom_gemini_api_key'),
  freeGenerationsUsed: integer('free_generations_used').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const quizzes = pgTable('quizzes', {
  id: varchar('id', { length: 36 }).primaryKey(),
  creatorId: varchar('creator_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  sourceType: quizSourceTypeEnum('source_type').notNull(),
  sourceMetadata: jsonb('source_metadata'),
  settings: jsonb('settings').notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const questions = pgTable('questions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  quizId: varchar('quiz_id', { length: 36 }).notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  type: questionTypeEnum('type').notNull(),
  prompt: text('prompt').notNull(),
  options: jsonb('options').notNull(),
  correctAnswers: jsonb('correct_answers').notNull(),
  explanation: text('explanation').notNull(),
  points: integer('points').default(1).notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const quizAttempts = pgTable('quiz_attempts', {
  id: varchar('id', { length: 36 }).primaryKey(),
  quizId: varchar('quiz_id', { length: 36 }).notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  status: attemptStatusEnum('status').default('in_progress').notNull(),
  scoreAwarded: numeric('score_awarded', { precision: 5, scale: 2 }).default('0.00').notNull(),
  totalPoints: numeric('total_points', { precision: 5, scale: 2 }).default('0.00').notNull(),
  percentage: numeric('percentage', { precision: 5, scale: 2 }).default('0.00').notNull(),
  isPassed: boolean('is_passed').default(false).notNull()
});

export const attemptAnswers = pgTable('attempt_answers', {
  id: varchar('id', { length: 36 }).primaryKey(),
  attemptId: varchar('attempt_id', { length: 36 }).notNull().references(() => quizAttempts.id, { onDelete: 'cascade' }),
  questionId: varchar('question_id', { length: 36 }).notNull().references(() => questions.id, { onDelete: 'cascade' }),
  submittedAnswer: jsonb('submitted_answer').notNull(),
  isCorrect: boolean('is_correct').notNull(),
  pointsEarned: numeric('points_earned', { precision: 5, scale: 2 }).notNull(),
  gradedFeedback: text('graded_feedback')
});
