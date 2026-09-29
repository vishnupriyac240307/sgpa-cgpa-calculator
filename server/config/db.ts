import mongoose from 'mongoose';

let isConnected = false;
let mongoMemoryServerInstance: any = null;

export async function connectDB(): Promise<void> {
  // Reuse existing connection if already connected (vital for Serverless Functions)
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
      console.log('[Database] Successfully connected to MongoDB');
      return;
    } catch (err) {
      console.error('[Database] Failed to connect to MONGO_URI:', err);
      throw err;
    }
  }

  // If deployed on Vercel or in production without MONGO_URI
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    console.warn('[Database] Warning: MONGO_URI is not defined in environment variables.');
    return;
  }

  // Local development fallback: try local mongod first
  try {
    const localUri = 'mongodb://127.0.0.1:27017/sgpa_cgpa_db';
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 1500 });
    isConnected = true;
    console.log(`[Database] Connected to local MongoDB at ${localUri}`);
    return;
  } catch (localErr) {
    // Local fallback: dynamic import of mongodb-memory-server so it is never loaded in production / Vercel
    try {
      console.log('[Database] Starting local in-memory MongoDB instance for development...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const memUri = mongoMemoryServerInstance.getUri();
      await mongoose.connect(memUri);
      isConnected = true;
      console.log(`[Database] Connected to MongoMemoryServer at ${memUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to start local MongoMemoryServer:', memErr);
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
