import { Worker } from "bullmq";
import IORedis from "ioredis";
import { processTaskUpdate } from "../services/taskProcessor.js";
import { taskRepository } from "../repositories/taskRepository.js";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null
});

export const taskWorker = new Worker(
  "urgent-logistics-tasks",
  async (job) => processTaskUpdate(job.data, taskRepository),
  { connection, concurrency: 10 }
);

taskWorker.on("completed", (job) => {
  console.log(`Processed job ${job.id}`);
});

taskWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});
