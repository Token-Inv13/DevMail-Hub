import { Router } from 'express';
import { cloudflareRouter } from './cloudflare.route';
import { healthRouter } from './health.route';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use('/cloudflare', cloudflareRouter);
