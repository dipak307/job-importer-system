import dotenv from "dotenv";
dotenv.config();

import cron from "node-cron";
import { startImport } from "../controllers/importController.js";

// url from documents
const FEEDS = [
  "https://jobicy.com/?feed=job_feed",
  "https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time",
  "https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france",
  "https://jobicy.com/?feed=job_feed&job_categories=design-multimedia",
  "https://jobicy.com/?feed=job_feed&job_categories=data-science",
  "https://jobicy.com/?feed=job_feed&job_categories=copywriting",
  "https://jobicy.com/?feed=job_feed&job_categories=business",
  "https://jobicy.com/?feed=job_feed&job_categories=management",
  "https://www.higheredjobs.com/rss/articleFeed.cfm"
];

const fakeReq = (feedUrl) => ({ body: { feedUrl } });

const fakeRes = () => ({
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    console.log(" Controller response:", data);
  }
});

console.log("Cron service started...");

// cron.schedule("*/10 * * * * *", runImportAllFeeds);
// PRODUCTION (Run every 1 hour)

cron.schedule("0 * * * *", runImportAllFeeds);
async function runImportAllFeeds() {
  console.log("🚀 Starting hourly job import for all feeds...");

  for (const feedUrl of FEEDS) {
    console.log(`📡 Importing feed → ${feedUrl}`);

    try {
      await startImport(fakeReq(feedUrl), fakeRes());
      console.log("Started import for:", feedUrl);
    } catch (err) {
      console.error("Import failed for:", feedUrl, err.message);
    }
  }

  console.log("🎉 All feeds queued successfully!");
}

// ------------------------------------------------------
setInterval(() => {}, 1 << 30);
