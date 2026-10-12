import { existsSync } from "node:fs";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

const rootEnvPath = resolve(process.cwd(), "../../.env");
const localEnvPath = resolve(process.cwd(), ".env");

if (existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else if (existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(6001),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().url().default("postgresql://postgres:rootpassword@localhost:5432/squizme"),
  GROQ_API_KEY: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment configuration:", parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
