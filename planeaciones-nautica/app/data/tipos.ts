// Tipos para los programas oficiales FIDENA (fuente de verdad: PDFs de programa).
// Estructura fiel al "Programa de Asignatura": clave, nombre, tipo, horas,
// objetivo general, unidades (con temas/subtemas/objetivo específico) y bibliografía.

export type HorasPrograma = {
  semanas: number;
  porSemana: number;
  teoricas: number;
  practicas: number;
  independientes: number;
  total: number;
};

export type UnidadOficial = {
  numero: number;
  /** Título del tema de la unidad (verbatim del PDF). */
  tema: string;
  /** Objetivo específico de la unidad ("Pendiente de revisión" si no se pudo extraer). */
  objetivoEspecifico: string;
  /** Subtemas verbatim del PDF (incluyen su numeración, p. ej. "1.1 ..."). */
  subtemas: string[];
  /** true para la unidad transversal "Contenidos de actualidad...". */
  transversal: boolean;
};

export type ProgramaOficial = {
  clave: string;
  nombre: string;
  tipo: string;
  horas: HorasPrograma;
  objetivoGeneral: string;
  unidades: UnidadOficial[];
  /** Líneas de "FUENTES DE CONSULTA" (mejor esfuerzo; revisión recomendada). */
  bibliografia: string[];
  /** Archivo PDF de origen. */
  fuente: string;
};

/** Type guard: distingue un programa oficial (nuevo) del contenido genérico (legacy). */
export const esProgramaOficial = (v: unknown): v is ProgramaOficial =>
  !!v && typeof v === "object" && Array.isArray((v as ProgramaOficial).unidades);
