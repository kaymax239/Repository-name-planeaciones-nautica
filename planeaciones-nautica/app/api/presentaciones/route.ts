type SolicitudPresentacion = {
  semestre?: string;
  materia?: string;
  unidad?: string;
  tema?: string;
  objetivo?: string;
  temasRelacionados?: string[];
};

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

const limpiarJson = (texto: string) =>
  texto
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

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
1. Antes de redactar, usa busqueda web para contrastar informacion reciente y fuentes confiables.
2. Evita texto generico como "aprendizaje guiado", "trabajo colaborativo" o "el desarrollo del contenido se basa".
3. Incluye contenido especifico del tema seleccionado, con precision academica.
4. Si el tema puede relacionarse con el ambito maritimo, nautico, portuario o de marina mercante, incluye ejemplos aplicados.
5. Devuelve SOLO JSON valido, sin markdown.
6. La presentacion debe tener entre 10 y 15 diapositivas.
7. La diapositiva 1 debe ser portada institucional.
8. La diapositiva 2 debe ser objetivos de aprendizaje.
9. Las diapositivas 3 a 10 deben desarrollar el tema con detalle.
10. Incluye diapositivas para ejemplos aplicados, actividad en clase, preguntas de repaso, resumen y bibliografia.
11. La ultima diapositiva debe ser Bibliografia con URLs.

Formato JSON exacto:
{
  "titulo": "string",
  "subtitulo": "string",
  "bibliografia": [
    { "titulo": "string", "url": "string", "descripcion": "string" }
  ],
  "diapositivas": [
    {
      "tipo": "portada|objetivos|desarrollo|ejemplos|actividad|preguntas|resumen|bibliografia",
      "titulo": "string",
      "contenido": ["string"],
      "notas": "string"
    }
  ]
}
`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_PRESENTACIONES_MODEL || "gpt-4o-mini",
      tools: [{ type: "web_search_preview" }],
      input: prompt,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    return Response.json(
      { error: "OpenAI no pudo generar la presentación.", detail },
      { status: 502 },
    );
  }

  const data = await response.json();
  const texto = limpiarJson(extraerTextoRespuesta(data));

  try {
    const parsed = JSON.parse(texto);
    return Response.json(parsed);
  } catch {
    return Response.json(
      {
        error: "La respuesta de OpenAI no tuvo formato JSON válido.",
        raw: texto,
      },
      { status: 502 },
    );
  }
}
