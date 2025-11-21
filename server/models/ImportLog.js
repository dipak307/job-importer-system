import mongoose from "mongoose";

const ImportLogSchema = new mongoose.Schema(
  {
    feedUrl: String,
    startedAt: Date,
    finishedAt: Date,
    totalFetched: Number,
    expectedCount: Number,
    processedCount: Number,
    newJobs: Number,
    updatedJobs: Number,
    failedCount: Number,
    failedJobs: Array
  },
  { timestamps: true }
);

export default mongoose.model("ImportLog", ImportLogSchema);
