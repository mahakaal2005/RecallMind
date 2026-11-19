const mongoose = require('mongoose');

// Throws on failure; the caller decides whether to exit (local server) or return a 500 (serverless).
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
};

module.exports = connectDB;
