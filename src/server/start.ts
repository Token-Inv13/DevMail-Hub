import { createServer as createViteServer } from 'vite';
import express from 'express';
import path from 'path';
import { createApp } from './app';
import { env } from './config/env';

export async function startServer() {
  const app = createApp();

  if (env.nodeEnv !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_request, response) => {
      response.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(env.port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
}
