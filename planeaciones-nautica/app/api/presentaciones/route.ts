type SolicitudPresentacion = {
  semestre?: string;
  materia?: string;
  unidad?: string;
  tema?: string;
  objetivo?: string;
  temasRelacionados?: string[];
};

const presentacionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["titulo", "subtitulo", "diapositivas"],
  properties: {
    titulo: { type: "string" },
    subtitulo: { type: "string" },
    diapositivas: {
      type: "array",
      minItems: 15,
      maxItems: 25,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["titulo", "contenido", "notas", "tipo", "fuentes"],
        properties: {
          titulo: { type: "string" },
          contenido: {
            type: "array",
            minItems: 1,
            items: { type: "string" },
          },
          notas: { type: "string" },
          tipo: {
            type: "string",
            enum: [
              "portada",
              "objetivo",
              "contenido",
              "ejemplo",
              "actividad",
              "repaso",
              "resumen",
              "bibliografia",
            ],
          },
          fuentes: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["titulo", "url"],
              properties: {
                titulo: { type: "string" },
                url: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
} as const;

const extraerTextoRespuesta = (data: unknown) => {
  const response = data as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        text?: string;
        type?: string;
      }>;
    }>;
  };

  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  return (
    response.output
      ?.flatMap((item) => item.content || [])
      .map((content) => content.text || "")
      .join("\n") || ""
  );
};

const extraerErrorOpenAI = (responseBody: unknown, status: number, statusText: string) => {
  const body = responseBody as {
    error?: {
      message?: unknown;
      code?: unknown;
      type?: unknown;
    };
  };
  const message =
    typeof body?.error?.message === "string"
      ? body.error.message
      : statusText || "OpenAI no pudo generar la presentación.";

  return {
    message,
    status,
    code: typeof body?.error?.code === "string" ? body.error.code : null,
    type: typeof body?.error?.type === "string" ? body.error.type : null,
    response: responseBody,
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

  let response: Response;

  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_PRESENTACIONES_MODEL || "gpt-4o-mini",
        tools: [{ type: "web_search_preview" }],
        input: prompt,
        text: {
          format: {
            type: "json_schema",
            name: "presentacion_academica",
            strict: true,
            schema: presentacionSchema,
          },
        },
        temperature: 0.3,
      }),
    });
  } catch (error) {
    const openAIError = {
      message:
        error instanceof Error
          ? error.message
          : "No se pudo conectar con OpenAI.",
      status: 500,
      code: null,
      type: "network_error",
      response:
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : error,
    };

    console.error("OPENAI ERROR:", openAIError);

    return Response.json({ error: openAIError }, { status: 502 });
  }

  if (!response.ok) {
    const responseText = await response.text();
    let responseBody: unknown = responseText;

    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = responseText;
    }

    const openAIError = extraerErrorOpenAI(
      responseBody,
      response.status,
      response.statusText,
    );

    console.error("OPENAI ERROR:", openAIError);

    return Response.json(
      { error: openAIError },
      { status: 502 },
    );
  }

  const data = await response.json();
  const contenido = extraerTextoRespuesta(data);

  console.log("OPENAI RAW CONTENT:", contenido);

  try {
    const parsed = JSON.parse(contenido);
    return Response.json(parsed);
  } catch (error) {
    const parseError = {
      message:
        error instanceof Error
          ? error.message
          : "No se pudo parsear la respuesta de OpenAI.",
      status: 502,
      code: "invalid_json",
      type: "parse_error",
      response: {
        contenidoRecibido: contenido,
        errorParseo:
          error instanceof Error
            ? { name: error.name, message: error.message, stack: error.stack }
            : error,
        respuestaOpenAICompleta: data,
      },
    };

    console.error("OPENAI ERROR:", parseError);

    return Response.json(
      {
        error: parseError,
      },
      { status: 502 },
    );
  }
}
