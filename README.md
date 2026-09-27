# SpecFlow

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

Seeded by `npm run seed` in `specflow-backend`.

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@specflow.dev | Admin1234! |
| Developer | dev@specflow.dev | Dev12345! |

Public registration always creates a developer. The admin account comes from the seed.

## Tests

```bash
cd specflow-backend && npm test
cd specflow-frontend && npm test
```

## Deploy

1. Create a MongoDB Atlas free cluster and copy the connection string.
2. Deploy `specflow-backend` to Railway (or Render). Build command `npm run build`, start command `npm start`. Set `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, and `NODE_ENV=production`.
3. Deploy `specflow-frontend` to Vercel. Set `VITE_API_URL` to the Railway URL. The included `vercel.json` keeps client-side routes working.
4. Set `FRONTEND_URL` on the API to the Vercel origin so CORS and the refresh cookie (`SameSite=None; Secure`) match.
5. Run the seed against the Atlas database, or create the two demo users there.

## How to describe it

Built SpecFlow, a full stack internal tool for managing technical specifications and development tasks. Vue 3 Composition API with TypeScript strict, Pinia, Vue Router, and Zod validation on the frontend. Node.js Express backend with MongoDB, JWT auth with refresh token rotation, role based access control, rate limiting, and input validation. Comprehensive unit and integration tests with Vitest and mongodb-memory-server. Deployed on Vercel and Railway.
