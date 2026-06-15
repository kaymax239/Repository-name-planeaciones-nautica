// Calendario escolar oficial FIDENA — Ciclo 2026/2027, 1.er periodo (Jul-Dic 2026).
// Semestres I, III, V y VII. Fuente: calendario oficial Secretaría de Marina.
// Mapeo de las 18 semanas a fechas reales confirmado con el calendario (saltando asuetos).

export type RangoFecha = { ini: Date; fin: Date };

export type SemanaFecha = {
  numero: number;
  ini: Date;
  fin: Date;
  /** Rango legible, p. ej. "3–8 ago 2026" o "31 ago–5 sep 2026". */
  etiqueta: string;
  /** Asuetos que caen dentro de la semana. */
  asuetos: Asueto[];
};

export type Asueto = { fecha: Date; nombre: string };

const d = (mes: number, dia: number) => new Date(2026, mes - 1, dia);

export const INICIO_CLASES = d(8, 3); // lunes 3 de agosto de 2026
export const FIN_PERIODO = d(12, 23); // miércoles 23 de diciembre de 2026
export const PERIODO_ESCOLAR = "Julio-Diciembre 2026";

// Días de asueto (sin clase) confirmados dentro del periodo de clases.
export const ASUETOS: Asueto[] = [
  { fecha: d(9, 2), nombre: "Aniversario de la ENM de Tampico" },
  { fecha: d(9, 16), nombre: "Día de la Independencia de México" },
  { fecha: d(11, 2), nombre: "Día de Muertos" },
  { fecha: d(11, 16), nombre: "Aniversario de la Revolución Mexicana" },
  { fecha: d(11, 20), nombre: "Desfile de la Revolución Mexicana" },
];

// Fechas de evaluación para la hoja de fechas del F-32.
export const EXAMENES = {
  parcial1: { ini: d(10, 12), fin: d(10, 17) }, // 1.ª Evaluación Parcial
  parcial2: { ini: d(11, 30), fin: d(12, 5) }, // 2.ª Evaluación Parcial
  ordinario: { ini: d(12, 10), fin: d(12, 16) }, // Evaluación Ordinaria / Semestral
  extraordinario: { ini: d(12, 19), fin: d(12, 22) },
  regularizacion: { ini: d(12, 23), fin: d(12, 23) },
} satisfies Record<string, RangoFecha>;

// Rango de semanas que evalúa cada examen (1-indexado, inclusivo).
export const RANGO_EVALUACION = {
  parcial1: { desde: 1, hasta: 10 },
  parcial2: { desde: 11, hasta: 16 },
  ordinario: { desde: 1, hasta: 18 },
} as const;

// Mapeo APROBADO de las 18 semanas de planeación a fechas reales.
// Las semanas de parcial (oct 12-17 y nov 30-dic 5) NO son semanas de contenido:
// quedan entre la semana 10 y 11, y entre la 16 y 17 respectivamente.
const RANGOS_SEMANA: RangoFecha[] = [
  { ini: d(8, 3), fin: d(8, 8) }, // 1
  { ini: d(8, 10), fin: d(8, 15) }, // 2
  { ini: d(8, 17), fin: d(8, 22) }, // 3
  { ini: d(8, 24), fin: d(8, 29) }, // 4
  { ini: d(8, 31), fin: d(9, 5) }, // 5  (asueto 2 sep)
  { ini: d(9, 7), fin: d(9, 12) }, // 6
  { ini: d(9, 14), fin: d(9, 19) }, // 7  (asueto 16 sep)
  { ini: d(9, 21), fin: d(9, 26) }, // 8
  { ini: d(9, 28), fin: d(10, 3) }, // 9
  { ini: d(10, 5), fin: d(10, 10) }, // 10  -> 1.ª Parcial (oct 12-17)
  { ini: d(10, 19), fin: d(10, 24) }, // 11
  { ini: d(10, 26), fin: d(10, 31) }, // 12
  { ini: d(11, 2), fin: d(11, 7) }, // 13  (asueto 2 nov)
  { ini: d(11, 9), fin: d(11, 14) }, // 14
  { ini: d(11, 16), fin: d(11, 21) }, // 15  (asuetos 16 y 20 nov)
  { ini: d(11, 23), fin: d(11, 28) }, // 16  -> 2.ª Parcial (nov 30-dic 5)
  { ini: d(12, 7), fin: d(12, 9) }, // 17  Repaso general
  { ini: d(12, 10), fin: d(12, 16) }, // 18  Evaluación integradora / Ordinario
];

const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

/** Formatea un rango como "3–8 ago 2026" o "31 ago–5 sep 2026". */
export const formatearRango = ({ ini, fin }: RangoFecha) => {
  const anio = fin.getFullYear();
  if (ini.getMonth() === fin.getMonth()) {
    return `${ini.getDate()}–${fin.getDate()} ${MESES[fin.getMonth()]} ${anio}`;
  }
  return `${ini.getDate()} ${MESES[ini.getMonth()]}–${fin.getDate()} ${MESES[fin.getMonth()]} ${anio}`;
};

/** Formatea una fecha suelta como "16 sep". */
export const formatearFecha = (fecha: Date) =>
  `${fecha.getDate()} ${MESES[fecha.getMonth()]}`;

const dentroDe = (fecha: Date, { ini, fin }: RangoFecha) =>
  fecha.getTime() >= ini.getTime() && fecha.getTime() <= fin.getTime();

/**
 * Distribuye las fechas reales sobre el número de semanas de la asignatura.
 * Las asignaturas de 18 semanas usan el mapeo completo; las de menos semanas
 * (p. ej. cursos intensivos de 5 semanas) usan las primeras N semanas.
 */
export const distribuirFechas = (numSemanas: number): SemanaFecha[] => {
  const total = Math.min(numSemanas, RANGOS_SEMANA.length);

  return Array.from({ length: total }, (_, i) => {
    const rango = RANGOS_SEMANA[i];
    const asuetos = ASUETOS.filter((a) => dentroDe(a.fecha, rango));

    return {
      numero: i + 1,
      ini: rango.ini,
      fin: rango.fin,
      etiqueta: formatearRango(rango),
      asuetos,
    };
  });
};

/** Texto compacto para la celda "Semana" del F-32, p. ej.:
 *  "Semana 7\n14–19 sep 2026\n(asueto: 16 sep)". */
export const etiquetaSemanaF32 = (semana: SemanaFecha) => {
  const lineas = [`Semana ${semana.numero}`, semana.etiqueta];
  if (semana.asuetos.length > 0) {
    lineas.push(
      `(asueto: ${semana.asuetos.map((a) => formatearFecha(a.fecha)).join(", ")})`,
    );
  }
  return lineas.join("\n");
};
