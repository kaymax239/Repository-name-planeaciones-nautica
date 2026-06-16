// Registro de presentaciones enriquecidas DISPONIBLES (bajo demanda).
// Hoy solo existe Álgebra (PN) · Unidad 1 · V2. Agregar una unidad futura =
// añadir una entrada aquí; nada se genera ni se almacena por adelantado.

import type { PresentacionV2 } from "./tiposV2";
import { presentacionAlgebraU1V2 } from "./algebra-u1-v2";

/** Clave de disponibilidad: carrera | materia | número de unidad. */
const clave = (carrera: string, materia: string, unidad: number) =>
  `${carrera}|${materia}|${unidad}`;

const disponibles: Record<string, PresentacionV2> = {
  [clave("PN", "Álgebra", 1)]: presentacionAlgebraU1V2,
};

/** Devuelve la presentación V2 de la unidad seleccionada, o null si aún no existe. */
export function obtenerPresentacion(
  carrera: string,
  materia: string,
  unidad: number,
): PresentacionV2 | null {
  return disponibles[clave(carrera, materia, unidad)] ?? null;
}

/** true si la combinación tiene presentación enriquecida disponible. */
export function presentacionDisponible(
  carrera: string,
  materia: string,
  unidad: number,
): boolean {
  return clave(carrera, materia, unidad) in disponibles;
}
