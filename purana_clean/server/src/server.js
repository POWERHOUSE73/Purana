import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRouter } from './routes/auth.js';
import { orderRouter } from './routes/orders.js';
import { productRouter } from './routes/products.js';
import { seedDatabase } from './store/databaseSeed.js';
import { seedMemoryStore } from './store/memoryStore.js';

dotenv.config({ path: new URL('../.env', import.meta.url) });
dotenv.config({ path: new URL('../../.env', import.meta.url) });

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
const configuredClientOrigin = process.env.CLIENT_ORIGIN || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173');
const allowedOrigins = configuredClientOrigin
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const shouldSeedDemoData = process.env.SEED_DEMO_DATA !== 'false';

app.use(cors({
  origin(origin, callback) {
    if (!origin || !allowedOrigins.length || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  }
}));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 ? 'mongo' : 'memory' });
});

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

app.use((err, _req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  return res.status(500).json({ message: 'Server error. Please try again.' });
});

if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
} else {
  app.get('/', (_req, res) => {
    res.json({ message: 'Purana API is running. Start the client with npm run dev from the client folder.' });
  });
}

async function start() {
  if (shouldSeedDemoData) seedMemoryStore();
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected');
      if (shouldSeedDemoData) await seedDatabase();
    } catch (err) {
      console.warn('MongoDB unavailable, using demo data:', err.message);
      if (!shouldSeedDemoData) console.warn('SEED_DEMO_DATA=false and MongoDB is unavailable, so no demo data was loaded');
    }
  } else {
    console.warn(shouldSeedDemoData
      ? 'MONGO_URI not set - using in-memory demo data'
      : 'MONGO_URI not set and SEED_DEMO_DATA=false - running with empty in-memory data');
  }
  app.listen(process.env.PORT || 5000, () =>
    console.log(`Purana running on http://localhost:${process.env.PORT || 5000}`)
  );
}

start();
