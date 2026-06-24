// Fase 1 — Selección de planeaciones históricas relevantes para una materia.
//
// Dado el programa oficial de una materia (clave, nombre, carrera, semestre),
// localiza en el corpus histórico (app/data/planeaciones-historicas/manifest.json)
// las 1–3 planeaciones más PARECIDAS, para usarlas en una fase posterior como
// REFERENCIA DE ESTILO al pedirle a Gemini la redacción pedagógica.
//
// IMPORTANTE: este módulo NO toca el flujo actual. No importa Gemini, no usa
// `fs`, no modifica generarWord ni los programas oficiales. Es una función pura
// de búsqueda sobre el índice ya generado en la Fase 0.
//
// Cascada de especificidad (devuelve el primer nivel con resultados):
//   1. CLAVE exacta            (NAV530 → NAV530)
//   2. MISMA MATERIA           (raíz del nombre, ignorando números romanos)
//   3. ÁREA + CARRERA + SEM.   (náutica · PN · 5.º)
//   4. CARRERA + SEMESTRE      (PN · 5.º)
//   5. ÁREA + CARRERA          (náutica · PN)
//   (sin resultados → []; el llamador decide no enviar contexto histórico)

import manifestData from "../data/planeaciones-historicas/manifest.json";

export type Carrera = "PN" | "MN";

export type AreaAcademica =
  | "nautica"
  | "maquinas"
  | "basica"
  | "humanidades"
  | "practicas-marineras"
  | "educacion-fisica"
  | "otra";

/** Una entrada del manifest histórico (Fase 0). */
export interface EntradaHistorica {
  id: string;
  clave: string;
  materia: string;
  carrera: string; // "PN" | "MN" | "ND"
  semestre: number; // 0 = indeterminado
  area: string;
  docente: string;
  archivoOrigen: string;
  formato: "doc" | "docx";
  /** Ruta relativa al corpus JSON, dentro de app/data/planeaciones-historicas/. */
  corpus: string;
  claveCoincideConProgramaOficial: boolean;
}

interface Manifest {
  totalCorpus: number;
  documentos: EntradaHistorica[];
}

const MANIFEST = manifestData as unknown as Manifest;
const DOCUMENTOS: EntradaHistorica[] = MANIFEST.documentos ?? [];

/** Criterio de búsqueda: lo que se conoce de la materia (del programa oficial). */
export interface CriterioBusqueda {
  /** Clave oficial, p. ej. "NAV530". Es la señal más fuerte. */
  clave?: string;
  /** Nombre oficial de la materia, p. ej. "Navegación III". */
  materia?: string;
  carrera: Carrera;
  /** Semestre 1–8 (impares en este ciclo). */
  semestre?: number;
  /** Área académica; si se omite, se infiere de clave/materia. */
  area?: AreaAcademica;
}

/** Nivel de coincidencia alcanzado (a mayor especificidad, mayor score). */
export const NIVEL = {
  CLAVE: { n: 1, score: 1.0, etiqueta: "clave-exacta" },
  MATERIA: { n: 2, score: 0.8, etiqueta: "misma-materia" },
  AREA_CARRERA_SEMESTRE: { n: 3, score: 0.6, etiqueta: "area-carrera-semestre" },
  CARRERA_SEMESTRE: { n: 4, score: 0.4, etiqueta: "carrera-semestre" },
  AREA_CARRERA: { n: 5, score: 0.25, etiqueta: "area-carrera" },
} as const;

export type Nivel = (typeof NIVEL)[keyof typeof NIVEL];

export interface ResultadoHistorica {
  entrada: EntradaHistorica;
  nivel: number;
  etiquetaNivel: string;
  score: number;
}

export interface OpcionesSeleccion {
  /** Máximo de resultados a devolver (por defecto 3). */
  maximo?: number;
  /** Excluir documentos sin clave detectada (por defecto false). */
  soloConClave?: boolean;
}

/* ------------------------------ normalización ------------------------------ */

const ROMANOS = /\b(viii|vii|vi|iv|iii|ii|i|v)\b/g;

/** minúsculas, sin acentos, sin signos. */
export function normalizar(s: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Clave canónica: sin espacios ni signos, mayúsculas. "NAV 530" → "NAV530". */
export function normalizarClave(s: string): string {
  return (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/**
 * Raíz de la materia: nombre normalizado sin numeración de nivel (romanos,
 * "1", "I"…) ni ruido de plantilla. "Navegación III" / "NAVEGACIONIII" →
 * "navegacion". Permite agrupar Navegación I/III/V como la misma materia base.
 */
export function raizMateria(s: string): string {
  let t = " " + normalizar(s) + " ";
  // separa números pegados al final de palabra: "navegacioniii" → "navegacion iii"
  t = t.replace(/([a-z])(viii|vii|vi|iii|ii|iv|ix|x)\b/g, "$1 $2");
  t = t.replace(ROMANOS, " ");
  t = t.replace(/\b\d+\b/g, " ");
  return t.replace(/\s+/g, " ").trim();
}

/* ------------------------------ inferencia de área ------------------------- */

export function inferirArea(clave: string, materia: string): AreaAcademica {
  const s = normalizar(clave + " " + materia);
  if (
    /\bnav|cart|hidr|meteo|maniobr|carga|estiba|teb|teoria del buque|omi|sim|contmult|control de mult|familiariz|buque tanque|buque de pasaje\b/.test(
      s,
    )
  )
    return "nautica";
  if (/\bmot|mef|fluidos|mma|maq mar|electro|auto|lab|taller|refrig|estab|motor\b/.test(s))
    return "maquinas";
  if (/\bpmr|practicas mariner\b/.test(s)) return "practicas-marineras";
  if (/\beduc.*fisica|educacion fisica|\be f\b\b/.test(s)) return "educacion-fisica";
  if (/\betica|lider|expre|redacc|estrategias de aprend\b/.test(s)) return "humanidades";
  if (
    /\balg|fis|din|geo|dibujo|ele|quim|transporte marit|tec avanz|incendio\b/.test(s)
  )
    return "basica";
  return "otra";
}

/* ------------------------------ selección ------------------------------ */

/** Ordena dentro de un nivel: primero los validados con programa oficial y docx. */
function ordenarCandidatos(a: EntradaHistorica, b: EntradaHistorica): number {
  if (a.claveCoincideConProgramaOficial !== b.claveCoincideConProgramaOficial)
    return a.claveCoincideConProgramaOficial ? -1 : 1;
  if (a.formato !== b.formato) return a.formato === "docx" ? -1 : 1; // docx más limpio
  return a.id.localeCompare(b.id); // estable
}

/**
 * Devuelve las planeaciones históricas más parecidas a la materia indicada,
 * tomando el PRIMER nivel de la cascada que produzca resultados.
 * Si no hay ninguna coincidencia razonable, devuelve [].
 */
export function seleccionarHistoricas(
  criterio: CriterioBusqueda,
  opciones: OpcionesSeleccion = {},
): ResultadoHistorica[] {
  const maximo = opciones.maximo ?? 3;
  const carrera = criterio.carrera;
  const semestre = criterio.semestre;
  const claveBuscada = criterio.clave ? normalizarClave(criterio.clave) : "";
  const raizBuscada = criterio.materia ? raizMateria(criterio.materia) : "";
  const area =
    criterio.area ?? inferirArea(criterio.clave ?? "", criterio.materia ?? "");

  let universo = DOCUMENTOS;
  if (opciones.soloConClave) universo = universo.filter((d) => d.clave);

  // Filtros de cada nivel, en orden de especificidad.
  const niveles: { nivel: Nivel; test: (d: EntradaHistorica) => boolean }[] = [
    {
      nivel: NIVEL.CLAVE,
      test: (d) => !!claveBuscada && normalizarClave(d.clave) === claveBuscada,
    },
    {
      nivel: NIVEL.MATERIA,
      test: (d) =>
        !!raizBuscada &&
        raizMateria(d.materia) === raizBuscada &&
        d.carrera === carrera,
    },
    {
      nivel: NIVEL.AREA_CARRERA_SEMESTRE,
      test: (d) =>
        d.area === area &&
        d.carrera === carrera &&
        !!semestre &&
        d.semestre === semestre,
    },
    {
      nivel: NIVEL.CARRERA_SEMESTRE,
      test: (d) => d.carrera === carrera && !!semestre && d.semestre === semestre,
    },
    { nivel: NIVEL.AREA_CARRERA, test: (d) => d.area === area && d.carrera === carrera },
  ];

  for (const { nivel, test } of niveles) {
    const encontrados = universo.filter(test).sort(ordenarCandidatos);
    if (encontrados.length) {
      return encontrados.slice(0, maximo).map((entrada) => ({
        entrada,
        nivel: nivel.n,
        etiquetaNivel: nivel.etiqueta,
        score: nivel.score,
      }));
    }
  }

  return [];
}

/** Ruta relativa del corpus de una entrada (para que la Fase 2 lo cargue). */
export function rutaCorpus(entrada: EntradaHistorica): string {
  return `app/data/planeaciones-historicas/${entrada.corpus}`;
}

/** Acceso de solo lectura al manifest completo (para diagnósticos). */
export function totalHistoricas(): number {
  return DOCUMENTOS.length;
}
