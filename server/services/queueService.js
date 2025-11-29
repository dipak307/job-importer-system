import { Queue } from "bullmq";
import IORedis from "ioredis";

const redis = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,   // <--- REQUIRED
  enableReadyCheck: false       // <--- Prevents blocking
});

const queue = new Queue(process.env.QUEUE_NAME || "job-import-queue", {
  connection: redis,
});

export default queue;
