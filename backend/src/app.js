import cors from 'cors';
import express from 'express';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { createResourceRouter } from './routes/resources.js';
import { createSmartAssistRouter } from './routes/smartAssist.js';
import { createStore } from './lib/store.js';

export function createApp({ store = createStore(), allowedOrigin = process.env.CLIENT_ORIGIN || '*' } = {}) {
  const app = express();
  app.use(cors({ origin: allowedOrigin }));
  app.use(express.json({ limit: '32kb' }));
  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
  app.use('/api/tasks', createResourceRouter({ resource: 'tasks', store }));
  app.use('/api/notes', createResourceRouter({ resource: 'notes', store }));
  app.use('/api/smart-assist', createSmartAssistRouter());
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
