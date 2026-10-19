import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import academicRoutes from './routes/academic';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Connect DB middleware for API calls
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    try {
      await connectDB();
      next();
    } catch (err: any) {
      console.error('Database connection error in middleware:', err);
      res.status(500).json({ error: 'Database connection failure.' });
      return;
    }
  } else {
    next();
  }
});

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/academic', academicRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'CSDA SGPA & CGPA Calculator Backend' });
});

// Serve frontend static build if available
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

app.use(express.static(distPath));

// SPA fallback for non-API GET requests
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) next();
    });
  }
  next();
});

export default app;
