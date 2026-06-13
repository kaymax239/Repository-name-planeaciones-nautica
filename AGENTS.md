<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

This repo contains **two independent Next.js 16 apps** (not a shared workspace); each has its own `package.json`, lockfile, and `node_modules`:

- **Root `rutas-tampico`** (`/workspace`): live bus-tracking PWA ("Rutas Kaymax"). `next.config.js` uses `output: "export"`; Firebase config is hard-coded in `app/firebase.ts`, so **no env vars are needed**. Live map/presence features need internet (Firestore + OpenStreetMap tiles).
- **`planeaciones-nautica`** (`/workspace/planeaciones-nautica`): academic lesson-planning + AI PowerPoint generator. Doc generation (F-32 / F-51 / exams via `docxtemplater`) is fully client-side and needs no key. Only the AI presentation route (`app/api/presentaciones/route.ts`, `POST /api/presentaciones`) requires `OPENAI_API_KEY` (optional `OPENAI_PRESENTACIONES_MODEL`, default `gpt-4o-mini`); without it that one route returns HTTP 500 but the rest of the app works.

Run commands (standard scripts in each `package.json`: `dev`, `build`, `start`, `lint`):

- Both apps default to **port 3000**. To run them simultaneously, give one a different port, e.g. run nautica with `npm run dev -- -p 3001`.
- Running nautica logs a harmless "multiple lockfiles" workspace-root warning because the root lockfile is detected too; it is not an error.
- `npm run lint` works in both apps but currently reports **pre-existing** lint errors (e.g. `react-hooks/set-state-in-effect` in `app/Mapa.tsx`, `@next/next/no-html-link-for-pages` in `planeaciones-nautica/app/presentaciones/page.tsx`). These are not caused by setup.
