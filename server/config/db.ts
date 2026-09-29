import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sgpa_cgpa_db';
  
  try {
    // Set low selection timeout to fail fast if local mongod isn't running
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] Connected to MongoDB at ${uri}`);
  } catch (err) {
    console.log('[Database] Local MongoDB server not found. Starting in-memory MongoDB instance...');
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const mongoUri = mongoMemoryServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`[Database] Connected to MongoMemoryServer at ${mongoUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to connect to MongoDB:', memErr);
      process.exit(1);
    }
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}
