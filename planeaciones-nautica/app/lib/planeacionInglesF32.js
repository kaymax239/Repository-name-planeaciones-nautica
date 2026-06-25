// Mapea la planeación de Inglés (JSON de /api/planeacion-ingles) a los datos que
// espera la MISMA plantilla institucional F-32 (public/templates/F-32.docx) que
// usan PN/MN. No define una plantilla nueva ni un generador nuevo: solo traduce
// el contenido de Inglés a los placeholders existentes de F-32.
//
// Plantilla JS (no TS) a propósito: así la importan sin duplicar tanto la UI
// (TS, allowJs) como el script de Node (.mjs). No toca el flujo PN/MN.
//
// Placeholders reales de F-32.docx:
//   {periodo}{asignatura}{clave}{cadetes}{docente}{grupo}{fuentes}
//   {#unidadBloques}{estrategia}{#semanas}{semana}{tema}{secuencia}{recursos}{producto}{/semanas}{/unidadBloques}
//   {fechaParcial1}{fechaParcial2}{pctConocimiento}{pctActividades}{pctParticipacion}

/** Une una lista de strings en viñetas separadas por salto de línea. */
function vinetas(lista) {
  if (!Array.isArray(lista)) return "";
  const items = lista.filter((x) => typeof x === "string" && x.trim());
  return items.map((x) => `• ${x.trim()}`).join("\n");
}

function texto(v) {
  return typeof v === "string" ? v : "";
}

/**
 * Bibliografía institucional del libro iDiscover para el nivel dado. Es el
 * patrón observado en las planeaciones históricas (Express Publishing).
 */
export function bibliografiaIDiscover(nivel) {
  const n = String(nivel || "").trim();
  return n
    ? `I Discover ${n} Student book & Workbook (2013), Evans, Dooley. Express Publishing.`
    : "I Discover Student book & Workbook (2013), Evans, Dooley. Express Publishing.";
}

/**
 * Construye el objeto de render para F-32.docx a partir de la planeación de
 * Inglés y unos metadatos de portada/evaluación.
 *
 * @param {object} planeacion  JSON devuelto por /api/planeacion-ingles
 * @param {object} [meta]      { nivel, grupo, docente, cadetes, periodo, clave,
 *                               fechaParcial1, fechaParcial2,
 *                               pctConocimiento, pctActividades, pctParticipacion }
 */
export function construirDatosF32DesdeIngles(planeacion, meta = {}) {
  const p = planeacion || {};
  const nivel = texto(meta.nivel) || texto(p.nivel);

  // Texto de evaluación por sesión: instrumentos de la rúbrica del JSON (mismos
  // para todas las semanas) o un texto estándar si no hay rúbrica.
  const instrumentos = Array.isArray(p.evaluacion)
    ? p.evaluacion.map((e) => texto(e && e.instrumento)).filter(Boolean)
    : [];
  const evaluacionSesion = instrumentos.length
    ? instrumentos.join("; ")
    : "Participación, evidencias y productos de la sesión.";

  const secuencia = Array.isArray(p.secuenciaSemanal) ? p.secuenciaSemanal : [];
  const semanas = secuencia.map((s, i) => ({
    semana: `Semana ${s && s.semana != null ? s.semana : i + 1}`,
    tema: texto(s && s.contenido),
    secuencia: vinetas(s && s.actividades),
    recursos: Array.isArray(s && s.recursos)
      ? s.recursos.filter((x) => typeof x === "string").join(", ")
      : "",
    // En F-32 "producto" es la evidencia de la sesión.
    producto: texto(s && s.evidencias),
    // Columna de evaluación por sesión (PN/MN también la llena).
    evaluacion: evaluacionSesion,
  }));

  // Bibliografía/fuentes: usa la del JSON salvo que esté vacía o sea el texto
  // genérico "No especificada…", en cuyo caso cae a la bibliografía iDiscover
  // del nivel. Nunca se muestra "No especificada".
  const bibJSON = Array.isArray(p.bibliografia)
    ? p.bibliografia.filter((x) => typeof x === "string" && x.trim())
    : [];
  const bibValida = bibJSON.filter((x) => !/no\s+especificad/i.test(x));
  const fuentes = bibValida.length
    ? bibValida.join("\n")
    : bibliografiaIDiscover(nivel);

  // Estrategia de la unidad: el enfoque iDiscover + objetivo general.
  const estrategiaPartes = [texto(p.enfoque), texto(p.objetivoGeneral)].filter(
    Boolean,
  );

  const asignatura =
    texto(p.asignatura) || (nivel ? `Inglés Nivel ${nivel}` : "Inglés");
  const clave = texto(meta.clave) || (nivel ? `INGLES-N${nivel}` : "INGLES");
  const grupo = texto(meta.grupo) || texto(p.grupo);
  const docente = texto(meta.docente);
  const cadetes = texto(meta.cadetes);
  const fechaInicio = texto(meta.fechaInicio);
  const objetivoGeneral = texto(p.objetivoGeneral);

  // Horas: para Inglés son teóricas. Total = semanas × horas/semana (si se dan).
  const hpw = Number(meta.horasPorSemana) || 0;
  const sem = Number(meta.semanas) || semanas.length || 0;
  const total = hpw && sem ? hpw * sem : 0;
  const hStr = (n) => (n ? String(n) : "");

  // Mismo conjunto de campos que pasa el flujo PN/MN (page.tsx -> doc.render),
  // para que la plantilla F-32 se rellene sin dejar placeholders en "undefined".
  return {
    escuela: texto(meta.escuela) || "Tampico",
    licenciatura: texto(meta.licenciatura) || "Inglés",
    periodo: texto(meta.periodo),
    escuelaNautica:
      texto(meta.escuelaNautica) ||
      'Escuela Náutica Mercante de Tampico "Cap. de Altura Luis Gonzaga Priego González"',

    asignatura,
    clave,
    claveAsignatura: clave,
    claveAsignaturaCurso: clave,

    horasTotales: hStr(total),
    horasTeoricas: hStr(total),
    horasPracticas: "0",
    horasIndependientes: "0",
    horasPorSemana: hStr(hpw),
    horasSemana: hStr(hpw),
    horasXSemana: hStr(hpw),

    objetivoGeneral,
    fuentes,
    unidadBloques: [
      {
        unidad: "I",
        objetivoEspecifico: objetivoGeneral,
        estrategia:
          estrategiaPartes.join("\n\n") ||
          "Enfoque iDiscover; aprendizaje activo y contextualizado del inglés.",
        semanas,
      },
    ],

    docente,
    nombreDocente: docente,
    grupo,
    grupoAsignatura: grupo,
    cadetes,
    numeroCadetes: cadetes,
    fechaInicio,
    fecha: fechaInicio,

    // Hoja de evaluación: opcional para Inglés (la rúbrica real va en el JSON).
    fechaParcial1: texto(meta.fechaParcial1),
    fechaParcial2: texto(meta.fechaParcial2),
    pctConocimiento: texto(meta.pctConocimiento),
    pctActividades: texto(meta.pctActividades),
    pctParticipacion: texto(meta.pctParticipacion),
  };
}
