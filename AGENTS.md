<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

This repo contains **two independent Next.js 16 apps**, each with its own `package.json`, `package-lock.json`, and `node_modules` (install/run them separately, npm):

| App | Path | What it is | Run (dev) |
| --- | --- | --- | --- |
| `rutas-tampico` | `/workspace` (root) | Bus-routes PWA (Leaflet map + Firebase Firestore presence/suggestions); also a Capacitor Android wrapper | `npm run dev` |
| `planeaciones-nautica` | `/workspace/planeaciones-nautica` | Academic planning tool; generates F-32/F-51/exam `.docx` client-side, plus optional AI PowerPoint | `npm run dev` |

Standard scripts (`dev`/`build`/`lint`/`start`) are in each `package.json`.

Non-obvious caveats:
- Both apps default to port **3000**. To run them at the same time, pass a port, e.g. `npm run dev -- --port 3100` for the nested app.
- Running `npm run lint` at the **root** also lints `planeaciones-nautica` (root eslint flat config has no ignore for the nested folder); the nested folder has its own `npm run lint` too. There are a few pre-existing lint errors in both apps — not environment issues.
- Root `next.config.js` sets `output: "export"` (static export). `next dev` works normally; `npm run build` emits a static site (no SSR for the root app).
- `planeaciones-nautica`'s `/api/presentaciones` route (the "Generar Presentación IA" button) requires `OPENAI_API_KEY` in the environment. Everything else in that app — semester/subject selection and all `.docx` (F-32, F-51, exams) generation — works client-side without any key.
- Firebase config in `app/firebase.ts` is hardcoded (public web config), so the root app's online-users/suggestions features work without secrets.
- Running the nested app prints a harmless Turbopack warning about multiple lockfiles (it detects both `package-lock.json` files).
