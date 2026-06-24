// Fase 2 — System prompt y mensaje de usuario para el enriquecimiento Premium.
//
// Ancla TODO al programa oficial (fuente de verdad) y usa las planeaciones
// históricas SOLO como referencia de estilo institucional. Las reglas duras
// impiden que la IA toque temas/unidades/objetivos/bibliografía; el merge es la
// garantía final (este prompt es la primera línea de defensa).

import type { ProgramaOficial, UnidadOficial } from "../data/tipos";

/** Extracto de una planeación histórica usado como referencia de estilo. */
export interface ReferenciaHistorica {
  clave: string;
  materia: string;
  etiquetaNivel: string; // cómo se relacionó (clave-exacta, misma-materia, …)
  pedagogia: {
    competencias?: string[];
    estrategiasEnsenanza?: string[];
    tecnicasEnsenanza?: string[];
    secuenciaDidactica?: string;
    productosEvidencias?: string[];
    instrumentosEvaluacion?: string[];
  };
}

export interface ContextoPlaneacion {
  programa: ProgramaOficial;
  /** Unidades a enriquecer (todas, o un subconjunto del programa). */
  unidades: UnidadOficial[];
  carreraDisplay: string;
  semestreDisplay: string;
  /** Texto de criterios DEN de evaluación (de evaluacion.ts). */
  lineamientosDEN: string;
  /** 0–3 planeaciones históricas como referencia de estilo. */
  historicas: ReferenciaHistorica[];
}

export const SYSTEM_PROMPT = `Eres un diseñador instruccional experto de la Escuela Náutica Mercante de México (FIDENA), especializado en planeación didáctica F-32 alineada a los estándares OMI/STCW y a los lineamientos de evaluación DEN.

Tu tarea es ENRIQUECER la parte PEDAGÓGICA de una planeación cuyo contenido curricular ya está fijado por el PROGRAMA OFICIAL. Devuelves ÚNICAMENTE el objeto JSON solicitado (sin texto adicional, sin markdown).

REGLAS DURAS (no negociable):
- El PROGRAMA OFICIAL es la única fuente de verdad. NO inventes, cambies, reordenes ni completes temas, unidades, subtemas, objetivos ni bibliografía. NO los repitas en tu salida: no hay campo para ellos.
- Solo produces: competencias genéricas (a nivel asignatura) y, POR UNIDAD: competencias disciplinares, estrategias de enseñanza, técnicas de enseñanza, secuencia didáctica (inicio, desarrollo, cierre), productos/evidencias e instrumentos de evaluación.
- Cada bloque por unidad debe referenciar la unidad por su número oficial exacto (unidadNumero). NO crees unidades nuevas ni números que no existan en el programa.
- Usa las PLANEACIONES HISTÓRICAS solo como REFERENCIA DE ESTILO institucional y de técnicas reales; NO copies su contenido curricular ni inventes a partir de ellas temas fuera del programa.
- Los instrumentos de evaluación deben respetar los LINEAMIENTOS DEN entregados y clasificarse como "diagnostica", "formativa" o "sumativa".

CALIDAD ESPERADA:
- Nivel universitario profesional, terminología marítima correcta, español neutro.
- Secuencia didáctica concreta y accionable: en "inicio" activa conocimientos previos; en "desarrollo" explica y aplica los subtemas oficiales con práctica; en "cierre" socializa, evalúa y retroalimenta.
- Estrategias y técnicas variadas y específicas de la materia (no genéricas).

FORMATO DE SALIDA: exclusivamente el objeto JSON conforme al esquema. Sin \`\`\`, sin comentarios, sin texto antes o después.`;

const limpiarSubtema = (s: string) =>
  s.replace(/^\s*\d+(\.\d+)*\.?\s*/, "").trim();

function bloqueUnidadesOficiales(unidades: UnidadOficial[]): string {
  return unidades
    .map((u) => {
      const subtemas = u.subtemas.map((s) => `    - ${limpiarSubtema(s)}`).join("\n");
      return `UNIDAD ${u.numero}: ${u.tema}
  Objetivo específico (INMUTABLE): ${u.objetivoEspecifico || "(no especificado)"}
  Subtemas oficiales (INMUTABLES, no los repitas en tu salida):
${subtemas || "    (sin subtemas)"}`;
    })
    .join("\n\n");
}

function bloqueHistoricas(historicas: ReferenciaHistorica[]): string {
  if (!historicas.length)
    return "(No hay planeaciones históricas de referencia; usa tu mejor criterio institucional respetando el programa.)";

  return historicas
    .map((h, i) => {
      const p = h.pedagogia;
      const lista = (arr?: string[]) =>
        arr && arr.length ? arr.slice(0, 8).map((x) => `    · ${x}`).join("\n") : "    (sin datos)";
      const sec = (p.secuenciaDidactica || "").slice(0, 1200);
      return `REFERENCIA ${i + 1} — ${h.materia} (${h.clave}) [relación: ${h.etiquetaNivel}]
  Competencias:
${lista(p.competencias)}
  Estrategias de enseñanza:
${lista(p.estrategiasEnsenanza)}
  Técnicas de enseñanza:
${lista(p.tecnicasEnsenanza)}
  Instrumentos de evaluación:
${lista(p.instrumentosEvaluacion)}
  Secuencia (estilo, extracto): ${sec || "(sin datos)"}`;
    })
    .join("\n\n");
}

/** Construye el mensaje de usuario con el contexto oficial + histórico + DEN. */
export function construirMensajeUsuario(ctx: ContextoPlaneacion): string {
  const { programa, unidades, carreraDisplay, semestreDisplay, lineamientosDEN } = ctx;

  return `Enriquece la planeación didáctica para:

CARRERA: ${carreraDisplay}
SEMESTRE: ${semestreDisplay}
ASIGNATURA: ${programa.nombre} (clave ${programa.clave})
OBJETIVO GENERAL DE LA ASIGNATURA (INMUTABLE): ${programa.objetivoGeneral || "(no especificado)"}

PROGRAMA OFICIAL — UNIDADES A ENRIQUECER (contenido INMUTABLE; ancla tu salida a estos unidadNumero):
${bloqueUnidadesOficiales(unidades)}

LINEAMIENTOS DE EVALUACIÓN (DEN) — respétalos al definir instrumentos:
${lineamientosDEN}

PLANEACIONES HISTÓRICAS — referencia de ESTILO institucional (no copies contenido curricular):
${bloqueHistoricas(ctx.historicas)}

TAREA: genera competenciasGenericas (asignatura) y, para CADA unidad listada, su enriquecimiento pedagógico anclado a su unidadNumero. Devuelve solo el JSON del esquema.`;
}
