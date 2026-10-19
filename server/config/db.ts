import mongoose from 'mongoose';

let isConnected = false;
let mongoMemoryServerInstance: any = null;

export async function connectDB(): Promise<void> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGO_URI;

  if (uri) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      console.log('[Database] Connected to external MongoDB URI');
      return;
    } catch (err) {
      console.error('[Database] Failed to connect to MONGO_URI, falling back...', err);
    }
  }

  // Try local default mongod instance
  try {
    const localUri = 'mongodb://127.0.0.1:27017/sgpa_cgpa_db';
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 1500 });
    isConnected = true;
    console.log(`[Database] Connected to local MongoDB at ${localUri}`);
    return;
  } catch (localErr) {
    // Fallback: in-memory MongoDB instance for development & testing
    try {
      if (!mongoMemoryServerInstance) {
        console.log('[Database] Starting in-memory MongoDB instance...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoMemoryServerInstance = await MongoMemoryServer.create();
      }
      const memUri = mongoMemoryServerInstance.getUri();
      await mongoose.connect(memUri);
      isConnected = true;
      console.log(`[Database] Connected to MongoMemoryServer at ${memUri}`);
    } catch (memErr) {
      console.error('[Database] Error starting MongoMemoryServer:', memErr);
      throw memErr;
    }
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
    mongoMemoryServerInstance = null;
  }
}
