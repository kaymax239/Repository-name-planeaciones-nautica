// Esquema de validación (zod v4) de la presentación generada por IA.
//
// Refleja EXACTAMENTE el subconjunto de bloques que el renderer premium V2 ya
// sabe dibujar (ver `pptxOficialV2.ts` → renderBloqueV2 / renderBloque). La IA
// SOLO puede emitir estos bloques; cualquier cosa fuera del esquema se rechaza
// en validación y se descarta, de modo que el renderer nunca recibe basura.
//
// Se omiten a propósito los gráficos matemáticos muy específicos (parábola,
// triángulo de Pascal, recta numérica, área del cuadrado): son útiles solo para
// álgebra y no para el resto de materias. El resto del vocabulario cubre todo lo
// que pide la especificación (conceptos, definiciones, tablas, diagramas,
// procesos, casos prácticos, participación y evaluación).

import * as z from "zod/v4";

/* ------------------------------ Bloques V1 ------------------------------- */

const bullets = z.object({
  tipo: z.literal("bullets"),
  items: z.array(z.string()),
});

const definicion = z.object({
  tipo: z.literal("definicion"),
  titulo: z.string(),
  texto: z.string(),
});

const nota = z.object({
  tipo: z.literal("nota"),
  texto: z.string(),
});

const tabla = z.object({
  tipo: z.literal("tabla"),
  headers: z.array(z.string()),
  filas: z.array(z.array(z.string())),
});

const proceso = z.object({
  tipo: z.literal("proceso"),
  etapas: z.array(z.string()),
});

const pasos = z.object({
  tipo: z.literal("pasos"),
  enunciado: z.string(),
  pasos: z.array(z.string()),
  resultado: z.string().optional(),
});

const ejemplo = z.object({
  tipo: z.literal("ejemplo"),
  enunciado: z.string(),
  pasos: z.array(z.string()),
});

const aplicacion = z.object({
  tipo: z.literal("aplicacion"),
  titulo: z.string(),
  enunciado: z.string(),
  pasos: z.array(z.string()),
  resultado: z.string().optional(),
});

const ejercicio = z.object({
  tipo: z.literal("ejercicio"),
  items: z.array(z.string()),
});

const ejercicioGuiado = z.object({
  tipo: z.literal("ejercicioGuiado"),
  enunciado: z.string(),
  pista: z.string().optional(),
  items: z.array(z.string()),
});

const formulaDestacada = z.object({
  tipo: z.literal("formulaDestacada"),
  etiqueta: z.string().optional(),
  formula: z.string(),
});

const comparacion = z.object({
  tipo: z.literal("comparacion"),
  izq: z.object({ titulo: z.string(), items: z.array(z.string()) }),
  der: z.object({ titulo: z.string(), items: z.array(z.string()) }),
});

/* ------------------------------ Bloques V2 ------------------------------- */

const flujo = z.object({
  tipo: z.literal("flujo"),
  nodos: z.array(z.string()),
  resultado: z.string().optional(),
  orientacion: z.enum(["vertical", "horizontal"]).optional(),
});

const mapaConceptual = z.object({
  tipo: z.literal("mapaConceptual"),
  centro: z.string(),
  ramas: z.array(
    z.object({ titulo: z.string(), detalle: z.string().optional() }),
  ),
});

const diagramaArbol = z.object({
  tipo: z.literal("diagramaArbol"),
  raiz: z.string(),
  ramas: z.array(
    z.object({ titulo: z.string(), ejemplo: z.string().optional() }),
  ),
});

export const bloqueIASchema = z.discriminatedUnion("tipo", [
  bullets,
  definicion,
  nota,
  tabla,
  proceso,
  pasos,
  ejemplo,
  aplicacion,
  ejercicio,
  ejercicioGuiado,
  formulaDestacada,
  comparacion,
  flujo,
  mapaConceptual,
  diagramaArbol,
]);

export const diapositivaIASchema = z.object({
  layout: z
    .enum(["portada", "contenido", "divisor", "transicion", "cierre"])
    .optional(),
  etiqueta: z.string().optional(),
  titulo: z.string(),
  subtitulo: z.string().optional(),
  bloques: z.array(bloqueIASchema),
  mensajeFinal: z.string().optional(),
});

/**
 * Lo que la IA debe devolver: las diapositivas y, opcionalmente, los textos de
 * portada. Los metadatos (asignatura, clave, carrera, semestre, nombre de
 * archivo) NO los genera la IA: los fija el servidor de forma determinista.
 */
export const presentacionIASchema = z.object({
  kicker: z.string().optional(),
  subtituloPortada: z.string().optional(),
  diapositivas: z.array(diapositivaIASchema),
});

export type PresentacionIA = z.infer<typeof presentacionIASchema>;
