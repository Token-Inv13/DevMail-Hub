import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { apiRouter } from './routes/api.route';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api', apiRouter);

  app.use((error: any, _request: Request, response: Response, _next: NextFunction) => {
    const message = error?.response?.data || error?.message || 'Internal server error';
    console.error('Server Error:', message);
    response.status(500).json({ error: message });
  });

  return app;
}
