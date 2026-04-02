# DevMail Hub

DevMail Hub is a React + Firebase application for managing QA mailboxes, simulating inbound messages and app activity, and automating parts of DNS setup through Cloudflare.

## Stack

- React 19 + Vite + TypeScript
- Firebase Auth + Firestore
- Express dev server
- Cloudflare API integration for DNS automation

## Features

- Create and manage test mailboxes per project
- Simulate signup, reset-password, and notification emails
- Track mailbox-linked activity logs
- Connect Cloudflare zones and automate MX/SPF setup
- Generate and rotate a personal API key
- Test webhook callbacks from the settings screen

## Local development

### Prerequisites

- Node.js 20+
- npm

### Environment

Start from `.env.example` and define the values you need:

- `GEMINI_API_KEY`: optional if Gemini-backed functionality is reintroduced
- `APP_URL`: optional deployment URL
- `CLOUDFLARE_API_TOKEN`: required for Cloudflare API routes

The project also expects Firebase configuration from `firebase-applet-config.json`.

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

This starts the Express server from [server.ts](/home/token/Documents/DevMail-Hub/server.ts), mounts the API routes, and serves the Vite app in middleware mode during development.

## Scripts

```bash
npm run dev
npm run lint
npm run test
npm run build
```

## Project structure

- `src/App.tsx`: root app composition and lazy-loaded screens
- `src/pages/`: top-level screens
- `src/components/`: reusable UI and feature components
- `src/hooks/`: orchestration hooks for frontend state and actions
- `src/services/`: network and pure business helpers
- `src/repositories/`: Firestore data access helpers
- `src/server/`: Express app, routes, services, and environment config

## Tests

Targeted tests currently cover:

- mailbox draft generation in `src/services/mailboxFactory.ts`
- Cloudflare client request handling in `src/services/cloudflare.service.ts`
- repository sorting helpers in `src/repositories/*`

Run them with:

```bash
npm run test
```

## Notes

- The frontend is production-built with manual chunk splitting in `vite.config.ts`.
- Cloudflare routes fail cleanly when `CLOUDFLARE_API_TOKEN` is missing; the server still starts.
- Some product areas remain simulated by design, especially parts of the mailbox/app activity flow.
