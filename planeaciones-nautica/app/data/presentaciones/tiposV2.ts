// Tipos V2 — capa visual. Reutiliza los bloques de V1 (mismo contenido académico)
// y añade bloques gráficos: diagramas conceptuales, mapas mentales, gráficos
// matemáticos y diagramas de flujo. NO modifica el contenido oficial; solo cambia
// la forma de presentarlo.

import type { Bloque, Diapositiva } from "./tipos";

export type BloqueV2 =
  | Bloque
  // Diagrama de flujo (convierte ejemplos paso a paso en flujo visual).
  | { tipo: "flujo"; nodos: string[]; resultado?: string; orientacion?: "vertical" | "horizontal" }
  // Mapa conceptual / mental: nodo central + ramas.
  | { tipo: "mapaConceptual"; centro: string; ramas: { titulo: string; detalle?: string }[] }
  // Diagrama de árbol (clasificaciones, p. ej. tipos de expresiones).
  | { tipo: "diagramaArbol"; raiz: string; ramas: { titulo: string; ejemplo?: string }[] }
  // Gráficos matemáticos.
  | { tipo: "grafico"; clase: "areaCuadrado"; etiqueta: string; aLabel?: string; bLabel?: string }
  | { tipo: "grafico"; clase: "parabola"; etiqueta: string; labels: string[]; valores: number[] }
  | { tipo: "grafico"; clase: "pascal"; etiqueta: string; filas: string[][] }
  | { tipo: "grafico"; clase: "rectaNumerica"; etiqueta: string; marcas: string[]; resaltar?: string[] };

export type DiapositivaV2 = {
  etiqueta?: string;
  titulo: string;
  subtitulo?: string;
  bloques: BloqueV2[];
  layout?: "portada" | "contenido" | "cierre" | "divisor" | "transicion";
  /** Mensaje final de la diapositiva de cierre (sustituye al texto por defecto). */
  mensajeFinal?: string;
};

export type PresentacionV2 = {
  asignatura: string;
  clave: string;
  unidad: string;
  carrera: string;
  semestre: string;
  diapositivas: DiapositivaV2[];
  /** Tema/subtema específico (opcional). Solo informativo para el nombre de archivo. */
  tema?: string;
  /** Texto pequeño sobre el título de portada. Si se omite, se deriva de la unidad. */
  kicker?: string;
  /** Línea bajo el título de portada. Si se omite, se deriva del tema de la unidad. */
  subtituloPortada?: string;
  /** Nombre del .pptx a descargar. Si se omite, se deriva de clave + unidad. */
  nombreArchivo?: string;
};

export type { Diapositiva };
