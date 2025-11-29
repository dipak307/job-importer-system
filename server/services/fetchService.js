// server/src/services/fetcher.js
import axios from 'axios';
// import xml2js from 'xml2js';
import { Parser } from "xml2js";

// async function fetchFeed(feedUrl) {
//   const res = await axios.get(feedUrl, { timeout: 15000 });
//   const xml = res.data;
//   const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
//   const parsed = await parser.parseStringPromise(xml);
//   // NOTE: feed structures vary. Normalize to an array of job objects.
//   // This example assumes standard rss -> channel -> item structure.
//   const items = (parsed.rss && parsed.rss.channel && parsed.rss.channel.item) || [];
//   const jobs = Array.isArray(items) ? items : [items];
//   // Normalize fields (map item fields to your Job model)
//   return jobs.map(item => ({
//     externalId: item.guid || item.id || item.link || item.title,
//     title: item.title,
//     description: item.description,
//     company: (item['dc:creator'] || item.company) || '',
//     location: item.location || item['job:location'] || '',
//     category: item.category || '',
//     type: item.type || '',
//     postedAt: item.pubDate ? new Date(item.pubDate) : undefined,
//     raw: item,
//   }));
// }

export async function fetchFeed(feedUrl) {
  try {
    const res = await axios.get(feedUrl);

    const parser = new Parser({
      explicitArray: false,
      mergeAttrs: true,
      strict: false,          // <-- FIX invalid XML
      normalizeTags: true,    // optional improvement
      normalize: true,
      trim: true
    });

    const parsed = await parser.parseStringPromise(res.data);

    return parsed.rss?.channel?.item || [];
  } catch (err) {
    console.error("FetchFeed Error:", err);
    throw err;
  }
}

// export { fetchFeed };
