# CHECKLIST DEMO — Notas internas (NO mostrar al subdirector)

> Estado técnico tras el pase de "modo demo seguro" del **2026-06-21**.
> Modo elegido: **solo arreglar errores duros** (no se enmascara "Pendiente de revisión").

## Cambios aplicados (modo demo seguro)

| Archivo | Cambio | Por qué |
|---|---|---|
| `app/page.tsx` · `generarExamen` | Si la plantilla no tiene placeholders (examen **ordinario**), usa `examen-parcial.docx` como fallback. Preguntas ahora se construyen desde los **subtemas reales** del programa. `alert()` → mensaje claro en pantalla. `mimeType` correcto. | Antes el ordinario salía **en blanco** + alert; y las preguntas eran genéricas (ProgramaOficial no expone `semanas`). |
| `app/page.tsx` · `generarAvanceProgramatico` (F-51) | Deriva las semanas del temario oficial (`distribuirPrograma`); `alert()` → mensaje claro; `mimeType` correcto. | Antes el F-51 salía con "Sin tema programado" en todas las semanas. |
| `app/page.tsx` | Nuevo estado `mensajeExamen` + bloque de mensaje en la tarjeta Exámenes; helper `semanasDesdePrograma`. | Feedback claro de éxito/error; nunca un fallo silencioso. |
| `app/lib/construirPresentacionV2.ts` | Nueva diapositiva **"Actividad de cierre"** (reflexión + actividad) antes del cierre. | Cumple el mínimo de la presentación (actividad/reflexión). |

> Validación: `tsc --noEmit` = **0 errores**. Prueba funcional 4/4 (PN I/III, MN V/VII).
> **No** se hizo commit/push. **No** se borró nada. `.env.local` no existe → la app usa el **generador determinista** (sin IA): rápido, sin costo, sin riesgo de timeout.

## Estado de datos por materia (74 materias visibles: PN+MN, semestres I/III/V/VII)

- ✅ **74/74** generan **Planeación F-32, Presentación y Examen** con datos mínimos (nombre, clave, horas, unidades, subtemas). **Ninguna sale en blanco.**
- ✅ **Menú ↔ contenidos: correspondencia 100%** (ninguna materia del menú queda sin programa → no hay documentos vacíos por desajuste de nombre).
- ⚠️ **72/74** tienen ≥1 `objetivoEspecífico` = **"Pendiente de revisión"** → **se ve en el F-32** (celda de objetivo por unidad). **NO** se ve en la presentación (el generador lo filtra automáticamente).
- ⚠️ **6 materias** tienen además el `objetivoGeneral` = "Pendiente" (se ve más prominente en el F-32):
  - PN III · Técnicas Avanzadas de Lucha Contra Incendios
  - PN VII · Familiarización con buques tanque
  - PN VII · Familiarización con buque de pasaje
  - MN III · Técnicas Avanzadas de Lucha Contra Incendios
  - MN VII · Familiarización con buques tanque
  - MN VII · Familiarización con buque de pasaje

### Materias más "limpias" (recomendadas para el F-32 en vivo)

| Semestre | Recomendada (PN) | Recomendada (MN) |
|---|---|---|
| I | **Álgebra** (2/7 pend.) | Electricidad (1/6) |
| III | Cartografía (1/7) | **Dinámica (0/4 — impecable)** |
| V | **Comunicación Visual (0/5 — impecable)** | Ética Profesional (1/4) |
| VII | Convenios OMI (1/6) | Convenios OMI (1/6) |

> 100% limpias (cero "Pendiente"): **PN V · Comunicación Visual** y **MN III · Dinámica**.

## Fallback en uso durante la demo

| Componente | Fallback activo |
|---|---|
| Presentaciones | IA no configurada → **generador determinista** desde el programa oficial (siempre funciona). |
| Examen Ordinario | Plantilla sin placeholders → usa **examen-parcial.docx** (mismo contenido por rango 1–18). |
| Objetivos "Pendiente" | **Sin fallback** (decisión: se dejan visibles). Evitar las 6 materias de arriba en el F-32 si se quiere pulcritud. |

## Limitaciones conocidas (no son errores, pero conviene saber)

- El examen muestra **materia + preguntas**, pero la plantilla `examen-parcial.docx` **no** tiene placeholders de `carrera`/`semestre`/`instrucciones`/`clave`, así que esos no se inyectan automáticamente (solo lo que la plantilla traiga fijo).
- El F-51 no es uno de los 3 entregables de la demo; quedó robusto pero su contenido semanal es el reparto automático del temario.
- La presentación dice en la UI "con IA (Claude Opus)"; en la demo corre el **generador determinista** (sin key). El mensaje de éxito lo indica como "(generador oficial (sin IA))".
