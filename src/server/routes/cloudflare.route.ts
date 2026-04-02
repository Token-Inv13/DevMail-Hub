import { NextFunction, Request, Response, Router } from 'express';
import { requireCloudflareApiToken } from '../config/env';
import { cloudflareService } from '../services/cloudflare.service';

export const cloudflareRouter = Router();

function asyncHandler(handler: (request: Request, response: Response, next: NextFunction) => Promise<void>) {
  return (request: Request, response: Response, next: NextFunction) => {
    handler(request, response, next).catch(next);
  };
}

function ensureCloudflareConfigured() {
  requireCloudflareApiToken();
}

cloudflareRouter.get(
  '/zones',
  asyncHandler(async (_request, response) => {
    ensureCloudflareConfigured();
    response.json(await cloudflareService.listZones());
  }),
);

cloudflareRouter.post(
  '/setup-dns',
  asyncHandler(async (request, response) => {
    const { zoneId, domainName } = request.body as { zoneId?: string; domainName?: string };
    if (!zoneId || !domainName) {
      response.status(400).json({ error: 'zoneId and domainName are required' });
      return;
    }

    ensureCloudflareConfigured();
    response.json(await cloudflareService.setupDns(zoneId, domainName));
  }),
);

cloudflareRouter.get(
  '/verify-dns/:zoneId',
  asyncHandler(async (request, response) => {
    const { zoneId } = request.params;
    if (!zoneId) {
      response.status(400).json({ error: 'zoneId is required' });
      return;
    }

    ensureCloudflareConfigured();
    response.json(await cloudflareService.verifyDns(zoneId));
  }),
);

cloudflareRouter.post(
  '/create-subdomain',
  asyncHandler(async (request, response) => {
    const { zoneId, subdomain, target } = request.body as {
      zoneId?: string;
      subdomain?: string;
      target?: string;
    };

    if (!zoneId || !subdomain || !target) {
      response.status(400).json({ error: 'zoneId, subdomain, and target are required' });
      return;
    }

    ensureCloudflareConfigured();
    response.json(await cloudflareService.createSubdomain(zoneId, subdomain, target));
  }),
);
