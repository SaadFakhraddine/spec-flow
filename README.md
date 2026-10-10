# SpecFlow

[![CI](https://github.com/SaadFakhraddine/spec-flow/actions/workflows/ci.yml/badge.svg)](https://github.com/SaadFakhraddine/spec-flow/actions/workflows/ci.yml)

Internal tool for feature requests, technical specifications, and the tasks that fall out of them. Admins write specs and assign work. Developers move tasks through the pipeline.

## Stack

- Vue 3 Composition API, TypeScript, Pinia, Vue Router, Tailwind, Zod, Axios
- Node.js, Express, TypeScript, MongoDB, Mongoose
- JWT access tokens (15 minutes, memory only) and rotating refresh tokens (7 days, httpOnly cookie)
- Vitest, Vue Test Utils, Supertest, mongodb-memory-server

## Run locally

MongoDB has to be running. From the repo root:

```bash
docker compose up -d
```

Or point `specflow-backend/.env` at a MongoDB Atlas URI.

```bash
cd specflow-backend
npm install
npm run seed
npm run dev
```

```bash
cd specflow-frontend
npm install
npm run dev
```

The UI is at http://localhost:5173 and the API at http://localhost:4000.

## Demo accounts

Seeded by `npm run seed` in `specflow-backend` (set `SEED_FORCE=true` to replace existing demo data).

| Role | Email | Password | Notes |
| --- | --- | --- | --- |
| Admin | admin@specflow.dev | Admin1234! | Alex Rivera — list default, teal accent |
| Developer | dev@specflow.dev | Dev12345! | Jordan Lee — board default, dark/amber |

The seed fills specs (including approved + archived), tasks across every board column with due dates / blockers / checklists, comments with mentions, notifications, activity, revisions, and saved filters.

Public registration always creates a developer. The admin account comes from the seed.

## Tests

```bash
cd specflow-backend && npm test
cd specflow-frontend && npm test
```

## Portfolio screenshots

Capture PNGs of the main views for an external portfolio site (output is **gitignored**).

1. Start Mongo, seed, and run the API (`npm run seed` then `npm run dev` in `specflow-backend`).
2. From `specflow-frontend`, set `VITE_API_URL` if needed, then:

```bash
npm run portfolio:shots
```

Images land in `specflow-frontend/portfolio-shots/` (e.g. `01-login.png`). Copy them into your portfolio repo locally — do not commit them here. CI still runs only the smoke e2e suite.

## Deploy

1. Create a MongoDB Atlas free cluster and copy the connection string.
2. Deploy `specflow-backend` to Railway (or Render). Build command `npm run build`, start command `npm start`. Set `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, and `NODE_ENV=production`.
3. Deploy `specflow-frontend` to Vercel. Set `VITE_API_URL` to `/api` so the browser talks to the same origin; `vercel.json` proxies `/api/*` to the Render/Railway API (update that destination if your API host changes). The SPA fallback rewrite stays in place.
4. Set `FRONTEND_URL` on the API to the Vercel origin. With the `/api` proxy, also set `REFRESH_COOKIE_FIRST_PARTY=true` on the API so the refresh cookie is `SameSite=Lax` (first-party). Without the proxy, omit that flag and the API uses `SameSite=None; Secure; Partitioned` for cross-site cookies.
5. Run the seed against the Atlas database, or create the two demo users there.
6. Public self-registration is **off** when `NODE_ENV=production` unless you set `ALLOW_PUBLIC_REGISTER=true`. Prefer seeding or inviting users in production. Seed is blocked in production unless `ALLOW_SEED=true`.
7. Developers may only update (or bulk-update) tasks **assigned to them**; admins can edit any task. Specs always create as `draft` and advance through status transitions.

Dependabot is configured under `.github/dependabot.yml` for weekly npm updates on both apps.

## How to describe it

Built SpecFlow, a full stack internal tool for managing technical specifications and development tasks. Vue 3 Composition API with TypeScript strict, Pinia, Vue Router, and Zod validation on the frontend. Node.js Express backend with MongoDB, JWT auth with refresh token rotation, role based access control, rate limiting, and input validation. Comprehensive unit and integration tests with Vitest and mongodb-memory-server. Deployed on Vercel and Railway.
