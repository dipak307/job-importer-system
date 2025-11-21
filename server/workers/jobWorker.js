import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import JobModel from "../models/Job.js";
import ImportLog from "../models/ImportLog.js";

const REDIS_URL = process.env.REDIS_URL;
const QUEUE_NAME = process.env.QUEUE_NAME || "job-import-queue";
const CHANNEL = process.env.REDIS_PUBSUB_CHANNEL || "job-events";

const MAX_CONCURRENCY = Number(process.env.MAX_CONCURRENCY || 5);

// ------------------------------
// 1️⃣ CONNECT TO MONGODB
// ------------------------------
await mongoose.connect(process.env.MONGO_URI, {});
console.log("📦 Worker connected to MongoDB");

// Redis publisher for SSE / websocket style updates
const redisPub = new IORedis(REDIS_URL);

function publish(event, data) {
  redisPub.publish(CHANNEL, JSON.stringify({ event, data }));
}

// ------------------------------
// 2️⃣ WORKER LOGIC
// ------------------------------
const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { logId, item } = job.data;

    if (!item) {
      await ImportLog.findByIdAndUpdate(logId, {
        $inc: { processedCount: 1, failedCount: 1 },
        $push: { failedJobs: { reason: "Empty job item", time: new Date() } }
      });
      publish("job-failed", { logId, reason: "Empty item" });
      return;
    }

    try {
      // ---------------------------------------
      // 2️⃣ Identify job uniquely (best-possible)
      // ---------------------------------------
      const query = {};
      if (item.externalId) query.externalId = item.externalId;
      else if (item.url) query.url = item.url;
      else query.title = item.title || null;

      // ---------------------------------------
      // 3️⃣ Prepare fields
      // ---------------------------------------
      const updateDoc = {
        externalId: item.externalId || null,
        title: item.title,
        company: item.company,
        location: item.location,
        description: item.description,
        url: item.url,
        postedAt: item.postedAt ? new Date(item.postedAt) : null,
        raw: item.raw || item
      };

      // ---------------------------------------
      // 4️⃣ UPSERT (insert or update)
      // ---------------------------------------
      const result = await JobModel.updateOne(
        query,
        { $set: updateDoc },
        { upsert: true }
      );

      // ---------------------------------------
      // 5️⃣ Detect NEW or UPDATED
      // ---------------------------------------
      let isNewRecord = false;

      // BullMQ returns this for newly inserted:
      // result.upsertedId OR upsertedCount = 1
      if (result.upsertedId || result.upsertedCount > 0) {
        isNewRecord = true;
      }

      // ---------------------------------------
      // 6️⃣ Update ImportLog
      // ---------------------------------------
      await ImportLog.findByIdAndUpdate(logId, {
        $inc: {
          processedCount: 1,
          totalImported: 1,
          newJobs: isNewRecord ? 1 : 0,
          updatedJobs: isNewRecord ? 0 : 1
        }
      });

      publish("job-processed", {
        logId,
        title: item.title,
        isNew: isNewRecord
      });

    } catch (err) {
      console.error("❌ Worker error:", err.message);

      await ImportLog.findByIdAndUpdate(logId, {
        $inc: { processedCount: 1, failedCount: 1 },
        $push: { failedJobs: { item, reason: err.message, time: new Date() } }
      });

      publish("job-failed", { logId, reason: err.message });

      throw err; // allow BullMQ retry/backoff
    }

    // ---------------------------------------
    // 7️⃣ Detect when ALL jobs are completed
    // ---------------------------------------
    const log = await ImportLog.findById(logId);
    if (
      log &&
      log.expectedCount > 0 &&
      log.processedCount >= log.expectedCount &&
      !log.finishedAt
    ) {
      await ImportLog.findByIdAndUpdate(logId, {
        finishedAt: new Date()
      });

      publish("import-finished", { logId });
    }
  },
  {
    connection: { connectionString: REDIS_URL },
    concurrency: MAX_CONCURRENCY
  }
);

// ------------------------------
// 3️⃣ EVENTS
// ------------------------------
worker.on("completed", (job) => {
  console.log(`✔ Worker completed job ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job failed ${job.id} →`, err.message);
});

console.log("🚀 Worker started with concurrency:", MAX_CONCURRENCY);
