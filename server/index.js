// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import connectDB from "./config/db.js";
// import importRoutes from "./routes/importRoutes.js";
// import jobRoutes from "./routes/jobRoutes.js";
// import cors from 'cors'

// const app = express();
// app.use(express.json());
// app.use(cors({
//   origin: "http://localhost:3000",   
//   methods: "GET,POST,PUT,DELETE",
//   credentials: true
// }));


// // console.log(process.env.PORT,"PORTSS");

// // Connect MongoDB
// connectDB();

// app.get("/", (req, res) => {
//   res.send("Backend running with ES Modules");
// });

// // Routes code 
// app.use("/api/import", importRoutes);
// app.use("/api/jobs", jobRoutes);  

// app.listen(process.env.PORT, () => {
//   console.log(`Server running on port ${process.env.PORT}`);
// });


/////////// for using socket io code 

// server/index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import Redis from "ioredis";

import connectDB from "./config/db.js";
import importRoutes from "./routes/importRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";

const app = express();
app.use(express.json());

// CORS (keep as you had)
import cors from "cors";
app.use(cors({ origin: "http://localhost:3000", methods: "GET,POST,PUT,DELETE", credentials: true }));

// routes
app.use("/api/import", importRoutes);
app.use("/api/jobs", jobRoutes);

// create http server for socket.io
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET","POST"] }
});

// Redis subscriber to forward worker events to connected sockets
const redisSub = new Redis(process.env.REDIS_URL);

// subscribe to the events channel
const CHANNEL = process.env.REDIS_PUBSUB_CHANNEL || "job-events";
redisSub.subscribe(CHANNEL, (err, count) => {
  if (err) console.error("Redis subscribe error:", err);
  else console.log(`Subscribed to ${CHANNEL} (count=${count})`);
});

redisSub.on("message", (channel, message) => {
  try {
    const payload = JSON.parse(message);
    // emit by event name or generic channel
    // payload should include event and data
    const evt = payload.event || "import-progress";
    io.emit(evt, payload.data);
  } catch (e) {
    console.error("Failed to parse pubsub message", e, message);
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// connect DB and start server
const PORT = process.env.PORT || 4000;
async function start() {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
}
start().catch(err => { console.error(err); process.exit(1); });

// export io if needed later (not used by worker here)
export { io };



