# Server Architecture

```
apps/server/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   │   ├── env.ts
│   │   └── ai.config.ts
│   │
│   ├── lib/
│   │   ├── db.ts
│   │   ├── logger.ts
│   │   └── errors.ts
│   │
│   ├── plugins/
│   │   ├── auth.plugin.ts
│   │   └── error-handler.plugin.ts
│   │
│   ├── middleware/
│   │   └── require-auth.ts
│   │
│   ├── modules/
│   │   ├── quizzes/
│   │   │   ├── quiz.routes.ts
│   │   │   ├── quiz.controller.ts
│   │   │   ├── quiz.service.ts
│   │   │   └── quiz.repository.ts
│   │   │
│   │   ├── generation/
│   │   │   ├── generation.routes.ts
│   │   │   ├── generation.controller.ts
│   │   │   ├── generation.service.ts
│   │   │   ├── generation.repository.ts
│   │   │   │
│   │   │   ├── jobs/
│   │   │   │   ├── job.service.ts
│   │   │   │   ├── job.repository.ts
│   │   │   │   ├── job.worker.ts
│   │   │   │   ├── job.scheduler.ts
│   │   │   │   └── job.state.ts
│   │   │   │
│   │   │   ├── planning/
│   │   │   │   ├── topic-analyzer.ts
│   │   │   │   ├── distribution.ts
│   │   │   │   └── batch-planner.ts
│   │   │   │
│   │   │   ├── question-generation/
│   │   │   │   ├── generate-batch.ts
│   │   │   │   ├── generation-prompts.ts
│   │   │   │   ├── retry.ts
│   │   │   │   └── duplicate-check.ts
│   │   │   │
│   │   │   ├── validation/
│   │   │   │   ├── validate-question.ts
│   │   │   │   ├── validate-batch.ts
│   │   │   │   └── validate-plan.ts
│   │   │   │
│   │   │   └── sources/
│   │   │       ├── source.service.ts
│   │   │       └── extract-text.ts
│   │   │
│   │   ├── explanations/
│   │   │   ├── explanation.routes.ts
│   │   │   ├── explanation.controller.ts
│   │   │   ├── explanation.service.ts
│   │   │   └── explanation-prompts.ts
│   │   │
│   │   ├── users/
│   │   ├── scores/
│   │   └── analytics/
│   │
│   ├── integrations/
│   │   └── groq/
│   │       ├── groq.client.ts
│   │       └── groq.errors.ts
│   │
│   └── utils/
│       ├── ids.ts
│       └── time.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── package.json
└── tsconfig.json
```