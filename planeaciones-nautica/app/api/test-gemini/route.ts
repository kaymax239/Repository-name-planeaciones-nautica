import { GoogleGenAI } from "@google/genai";

const prompt =
  "Genera una presentación docente de Álgebra I, Unidad 1, Números Reales. Devuelve JSON con 10 diapositivas.";

const modeloGemini = "gemini-2.5-flash";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "PEGARE_AQUI_MI_API_KEY") {
    return Response.json(
      {
        ok: false,
        error:
          "Configura GEMINI_API_KEY en .env.local para probar Gemini API.",
      },
      { status: 500 },
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: modeloGemini,
      contents: prompt,
    });

    return Response.json({
      ok: true,
      model: modeloGemini,
      prompt,
      text: response.text,
    });
  } catch (error) {
    console.error("GEMINI TEST ERROR:", error);

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
