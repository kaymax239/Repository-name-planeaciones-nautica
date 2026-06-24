// Fase 2 — Merge: PROGRAMA OFICIAL ⊕ ENRIQUECIMIENTO IA.
//
// GARANTÍA CENTRAL DEL MODO PREMIUM:
//   - tema, objetivoEspecifico, subtemas y bibliografía SIEMPRE provienen del
//     programa oficial. NUNCA del enriquecimiento (el esquema de IA ni siquiera
//     tiene esos campos).
//   - La pedagogía de IA se aplica por unidad SOLO si referencia un unidadNumero
//     que existe en el programa; cualquier número desconocido se DESCARTA.
//   - Las unidades sin enriquecimiento válido quedan con `pedagogia: null` para
//     que el llamador use el camino determinista actual (fallback por unidad).
//
// Función PURA: no usa red, fs ni Gemini. Es la pieza que la Fase 3 conectará a
// generarWord (sin tocarlo en esta fase).

import type { ProgramaOficial, UnidadOficial } from "../data/tipos";
import type {
  PlaneacionEnriquecida,
  UnidadEnriquecida,
} from "./esquemaPlaneacion";

export interface PedagogiaUnidad {
  competenciasDisciplinares: string[];
  estrategiasEnsenanza: string[];
  tecnicasEnsenanza: string[];
  secuencia: { inicio: string; desarrollo: string; cierre: string };
  productosEvidencias: string[];
  instrumentosEvaluacion: { nombre: string; tipo: string }[];
}

export interface UnidadMerge {
  // --- OFICIAL (inmutable) ---
  numero: number;
  tema: string;
  objetivoEspecifico: string;
  subtemas: string[];
  // --- PREMIUM (IA), o null si no hubo enriquecimiento válido ---
  pedagogia: PedagogiaUnidad | null;
}

export interface ResultadoMerge {
  asignatura: string;
  clave: string;
  /** Bibliografía SIEMPRE del programa oficial. */
  bibliografia: string[];
  /** Competencias genéricas (de IA; [] si no hubo enriquecimiento). */
  competenciasGenericas: string[];
  unidades: UnidadMerge[];
  /** true si se aplicó enriquecimiento a al menos una unidad. */
  enriquecido: boolean;
  /** Diagnóstico: unidadNumero devueltos por IA que no existen en el programa. */
  unidadesDescartadas: number[];
}

function aPedagogia(u: UnidadEnriquecida): PedagogiaUnidad {
  return {
    competenciasDisciplinares: u.competenciasDisciplinares ?? [],
    estrategiasEnsenanza: u.estrategiasEnsenanza ?? [],
    tecnicasEnsenanza: u.tecnicasEnsenanza ?? [],
    secuencia: u.secuencia,
    productosEvidencias: u.productosEvidencias ?? [],
    instrumentosEvaluacion: u.instrumentosEvaluacion ?? [],
  };
}

/**
 * Combina el programa oficial con el enriquecimiento de IA. Si `enriquecimiento`
 * es null (IA falló o deshabilitada), devuelve el programa con `pedagogia: null`
 * en todas las unidades → el llamador cae al sistema determinista actual.
 */
export function mergePlaneacion(
  programa: ProgramaOficial,
  enriquecimiento: PlaneacionEnriquecida | null,
): ResultadoMerge {
  const numerosOficiales = new Set(programa.unidades.map((u) => u.numero));

  // Indexa el enriquecimiento por unidadNumero, ignorando los desconocidos.
  const porNumero = new Map<number, UnidadEnriquecida>();
  const unidadesDescartadas: number[] = [];
  for (const u of enriquecimiento?.unidades ?? []) {
    if (numerosOficiales.has(u.unidadNumero)) porNumero.set(u.unidadNumero, u);
    else unidadesDescartadas.push(u.unidadNumero);
  }

  const unidades: UnidadMerge[] = programa.unidades.map((u: UnidadOficial) => {
    const ia = porNumero.get(u.numero);
    return {
      // OFICIAL — copiado verbatim, jamás de la IA.
      numero: u.numero,
      tema: u.tema,
      objetivoEspecifico: u.objetivoEspecifico,
      subtemas: [...u.subtemas],
      // PREMIUM — solo si hubo enriquecimiento válido para esta unidad.
      pedagogia: ia ? aPedagogia(ia) : null,
    };
  });

  return {
    asignatura: programa.nombre,
    clave: programa.clave,
    bibliografia: [...programa.bibliografia],
    competenciasGenericas: enriquecimiento?.competenciasGenericas ?? [],
    unidades,
    enriquecido: unidades.some((u) => u.pedagogia !== null),
    unidadesDescartadas,
  };
}
