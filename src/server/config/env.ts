import dotenv from 'dotenv';

dotenv.config();

export const env = {
  cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
};

export function requireCloudflareApiToken() {
  if (!env.cloudflareApiToken) {
    throw new Error('CLOUDFLARE_API_TOKEN is not set');
  }

  return env.cloudflareApiToken;
}
