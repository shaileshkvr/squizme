import { mysqlTable, varchar, text, timestamp, int, decimal, boolean, json, mysqlEnum } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  role: mysqlEnum('role', ['user', 'admin']).default('user').notNull(),
  customGeminiApiKey: text('custom_gemini_api_key'),
  freeGenerationsUsed: int('free_generations_used').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

export const quizzes = mysqlTable('quizzes', {
  id: varchar('id', { length: 36 }).primaryKey(),
  creatorId: varchar('creator_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  sourceType: mysqlEnum('source_type', ['prompt', 'pdf', 'docx', 'manual']).notNull(),
  sourceMetadata: json('source_metadata'),
  settings: json('settings').notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

export const questions = mysqlTable('questions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  quizId: varchar('quiz_id', { length: 36 }).notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  type: mysqlEnum('type', ['single_choice', 'multiple_choice', 'true_false', 'short_answer']).notNull(),
  prompt: text('prompt').notNull(),
  options: json('options').notNull(),
  correctAnswers: json('correct_answers').notNull(),
  explanation: text('explanation').notNull(),
  points: int('points').default(1).notNull(),
  orderIndex: int('order_index').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const quizAttempts = mysqlTable('quiz_attempts', {
  id: varchar('id', { length: 36 }).primaryKey(),
  quizId: varchar('quiz_id', { length: 36 }).notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  status: mysqlEnum('status', ['in_progress', 'completed', 'timed_out', 'abandoned']).default('in_progress').notNull(),
  scoreAwarded: decimal('score_awarded', { precision: 5, scale: 2 }).default('0.00').notNull(),
  totalPoints: decimal('total_points', { precision: 5, scale: 2 }).default('0.00').notNull(),
  percentage: decimal('percentage', { precision: 5, scale: 2 }).default('0.00').notNull(),
  isPassed: boolean('is_passed').default(false).notNull()
});

export const attemptAnswers = mysqlTable('attempt_answers', {
  id: varchar('id', { length: 36 }).primaryKey(),
  attemptId: varchar('attempt_id', { length: 36 }).notNull().references(() => quizAttempts.id, { onDelete: 'cascade' }),
  questionId: varchar('question_id', { length: 36 }).notNull().references(() => questions.id, { onDelete: 'cascade' }),
  submittedAnswer: json('submitted_answer').notNull(),
  isCorrect: boolean('is_correct').notNull(),
  pointsEarned: decimal('points_earned', { precision: 5, scale: 2 }).notNull(),
  gradedFeedback: text('graded_feedback')
});
