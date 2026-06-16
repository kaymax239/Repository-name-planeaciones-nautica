// Adaptador de unidades/temas para el selector de presentaciones.
// Lee la biblioteca estructurada ya existente (programas oficiales) y expone
// las unidades y subtemas de una materia para poblar los dropdowns. No genera
// nada: solo proyecta los datos del temario oficial.

import { esProgramaOficial, type ProgramaOficial } from "../tipos";

/** Subtemas (temas específicos) de una unidad, verbatim del programa oficial. */
export function temasDeUnidad(
  programa: ProgramaOficial | undefined,
  unidadNumero: number,
): string[] {
  if (!esProgramaOficial(programa)) return [];
  return programa.unidades.find((u) => u.numero === unidadNumero)?.subtemas ?? [];
}
