import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import {
  GenerationRequestSchema,
  type JobStatusResponse,
} from "@squizme/shared";
import { pool } from "../../db/index.js";
import {
  createGenerationJob,
  findActiveJobByUserId,
  getJobById,
  requestJobCancellation,
  type GenerationJobRow,
} from "./jobs/job.repository.js";

const DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  TOPIC_REJECTED: "That doesn't look like a real topic.",
  TOPIC_REJECTED_GIBBERISH: "That doesn't look like a real topic.",
  QUESTION_GENERATION_FAILED: "Generation failed. Try another prompt.",
  GENERATION_CANCELLED: "Quiz generation was cancelled.",
  GENERATION_FAILED: "Generation encountered an issue.",
};

function formatJobStatusResponse(job: GenerationJobRow): JobStatusResponse {
  let errorMessage =
    job.last_error_message ||
    (job.last_error_code
      ? DEFAULT_ERROR_MESSAGES[job.last_error_code] || "Generation encountered an issue."
      : null);

  if (errorMessage && errorMessage.length > 50) {
    errorMessage = errorMessage.slice(0, 47) + "...";
  }

  return {
    jobId: job.id,
    status: job.status,
    plannedQuestionCount: job.planned_question_count,
    acceptedQuestionCount: job.accepted_question_count,
    completedBatches: job.completed_batch_count,
    totalBatches: job.total_batch_count,
    quizId: job.quiz_id,
    error: job.last_error_code
      ? { code: job.last_error_code, message: errorMessage || "Generation encountered an issue." }
      : null,
    createdAt: job.created_at.toISOString(),
    updatedAt: job.updated_at.toISOString(),
  };
}

export const generationRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // 1. Submit a new generation request (202 Accepted)
  app.post(
    "/quiz-generations",
    {
      schema: {
        tags: ["Quiz Generations"],
        summary: "Submit a new asynchronous quiz generation request",
        description:
          "Accepts generation settings with a unique client idempotency key. Returns 202 Accepted with a tracking job reference.",
      },
    },
    async (request, reply) => {
      const parsed = GenerationRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.badRequest(parsed.error.errors[0]?.message || "Invalid generation request");
      }

      const userId = request.userId;

      try {
        const { job } = await createGenerationJob(pool, userId, parsed.data);
        return reply.status(202).send(formatJobStatusResponse(job));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);

        if (message.includes("ACTIVE_GENERATION_EXISTS")) {
          return reply.status(409).send({
            statusCode: 409,
            error: "ACTIVE_GENERATION_EXISTS",
            message: "You already have a generation job in progress. Please wait for it to complete.",
          });
        }

        if (message.includes("IDEMPOTENCY_KEY_REUSED")) {
          return reply.status(409).send({
            statusCode: 409,
            error: "IDEMPOTENCY_KEY_REUSED",
            message: "This idempotency key was previously used with a different request payload.",
          });
        }

        request.log.error({ err }, "Error creating generation job");
        return reply.internalServerError("Could not initialize generation job");
      }
    }
  );

  // 2. Find the current user's active generation job
  app.get(
    "/quiz-generations/active",
    {
      schema: {
        tags: ["Quiz Generations"],
        summary: "Find the current user's active generation job",
        description: "Returns the in-flight generation job for recovery after refresh or reconnection.",
      },
    },
    async (request, reply) => {
      const activeJob = await findActiveJobByUserId(pool, request.userId);
      if (!activeJob) {
        return reply.notFound("No active generation job found for user");
      }
      return reply.send(formatJobStatusResponse(activeJob));
    }
  );

  // 3. Retrieve status and progress of a specific job
  app.get<{ Params: { jobId: string } }>(
    "/quiz-generations/:jobId",
    {
      schema: {
        tags: ["Quiz Generations"],
        summary: "Retrieve generation job status and progress",
        params: {
          type: "object",
          required: ["jobId"],
          properties: {
            jobId: { type: "string", format: "uuid" },
          },
        },
      },
    },
    async (request, reply) => {
      const { jobId } = request.params;
      const job = await getJobById(pool, jobId, request.userId);
      if (!job) {
        return reply.notFound(`Generation job with ID ${jobId} not found`);
      }
      return reply.send(formatJobStatusResponse(job));
    }
  );

  // 4. Request cancellation of an active job
  app.post<{ Params: { jobId: string } }>(
    "/quiz-generations/:jobId/cancel",
    {
      schema: {
        tags: ["Quiz Generations"],
        summary: "Request cooperative cancellation of a generation job",
        params: {
          type: "object",
          required: ["jobId"],
          properties: {
            jobId: { type: "string", format: "uuid" },
          },
        },
      },
    },
    async (request, reply) => {
      const { jobId } = request.params;

      try {
        const result = await requestJobCancellation(pool, jobId, request.userId);
        return reply.send({
          success: result.success,
          status: result.currentStatus,
          message: result.success
            ? "Cancellation requested. The worker will stop at the nearest safe boundary."
            : `Job is already in terminal state '${result.currentStatus}' and cannot be cancelled.`,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("GENERATION_NOT_FOUND")) {
          return reply.notFound(`Generation job with ID ${jobId} not found`);
        }
        return reply.internalServerError("Could not process cancellation request");
      }
    }
  );
};
