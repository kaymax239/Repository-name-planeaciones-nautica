import { GoogleGenAI, Type } from "@google/genai";

type SolicitudPresentacion = {
  semestre?: string;
  materia?: string;
  unidad?: string;
  tema?: string;
};

const modeloGemini = "gemini-2.5-flash";

const schemaPresentacion = {
  type: Type.OBJECT,
  properties: {
    titulo: { type: Type.STRING },
    objetivo: { type: Type.STRING },
    diapositivas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          numero: { type: Type.INTEGER },
          titulo: { type: Type.STRING },
          contenido: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          notasDocente: { type: Type.STRING },
        },
        required: ["numero", "titulo", "contenido", "notasDocente"],
      },
    },
    actividades: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    preguntas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    notasDocente: { type: Type.STRING },
  },
  required: [
    "titulo",
    "objetivo",
    "diapositivas",
    "actividades",
    "preguntas",
    "notasDocente",
  ],
};

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "PEGARE_AQUI_MI_API_KEY") {
    return Response.json(
      {
        ok: false,
        error:
          "Configura GEMINI_API_KEY en las variables de entorno para generar presentaciones.",
      },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as SolicitudPresentacion;
  const semestre = body.semestre || "I";
  const materia = body.materia || "Álgebra I";
  const unidad = body.unidad || "Unidad 1";
  const tema = body.tema || "Números reales";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = [
      `Genera una presentación docente profesional de ${materia}, ${unidad}, tema: ${tema}.`,
      `Semestre: ${semestre}.`,
      "Devuelve JSON con 12 a 15 diapositivas.",
      "Incluye contenido académico claro, ejemplos, actividades, preguntas y notas docentes.",
      "Estructura las diapositivas para una clase universitaria lista para impartirse.",
      "No incluyas markdown; devuelve únicamente el JSON solicitado por el esquema.",
    ].join("\n");

    const response = await ai.models.generateContent({
      model: modeloGemini,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schemaPresentacion,
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);

    return Response.json({
      ok: true,
      model: modeloGemini,
      input: {
        semestre,
        materia,
        unidad,
        tema,
      },
      presentacion: parsed,
    });
  } catch (error) {
    console.error("GEMINI GENERAR PRESENTACION ERROR:", error);

    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
      },
      { status: 500 },
    );
  }
}
