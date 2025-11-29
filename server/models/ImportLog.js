// server/src/models/ImportLog.js
import mongoose from "mongoose";

const FailedDetailSchema = new mongoose.Schema({
  externalId: String,
  reason: String,
}, { _id: false });

const ImportLogSchema = new mongoose.Schema({
  feedUrl: { type: String },
  startedAt: { type: Date, default: Date.now },
  totalFetched: { type: Number, default: 0 },
  totalEnqueued: { type: Number, default: 0 },
  totalImported: { type: Number, default: 0 },
  newJobs: { type: Number, default: 0 },
  updatedJobs: { type: Number, default: 0 },
  failedJobs: { type: Number, default: 0 },
  failedDetails: [
    {
      jobId: String,
      reason: String,
    }
  ]
}, { timestamps: true });

export default mongoose.model('ImportLog', ImportLogSchema);