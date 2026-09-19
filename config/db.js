const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows local ISP DNS blocking MongoDB SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore DNS set failure in restricted serverless / container environments
}

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    // Connect to MongoDB using environment variable
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[Database] Error connecting to MongoDB: ${err.message}`);

    // In local development, fallback to Memory Server if explicitly enabled or failed
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.warn('[Database] Attempting Mongo Memory Server fallback for local testing...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const inMemoryUri = mongoServer.getUri();

        const conn = await mongoose.connect(inMemoryUri);
        console.log(`[Database] Connected to In-Memory MongoDB Fallback Server: ${conn.connection.host}`);
        return;
      } catch (fallbackErr) {
        console.error(`[Database] Memory server fallback failed: ${fallbackErr.message}`);
      }
    }

    process.exit(1);
  }
};

module.exports = connectDB;
