// Fase 2 — Esquema del enriquecimiento pedagógico que devuelve Gemini.
//
// Define EXACTAMENTE lo único que la IA puede producir. NO incluye temas,
// subtemas, unidades, objetivos ni bibliografía: esos campos viven solo en el
// programa oficial (app/data/contenidos) y el merge los inyecta aparte. Cada
// bloque se ancla a una unidad oficial mediante `unidadNumero` (entero); si la
// IA referencia un número inexistente, el merge lo descarta.
//
// Dos representaciones del MISMO contrato:
//  - `planeacionEnriquecidaSchema` (Zod v4): validación estricta en el servidor.
//  - `responseSchemaGemini` (Type de @google/genai): fuerza JSON estructurado
//    por constrained decoding (responseMimeType "application/json").

import * as z from "zod/v4";
import { Type } from "@google/genai";

/* ------------------------------ Zod (validación) ------------------------------ */

export const TIPOS_INSTRUMENTO = ["diagnostica", "formativa", "sumativa"] as const;

const instrumento = z.object({
  nombre: z.string().min(1),
  tipo: z.enum(TIPOS_INSTRUMENTO),
});

const secuencia = z.object({
  inicio: z.string().min(1),
  desarrollo: z.string().min(1),
  cierre: z.string().min(1),
});

const unidadEnriquecida = z.object({
  /** Referencia a la unidad OFICIAL. El merge valida que exista. */
  unidadNumero: z.number().int(),
  competenciasDisciplinares: z.array(z.string()),
  estrategiasEnsenanza: z.array(z.string()),
  tecnicasEnsenanza: z.array(z.string()),
  secuencia,
  productosEvidencias: z.array(z.string()),
  instrumentosEvaluacion: z.array(instrumento),
});

export const planeacionEnriquecidaSchema = z.object({
  /** Competencias genéricas a nivel asignatura. */
  competenciasGenericas: z.array(z.string()),
  /** Enriquecimiento por unidad (anclado por unidadNumero oficial). */
  unidades: z.array(unidadEnriquecida),
});

export type PlaneacionEnriquecida = z.infer<typeof planeacionEnriquecidaSchema>;
export type UnidadEnriquecida = z.infer<typeof unidadEnriquecida>;
export type InstrumentoEvaluacion = z.infer<typeof instrumento>;

/* ------------------------ responseSchema (Gemini) ------------------------ */

/** Espejo del esquema Zod, en el formato que exige Gemini para forzar el JSON. */
export const responseSchemaGemini = {
  type: Type.OBJECT,
  properties: {
    competenciasGenericas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    unidades: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          unidadNumero: { type: Type.INTEGER },
          competenciasDisciplinares: { type: Type.ARRAY, items: { type: Type.STRING } },
          estrategiasEnsenanza: { type: Type.ARRAY, items: { type: Type.STRING } },
          tecnicasEnsenanza: { type: Type.ARRAY, items: { type: Type.STRING } },
          secuencia: {
            type: Type.OBJECT,
            properties: {
              inicio: { type: Type.STRING },
              desarrollo: { type: Type.STRING },
              cierre: { type: Type.STRING },
            },
            required: ["inicio", "desarrollo", "cierre"],
            propertyOrdering: ["inicio", "desarrollo", "cierre"],
          },
          productosEvidencias: { type: Type.ARRAY, items: { type: Type.STRING } },
          instrumentosEvaluacion: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                nombre: { type: Type.STRING },
                tipo: { type: Type.STRING, enum: [...TIPOS_INSTRUMENTO] },
              },
              required: ["nombre", "tipo"],
              propertyOrdering: ["nombre", "tipo"],
            },
          },
        },
        required: [
          "unidadNumero",
          "competenciasDisciplinares",
          "estrategiasEnsenanza",
          "tecnicasEnsenanza",
          "secuencia",
          "productosEvidencias",
          "instrumentosEvaluacion",
        ],
        propertyOrdering: [
          "unidadNumero",
          "competenciasDisciplinares",
          "estrategiasEnsenanza",
          "tecnicasEnsenanza",
          "secuencia",
          "productosEvidencias",
          "instrumentosEvaluacion",
        ],
      },
    },
  },
  required: ["competenciasGenericas", "unidades"],
  propertyOrdering: ["competenciasGenericas", "unidades"],
} as const;
