# Auditoría Técnica — Planeaciones Náutica

> Auditoría de **solo lectura** generada el **2026-06-21**.
> No se modificó código, datos, dependencias ni configuración. No se hicieron commits ni push.
>
> **Proyecto auditado:** `C:\Users\Dell\rutas-tampico\planeaciones-nautica` (repo Git `rutas-tampico`).
> ⚠️ Existe una **copia paralela** en `C:\Users\Dell\rutas-tampico-mapa\planeaciones-nautica` — ver §5.

---

## 1. Resumen Ejecutivo

| Campo | Valor |
|---|---|
| **Nombre** | `planeaciones-nautica` — Sistema académico "Planeación F-32" (UMPM / Escuela Náutica Mercante de Tampico) |
| **Propósito** | Generar planeaciones F-32, avances programáticos F-51, exámenes y **presentaciones de clase con IA**, a partir de los programas oficiales FIDENA 2022 (PN y MN). |
| **Estado general** | 🟢 **Operativo (funcional end-to-end)**, pero con datos académicos **parcialmente sin verificar**. |
| **Riesgo actual** | 🟡 **Medio** (exposición de costo de IA sin autenticación + exactitud de datos auto-extraídos + higiene del repo). |
| **Avance estimado** | **~60%** hacia herramienta interna usable; **~40%** hacia liberación pública completa (ver §9). |

**Diagnóstico.** A diferencia de un prototipo, este proyecto tiene un **motor real y bien diseñado**: flujo completo de selección (carrera → semestre → materia → datos → documento), exportación Word por plantillas `docxtemplater`, generación de PowerPoint con `pptxgenjs`, e integración con **Claude (Opus 4.8)** anclada al programa oficial, con validación `zod`, cache en disco y **degradación elegante** a un generador determinista cuando no hay IA. La arquitectura es sólida y la separación de responsabilidades (datos / lib / API / UI) es clara.

Los riesgos no están en la ingeniería sino en: (1) **calidad/cobertura de los datos** —solo el 1.er semestre PN está verificado a mano contra el PDF; el resto se auto-extrajo y contiene marcadores `"Pendiente de revisión"`—; (2) **costo y seguridad de la IA** —endpoint Opus sin autenticación ni límite de uso, y cache efímero en Vercel—; y (3) **higiene del repositorio** (258 MB de PDFs versionados, copia duplicada del proyecto, README boilerplate).

---

## 2. Estructura

```
planeaciones-nautica/
├── app/
│   ├── page.tsx                 ⭐ UI completa + exportación Word (F-32/F-51/exámenes) — 1,489 líneas
│   ├── layout.tsx · globals.css
│   ├── api/
│   │   └── presentacion/route.ts   ⭐ Endpoint IA (Claude Opus) — server only
│   ├── lib/
│   │   ├── promptPresentacion.ts    System prompt + contexto oficial para la IA
│   │   ├── esquemaPresentacion.ts   Validación zod de la salida de la IA (15 tipos de bloque)
│   │   ├── cachePresentacion.ts     Cache en disco del guion IA (hash sha1)
│   │   ├── construirPresentacionV2.ts  Generador DETERMINISTA (fallback sin IA)
│   │   ├── pptxOficialV2.ts         Renderer PPTX visual (portada, compás, diagramas) — 434 líneas
│   │   └── pptxOficial.ts           Renderer base V1 (reutilizado por V2)
│   └── data/
│       ├── materias.ts             Menús PN y MN por semestre (Inglés excluido)
│       ├── tipos.ts                Tipo ProgramaOficial + type guard esProgramaOficial
│       ├── contenidosMaterias.ts   Agrega los 8 archivos de contenido (PN + MN)
│       ├── contenidos/
│       │   ├── semestre1/3/5/7.ts   PN — temario oficial (Record<string,ProgramaOficial>)
│       │   └── mn1/3/5/7.ts         MN — temario oficial
│       ├── calendario.ts           Calendario FIDENA 2026 (18 semanas, asuetos, exámenes)
│       ├── evaluacion.ts           Criterios DEN/526/2025 (porcentajes y escala)
│       ├── distribucion.ts         Reparte el temario en las 18 semanas del F-32
│       └── presentaciones/         Registro premium, tipos V1/V2, decks Álgebra U1
├── public/templates/
│   ├── F-32.docx · Avance-Programatico-F51.docx · examen-parcial.docx · examen-ordinario.docx
│   └── biblioteca/                 183 PDFs oficiales FIDENA (PN+MN, 8 semestres) — 258 MB ⚠️
├── AUDITORIA-PROGRAMAS-OFICIALES.md   Inventario previo de los 166 programas
├── CLAUDE.md → AGENTS.md            Aviso "este Next.js tiene breaking changes; lee node_modules/next/dist/docs"
├── .env.example                    ANTHROPIC_API_KEY / ANTHROPIC_MODEL
├── .vercel/project.json            Proyecto Vercel configurado (deploy listo)
└── Presentacion_ALG103_U1(.|_V2).pptx   Artefactos generados (no versionados) ⚠️
```

**Módulos críticos:** [app/page.tsx](app/page.tsx) (UI + Word), [app/api/presentacion/route.ts](app/api/presentacion/route.ts) (IA), [app/data/contenidos/](app/data/contenidos/) (fuente de verdad), [app/lib/construirPresentacionV2.ts](app/lib/construirPresentacionV2.ts) (fallback determinista).

---

## 3. Tecnologías

| Categoría | Detalle |
|---|---|
| **Framework** | Next.js **16.2.6** (App Router, Route Handlers) — versión nueva con breaking changes (lo advierte `AGENTS.md`). |
| **UI** | React **19.2.4**, Tailwind CSS **4**. |
| **Lenguaje** | TypeScript **5** (`strict`), ESLint 9 (`eslint-config-next`). |
| **Base de datos** | ❌ **Ninguna.** El estado es `useState` en cliente (no se persiste la captura). El único almacenamiento es el **cache en disco** del guion IA (`.presentaciones-cache`, efímero en Vercel). |
| **IA / API** | **`@anthropic-ai/sdk` 0.104.2** → Claude **`claude-opus-4-8`** (configurable vía `ANTHROPIC_MODEL`). `streaming` + `thinking: adaptive` + `effort: high`, `max_tokens: 32000`. |
| **Word (DOCX)** | `docxtemplater` 3.68.7 + `pizzip` 3.2.0 (relleno de plantillas por placeholders `{...}`), `file-saver` 2.0.5 (descarga). Todo en cliente. |
| **PowerPoint (PPTX)** | `pptxgenjs` 4.0.1 (render en cliente). |
| **Validación** | `zod` 4.4.3 (esquema estricto de la salida de la IA). |
| **Deploy** | **Vercel** (proyecto `planeaciones-nautica` ya vinculado; `maxDuration=300` requiere plan **Pro**). |

✅ **Buenas prácticas observadas:** versiones de dependencias **fijadas** (no `latest`), `package-lock.json` presente, `.env*` y `node_modules` correctamente ignorados, API key **solo en servidor**, validación de la respuesta de IA antes de usarla.

---

## 4. Estado de Funcionalidades

### Planeaciones

| Funcionalidad | Estado | Evidencia |
|---|---|---|
| Generación automática de planeaciones | ✅ **Funciona** | `generarWord()` rellena `F-32.docx` con `distribuirPrograma()` (temario oficial repartido en 18 semanas con fechas y criterios). |
| Flujo completo materia → documento | ✅ **Funciona** | Paso 1 carrera/semestre → Paso 2 materia → Paso 3 datos → botón "Generar planeación F-32" descarga el `.docx`. |
| Compatibilidad **PN** | ✅ **Funciona** | `materiasPorSemestre` + `contenidosMaterias` (semestre1/3/5/7). |
| Compatibilidad **MN** | ✅ **Funciona** | `materiasPorSemestreMN` + `contenidosMateriasMN` (mn1/3/5/7); namespace separado por nombres compartidos. |
| Exclusión de **Inglés Marítimo** | ✅ **Funciona** | `materias.ts` no lista las asignaturas de Inglés en ningún semestre (excluidas a propósito). |
| Semestres **I, III, V, VII** | ✅ **Funciona** | Son exactamente los 4 expuestos en los menús de ambas carreras. |
| Manejo de **competencias** | ⚠️ **Requiere revisión** | Se usa `unidad.objetivoEspecifico` como competencia, pero hay marcadores `"Pendiente de revisión"` en los 8 archivos. |
| Manejo de **objetivos generales** | ⚠️ **Requiere revisión** | `programa.objetivoGeneral` se renderiza; igualmente con huecos auto-extraídos. |
| Manejo de **contenidos temáticos** | ✅/⚠️ | Subtemas verbatim del PDF; el reparto semanal es sólido, pero la extracción de PN-1 es la única verificada a mano (ver `AUDITORIA-PROGRAMAS-OFICIALES.md`). |
| Avance Programático **F-51** | ✅ **Funciona** (manejo de errores pobre) | `generarAvanceProgramatico()` rellena `Avance-Programatico-F51.docx`; en error solo hace `alert()`. |
| Exámenes (Parcial 1/2, Ordinario) | ✅ **Funciona** | `generarExamen()` genera reactivos por temario; verifica si la plantilla tiene placeholders y avisa si no. |

### Exportación Word

| Aspecto | Estado | Detalle |
|---|---|---|
| Exportación Word | ✅ | `docxtemplater` + `pizzip` en cliente; `saveAs()` descarga. |
| Plantillas DOCX | ✅ | 4 plantillas versionadas en `public/templates/` (F-32, F-51, examen parcial/ordinario). |
| Librerías | ✅ | `docxtemplater`, `pizzip`, `file-saver` instaladas y fijadas. |
| Riesgo de corrupción | ⚠️ **Medio** | Ver §5: si una plantilla tiene placeholders mal formados o un `{` suelto, `docxtemplater` lanza y **no hay manejo específico** (solo `catch` genérico). El examen sí detecta ausencia de placeholders; F-32/F-51 no validan. |

### Inteligencia Artificial

| Aspecto | Estado | Detalle |
|---|---|---|
| Claude API | ✅ **Funciona** (si hay key) | `route.ts` usa `@anthropic-ai/sdk` con streaming + `finalMessage()`. |
| Configuración de modelos | ✅ | Default `claude-opus-4-8`; override por `ANTHROPIC_MODEL` (se sugiere `claude-sonnet-4-6` como alternativa). |
| Variables de entorno | ✅ | `ANTHROPIC_API_KEY` (servidor, nunca al navegador), `ANTHROPIC_MODEL`. Documentadas en `.env.example`. |
| Manejo de errores | ✅ **Robusto** | Códigos para `sin_api_key`, `sin_programa`, `rechazo_ia`, `respuesta_vacia`, `fallo_ia`, `sin_diapositivas`; el cliente **cae al generador determinista** sin romperse. |
| Costos potenciales | 🔴 **Riesgo** | Opus con `max_tokens 32000` + thinking por unidad. Endpoint **sin autenticación ni rate-limit**: cualquiera con la URL del deploy puede disparar generaciones de pago. |
| Límites de uso | ⚠️ | No hay cuota por usuario. Cache mitiga repeticiones, pero en **Vercel es efímero** (`/tmp`): cada instancia fría regenera y vuelve a costar. `maxDuration=300` excede el límite de **60 s del plan Hobby** → posible timeout en producción si no es Pro. |

### Presentaciones IA

| Aspecto | Estado | Detalle |
|---|---|---|
| Sistema de generación | ✅ **Funciona** (3 niveles) | (1) **Premium** hand-authored → (2) **IA Opus** bajo demanda → (3) **determinista** desde el programa oficial. Prioridad en ese orden. |
| Estado actual | 🟡 **Parcial** | El nivel determinista funciona para **cualquier** materia con programa oficial. El premium **solo existe para Álgebra PN Unidad 1** (`registro.ts`). La IA depende de la key. |
| Archivos relacionados | — | `route.ts`, `promptPresentacion.ts`, `esquemaPresentacion.ts`, `cachePresentacion.ts`, `construirPresentacionV2.ts`, `pptxOficialV2.ts`, `data/presentaciones/*`. |
| Funcionalidades completas | ✅ | Selección unidad/tema, render PPTX visual (portada náutica, mapas conceptuales, tablas, diagramas), descarga, cache, fallback. |
| Funcionalidades incompletas | ⚠️ | Biblioteca premium mínima (1 deck); 2 `.pptx` de prueba quedaron en la raíz del proyecto. |

### Biblioteca Académica

| Aspecto | Estado | Detalle |
|---|---|---|
| Planeaciones históricas | ❌ **No disponibles** | El código declara que "no hay planeaciones históricas confiables para espejar" (`distribucion.ts`); el reparto se hace proporcional a subtemas. |
| Programas oficiales | ✅ | 183 PDFs FIDENA 2022 (PN+MN, 8 semestres) + planes de estudio + mapa curricular en `public/templates/biblioteca/`. |
| Organización | 🟡 | Por carrera/semestre, pero con **duplicados** ("Copia de…" en 07SEM) y 2 `.zip` originales sin descomprimir. `AUDITORIA-PROGRAMAS-OFICIALES.md` ya cataloga 166 únicos + 13 duplicados. |
| Archivos faltantes | ⚠️ | En la **app** solo están cableados I/III/V/VII; los PDFs de II/IV/VI/VIII existen pero **no están integrados** al sistema. |

---

## 5. Errores Potenciales

- 🟡 **Código legacy probablemente muerto.** En `generarWord()` la rama "Legacy: contenido genérico (semestres III, V y VII)" ([page.tsx:738-787](app/page.tsx#L738)) y los helpers `generarSecuenciaDidactica`/`obtenerContextoDidactico` solo se ejecutan cuando la materia **no** es `ProgramaOficial`. Pero **los 8 archivos de contenido ya son `Record<string,ProgramaOficial>`**, así que esa rama casi nunca se alcanza → mantener código que aparenta estar vivo y no lo está.
- 🔴 **Riesgo de planeación vacía por desajuste de nombres.** `fuenteContenidos[materiaSeleccionada]` busca por el **texto del menú**. Si un nombre en `materias.ts` no coincide *exactamente* con la clave en `contenidos/*`, `esProgramaOficial(undefined)` es `false` y se genera un documento legacy casi vacío **sin avisar** al docente. Conviene una prueba que valide la correspondencia menú ↔ contenidos.
- ⚠️ **Datos académicos sin verificar.** Los 8 archivos contienen `"Pendiente de revisión"` y, según la auditoría previa, el desglose de horas y algunos temas se auto-extrajeron del PDF con **posibles errores de columna**. Solo PN-1.er semestre está verificado a mano.
- ⚠️ **Corrupción de DOCX.** `docxtemplater` lanza ante placeholders rotos o un `{`/`}` suelto en la plantilla; F-32 y F-51 no validan previamente (solo `catch` genérico → mensaje/`alert`). Riesgo si se editan las plantillas sin cuidado.
- 🔴 **Endpoint de IA sin auth ni límite** → exposición de costo (Opus) en el deploy público. Cache **efímero** en Vercel no protege entre instancias.
- ⚠️ **`maxDuration=300` vs plan Hobby (60 s)** → timeouts en producción si el proyecto no está en Pro (el propio código lo comenta).
- 🟡 **258 MB de PDFs versionados** en `public/templates/biblioteca/` (183 archivos tracked) → repositorio pesado; además se publican como estáticos accesibles desde el navegador.
- 🟡 **Copia duplicada del proyecto** en `rutas-tampico-mapa/planeaciones-nautica` (mismo árbol). Riesgo de divergencia / editar la copia equivocada.
- 🟢 **Artefactos sueltos:** `Presentacion_ALG103_U1.pptx` y `_V2.pptx` en la raíz (no versionados, pero conviene limpiarlos).
- 🟢 **README boilerplate** de `create-next-app` (no documenta este proyecto). El nombre del remoto es `Repository-name-planeaciones-nautica` (placeholder sin renombrar).
- 🟢 **Logos placeholder** en la UI ("Logo UMPM", "Escudo institucional") — pendiente de identidad gráfica real.

> No se detectaron imports rotos, dependencias sin instalar (`docxtemplater` y `@anthropic-ai/sdk` presentes en `node_modules`) ni secretos versionados (`.env*` ignorado correctamente).

---

## 6. Git y GitHub

| Concepto | Valor |
|---|---|
| **Repositorio** | `rutas-tampico` (la app vive en la subcarpeta `planeaciones-nautica/`). |
| **Remoto** | `https://github.com/kaymax239/Repository-name-planeaciones-nautica.git` ⚠️ nombre con placeholder. |
| **Rama actual** | `main` |
| **Sincronía** | `main...origin/main` **sin adelanto/atraso** reportado (en sincronía para la subcarpeta). |
| **Último commit (subcarpeta)** | `6507e6e` — *ui: describir generación con IA y aviso de espera (~1 min) en presentaciones* |
| **Commits relevantes** | `151038d` presentaciones premium con IA (Opus) + cache · `5d7b922` restore curriculum units · `e196c66` generador dinámico de presentaciones. |
| **Archivos versionados (subcarpeta)** | 235 (incluye **183 PDFs** de biblioteca + **4 plantillas .docx**). |
| **Correctamente ignorados** | `node_modules`, `.env*`, `*.pptx`, `.next`, `.vercel`, `.presentaciones-cache`, `*.tsbuildinfo`. |
| **Sin seguimiento / modificados (a nivel repo)** | `.claude/` (untracked); cambios en `../android/.idea/*`, `../package-lock.json`, `../.vercelignore` — **fuera** de la app, en el repo contenedor. |

---

## 7. Próximos Pasos (priorizados)

### 🔴 Prioridad Alta (bloqueantes de confianza/costo)
1. **Verificar los datos académicos** de PN y MN (objetivos, competencias, horas, subtemas) contra los PDFs; eliminar los `"Pendiente de revisión"`. Empezar por las materias que se demostrarán.
2. **Proteger el endpoint de IA**: autenticación (aunque sea básica/por token) + límite de uso, para no exponer costo de Opus en producción.
3. **Cache de IA persistente** (KV/Blob/Redis en vez de `/tmp`) para que en Vercel no se regenere (y se vuelva a pagar) en cada instancia.
4. **Validar plan Vercel** (Pro para `maxDuration=300`) o reducir el tiempo/modelo para Hobby.
5. **Prueba de correspondencia menú ↔ contenidos** que falle el build si un nombre no resuelve a `ProgramaOficial`.

### 🟡 Prioridad Media
6. Mover los 258 MB de PDFs fuera de Git (Blob/almacenamiento externo o Git LFS); limpiar duplicados de biblioteca.
7. Unificar el manejo de errores (sustituir `alert()` de F-51/exámenes por los mensajes de estado que ya usa F-32).
8. Validar plantillas DOCX antes de renderizar (chequear placeholders) para prevenir corrupción.
9. Eliminar/aislar la rama legacy muerta de `generarWord()` y los helpers asociados.
10. Resolver la **copia duplicada** `rutas-tampico-mapa/planeaciones-nautica` (definir cuál es la fuente de verdad).

### 🟢 Prioridad Baja
11. Renombrar el repositorio remoto (quitar "Repository-name-").
12. Reemplazar el README boilerplate por documentación real; insertar logos/identidad institucional.
13. Ampliar la biblioteca premium de presentaciones más allá de Álgebra U1.
14. Añadir selector de fecha (hoy `fechaInicio` es texto libre) y limpiar `.pptx` de prueba.
15. Integrar semestres II/IV/VI/VIII (datos ya disponibles en biblioteca).

---

## 8. Recomendaciones

1. **Tratar la exactitud de los datos como el verdadero "producto".** El motor ya funciona; el valor (y el riesgo de credibilidad ante docentes y dirección) está en que el F-32 muestre objetivos/horas/competencias **correctos**. Priorizar una pasada de verificación humana documentada por materia.
2. **Modo demo determinista.** Para presentar al director sin depender de la API key ni del costo de Opus, usar el generador determinista (ya implementado) como ruta por defecto en la demo; activar IA solo en materias verificadas.
3. **Cerrar el costo de IA antes de exponer públicamente**: auth + cuota + cache persistente. Es el único riesgo "de dinero real".
4. **Higiene del repo**: sacar binarios pesados de Git, resolver la copia duplicada y renombrar el remoto. Mejora clones, despliegues y evita editar el proyecto equivocado.
5. **QA de salida**: validar los `.docx`/`.pptx` generados contra los formatos institucionales aceptados (un docente revisor), no solo que "descarguen sin error".
6. **Observabilidad**: registrar uso del endpoint de IA (tokens/costo) para dimensionar gasto antes de abrir a usuarios.

---

## 9. Estimación Real de Avance (%)

| Eje | Avance | Comentario |
|---|---|---|
| **Arquitectura / ingeniería** | **85%** | Flujo completo, separación limpia, fallback robusto, validación, deploy configurado. |
| **Exportación Word (F-32/F-51/exámenes)** | **80%** | Funciona; faltan validación de plantillas y unificar manejo de errores. |
| **Presentaciones (determinista + IA)** | **70%** | Pipeline completo; premium mínimo y costo de IA sin controlar. |
| **Datos oficiales (PN+MN, I/III/V/VII)** | **45%** | Estructurados y cargados, pero solo PN-1 verificado a mano; huecos "Pendiente de revisión". |
| **Cobertura curricular (8 semestres)** | **50%** | 4 de 8 semestres cableados en la app (PDFs del resto ya disponibles). |
| **Producción (auth, costo, persistencia, identidad)** | **25%** | Sin auth, cache efímero, sin control de costo, logos placeholder. |

> **Avance global ponderado: ~60% para herramienta interna usable; ~40% para liberación pública robusta.**

---

## 10. Checklist para Producción

**Qué ya está terminado**
- [x] Flujo carrera → semestre → materia → datos → documento (PN y MN, semestres I/III/V/VII).
- [x] Exportación Word F-32, Avance F-51 y exámenes (parcial 1/2, ordinario) por plantilla.
- [x] Generación de presentaciones: determinista + IA (Opus) + 1 premium, con render PPTX visual.
- [x] Integración Claude con API key solo en servidor, validación `zod` y **fallback** sin IA.
- [x] Datos oficiales estructurados, criterios de evaluación (DEN/526/2025) y calendario FIDENA 2026.
- [x] Exclusión de Inglés Marítimo; dependencias fijadas; proyecto Vercel vinculado.

**Qué falta para usarlo con docentes reales**
- [ ] Verificación humana de objetivos/competencias/horas/subtemas por materia (quitar "Pendiente de revisión").
- [ ] Identidad gráfica institucional (logos/escudos) en UI y documentos.
- [ ] Validación de plantillas DOCX y mensajes de error uniformes.
- [ ] Prueba automática de correspondencia menú ↔ contenidos (evitar planeaciones vacías).

**Qué impide una demostración al director (hoy)**
- [ ] Placeholders visibles (logos) y posibilidad de mostrar datos no verificados.
- [ ] Si se demuestra la IA: requiere `ANTHROPIC_API_KEY` configurada y plan Vercel Pro (o el deck puede tardar/expirar). *Mitigación:* demostrar con el generador determinista.

**Qué impide una liberación a usuarios reales**
- [ ] **Autenticación** y control de acceso.
- [ ] **Límite de uso + cache persistente** para el endpoint de IA (costo de Opus).
- [ ] Datos académicos validados de extremo a extremo (exactitud legal/curricular).
- [ ] Higiene del repositorio (PDFs fuera de Git, copia duplicada resuelta, remoto renombrado).
- [ ] (Opcional) Cobertura de los 8 semestres.

---

### Apéndice — Alcance de la auditoría
- ✅ Lectura del código fuente (`app/`, `lib/`, `api/`, `data/`), configuración, plantillas, documentación y estado Git.
- ✅ Verificación de cobertura de datos, tracking de archivos y rutas de fallback.
- ⚠️ **No** se ejecutó `npm run build`/`dev` ni se generaron documentos (por instrucción de no modificar el entorno); el estado "Funciona" se infiere por lectura estática.
- ⚠️ No se abrió el contenido de los 183 PDFs uno por uno; se reportan por inventario y por la auditoría previa `AUDITORIA-PROGRAMAS-OFICIALES.md`.

*Reporte de solo lectura. No se realizaron cambios en el proyecto.*
