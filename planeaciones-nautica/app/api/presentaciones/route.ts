type SolicitudPresentacion = {
  semestre?: string;
  materia?: string;
  unidad?: string;
  tema?: string;
  objetivo?: string;
  temasRelacionados?: string[];
};

type Diapositiva = {
  titulo: string;
  contenido: string[];
  notas: string;
  tipo:
    | "portada"
    | "objetivo"
    | "contenido"
    | "ejemplo"
    | "actividad"
    | "repaso"
    | "resumen"
    | "bibliografia";
  fuentes: Array<{
    titulo: string;
    url: string;
  }>;
};

type Presentacion = {
  titulo: string;
  subtitulo: string;
  diapositivas: Diapositiva[];
};

const extraerTextoRespuesta = (data: unknown) => {
  const response = data as {
    output?: Array<{
      content?: Array<{
        text?: string;
      }>;
    }>;
  };

  return (
    response.output
      ?.flatMap((item) => item.content || [])
      .map((content) => content.text || "")
      .filter(Boolean)
      .join("\n") || ""
  );
};

const extraerCampoError = (texto: string, campo: string) => {
  const regex = new RegExp(`"${campo}"\\s*:\\s*"([^"]+)"`, "i");
  return texto.match(regex)?.[1] || null;
};

const construirErrorOpenAI = ({
  message,
  status,
  code,
  type,
  response,
}: {
  message: string;
  status: number;
  code?: string | null;
  type?: string | null;
  response: unknown;
}) => ({
  message,
  status,
  code: code || null,
  type: type || null,
  response,
});

const detectarTipo = (titulo: string, indice: number): Diapositiva["tipo"] => {
  const normalizado = titulo.toLowerCase();

  if (indice === 0 || normalizado.includes("portada")) return "portada";
  if (normalizado.includes("objetivo")) return "objetivo";
  if (normalizado.includes("ejemplo") || normalizado.includes("caso")) return "ejemplo";
  if (normalizado.includes("actividad")) return "actividad";
  if (normalizado.includes("pregunta") || normalizado.includes("repaso")) return "repaso";
  if (normalizado.includes("conclus") || normalizado.includes("resumen")) return "resumen";
  if (normalizado.includes("bibliograf") || normalizado.includes("fuente")) return "bibliografia";

  return "contenido";
};

const extraerFuentes = (lineas: string[]) =>
  lineas
    .map((linea) => {
      const match = linea.match(/(.+?)\s*\|\s*(https?:\/\/\S+)/i);
      if (!match) return null;

      return {
        titulo: match[1].replace(/^[-•]\s*/, "").trim(),
        url: match[2].trim(),
      };
    })
    .filter((fuente): fuente is { titulo: string; url: string } => Boolean(fuente));

const construirPresentacionRespaldo = ({
  materia,
  tema,
  semestre,
  unidad,
}: {
  materia: string;
  tema: string;
  semestre?: string;
  unidad?: string;
}): Presentacion => ({
  titulo: `${materia}: ${tema}`,
  subtitulo: `${semestre || "Semestre no especificado"} | ${unidad || "Unidad no especificada"}`,
  diapositivas: [
    {
      tipo: "portada",
      titulo: `${materia}: ${tema}`,
      contenido: ["Presentación institucional generada con contenido de respaldo."],
      notas: "",
      fuentes: [],
    },
    {
      tipo: "objetivo",
      titulo: "Objetivos de aprendizaje",
      contenido: [
        `Identificar los conceptos principales de ${tema}.`,
        `Explicar la importancia del tema dentro de ${materia}.`,
        "Relacionar el contenido con aplicaciones académicas o náuticas.",
      ],
      notas: "",
      fuentes: [],
    },
    {
      tipo: "contenido",
      titulo: "Desarrollo del tema",
      contenido: [
        `${tema} forma parte de los contenidos esenciales de ${materia}.`,
        "El docente puede ampliar esta sección con ejemplos específicos de la planeación.",
      ],
      notas: "",
      fuentes: [],
    },
    {
      tipo: "actividad",
      titulo: "Actividad en clase",
      contenido: [
        "Analizar un caso relacionado con el tema.",
        "Resolver preguntas de aplicación y discutir conclusiones.",
      ],
      notas: "",
      fuentes: [],
    },
    {
      tipo: "bibliografia",
      titulo: "Bibliografía",
      contenido: [
        "Consultar bibliografía oficial de la asignatura y recursos académicos actualizados.",
      ],
      notas: "",
      fuentes: [],
    },
  ],
});

const construirPresentacionDesdeTexto = ({
  texto,
  materia,
  tema,
  semestre,
  unidad,
}: {
  texto: string;
  materia: string;
  tema: string;
  semestre?: string;
  unidad?: string;
}): Presentacion => {
  const bloques = texto
    .split(/(?=DIAPOSITIVA\s+\d+\s*:)/gi)
    .map((bloque) => bloque.trim())
    .filter(Boolean);

  const diapositivas = bloques.map((bloque, indice) => {
    const lineas = bloque
      .split(/\r?\n/)
      .map((linea) => linea.trim())
      .filter(Boolean);
    const encabezado = lineas[0] || `DIAPOSITIVA ${indice + 1}: ${tema}`;
    const titulo =
      encabezado.replace(/^DIAPOSITIVA\s+\d+\s*:\s*/i, "").trim() ||
      `${materia} - ${tema}`;
    const contenido = lineas
      .slice(1)
      .filter((linea) => !/^FUENTES?:/i.test(linea))
      .filter((linea) => !/^NOTAS?:/i.test(linea))
      .filter((linea) => !/^TIPO:/i.test(linea))
      .map((linea) => linea.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean);
    const fuentes = extraerFuentes(lineas);

    return {
      tipo: detectarTipo(titulo, indice),
      titulo,
      contenido: contenido.length > 0 ? contenido : [`Contenido clave sobre ${tema}.`],
      notas: `Diapositiva generada para ${materia}.`,
      fuentes,
    };
  });

  if (diapositivas.length === 0) {
    return construirPresentacionRespaldo({ materia, tema, semestre, unidad });
  }

  return {
    titulo: `${materia}: ${tema}`,
    subtitulo: `${semestre || "Semestre no especificado"} | ${unidad || "Unidad no especificada"}`,
    diapositivas: diapositivas.slice(0, 25),
  };
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  const body = (await request.json()) as SolicitudPresentacion;
  const materia = body.materia?.trim();
  const tema = body.tema?.trim();

  if (!materia || !tema) {
    return Response.json(
      { error: "Materia y tema son requeridos para generar la presentación." },
      { status: 400 },
    );
  }

  if (!apiKey) {
    const error = construirErrorOpenAI({
      message:
        "Falta configurar OPENAI_API_KEY en el entorno para generar presentaciones IA.",
      status: 500,
      code: "missing_api_key",
      type: "configuration_error",
      response: null,
    });
    console.error("OPENAI ERROR:", error);

    return Response.json(
      construirPresentacionRespaldo({
        materia,
        tema,
        semestre: body.semestre,
        unidad: body.unidad,
      }),
    );
  }

  const prompt = `
Genera una presentacion academica profesional en texto plano, no JSON.

Contexto:
- Semestre: ${body.semestre || "No especificado"}
- Materia: ${materia}
- Unidad: ${body.unidad || "No especificada"}
- Tema central: ${tema}
- Objetivo base de la planeacion: ${body.objetivo || "No especificado"}
- Temas relacionados de la planeacion: ${(body.temasRelacionados || []).join("; ")}

Reglas:
1. Usa busqueda web real para contrastar informacion reciente y fuentes confiables.
2. Incluye conceptos, definiciones tecnicas, procedimientos, formulas, tablas textuales, aplicaciones, ejemplos y bibliografia.
3. Evita texto generico.
4. Genera entre 15 y 25 diapositivas.
5. La ultima diapositiva debe incluir bibliografia con URLs.
6. No devuelvas JSON. No uses markdown de codigo.
7. Usa exactamente este formato:

DIAPOSITIVA 1: Portada institucional
- punto de contenido
- punto de contenido
FUENTES:
- Titulo de fuente | https://url

DIAPOSITIVA 2: Objetivos de aprendizaje
- punto de contenido
- punto de contenido
FUENTES:
- Titulo de fuente | https://url
`;

  try {
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
      const errorText = await response.text();
      const error = construirErrorOpenAI({
        message:
          extraerCampoError(errorText, "message") ||
          response.statusText ||
          "OpenAI no pudo generar la presentación.",
        status: response.status,
        code: extraerCampoError(errorText, "code"),
        type: extraerCampoError(errorText, "type") || "openai_error",
        response: errorText,
      });
      console.error("OPENAI ERROR:", error);

      return Response.json(
        construirPresentacionRespaldo({
          materia,
          tema,
          semestre: body.semestre,
          unidad: body.unidad,
        }),
      );
    }

    const data = await response.json();
    const texto = extraerTextoRespuesta(data);
    console.log("OPENAI TEXT OUTPUT:", texto);

    const presentacion = construirPresentacionDesdeTexto({
      texto,
      materia,
      tema,
      semestre: body.semestre,
      unidad: body.unidad,
    });

    console.log("OPENAI STRUCTURED OUTPUT", presentacion);

    return Response.json(presentacion);
  } catch (error) {
    const openAIError = construirErrorOpenAI({
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
    });

    console.error("OPENAI ERROR:", openAIError);

    return Response.json(
      construirPresentacionRespaldo({
        materia,
        tema,
        semestre: body.semestre,
        unidad: body.unidad,
      }),
    );
  }
}
