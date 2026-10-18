import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const candidateEnvPaths = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "apps/server/.env"),
  resolve(__dirname, "../../.env"),
  resolve(__dirname, "../../../.env"),
];

for (const envPath of candidateEnvPaths) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(8001),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().url().default("postgresql://postgres:rootpassword@localhost:5432/squizme"),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default("openai/gpt-oss-120b"),
  GROQ_MODEL_PLANNING: z.string().default("qwen/qwen3.8-27b"),
  GROQ_MODEL_GENERATION: z.string().default("openai/gpt-oss-120b"),
  GROQ_MODEL_EXPLANATION: z.string().default("openai/gpt-oss-20b"),
  GROQ_TEMPERATURE: z.coerce.number().default(0.7),
  GROQ_MAX_TOKENS: z.coerce.number().default(4096),
  MAX_BATCH_SIZE: z.coerce.number().default(17),
  MAX_CONTENT_RETRIES: z.coerce.number().default(2),
  MIN_ACCEPTANCE_RATIO: z.coerce.number().default(0.9),
  WORKER_POLL_INTERVAL_MS: z.coerce.number().default(5000),
  HEARTBEAT_INTERVAL_MS: z.coerce.number().default(30000),
  LEASE_DURATION_MS: z.coerce.number().default(300000),
  STALE_RECOVERY_INTERVAL_MS: z.coerce.number().default(60000),
  MAX_INFRASTRUCTURE_RETRIES: z.coerce.number().default(3),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment configuration:", parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
