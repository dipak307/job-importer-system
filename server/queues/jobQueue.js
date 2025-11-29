// server/src/queues/jobQueue.js
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const connection = new IORedis(redisUrl);

const queueName = process.env.QUEUE_NAME || 'job-import-queue';

const jobQueue = new Queue(queueName, { connection });

export { jobQueue, connection };
