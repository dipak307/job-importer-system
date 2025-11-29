import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    externalId: { type: String, index: true },
    title: String,
    company: String,
    location: String,
    description: String,
    url: String,
    postedAt: Date,
    raw: Object
  },
  { timestamps: true }
);

const Job=mongoose.model("Job", JobSchema);
export default Job;
