
import dotenv from "dotenv";
dotenv.config();

import { Queue } from "bullmq";

const QUEUE_NAME = process.env.QUEUE_NAME || "job-import-queue";
const connectionOpt = { connection: { connectionString: process.env.REDIS_URL } };

const queue = new Queue(QUEUE_NAME, connectionOpt);

export default queue;

