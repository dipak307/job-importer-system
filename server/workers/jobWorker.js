// server/src/workers/jobWorker.js
import { Worker, QueueEvents } from "bullmq";
import IORedis from "ioredis";
import Job from "../models/Job.js";
import ImportLog from "../models/ImportLog.js";
import mongoose from "mongoose";

// ------------------------------
// REDIS FIX (REQUIRED FOR BULLMQ)
// ------------------------------

const mongoUrl = process.env.MONGO_URI || "mongodb://localhost:27017/jobimporter";

await mongoose.connect(mongoUrl);
mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});
const redis = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  enableOfflineQueue: true,
});

redis.on("ready", () => {
  console.log("✅ Redis is ready, starting worker...");

  const worker = new Worker(
    queueName,
    async (job) => {
      // your job processing code
    },
    {
      concurrency: maxConcurrency,
      connection: redis,
    }
  );

  const queueEvents = new QueueEvents(queueName, { connection: redis });

  queueEvents.on("completed", ({ jobId }) => console.log(`✔ Job Completed: ${jobId}`));
  queueEvents.on("failed", ({ jobId, failedReason }) => console.error(`❌ Job Failed (${jobId}): ${failedReason}`));

  worker.on("error", (err) => console.error("❌ Worker Error:", err));

  console.log("🚀 Worker is running on queue:", queueName);
});

const queueName = process.env.QUEUE_NAME || "job-import-queue";
const maxConcurrency = parseInt(process.env.MAX_CONCURRENCY || 5);

// ------------------------------
// WORKER START
// ------------------------------
const worker = new Worker(
  queueName,
  async (job) => {
    const { logId, item: jobData } = job.data;
    console.log("RAW JOB DATA:", jobData);
    let externalId = null;

if (jobData.guid) {
  if (typeof jobData.guid === "object" && jobData.guid._) {
    externalId = jobData.guid._;
  } else if (typeof jobData.guid === "string") {
    externalId = jobData.guid;
  }
}

if (!externalId && jobData.id) {
  externalId = jobData.id.toString();
}
jobData.externalId = externalId;
// THE IMPORTANT FIELD MAPPING
externalId =  String(jobData.id) ;
const mappedData = {
  externalId: externalId,
  title: jobData.title || null,
  company: jobData["job_listing:company"] || null,
  location: jobData["job_listing:location"] || null,
  description: jobData.description || null,
  url: jobData.link || null,
  postedAt: jobData.pubdate ? new Date(jobData.pubdate) : null,
  raw: jobData, // save full original feed
};


    // console.log("Mapped data to insert:", mappedData);

    try {
      // check if existing
      console.log("Checking existence for externalId:", externalId);
      const exists = await Job.findOne({ externalId });
      console.log("exists:", exists)
      if (exists) {
        // --------------------------
        // UPDATE EXISTING JOB
        // --------------------------
        await Job.updateOne({ externalId }, { $set: mappedData });

        await ImportLog.findByIdAndUpdate(logId, {
          $inc: { updatedJobs: 1, processedCount: 1, totalImported: 1 },
        });

        console.log("UPDATED JOB:", externalId);

        return { success: true, status: "updated" };
      }

      // ------------------------------
      // INSERT NEW JOB
      // ------------------------------
      await Job.create(mappedData);

      await ImportLog.findByIdAndUpdate(logId, {
        $inc: { newJobs: 1, processedCount: 1, totalImported: 1 },
      });

      console.log("CREATED JOB:", externalId);

      return { success: true, status: "created" };
    } catch (err) {
      // ------------------------------
      // LOG FAILURE
      // ------------------------------
      await ImportLog.findByIdAndUpdate(logId, {
        $inc: { failedJobs: 1, processedCount: 1 },
        $push: {
          failedDetails: {
            jobId: externalId,
            reason: err.message,
          },
        },
      });

      console.error("❌ Worker Import Error:", err.message);

      throw new Error(`Failed to import job ${externalId} - ${err.message}`);
    }
  },
  {
    concurrency: maxConcurrency,
    connection: redis,
  }
);

// ------------------------------
// QUEUE EVENTS LOGGING
// ------------------------------
const queueEvents = new QueueEvents(queueName, { connection: redis });

queueEvents.on("completed", ({ jobId }) => {
  console.log(`✔ Job Completed: ${jobId}`);
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`❌ Job Failed (${jobId}): ${failedReason}`);
});

worker.on("error", (err) => {
  console.error("❌ Worker Error:", err);
});

console.log("🚀 Worker is running on queue:", queueName);

export { worker, queueEvents };
