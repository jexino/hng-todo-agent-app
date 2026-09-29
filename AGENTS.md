# Agent Instructions

## Purpose

Build and maintain Daymark, a task and notes application with a Vite/React client, an Express API, Supabase persistence, and an explicitly simulated smart-assist feature. Keep the app usable locally without Supabase credentials and deployable as two services.

## Rules

1. Read the files at the behavior boundary before changing them. Follow nearby naming, module, and error-handling conventions.
2. Keep changes scoped to the requested behavior. Preserve existing user files and avoid unrelated refactors.
3. Keep the API as the source of truth for validation. Validate request bodies and resource IDs, reject unknown input keys, and use consistent JSON errors.
4. Keep the Supabase service-role key on the server. Never expose it through Vite variables or client code.
5. Use the shared resource controller and store contract for task and note CRUD. Add behavior at the closest owning module rather than duplicating endpoint logic.
6. Make async UI actions report errors, represent loading/busy states, and update local state only after the API confirms a change.
7. Label the smart-assist behavior accurately. The current implementation is a deterministic prompt-template simulation; do not describe it as a connected AI model.
8. Prefer accessible native controls, explicit labels, keyboard-visible focus, and responsive layouts.
9. Keep code modular and remove dead code when editing. Do not leave placeholder comments or unfinished stubs.
10. Do not commit, reset, or discard user work unless explicitly asked.

## Planner Loop

1. **Anchor:** Identify the named file, failing behavior, endpoint, UI action, or closest call site.
2. **Trace:** Read only enough neighboring implementation and tests to determine who owns the behavior.
3. **Hypothesis:** State one testable explanation of how the behavior should work or why it is failing.
4. **Check:** Pick the cheapest discriminating check, such as an endpoint test, component build, or syntax/type check.
5. **Plan:** Define the smallest edit that addresses the hypothesis and name the affected files.
6. **Proceed:** If the request is actionable and evidence is sufficient, implement without pausing for approval.

## Worker Loop

1. Work on one behavior slice at a time: API/store, validation/tests, client state/workflow, or deployment configuration.
2. Make the smallest coherent edit and preserve unrelated changes.
3. Keep route handling thin; put CRUD decisions in controllers and persistence decisions in the store.
4. Keep shared client request/error handling in `frontend/src/api.js`; keep screen state and interaction flow in `frontend/src/App.jsx`.
5. Add tests at the layer that can falsify the behavior. Prefer Supertest for HTTP contracts.
6. After the first substantive edit, immediately run its narrowest available check before broadening the change.
7. If validation fails, distinguish environment/setup failures from code failures. Repair the same slice and rerun the same check.
8. Before finishing, review all requested requirements and report any external setup still needed.

## Self-Verification Loops

### API changes

1. Verify request schema constraints, status codes, not-found behavior, and error envelope.
2. Run `npm test --workspace backend` from the repository root.
3. Confirm task CRUD, note CRUD, malformed IDs, invalid bodies, and smart-assist input are covered when touched.

### Frontend changes

1. Run `npm run build --workspace frontend` from the repository root.
2. Check task and note create/read/edit/delete paths, completion toggle, search/filter, and smart-assist loading/error states.
3. Check responsive behavior at narrow and wide viewport sizes when a browser is available.

### Persistence and deployment

1. Run `backend/supabase/schema.sql` in the Supabase SQL editor before configuring the production API.
2. Confirm Supabase URL and service-role key exist only in backend environment settings.
3. Configure the deployed client origin on the API and the API base URL on the client.
4. Verify `GET /api/health`, then verify task and note persistence across API restarts when Supabase is configured.

## Completion Gate

Do not call the work complete until all critical requirements are accounted for: task CRUD, notes, smart-assist prompt simulation, this guide, endpoint validation tests, and deployment steps. State exactly which checks ran and identify any that could not run.