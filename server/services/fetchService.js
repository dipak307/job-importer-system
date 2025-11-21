import axios from "axios";
import xml2js from "xml2js";

export default async function fetchFeed(url) {
  const xml = (await axios.get(url)).data;
  const json = await xml2js.parseStringPromise(xml, { explicitArray: false });

  let items = [];

  if (json.rss?.channel?.item) items = json.rss.channel.item;
  if (!Array.isArray(items)) items = [items];

  return items.map((it) => ({
    externalId: it.guid?._ || it.guid || null,
    title: it.title,
    company: it["dc:creator"] || "",
    location: it.location || "",
    description: it.description,
    url: it.link,
    postedAt: it.pubDate ? new Date(it.pubDate) : null,
    raw: it
  }));
}
