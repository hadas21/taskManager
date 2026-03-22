import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null
});

export const taskQueue = new Queue("urgent-logistics-tasks", { connection });

export async function enqueueTaskUpdate(taskPayload) {
  return taskQueue.add("update-task", taskPayload, {
    attempts: 3,
    backoff: { type: "exponential", delay: 500 },
    removeOnComplete: true,
    removeOnFail: false
  });
}
