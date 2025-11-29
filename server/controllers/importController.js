import {fetchFeed} from "../services/fetchService.js";
import queue from "../services/queueService.js";
import ImportLog from "../models/ImportLog.js";

const BATCH_SIZE = Number(process.env.BATCH_SIZE || 25);
const RETRY_ATTEMPTS = Number(process.env.RETRY_ATTEMPTS || 5);
const RETRY_BACKOFF_MS = Number(process.env.RETRY_BACKOFF_MS || 2000);

export const startImport = async (req, res) => {
  try {
    const { feedUrl } = req.body;
    if (!feedUrl) return res.status(400).json({ error: "feedUrl required" });

    const log = await ImportLog.create({
      feedUrl,
      startedAt: new Date(),
      totalFetched: 0,
      expectedCount: 0,
      processedCount: 0,
      totalEnqueued: 0,
      newJobs: 0,
      updatedJobs: 0,
      failedJobs: 0,
      failedDetails: [],
    });

    const items = await fetchFeed(feedUrl);
    const total = items.length;

    log.totalFetched = total;
    log.expectedCount = total;
    await log.save();

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);

      const bulk = batch.map((item) => ({
        name: "job-item",
        data: { logId: log._id.toString(), item },
        opts: {
          attempts: RETRY_ATTEMPTS,
          backoff: { type: "exponential", delay: RETRY_BACKOFF_MS },
          removeOnComplete: true,
          removeOnFail: true,
        },
      }));

      await queue.addBulk(bulk);

      // track how many jobs were queued
      log.totalEnqueued += batch.length;
      await log.save();
    }

    res.json({ success: true, message: "Import started", logId: log._id });

  } catch (err) {
    console.error("startImport error:", err);
    res.status(500).json({ error: err.message, line: err.stack });
  }
};





export const getLogs = async (req, res) => {
  const logs = await ImportLog.find().sort({ startedAt: -1 });
  res.json(logs);
};

export const getLogById = async (req, res) => {
  const log = await ImportLog.findById(req.params.id);
  if (!log) return res.status(404).json({ error: "Log not found" });
  res.json(log);
};