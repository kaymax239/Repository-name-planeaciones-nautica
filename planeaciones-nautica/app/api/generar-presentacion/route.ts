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
    materia: { type: Type.STRING },
    semestre: { type: Type.STRING },
    unidad: { type: Type.STRING },
    tema: { type: Type.STRING },
    objetivoAprendizaje: { type: Type.STRING },
    competencias: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    diapositivas: {
      type: Type.ARRAY,
      minItems: 15,
      maxItems: 15,
      items: {
        type: Type.OBJECT,
        properties: {
          numero: { type: Type.INTEGER },
          titulo: { type: Type.STRING },
          tipo: {
            type: Type.STRING,
            enum: [
              "portada",
              "objetivo",
              "introduccion",
              "desarrollo",
              "ejemplo",
              "aplicacion_maritima",
              "actividad",
              "evaluacion",
              "cierre",
              "bibliografia",
              "notas_docente",
            ],
          },
          contenido: { type: Type.STRING },
          puntosClave: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          ejemplo: { type: Type.STRING },
          actividad: { type: Type.STRING },
          preguntas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          notasDocente: { type: Type.STRING },
        },
        required: [
          "numero",
          "titulo",
          "tipo",
          "contenido",
          "puntosClave",
          "ejemplo",
          "actividad",
          "preguntas",
          "notasDocente",
        ],
      },
    },
    bibliografia: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    evaluacionRapida: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    notasGeneralesDocente: { type: Type.STRING },
  },
  required: [
    "titulo",
    "materia",
    "semestre",
    "unidad",
    "tema",
    "objetivoAprendizaje",
    "competencias",
    "diapositivas",
    "bibliografia",
    "evaluacionRapida",
    "notasGeneralesDocente",
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
      `Genera una presentación docente profesional, rigurosa y lista para impartirse de ${materia}, ${unidad}, tema: ${tema}.`,
      `Semestre: ${semestre}.`,
      "Devuelve JSON limpio siguiendo exactamente el esquema de respuesta.",
      "La presentación debe tener exactamente 15 diapositivas.",
      "No incluyas markdown, comentarios, texto fuera del JSON ni bloques de código.",
      "Usa lenguaje docente, claro y académico.",
      "Evita respuestas superficiales; cada diapositiva debe tener contenido útil para explicar en clase.",
      "Cada diapositiva debe incluir notasDocente amplias, con orientaciones concretas para impartir la clase.",
      "Incluye ejemplos aplicados al contexto marítimo, náutico o de formación naval cuando sea posible.",
      "Incluye preguntas, actividades y evaluación rápida con enfoque formativo.",
      "Estructura obligatoria de las 15 diapositivas:",
      "1. Portada",
      "2. Objetivo de aprendizaje",
      "3. Competencias a desarrollar",
      "4. Introducción del tema",
      "5. Conceptos clave",
      "6. Desarrollo teórico I",
      "7. Desarrollo teórico II",
      "8. Ejemplo explicado paso a paso",
      "9. Aplicación marítima o náutica",
      "10. Actividad individual",
      "11. Actividad colaborativa",
      "12. Preguntas de reflexión",
      "13. Evaluación rápida",
      "14. Cierre y resumen",
      "15. Bibliografía y notas docentes",
      "Para cada diapositiva llena: numero, titulo, tipo, contenido, puntosClave, ejemplo, actividad, preguntas y notasDocente.",
      "Usa los tipos permitidos: portada, objetivo, introduccion, desarrollo, ejemplo, aplicacion_maritima, actividad, evaluacion, cierre, bibliografia, notas_docente.",
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
