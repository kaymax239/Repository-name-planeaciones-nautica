// Tipos para presentaciones deterministas generadas desde el programa oficial.
// El temario (títulos/subtemas) proviene del PDF; ejemplos, fórmulas y ejercicios
// ilustran esos subtemas oficiales (no inventan temario nuevo).

export type Bloque =
  | { tipo: "bullets"; items: string[] }
  | { tipo: "formulas"; items: string[] }
  | { tipo: "formulaDestacada"; etiqueta?: string; formula: string }
  | { tipo: "tabla"; headers: string[]; filas: string[][] }
  | { tipo: "definicion"; titulo: string; texto: string }
  | { tipo: "pasos"; enunciado: string; pasos: string[]; resultado?: string }
  | { tipo: "ejercicioGuiado"; enunciado: string; pista?: string; items: string[] }
  | { tipo: "proceso"; etapas: string[] }
  | {
      tipo: "comparacion";
      izq: { titulo: string; items: string[] };
      der: { titulo: string; items: string[] };
    }
  | {
      tipo: "aplicacion";
      titulo: string;
      enunciado: string;
      pasos: string[];
      resultado?: string;
    }
  | { tipo: "nota"; texto: string }
  | { tipo: "ejemplo"; enunciado: string; pasos: string[] }
  | { tipo: "ejercicio"; items: string[] };

export type Diapositiva = {
  /** Etiqueta de sección, p. ej. "Subtema 1.1" o "Unidad 1". */
  etiqueta?: string;
  titulo: string;
  subtitulo?: string;
  bloques: Bloque[];
  /** Layout especial. Por defecto "contenido". */
  layout?: "portada" | "contenido" | "cierre" | "divisor";
};

export type Presentacion = {
  asignatura: string;
  clave: string;
  unidad: string;
  carrera: string;
  semestre: string;
  diapositivas: Diapositiva[];
};
