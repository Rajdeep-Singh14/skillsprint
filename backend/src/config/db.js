const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas
 * Falls back safely to in-memory instance if MONGODB_URI is not yet provided in development,
 * enabling immediate out-of-the-box evaluation without requiring local MongoDB server installation.
 */
let memoryServerInstance = null;

const startMemoryServer = async () => {
  console.log('🔄 Initializing temporary development in-memory MongoDB server so the app runs immediately...');
  const { MongoMemoryServer } = require('mongodb-memory-server');
  memoryServerInstance = await MongoMemoryServer.create();
  const memoryUri = memoryServerInstance.getUri();
  const conn = await mongoose.connect(memoryUri, { dbName: 'skillsprint' });
  console.log(`✅ Development In-Memory MongoDB Connected at: ${memoryUri}`);
  console.log(`📂 Active Database: ${conn.connection.name}`);
  console.log('💡 Note: To connect to your cloud database, set MONGODB_URI in backend/.env with your full MongoDB Atlas connection string (e.g. cluster0.abc12.mongodb.net).');
  return conn;
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && uri !== 'your_mongodb_atlas_connection_string' && !uri.includes('<username>')) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        dbName: 'skillsprint',
      });
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
      console.log(`📂 Active Database: ${conn.connection.name}`);
      return;
    } catch (error) {
      console.error(`❌ MongoDB Atlas connection error: ${error.message}`);
      console.error('💡 Tip: Check that your cluster hostname is complete (e.g. cluster0.abcde.mongodb.net, not just cluster.mongodb.net) and IP is whitelisted (0.0.0.0/0).');

      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }

      try {
        await startMemoryServer();
      } catch (memErr) {
        console.error(`❌ Failed to start in-memory MongoDB: ${memErr.message}`);
      }
      return;
    }
  }

  // Fallback in development when Atlas URI is not yet configured
  console.log('ℹ️  No Atlas MONGODB_URI configured in .env.');
  try {
    await startMemoryServer();
  } catch (memErr) {
    console.error(`❌ Failed to start in-memory MongoDB: ${memErr.message}`);
  }
};

module.exports = connectDB;
