import type { ProgramaOficial } from "./tipos";
// Piloto Naval (PN) — contenido oficial de los PDFs FIDENA.
import { contenidosSemestre1 } from "./contenidos/semestre1";
import { contenidosSemestre3 } from "./contenidos/semestre3";
import { contenidosSemestre5 } from "./contenidos/semestre5";
import { contenidosSemestre7 } from "./contenidos/semestre7";
// Maquinista/Mecánico Naval (MN) — contenido oficial de los PDFs FIDENA.
import { contenidosMN1 } from "./contenidos/mn1";
import { contenidosMN3 } from "./contenidos/mn3";
import { contenidosMN5 } from "./contenidos/mn5";
import { contenidosMN7 } from "./contenidos/mn7";

export const contenidosMaterias: Record<string, ProgramaOficial> = {
  ...contenidosSemestre1,
  ...contenidosSemestre3,
  ...contenidosSemestre5,
  ...contenidosSemestre7,
};

// MN se mantiene en un espacio de nombres separado porque comparte nombres de
// materia con PN (p. ej. "Electricidad", "Álgebra" en el 1.er año común).
export const contenidosMateriasMN: Record<string, ProgramaOficial> = {
  ...contenidosMN1,
  ...contenidosMN3,
  ...contenidosMN5,
  ...contenidosMN7,
};
