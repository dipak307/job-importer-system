// server/src/cron/fetcherCron.js
import cron from 'node-cron';
import { fetchFeed } from '../services/fetcher.js';
import { jobQueue } from '../queues/jobQueue.js';
import ImportLog from '../models/ImportLog.js';
import JobModel from '../models/Job.js';


const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '25', 10);

// cron expression every hour
cron.schedule('0 * * * *', async () => {
  const feedUrl = process.env.FEED_URL || 'https://jobicy.com/?feed=job_feed';
  console.log(`Starting scheduled import for ${feedUrl}`);
  const importLog = new ImportLog({ fileName: feedUrl });

  try {
    const jobs = await fetchFeed(feedUrl);
    importLog.totalFetched = jobs.length;

    // enqueue in batches
    for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
      const batch = jobs.slice(i, i + BATCH_SIZE);
      const addPromises = batch.map(jobData =>
        jobQueue.add('importJob', { feedUrl, jobData }, {
          attempts: parseInt(process.env.RETRY_ATTEMPTS || '3', 10),
          backoff: { type: 'fixed', delay: parseInt(process.env.RETRY_BACKOFF_MS || '2000', 10) }
        })
      );
      await Promise.all(addPromises);
      importLog.totalEnqueued += batch.length;
    }

    await importLog.save();
    console.log('Enqueued all jobs and saved import log');
  } catch (err) {
    importLog.failedJobs = importLog.failedJobs + 1;
    importLog.failedDetails.push({ externalId: 'feed_fetch', reason: err.message });
    await importLog.save();
    console.error('Cron fetch failed', err);
  }
});
