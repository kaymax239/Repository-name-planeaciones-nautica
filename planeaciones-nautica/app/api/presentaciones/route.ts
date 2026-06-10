import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

type SolicitudPresentacion = {
  semestre?: string;
  materia?: string;
  unidad?: string;
  tema?: string;
  objetivo?: string;
  temasRelacionados?: string[];
};

const fuenteSchema = z.object({
  titulo: z.string(),
  url: z.string(),
});

const diapositivaSchema = z.object({
  titulo: z.string(),
  contenido: z.array(z.string()).min(1),
  notas: z.string(),
  tipo: z.enum([
    "portada",
    "objetivo",
    "contenido",
    "ejemplo",
    "actividad",
    "repaso",
    "resumen",
    "bibliografia",
  ]),
  fuentes: z.array(fuenteSchema),
});

const presentacionSchema = z.object({
  titulo: z.string(),
  subtitulo: z.string(),
  diapositivas: z.array(diapositivaSchema).min(15).max(25),
});

const extraerErrorOpenAI = (error: unknown) => {
  const posibleError = error as {
    status?: unknown;
    code?: unknown;
    type?: unknown;
    message?: unknown;
    response?: unknown;
    error?: unknown;
  };
  const message =
    typeof posibleError.message === "string"
      ? posibleError.message
      : error instanceof Error
        ? error.message
        : "OpenAI no pudo generar la presentación.";

  return {
    message,
    status: typeof posibleError.status === "number" ? posibleError.status : 500,
    code: typeof posibleError.code === "string" ? posibleError.code : null,
    type: typeof posibleError.type === "string" ? posibleError.type : null,
    response: {
      name: error instanceof Error ? error.name : null,
      message,
      stack: error instanceof Error ? error.stack : null,
      response: posibleError.response || null,
      error: posibleError.error || null,
      raw: error,
    },
  };
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        error:
          "Falta configurar OPENAI_API_KEY en el entorno para generar presentaciones IA.",
      },
      { status: 500 },
    );
  }

  const body = (await request.json()) as SolicitudPresentacion;
  const materia = body.materia?.trim();
  const tema = body.tema?.trim();

  if (!materia || !tema) {
    return Response.json(
      { error: "Materia y tema son requeridos para generar la presentación." },
      { status: 400 },
    );
  }

  const prompt = `
Genera contenido academico especifico, actualizado y verificable para una presentacion PowerPoint profesional.

Contexto:
- Semestre: ${body.semestre || "No especificado"}
- Materia: ${materia}
- Unidad: ${body.unidad || "No especificada"}
- Tema central: ${tema}
- Objetivo base de la planeacion: ${body.objetivo || "No especificado"}
- Temas relacionados de la planeacion: ${(body.temasRelacionados || []).join("; ")}

Instrucciones obligatorias:
1. Antes de redactar, usa busqueda web real para contrastar informacion reciente y fuentes confiables.
2. Extrae informacion actualizada del tema: conceptos, definiciones tecnicas, procedimientos, formulas, tablas, aplicaciones, ejemplos y referencias.
3. Evita texto generico como "aprendizaje guiado", "trabajo colaborativo" o "el desarrollo del contenido se basa".
4. Incluye contenido especifico del tema seleccionado, con precision academica y nivel universitario docente.
5. Si el tema puede relacionarse con el ambito maritimo, nautico, portuario o de marina mercante, incluye ejemplos aplicados y casos de estudio.
6. Para cada diapositiva de desarrollo, incluye de 4 a 7 puntos sustantivos con datos, explicaciones, formulas, pasos o criterios de interpretacion.
7. Incluye esquemas textuales, formulas, comparaciones y pasos dentro de los arreglos de contenido cuando aplique.
8. Incluye bibliografia automatica con URLs verificables en la ultima diapositiva.
9. La presentacion debe tener entre 15 y 25 diapositivas.
10. La diapositiva 1 debe ser portada institucional.
11. La diapositiva 2 debe ser objetivos de aprendizaje.
12. Las diapositivas intermedias deben desarrollar el tema con profundidad suficiente para impartir clase.
13. Incluye diapositivas para ejemplos aplicados, casos de estudio, actividad en clase, preguntas de repaso, conclusiones y bibliografia.
14. Respeta estrictamente el esquema JSON solicitado por la API. No uses markdown ni bloques de codigo.
`;

  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.responses.parse({
        model: process.env.OPENAI_PRESENTACIONES_MODEL || "gpt-4o-mini",
        tools: [{ type: "web_search_preview" }],
        input: prompt,
        text: {
          format: zodTextFormat(presentacionSchema, "presentacion_academica"),
        },
        temperature: 0.3,
    });

    const resultado = response.output_parsed;

    if (!resultado) {
      const openAIError = {
        message: "OpenAI no devolvió salida estructurada.",
        status: 502,
        code: "missing_structured_output",
        type: "structured_output_error",
        response,
      };
      console.error("OPENAI ERROR:", openAIError);
      return Response.json({ error: openAIError }, { status: 502 });
    }

    console.log("OPENAI STRUCTURED OUTPUT", resultado);
    return Response.json(resultado);
  } catch (error) {
    const openAIError = extraerErrorOpenAI(error);
    console.error("OPENAI ERROR:", openAIError);
    return Response.json({ error: openAIError }, { status: 502 });
  }
}
