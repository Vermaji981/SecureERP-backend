const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://hv0563163_db_user:UgeGfg2uMhqnnCNh@datamanagement.uvvgy90.mongodb.net';
    
    // Attempt standard connection
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`[Database] Local MongoDB connection failed (${err.message}). Attempting Mongo Memory Server fallback...`);
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`[Database] Connected to In-Memory MongoDB Fallback Server: ${conn.connection.host}`);
    } catch (fallbackErr) {
      console.error(`[Database] Error connecting to database: ${fallbackErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
