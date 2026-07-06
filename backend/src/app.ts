import express from 'express';
import cors from 'cors';
import { config, useMocks } from './config/env';
import authRoutes from './routes/auth.routes';
import scheduleRoutes from './routes/schedule.routes';
import emailRoutes from './routes/emails.routes';
import historyRoutes from './routes/history.routes';

const app = express();

app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => res.json({ ok: true, mode: useMocks ? 'sandbox' : 'production' }));

app.use('/api/auth', authRoutes);
app.use('/api/schedule-email', scheduleRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/history', historyRoutes);

// Fallbacks for incorrectly configured VITE_API_URL
app.use('/auth', authRoutes);
app.use('/schedule-email', scheduleRoutes);
app.use('/emails', emailRoutes);
app.use('/history', historyRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

export default app;
