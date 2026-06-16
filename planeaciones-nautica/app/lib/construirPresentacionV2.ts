// Generador dinámico de presentaciones V2 (bajo demanda).
//
// Convierte un ProgramaOficial (temario verbatim del PDF FIDENA) en una
// PresentacionV2 lista para el renderer visual `generarPresentacionOficialV2`.
// NO inventa contenido académico (sin IA): solo estructura y presenta el
// temario, objetivo y bibliografía oficiales con el estilo náutico aprobado.
//
// Es UN solo generador para todas las materias/unidades/temas: no se crea un
// archivo .ts por presentación ni se genera ningún .pptx por adelantado.

import type { ProgramaOficial, UnidadOficial } from "../data/tipos";
import type { DiapositivaV2, PresentacionV2 } from "../data/presentaciones/tiposV2";

/** Valor centinela del dropdown "Unidad completa (todos los temas)". */
export const TEMA_UNIDAD_COMPLETA = "__unidad_completa__";

type Opciones = {
  programa: ProgramaOficial;
  carrera: string; // texto a mostrar, p. ej. "Licenciatura en Piloto Naval"
  semestre: string; // texto a mostrar, p. ej. "I Semestre"
  unidadNumero: number;
  /** Subtema seleccionado, o TEMA_UNIDAD_COMPLETA / undefined para la unidad entera. */
  tema?: string;
};

/** Separa la numeración inicial ("1.1 ...") del texto del subtema. */
function partirSubtema(subtema: string): { etiqueta?: string; texto: string } {
  const m = subtema.match(/^(\d+(?:\.\d+)*)\s+(.*)$/);
  return m ? { etiqueta: m[1], texto: m[2].trim() } : { texto: subtema.trim() };
}

function tieneTexto(v?: string): v is string {
  return !!v && v.trim().length > 0 && !/pendiente de revisi/i.test(v);
}

function trozos<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

/**
 * Construye la PresentacionV2 de una unidad (o de un tema específico de ella).
 * Devuelve null si la unidad no existe en el programa.
 */
export function construirPresentacionV2(opts: Opciones): PresentacionV2 | null {
  const { programa, carrera, semestre, unidadNumero, tema } = opts;
  const unidad = programa.unidades.find((u) => u.numero === unidadNumero);
  if (!unidad) return null;

  const completa = !tema || tema === TEMA_UNIDAD_COMPLETA;
  const asignatura = programa.nombre;
  const unidadLabel = `Unidad ${unidad.numero}: ${unidad.tema}`;

  const diapositivas: DiapositivaV2[] = completa
    ? slidesUnidad(programa, unidad)
    : slidesTema(programa, unidad, tema!);

  const sufijo = completa
    ? `U${unidad.numero}`
    : `U${unidad.numero}_${partirSubtema(tema!).etiqueta ?? "tema"}`;

  return {
    asignatura,
    clave: programa.clave,
    unidad: unidadLabel,
    carrera,
    semestre,
    tema: completa ? undefined : tema,
    subtituloPortada: completa ? unidad.tema : partirSubtema(tema!).texto,
    nombreArchivo: `Presentacion_${programa.clave}_${sufijo}_V2.pptx`,
    diapositivas,
  };
}

/* --------------------------- Bloques reutilizables ------------------------- */

function portada(unidad: UnidadOficial, subtitulo: string): DiapositivaV2 {
  return { layout: "portada", titulo: unidad.tema, subtitulo, bloques: [] };
}

function objetivo(programa: ProgramaOficial, unidad: UnidadOficial): DiapositivaV2 {
  const bloques: DiapositivaV2["bloques"] = [];
  if (tieneTexto(unidad.objetivoEspecifico))
    bloques.push({
      tipo: "definicion",
      titulo: "Objetivo específico (programa oficial)",
      texto: unidad.objetivoEspecifico,
    });
  if (tieneTexto(programa.objetivoGeneral))
    bloques.push({ tipo: "nota", texto: `Objetivo general: ${programa.objetivoGeneral}` });
  if (bloques.length === 0)
    bloques.push({
      tipo: "nota",
      texto: "Objetivo de la unidad conforme al programa oficial de la asignatura.",
    });
  return {
    etiqueta: "Propósito de la unidad",
    titulo: "¿Qué lograremos en esta unidad?",
    bloques,
  };
}

function bibliografia(programa: ProgramaOficial): DiapositivaV2 | null {
  const refs = programa.bibliografia.filter(tieneTexto);
  if (refs.length === 0) return null;
  return {
    etiqueta: "Fuentes de consulta",
    titulo: "Bibliografía oficial",
    bloques: [
      { tipo: "definicion", titulo: "Bibliografía básica", texto: refs[0] },
      ...(refs.length > 1
        ? [{ tipo: "bullets" as const, items: refs.slice(1, 6) }]
        : []),
      { tipo: "nota", texto: `Referencias del programa oficial (${programa.fuente}).` },
    ],
  };
}

/* ------------------------------- Unidad entera ----------------------------- */

function slidesUnidad(programa: ProgramaOficial, unidad: UnidadOficial): DiapositivaV2[] {
  const subtemas = unidad.subtemas.map(partirSubtema);
  const slides: DiapositivaV2[] = [
    portada(unidad, unidad.tema),
    objetivo(programa, unidad),
  ];

  // Mapa de la unidad (hasta 6 ramas para no saturar el diagrama).
  if (subtemas.length > 0)
    slides.push({
      etiqueta: "Agenda",
      titulo: `Mapa de la Unidad ${unidad.numero}`,
      bloques: [
        {
          tipo: "mapaConceptual",
          centro: `Unidad ${unidad.numero}\n${unidad.tema}`,
          ramas: subtemas.slice(0, 6).map((s) => ({
            titulo: s.texto,
            detalle: s.etiqueta,
          })),
        },
      ],
    });

  // Divisor de la unidad.
  slides.push({
    layout: "divisor",
    etiqueta: `Unidad ${unidad.numero}`,
    titulo: unidad.tema,
    subtitulo:
      subtemas.length > 0 ? `${subtemas.length} temas en esta unidad` : undefined,
    bloques: [],
  });

  // Temario en diapositivas de bullets (máx. 6 por slide).
  trozos(subtemas, 6).forEach((grupo, i, arr) => {
    slides.push({
      etiqueta: "Temario de la unidad",
      titulo: arr.length > 1 ? `Contenido (parte ${i + 1})` : "Contenido de la unidad",
      bloques: [
        {
          tipo: "bullets",
          items: grupo.map((s) => (s.etiqueta ? `${s.etiqueta}  ${s.texto}` : s.texto)),
        },
      ],
    });
  });

  slides.push(cierreUnidad(unidad));
  const bib = bibliografia(programa);
  if (bib) slides.push(bib);
  return slides;
}

function cierreUnidad(unidad: UnidadOficial): DiapositivaV2 {
  const primeros = unidad.subtemas.slice(0, 3).map((s) => partirSubtema(s).texto);
  return {
    layout: "cierre",
    etiqueta: "Cierre de la sesión",
    titulo: "Síntesis de la unidad",
    mensajeFinal: "¡Gracias por su atención!",
    bloques: [
      {
        tipo: "bullets",
        items:
          primeros.length > 0
            ? primeros
            : [`Repaso de los temas de la Unidad ${unidad.numero}.`],
      },
      {
        tipo: "nota",
        texto:
          "Para la próxima sesión: repasar los temas vistos y resolver los ejercicios propuestos.",
      },
    ],
  };
}

/* ------------------------------- Tema específico --------------------------- */

function slidesTema(
  programa: ProgramaOficial,
  unidad: UnidadOficial,
  tema: string,
): DiapositivaV2[] {
  const { etiqueta, texto } = partirSubtema(tema);
  const etq = etiqueta ? `Tema ${etiqueta}` : "Tema";

  const slides: DiapositivaV2[] = [
    portada(unidad, texto),
    objetivo(programa, unidad),
    {
      layout: "divisor",
      etiqueta: etq,
      titulo: texto,
      subtitulo: `Unidad ${unidad.numero} · ${unidad.tema}`,
      bloques: [],
    },
    {
      etiqueta: etq,
      titulo: texto,
      bloques: [
        {
          tipo: "definicion",
          titulo: "Enfoque del tema",
          texto: tieneTexto(unidad.objetivoEspecifico)
            ? unidad.objetivoEspecifico
            : `Desarrollo del tema "${texto}" dentro de la Unidad ${unidad.numero}.`,
        },
        {
          tipo: "nota",
          texto:
            "Desarrolla este subtema con el apoyo del docente y el material oficial de la asignatura.",
        },
      ],
    },
    {
      layout: "cierre",
      etiqueta: "Cierre de la sesión",
      titulo: "Lo esencial que te llevas",
      mensajeFinal: "¡Gracias por su atención!",
      bloques: [
        { tipo: "bullets", items: [texto] },
        {
          tipo: "nota",
          texto: "Para la próxima sesión: repasar este tema y resolver los ejercicios propuestos.",
        },
      ],
    },
  ];

  const bib = bibliografia(programa);
  if (bib) slides.push(bib);
  return slides;
}
