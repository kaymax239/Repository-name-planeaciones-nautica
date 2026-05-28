import { contenidosSemestre1 } from "./contenidos/semestre1";
import { contenidosSemestre3 } from "./contenidos/semestre3";
import { contenidosSemestre5 } from "./contenidos/semestre5";

export const contenidosMaterias = {
  ...contenidosSemestre1,
  ...contenidosSemestre3,
  ...contenidosSemestre5,
};