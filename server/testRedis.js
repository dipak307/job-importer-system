import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL
});

client.on("error", (err) => console.log("Redis Error:", err));

async function run() {
  await client.connect();
  console.log("Connected to Redis Cloud!");
  await client.set("test", "Hello Redis Cloud");
  console.log("GET:", await client.get("test"));
}

run();
