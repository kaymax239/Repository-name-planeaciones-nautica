// Generador de datos para el Avance Programático F-51 (plantilla institucional
// public/templates/Avance-Programatico-F51.docx). Es GENÉRICO: recibe las
// semanas ya seleccionadas (de PN/MN o de Inglés) y las mete en los 4 huecos del
// formato. NO conoce de dónde salen los temas (programa oficial o históricas de
// Inglés), por eso no mezcla flujos: cada pantalla arma su propio arreglo.
//
// Reutiliza el calendario oficial para derivar el periodo a partir de las
// semanas elegidas (ya no se usa el campo "Mes reportado").

import { distribuirFechas, formatearRango } from "../data/calendario";

/** Semana seleccionada para el avance: número + tema derivado automáticamente. */
export type SemanaAvanceF51 = {
  numero: number;
  tema: string;
};

export type MetaAvanceF51 = {
  asignatura: string;
  licenciatura: string;
  /** Texto del semestre (PN/MN) o nivel (Inglés) para la celda correspondiente. */
  semestre: string;
  docente: string;
  grupo: string;
  objetivosCompetencias: string;
};

// Textos institucionales por defecto (mismos que ya usaba el avance). Aplican por
// igual a cualquier asignatura; no son contenido académico.
const ESTRATEGIAS =
  "Exposición guiada, análisis de casos, ejercicios prácticos, trabajo individual y colaborativo.";
const RECURSOS =
  "Presentación digital, equipo de cómputo, material didáctico, recursos digitales y referencias académicas.";
const EVIDENCIAS =
  "Actividades de clase, ejercicios resueltos, participación, reporte breve y evidencias del portafolio académico.";
const INSTRUMENTOS =
  "Lista de cotejo, rúbrica de desempeño, participación guiada y evaluación formativa.";

const MESES_LARGOS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const FECHAS_CICLO = distribuirFechas(18);

const limpiar = (t: string) => t.trim().replace(/\s*\n\s*/g, " — ");

/**
 * Deriva el periodo del avance a partir de las semanas seleccionadas, usando el
 * calendario oficial (fechas reales). Si alguna semana cae fuera del mapeo de 18
 * semanas, se ignora para el cálculo del rango.
 */
export function periodoDesdeSemanas(numeros: number[]): {
  mes: string;
  anio: string;
  periodoReportado: string;
} {
  const fechas = numeros
    .map((n) => FECHAS_CICLO[n - 1])
    .filter((f): f is (typeof FECHAS_CICLO)[number] => !!f)
    .sort((a, b) => a.numero - b.numero);

  if (fechas.length === 0) {
    const lista = [...numeros].sort((a, b) => a - b).join(", ");
    return { mes: "", anio: "2026", periodoReportado: `Semanas ${lista}` };
  }

  const ini = fechas[0].ini;
  const fin = fechas[fechas.length - 1].fin;
  const mes =
    ini.getMonth() === fin.getMonth()
      ? MESES_LARGOS[ini.getMonth()]
      : `${MESES_LARGOS[ini.getMonth()]}–${MESES_LARGOS[fin.getMonth()]}`;

  return {
    mes,
    anio: String(fin.getFullYear()),
    periodoReportado: formatearRango({ ini, fin }),
  };
}

/**
 * Construye el objeto de render para Avance-Programatico-F51.docx. Toma como
 * máximo 4 semanas (el formato tiene 4 huecos); si llegan más, el llamador debe
 * avisar del recorte. Si llegan menos, los huecos sobrantes quedan vacíos.
 */
export function construirDatosAvanceF51(
  semanas: SemanaAvanceF51[],
  meta: MetaAvanceF51,
) {
  const sel = semanas.slice(0, 4);
  const { mes, anio, periodoReportado } = periodoDesdeSemanas(
    sel.map((s) => s.numero),
  );

  const temasCubiertos =
    sel.map((s) => `Semana ${s.numero}: ${limpiar(s.tema)}`).join("\n") ||
    "Sin semanas seleccionadas.";

  const hueco = (i: number) => {
    const s = sel[i];
    return {
      tema: s ? limpiar(s.tema) : "",
      sesiones: s ? "1" : "",
      estrategia: s ? ESTRATEGIAS : "",
      evidencia: s ? EVIDENCIAS : "",
      recursos: s ? RECURSOS : "",
      instrumento: s ? INSTRUMENTOS : "",
    };
  };
  const h = [hueco(0), hueco(1), hueco(2), hueco(3)];

  return {
    asignaturaCurso: meta.asignatura,
    mes,
    anio,
    docente: meta.docente || "Nombre y firma del docente",
    licenciatura: meta.licenciatura,
    semestre: meta.semestre,
    grupo: meta.grupo,
    periodoReportado,
    temasCubiertos,
    objetivosCompetencias:
      meta.objetivosCompetencias ||
      `Desarrollar las competencias de ${meta.asignatura}.`,
    firmaDocente: meta.docente || "Nombre y firma del docente",

    tema1: h[0].tema, sesiones1: h[0].sesiones, estrategia1: h[0].estrategia,
    evidencia1: h[0].evidencia, recursos1: h[0].recursos, instrumento1: h[0].instrumento,
    tema2: h[1].tema, sesiones2: h[1].sesiones, estrategia2: h[1].estrategia,
    evidencia2: h[1].evidencia, recursos2: h[1].recursos, instrumento2: h[1].instrumento,
    tema3: h[2].tema, sesiones3: h[2].sesiones, estrategia3: h[2].estrategia,
    evidencia3: h[2].evidencia, recursos3: h[2].recursos, instrumento3: h[2].instrumento,
    tema4: h[3].tema, sesiones4: h[3].sesiones, estrategia4: h[3].estrategia,
    evidencia4: h[3].evidencia, recursos4: h[3].recursos, instrumento4: h[3].instrumento,
  };
}
