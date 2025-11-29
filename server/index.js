// import dotenv from "dotenv";
// import express from "express";
// import http from "http";
// import { Server as IOServer } from "socket.io";
// import Redis from "ioredis";
// import IORedis from "ioredis";
// import connectDB from "./config/db.js";
// import importRoutes from "./routes/importRoutes.js";
// import jobRoutes from "./routes/jobRoutes.js";
// import cors from "cors";
// dotenv.config();
// // import path from "path";
// // import { fileURLToPath } from "url";

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // dotenv.config({ path: path.resolve(__dirname, "../.env") });

// // Detect Docker environment
// const isDocker = !!process.env.DOCKER_ENV;

// // Determine Redis host based on environment
// const redisHost = isDocker ? process.env.REDIS_HOST : "127.0.0.1";
// const REDIS_URL = `redis://${redisHost}:${process.env.REDIS_PORT}`;

// // Express setup
// const app = express();
// app.use(express.json());

// // CORS (keep your config)
// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

// // Routes
// app.use("/api/import", importRoutes);
// app.use("/api/jobs", jobRoutes);

// app.get("/health", (req, res) => res.send("OK"));

// // HTTP server for Socket.io
// const server = http.createServer(app);
// const io = new IOServer(server, {
//   cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
// });

// // Redis subscriber to forward worker events to sockets
// // const redisSub = new Redis(REDIS_URL);
// // ensure valid DB index
// const redisDb = Number(process.env.REDIS_DB) || 0;

// const redisSub = new IORedis({
//   host: process.env.REDIS_HOST || "127.0.0.1",
//   port: process.env.REDIS_PORT || 6379,
//   db: redisDb,
// });

// redisSub.on("connect", () => console.log("⚡ Redis Connected for Server PubSub"));
// redisSub.on("error", (err) => console.error("❌ Redis error:", err));

// // Subscribe to the job events channel
// const CHANNEL = process.env.REDIS_PUBSUB_CHANNEL || "job-events";
// redisSub.subscribe(CHANNEL, (err, count) => {
//   if (err) console.error("Redis subscribe error:", err);
//   else console.log(`Subscribed to ${CHANNEL} (count=${count})`);
// });

// // Forward messages to Socket.io
// redisSub.on("message", (channel, message) => {
//   try {
//     const payload = JSON.parse(message);
//     const evt = payload.event || "import-progress";
//     io.emit(evt, payload.data);
//   } catch (e) {
//     console.error("Failed to parse pubsub message:", e, message);
//   }
// });

// // Socket.io connection
// io.on("connection", (socket) => {
//   console.log("Socket connected:", socket.id);
//   socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
// });

// // Start MongoDB and server
// const PORT = process.env.PORT || 4000;
// async function start() {
//   try {
//     // Mongo host detection
//     const mongoHost = isDocker ? process.env.MONGO_HOST : "127.0.0.1";
//     const mongoPort = process.env.MONGO_PORT || 27017;
//     const dbName = process.env.DB_NAME || "jobimporter";

//     // Connect DB
//     await connectDB(`mongodb://${mongoHost}:${mongoPort}/${dbName}`);

//     // Start server
//     server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
//   } catch (err) {
//     console.error("Failed to start server:", err);
//     process.exit(1);
//   }
// }
// start();

// // Export io if needed
// export { io };

//// production version code 

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import IORedis from "ioredis";

import connectDB from "./config/db.js";
import importRoutes from "./routes/importRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";

const app = express();
app.use(express.json());

import cors from "cors";
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));

app.use("/api/import", importRoutes);
app.use("/api/jobs", jobRoutes);

app.get("/health", (req, res) => res.send("OK"));

const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET","POST"] }
});

const redisSub = new IORedis(process.env.REDIS_URL);
const CHANNEL = process.env.REDIS_PUBSUB_CHANNEL || "job-events";

redisSub.subscribe(CHANNEL, (err, count) => {
  if (err) console.error("Redis subscribe error:", err);
  else console.log(`Subscribed to ${CHANNEL} (count=${count})`);
});

redisSub.on("message", (channel, message) => {
  try {
    const payload = JSON.parse(message);
    const evt = payload.event || "import-progress";
    io.emit(evt, payload.data);
  } catch (e) {
    console.error("Failed to parse pubsub message", e, message);
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
});

const PORT = process.env.PORT || 4000;
async function start() {
  await connectDB();
  server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}
start().catch(err => { console.error(err); process.exit(1); });

export { io };
