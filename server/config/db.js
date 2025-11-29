// import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     const host = process.env.MONGO_HOST || "127.0.0.1";
//     const port = process.env.MONGO_PORT || 27017;
//     const dbName = process.env.DB_NAME || "jobimporter";

//     const MONGO_URI = `mongodb://${host}:${port}/${dbName}`;
//     console.log("Connecting to MongoDB:", MONGO_URI);

//     await mongoose.connect(MONGO_URI);
//     console.log("MongoDB connected");
//   } catch (err) {
//     console.error("MongoDB error:", err.message);
//     process.exit(1);
//   }
// };

// export default connectDB;


// for production
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
