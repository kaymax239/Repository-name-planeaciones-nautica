# LÉEME PRIMERO — Planeaciones Náutica IA

> Nota de continuidad para retomar el proyecto en cualquier computadora.

## ✅ Este es el repositorio CORRECTO

- **Repo:** `kaymax239/Repository-name-planeaciones-nautica`
- **Rama:** `fase-0-corpus-historicas`
- Aquí vive el trabajo real y completo: PN/MN (semestres I, III, V, VII), Inglés
  por niveles con planeaciones históricas reales, F-32, F-51, exámenes y
  presentaciones con Gemini.

⛔ **NO uses el repo `kaymax239/rutas-tampico`** para las planeaciones: ese es,
sobre todo, la app de mapas/rutas de Tampico y tiene una copia VIEJA del inglés.

## ▶ Cómo dejarlo listo en una computadora nueva

```bash
git clone https://github.com/kaymax239/Repository-name-planeaciones-nautica.git
cd Repository-name-planeaciones-nautica
git checkout fase-0-corpus-historicas
cd planeaciones-nautica
npm install
```

Crea el archivo `planeaciones-nautica/.env.local` (NO se sube a git) con:

```
GEMINI_API_KEY=TU_KEY_DE_GOOGLE_AI_STUDIO
GEMINI_MODEL=gemini-2.5-flash
GEMINI_MODEL_PRESENTACIONES=gemini-2.5-flash
```

> Importante: usa **gemini-2.5-flash** en ambos. La key actual NO tiene cuota
> para `gemini-2.5-pro` (da error 429). Cuando subas de plan, podrás usar pro.

Luego:

```bash
npm run dev
```

## Estado del flujo de Inglés

- Niveles con planeaciones históricas reales: **3, 4, 5, 6, 7** (índice en
  `.indice-ingles/indice.json`).
- Niveles **1, 2 y 8: pendientes** de subir sus planeaciones históricas. Cuando
  se suban a la carpeta `planeaciones historicas ingles/` y se reindexe
  (`node scripts/indexar-ingles.mjs`), aparecen solos en la interfaz.
- El botón de Inglés genera: planeación (F-32), avance (F-51) y presentación
  (PowerPoint), todo espejeando las planeaciones históricas del nivel + iDiscover.
  Nunca usa STCW.
