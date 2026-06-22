# Checklist — Demo para el Subdirector

_Preparado el 2026-06-21. Objetivo: que el flujo funcione sin errores visibles._

## ✅ Funciones listas para demo

| Función | Estado |
|---|---|
| Selección de carrera (PN / MN) | ✅ Listo |
| Selección de semestre (I, III, V, VII) | ✅ Listo |
| Selección de materia | ✅ Listo (todas las materias del menú tienen programa) |
| Generar **Planeación F-32** (Word) | ✅ Listo (descarga `.docx` con materia, semanas, temas, evaluación) |
| Generar **Presentación** (PowerPoint) | ✅ Listo (portada, objetivo, temas, actividad, cierre) |
| Generar **Examen** (Parcial 1/2 y Ordinario) | ✅ Listo (preguntas según la materia; ordinario con respaldo automático) |
| Mensajes claros de éxito/error | ✅ Listo (ya no hay alertas ni fallos silenciosos) |

> Probado y verificado: **74/74 materias** generan los 3 documentos sin quedar en blanco.
> Validación de tipos `tsc` = 0 errores. Prueba funcional 4/4.

## 🧪 Materias probadas

| Semestre | Carrera | Materia | F-32 | Presentación | Examen |
|---|---|---|---|---|---|
| I | PN | Álgebra | ✅ | ✅ 9 slides | ✅ 10 reactivos |
| III | PN | Navegación I | ✅ | ✅ 8 slides | ✅ 10 reactivos |
| V | MN | Motores I | ✅ | ✅ 9 slides | ✅ 10 reactivos |
| VII | MN | Estabilidad del Buque | ✅ | ✅ 9 slides | ✅ 10 reactivos |

## 🟢 Materias recomendadas para escoger en vivo (las más completas)

Si quieres lucimiento máximo en el **F-32**, sugiere o deja que escoja entre estas:

- **I Semestre:** Álgebra (PN) · Electricidad (MN)
- **III Semestre:** **Dinámica (MN)** · Cartografía (PN)
- **V Semestre:** **Comunicación Visual (PN)** · Ética Profesional (MN)
- **VII Semestre:** Convenios OMI (PN o MN)

> **Dinámica (MN III)** y **Comunicación Visual (PN V)** tienen los datos más completos.

## 🔄 Flujo recomendado para presentar

1. **Elegir carrera** → PN o Maquinista Naval.
2. **Elegir semestre** → I, III, V o VII.
3. **Elegir materia** (de las recomendadas arriba para mayor pulcritud).
4. Llenar datos rápidos: **docente** y **grupo** (los demás son automáticos).
5. **Generar Planeación F-32** → se descarga el Word. Ábrelo y muéstralo.
6. **Generar Presentación** → se descarga el PowerPoint. Ábrelo y muéstralo.
7. **Generar Examen Parcial 1** → se descarga el Word con las preguntas.
8. **Descargar / abrir** cada archivo desde la carpeta de descargas.

> Tip: ten una carpeta de Descargas limpia y Word/PowerPoint ya abiertos para mostrar rápido.

## ⚠️ Qué hacer si el subdirector escoge una materia "incompleta"

- **No pasa nada grave:** ningún documento sale en blanco; el sistema siempre genera los 3.
- En el **F-32**, algunas materias muestran "Pendiente de revisión" en la celda de *objetivo de la unidad* (es contenido en proceso de captura, no un error). Si aparece y prefieres evitarlo, **cambia a una materia recomendada** (lista de arriba) — el cambio es instantáneo.
- La **presentación nunca** muestra ese texto (se omite automáticamente), así que es la pieza más segura para lucir.
- Si algo no descargara, aparecerá un **mensaje claro en pantalla** (no una alerta de error): basta reintentar o cambiar de materia.

## 🤐 Puntos sensibles a no destacar (a menos que pregunten)

- Que el contenido oficial de varias materias aún está **en proceso de verificación** (por eso aparece "Pendiente de revisión" en algunos objetivos).
- Que en esta demo la presentación corre con el **generador propio** (la IA de pago no está activada hoy); el resultado es igualmente profesional.
- Que el **examen ordinario** reutiliza el formato del parcial.
- Que el examen no inyecta automáticamente carrera/semestre (depende de la plantilla).
- Que el **F-51** (avance programático) es secundario y no forma parte de los 3 entregables.

## 🚫 Riesgos a evitar en vivo

- No abrir el **F-51** delante del subdirector salvo que lo pida (no es entregable de la demo).
- No elegir para el F-32, si buscas pulcritud, estas 6 materias (muestran "Pendiente" también en el objetivo general): *Técnicas Avanzadas de Lucha Contra Incendios* (PN/MN III) y las 4 de *Familiarización con buques tanque / de pasaje* (PN/MN VII).
- No depender de internet/IA: el flujo demo funciona **offline** con el generador determinista.

## ✅ Veredicto

**Listo para la demo de mañana** con el flujo recomendado (F-32 + Presentación + Examen).
Detalle técnico completo en `CHECKLIST_DEMO_INTERNA.md`.
