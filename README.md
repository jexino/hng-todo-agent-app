# Daymark: Tasks & Notes

A responsive task and notes workspace built with React, Vite, Tailwind CSS, Lucide icons, Express, and Supabase.

## Start locally

From the repository root:

```powershell
npm install
npm run dev
```

The Vite app runs at `http://localhost:5173` and the API at `http://localhost:4000`. Without Supabase environment variables the API uses an in-memory store; its data is lost when the server restarts. Copy `backend/.env.example` to `backend/.env` and set Supabase credentials for persistence. Run `backend/supabase/schema.sql` in the Supabase SQL editor first.

Run the API validation tests and build the client with:

```powershell
npm test
npm run build
```

## API

- `GET /api/health`
- `GET`, `POST /api/tasks`; `PATCH`, `DELETE /api/tasks/:id`
- `GET`, `POST /api/notes`; `PATCH`, `DELETE /api/notes/:id`
- `POST /api/smart-assist` with `{ "mode": "categorize" | "summarize", "text": "..." }`

All payloads are validated with Zod. Smart Assist currently uses deterministic prompt-template simulation logic; it does not call an external AI provider.

## Deployment Checklist: Vercel + Render

### Supabase

1. Create a Supabase project and run `backend/supabase/schema.sql` in its SQL editor.
2. Copy the project URL and service-role key from Project Settings → API. Keep the service-role key private and only set it in Render.

### Render API

1. Create a new **Web Service** from the repository.
2. Set **Root Directory** to `backend`, **Build Command** to `npm install`, and **Start Command** to `npm start`.
3. Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `CLIENT_ORIGIN` environment variables. `CLIENT_ORIGIN` should be the deployed Vercel origin; Render supplies `PORT` automatically.
4. Deploy, then confirm `https://<render-service>.onrender.com/api/health` returns `{ "status": "ok" }`.

### Vercel client

1. Import the same repository as a Vercel project and set **Root Directory** to `frontend`.
2. Use `npm install` as the install command and `npm run build` as the build command; Vite outputs to `dist`.
3. Set `VITE_API_URL` to `https://<render-service>.onrender.com/api` and redeploy.
4. Update Render's `CLIENT_ORIGIN` to the final Vercel deployment origin, then redeploy the API.
5. Test task create/edit/complete/delete, notes create/edit/delete, and both Smart Assist actions on the production URL.

## Project map

- `backend/src/routes`: task, note, and smart-assist routes
- `backend/src/controllers`: shared CRUD controller
- `backend/src/lib/store.js`: Supabase and local memory-store adapters
- `backend/__tests__/api.test.js`: Jest + Supertest API contract tests
- `backend/supabase/schema.sql`: database tables and update timestamps
- `frontend/src/App.jsx`: task and notes workflows
- `AGENTS.md`: planner, worker, and verification loops
