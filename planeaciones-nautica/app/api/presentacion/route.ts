// Route Handler (servidor) — genera bajo demanda el guion de una presentación
// premium con Claude y lo devuelve como PresentacionV2 lista para el renderer.
//
// La API key vive SOLO aquí (servidor); nunca llega al navegador. Si falla la
// IA o falta la key, devuelve un error con código y el cliente cae al generador
// determinista existente (construirPresentacionV2).

import Anthropic from "@anthropic-ai/sdk";
import {
  contenidosMaterias,
  contenidosMateriasMN,
} from "../../data/contenidosMaterias";
import { esProgramaOficial } from "../../data/tipos";
import { TEMA_UNIDAD_COMPLETA } from "../../lib/construirPresentacionV2";
import {
  presentacionIASchema,
  type PresentacionIA,
} from "../../lib/esquemaPresentacion";
import {
  SYSTEM_PROMPT,
  construirMensajeUsuario,
} from "../../lib/promptPresentacion";
import {
  claveCache,
  leerCache,
  escribirCache,
} from "../../lib/cachePresentacion";
import type { DiapositivaV2, PresentacionV2 } from "../../data/presentaciones/tiposV2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Opus con effort alto puede tardar ~60s en generar un deck completo. Damos
// holgura (requiere plan Pro; en Hobby Vercel lo limita a 60).
export const maxDuration = 300;

const MODELO = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

type Cuerpo = {
  carrera?: "PN" | "MN";
  materia?: string;
  unidadNumero?: number;
  tema?: string;
  carreraDisplay?: string;
  semestreDisplay?: string;
  /** Si es true, ignora el cache y regenera con IA. */
  forzar?: boolean;
};

function error(codigo: string, mensaje: string, status: number) {
  return Response.json({ error: codigo, mensaje }, { status });
}

// Aísla el objeto JSON: quita posibles ```json ... ``` y texto sobrante,
// quedándose con el primer "{" hasta el último "}".
function extraerJSON(texto: string): string {
  let t = texto.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const ini = t.indexOf("{");
  const fin = t.lastIndexOf("}");
  return ini >= 0 && fin > ini ? t.slice(ini, fin + 1) : t;
}

export async function POST(request: Request) {
  let cuerpo: Cuerpo;
  try {
    cuerpo = await request.json();
  } catch {
    return error("json_invalido", "Cuerpo de la solicitud inválido.", 400);
  }

  const { carrera, materia, unidadNumero, carreraDisplay, semestreDisplay } =
    cuerpo;
  if (!carrera || !materia || typeof unidadNumero !== "number") {
    return error(
      "faltan_datos",
      "Se requieren carrera, materia y unidadNumero.",
      400,
    );
  }

  const temaCompleto =
    !cuerpo.tema || cuerpo.tema === TEMA_UNIDAD_COMPLETA
      ? undefined
      : cuerpo.tema;

  // El currículo es fijo: si ya generamos esta unidad, la servimos del cache
  // (gratis, incluso sin API key). `forzar` lo regenera.
  const clave = claveCache({
    modelo: MODELO,
    carrera,
    materia,
    unidadNumero,
    tema: temaCompleto,
  });
  if (!cuerpo.forzar) {
    const cacheado = await leerCache(clave);
    if (cacheado) {
      return Response.json({ presentacion: cacheado, cacheado: true });
    }
  }

  // A partir de aquí hay que generar con IA: se requiere la API key.
  if (!process.env.ANTHROPIC_API_KEY) {
    return error("sin_api_key", "ANTHROPIC_API_KEY no está configurada.", 503);
  }

  const fuente = carrera === "MN" ? contenidosMateriasMN : contenidosMaterias;
  const programa = fuente[materia];
  if (!esProgramaOficial(programa)) {
    return error(
      "sin_programa",
      "La materia no tiene programa oficial.",
      404,
    );
  }

  const unidad = programa.unidades.find((u) => u.numero === unidadNumero);
  if (!unidad) {
    return error("sin_unidad", "La unidad no existe en el programa.", 404);
  }

  const mensajeUsuario = construirMensajeUsuario({
    programa,
    unidad,
    carreraDisplay: carreraDisplay || programa.nombre,
    semestreDisplay: semestreDisplay || "",
    tema: temaCompleto,
  });

  const client = new Anthropic();

  let validado: PresentacionIA;
  try {
    const stream = client.messages.stream({
      model: MODELO,
      max_tokens: 32000,
      thinking: { type: "adaptive" },
      output_config: { effort: "high" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: mensajeUsuario }],
    });
    const mensaje = await stream.finalMessage();

    if (mensaje.stop_reason === "refusal") {
      return error("rechazo_ia", "El modelo rechazó la solicitud.", 502);
    }

    let texto = "";
    for (const b of mensaje.content) {
      if (b.type === "text") texto += b.text;
    }
    if (!texto.trim()) {
      return error("respuesta_vacia", "La IA no devolvió contenido.", 502);
    }
    validado = presentacionIASchema.parse(JSON.parse(extraerJSON(texto)));
  } catch (e) {
    console.error("Error generando presentación con IA:", e);
    return error(
      "fallo_ia",
      e instanceof Error ? e.message : "Error desconocido al generar.",
      502,
    );
  }

  if (validado.diapositivas.length === 0) {
    return error("sin_diapositivas", "La IA devolvió 0 diapositivas.", 502);
  }

  const sufijo = temaCompleto ? `U${unidad.numero}_tema` : `U${unidad.numero}`;
  const presentacion: PresentacionV2 = {
    asignatura: programa.nombre,
    clave: programa.clave,
    unidad: `Unidad ${unidad.numero}: ${unidad.tema}`,
    carrera: carreraDisplay || programa.nombre,
    semestre: semestreDisplay || "",
    tema: temaCompleto,
    kicker: validado.kicker,
    subtituloPortada: validado.subtituloPortada ?? unidad.tema,
    nombreArchivo: `Presentacion_${programa.clave}_${sufijo}_IA.pptx`,
    diapositivas: validado.diapositivas as DiapositivaV2[],
  };

  // Guarda el guion para que esta unidad no se vuelva a pagar.
  await escribirCache(clave, presentacion);

  return Response.json({ presentacion, cacheado: false });
}
