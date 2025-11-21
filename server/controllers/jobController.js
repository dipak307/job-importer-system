import Job from "../models/Job.js";

export const getJobs = async (req, res) => {
  const { page = 1, limit = 20, search = "" } = req.query;

  const filter = search
    ? { title: new RegExp(search, "i") }
    : {};

  const total = await Job.countDocuments(filter);   // ⭐ total jobs
  const jobs = await Job.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.json({
    jobs,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit)
  });
};

export const getJobById = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
};
