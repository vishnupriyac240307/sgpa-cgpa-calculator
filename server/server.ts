import app from './app';
import { connectDB } from './config/db';
import { syncDiskToDatabase } from './services/fileStore';

const PORT = process.env.PORT || 5001;

async function startServer() {
  await connectDB();
  await syncDiskToDatabase();
  const PORT = Number(process.env.PORT) || 5001;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] CSDA Calculator Backend running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Failed to start:', err);
});
