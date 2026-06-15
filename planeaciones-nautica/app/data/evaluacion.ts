// Criterios de evaluación y escala de calificación oficiales.
// Fuente: Oficio DEN/526/2025 (Calificaciones en evaluaciones parciales, semestrales,
// extraordinarias y de regularización), ratificado por DEN/773/2025 y DEN/065/2026.
// Vigente para el ciclo Agosto-Diciembre 2026 (semestres I, III, V y VII).

export type TipoMateria = "teorica" | "practica" | "teorico-practica";

// La generación define tanto los porcentajes como la escala aprobatoria.
//  - "nuevo-ingreso": generación 2025-2029 y subsecuentes (1.er Año). Mínima 7.0.
//  - "en-curso": generaciones 2021-2025 (2.º, 3.º y 4.º Año). Mínima 6.0.
export type Generacion = "nuevo-ingreso" | "en-curso";

export type Criterio = { nombre: string; porcentaje: number };

const CONOCIMIENTO = "Conocimiento";
const ACTIVIDADES = "Prácticas y Actividades de Aprendizaje";
const PARTICIPACION = "Participaciones y uso de las TIC's";

// Art. 25 — generación nuevo ingreso (1.er Año): teóricas y prácticas iguales.
const CRITERIOS_NUEVO_INGRESO: Record<TipoMateria, Criterio[]> = {
  teorica: [
    { nombre: CONOCIMIENTO, porcentaje: 20 },
    { nombre: ACTIVIDADES, porcentaje: 70 },
    { nombre: PARTICIPACION, porcentaje: 10 },
  ],
  practica: [
    { nombre: CONOCIMIENTO, porcentaje: 20 },
    { nombre: ACTIVIDADES, porcentaje: 70 },
    { nombre: PARTICIPACION, porcentaje: 10 },
  ],
  // No diferenciada en este esquema; se usa el mismo reparto.
  "teorico-practica": [
    { nombre: CONOCIMIENTO, porcentaje: 20 },
    { nombre: ACTIVIDADES, porcentaje: 70 },
    { nombre: PARTICIPACION, porcentaje: 10 },
  ],
};

// Generaciones en curso (2021-2025): el reparto sí depende del tipo de materia.
const CRITERIOS_EN_CURSO: Record<TipoMateria, Criterio[]> = {
  teorica: [
    { nombre: CONOCIMIENTO, porcentaje: 50 },
    { nombre: ACTIVIDADES, porcentaje: 25 },
    { nombre: PARTICIPACION, porcentaje: 25 },
  ],
  practica: [
    { nombre: CONOCIMIENTO, porcentaje: 25 },
    { nombre: ACTIVIDADES, porcentaje: 50 },
    { nombre: PARTICIPACION, porcentaje: 25 },
  ],
  // El oficio solo define teóricas y prácticas; para teórico-prácticas se toma
  // el esquema teórico como predeterminado (ajustar con la clasificación DEN-065).
  "teorico-practica": [
    { nombre: CONOCIMIENTO, porcentaje: 50 },
    { nombre: ACTIVIDADES, porcentaje: 25 },
    { nombre: PARTICIPACION, porcentaje: 25 },
  ],
};

export const ESCALA = {
  "nuevo-ingreso": {
    minimaAprobatoria: 7.0,
    noCompetente: "0.0 a 6.9",
    competente: "7.0 a 10.0",
  },
  "en-curso": {
    minimaAprobatoria: 6.0,
    noCompetente: "0.0 a 5.9",
    competente: "6.0 a 10.0",
  },
} as const;

// Evaluaciones del periodo (su calendarización vive en ./calendario.ts).
export const EVALUACIONES = [
  "Primera Evaluación Parcial",
  "Segunda Evaluación Parcial",
  "Evaluación Semestral (Ordinaria)",
] as const;

/** Semestre I = nuevo ingreso (1.er Año); III, V y VII = generaciones en curso. */
export const generacionPorSemestre = (semestre: string): Generacion =>
  /\bI\s+SEMESTRE\b/i.test(semestre.trim()) ? "nuevo-ingreso" : "en-curso";

export const criteriosEvaluacion = (
  tipo: TipoMateria = "teorico-practica",
  generacion: Generacion = "nuevo-ingreso",
): Criterio[] =>
  (generacion === "nuevo-ingreso" ? CRITERIOS_NUEVO_INGRESO : CRITERIOS_EN_CURSO)[
    tipo
  ];

/** Texto compacto de puntuaciones para la celda de evaluación del F-32. */
export const textoPuntuacionesF32 = (
  tipo: TipoMateria = "teorico-practica",
  generacion: Generacion = "nuevo-ingreso",
) => {
  const criterios = criteriosEvaluacion(tipo, generacion)
    .map((c) => `${c.nombre} ${c.porcentaje}%`)
    .join(" · ");
  const escala = ESCALA[generacion];

  return (
    `Criterios de evaluación (DEN/526/2025): ${criterios}. ` +
    `Instrumentos: lista de cotejo y rúbrica de desempeño. ` +
    `Escala: ${escala.competente} Competente (aprobatorio); ` +
    `${escala.noCompetente} Aún no competente. ` +
    `Mínima aprobatoria: ${escala.minimaAprobatoria.toFixed(1)}.`
  );
};
