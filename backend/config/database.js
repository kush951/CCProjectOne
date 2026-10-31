const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("[DB] MONGODB_URI is not set. Aborting startup.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
    console.log(`[DB] Database name: ${conn.connection.name}`);
  } catch (err) {
    console.error("[DB] Connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;