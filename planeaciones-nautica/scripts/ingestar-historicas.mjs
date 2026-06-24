// Fase 0 — Ingestión del corpus de planeaciones históricas (Julio–Dic 2025).
//
// Lee los .docx/.doc importados, elimina duplicados por contenido, extrae los
// campos PEDAGÓGICOS útiles (competencias, estrategias, técnicas, secuencia,
// productos, instrumentos), REDACTA datos personales y emite:
//   - app/data/planeaciones-historicas/manifest.json
//   - app/data/planeaciones-historicas/corpus/<slug>.json
//
// NO toca la app, ni generarWord, ni los programas oficiales, ni F-32.docx.
// Reproducible: volver a correrlo regenera el corpus de forma determinista.
//
// Uso:  node scripts/ingestar-historicas.mjs

import { promises as fs } from "fs";
import fsSync from "fs";
import { createHash } from "crypto";
import { execFileSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import PizZip from "pizzip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(__dirname, "..");

// Origen (importación ya extraída) y destino del corpus.
const ORIGEN = path.join(
  RAIZ,
  "importacines",
  "planeaciones-julio-dic-2025",
  "Planeaciones didácticas J-D_2025",
);
const DEST = path.join(RAIZ, "app", "data", "planeaciones-historicas");
const DEST_CORPUS = path.join(DEST, "corpus");
const CONTENIDOS = path.join(RAIZ, "app", "data", "contenidos");

// Carpetas "coordinador" que solo contienen COPIAS de otros docentes.
// Ante un duplicado, se prefiere la copia que NO está aquí (autor real).
const PENALIZAR = ["PEDRO ALANIS GALLARDO", "Nueva carpeta"];

/* --------------------------- utilidades de texto --------------------------- */

const sinAcentos = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "");

const decodeXml = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

/** Extrae texto preservando saltos de párrafo/fila y separadores de celda. */
function textoDeDocx(buf) {
  const zip = new PizZip(buf);
  const xml = zip.file("word/document.xml")?.asText() || "";
  const conSaltos = xml
    .replace(/<\/w:p>/g, "\n")
    .replace(/<\/w:tr>/g, "\n")
    .replace(/<\/w:tc>/g, " · ")
    .replace(/<[^>]+>/g, "");
  return decodeXml(conSaltos)
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** .doc heredado (OLE): se copia a una ruta temporal ASCII y se usa antiword
 * (antiword falla con rutas que llevan acentos o punto final de carpeta). */
function textoDeDoc(buf) {
  const tmp = path.join(
    RAIZ,
    `.tmp-historica-${createHash("sha1").update(buf).digest("hex").slice(0, 8)}.doc`,
  );
  try {
    fsSync.writeFileSync(tmp, buf);
    return execFileSync("antiword", [tmp], { maxBuffer: 20 * 1024 * 1024 })
      .toString("utf8")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  } catch {
    return "";
  } finally {
    try {
      fsSync.unlinkSync(tmp);
    } catch {}
  }
}

/* --------------------------- parser de campos --------------------------- */

const campo = (txt, etiqueta) => {
  const re = new RegExp(etiqueta + "[:\\s·]*([^\\n]+)", "i");
  // Busca sobre texto sin acentos pero recorta del ORIGINAL para conservarlos.
  const plano = sinAcentos(txt);
  const m = plano.match(re);
  if (!m) return "";
  const ini = m.index + m[0].length - m[1].length;
  return txt
    .slice(ini, ini + m[1].length)
    .replace(/^[\s·:]+/, "")
    .replace(/\s*·\s*$/, "")
    .trim();
};

/** Toma el bloque entre una etiqueta y la siguiente etiqueta conocida. */
function bloque(txt, etiquetas, idx) {
  const plano = sinAcentos(txt);
  const desde = plano.indexOf(sinAcentos(etiquetas[idx]));
  if (desde < 0) return "";
  let hasta = plano.length;
  for (let j = 0; j < etiquetas.length; j++) {
    if (j === idx) continue;
    const p = plano.indexOf(sinAcentos(etiquetas[j]), desde + 1);
    if (p > desde && p < hasta) hasta = p;
  }
  // Devuelve el texto ORIGINAL (con acentos) en ese rango.
  return txt
    .slice(desde, hasta)
    .replace(new RegExp("^" + etiquetas[idx].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "")
    .replace(/^[:\s·]+/, "")
    .trim();
}

const ETIQUETAS = [
  "COMPETENCIAS DISCIPLINARES",
  "COMPETENCIAS GENERICAS",
  "ESTRATEGIAS DE ENSENANZA",
  "TECNICAS DE ENSENANZA",
  "SECUENCIA DIDACTICA",
  "RECURSOS DIDACTICOS",
  "PRODUCTOS",
  "INSTRUMENTO DE EVALUACION",
];

// Fragmentos de ENCABEZADO de plantilla que no son contenido real.
const STOP = [
  "QUE SE FAVORECEN",
  "A UTILIZAR",
  "SESIONES",
  "CONTENIDO",
  "FACTICOS",
  "PROCEDIMENTALES",
  "ACTITUDINALES",
  "SECUENCIA DIDACTICA",
  "INICIO, DESARROLLO",
  "RECURSOS DIDACTICOS",
  "PRODUCTOS O DESEMPENOS",
  "O DESEMPENOS",
  "INSTRUMENTO DE EVALUACION",
  "COMPETENCIAS DISCIPLINARES",
  "COMPETENCIAS GENERICAS",
  "ESTRATEGIAS DE ENSENANZA",
  "TECNICAS DE ENSENANZA",
];

/** Trocea una lista por viñetas '*', '•' o saltos y descarta encabezados. */
const aLista = (s) =>
  (s || "")
    .split(/\s*[*•]\s*|\n+|\s{2,}·\s*/)
    .map((x) => x.replace(/^[-·:\s]+/, "").replace(/\s*·\s*$/, "").trim())
    .filter((x) => x.length > 3 && x.length < 240)
    .filter((x) => {
      const u = sinAcentos(x).toUpperCase();
      // Descarta solo encabezados de plantilla: ítem corto que empieza por uno,
      // o coincidencia al inicio. No filtra frases largas de contenido real.
      return !STOP.some((h) => u.startsWith(h) || (u.length < 40 && u.includes(h)));
    })
    .slice(0, 12);

/* --------------------------- redacción de PII --------------------------- */

function redactar(txt, docente) {
  let t = txt;
  if (docente) {
    const partes = docente.split(/\s+/).filter((p) => p.length > 2);
    for (const p of partes) {
      t = t.replace(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "[DOCENTE]");
    }
  }
  return t
    .replace(/NOMBRE DEL DOCENTE[^\n]*/gi, "NOMBRE DEL DOCENTE [REDACTADO]")
    .replace(/N[ÚU]MERO DE ESTUDIANTES[^\n]*/gi, "NÚMERO DE ESTUDIANTES [REDACTADO]")
    .replace(/\bGRUPO[:\s][^\n]*/gi, "GRUPO [REDACTADO]")
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, "[FECHA]")
    .replace(/ESCUELA N[ÁA]UTICA MERCANTE[^\n]*/gi, "ESCUELA NÁUTICA MERCANTE [REDACTADO]");
}

/* --------------------------- clasificación --------------------------- */

function detectarCarrera(txt, rel) {
  const u = sinAcentos(txt + " " + rel).toUpperCase();
  if (/MAQUINISTA|MECANICO NAVAL/.test(u)) return "MN";
  if (/PILOTO NAVAL/.test(u)) return "PN";
  // Sufijo concatenado del nombre: VAPN, IAMN, IBPN, VIIAPN…
  const m = u.match(/(?:[IVX0-9]|[AB])(PN|MN)\b/);
  if (m) return m[1];
  if (/\bMN\b/.test(u)) return "MN";
  if (/\bPN\b/.test(u)) return "PN";
  return "ND";
}

const ROMANO = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8 };

function detectarSemestre(txt, rel) {
  // 1) por GRUPO del encabezado: "GRUPO: V A PILOTO NAVAL" (tolera "|", "·").
  const g = sinAcentos(txt).match(/GRUPO[\s:|·]+([IVX]+)\b/i);
  if (g && ROMANO[g[1].toUpperCase()]) return ROMANO[g[1].toUpperCase()];
  // 2) por sufijo del nombre: VAPN, IIIBPN, 1APN, VIIAMN… (romanos largo→corto).
  const f = sinAcentos(rel)
    .toUpperCase()
    .match(/\b(VIII|VII|VI|V|IV|III|II|I|1)\s?[AB]?\s?(?:PN|MN)/);
  if (f) return f[1] === "1" ? 1 : ROMANO[f[1]] || 0;
  return 0;
}

function detectarArea(clave, materia) {
  const s = sinAcentos((clave + " " + materia)).toUpperCase();
  if (/NAV|CART|HIDR|METEO|MANIOBR|CARGA|ESTIBA|TEB|TEORIA DEL BUQUE|OMI|SIM|CONTMULT|CONTROL DE MULT|FAM|BUQUE TANQUE|BUQUE DE PASAJE/.test(s))
    return "nautica";
  if (/MOT|MEF|FLUIDOS|MMA|MAQ\.? MAR|ELECTRO|AUTO|LAB|TALLER|REFRIG|ESTAB|MOTOR/.test(s))
    return "maquinas";
  if (/ALG|FIS|DIN|GEO|DIBUJO|ELE|QUIM|TRANSPORTE MARIT|TEC\.? AVANZ|INCENDIO/.test(s))
    return "basica";
  if (/ETICA|LIDER|EXPRE|REDACC|ESTRATEGIAS DE APREND/.test(s)) return "humanidades";
  if (/PMR|PRACTICAS MARINER/.test(s)) return "practicas-marineras";
  if (/E\.?\s?F|EDUC.*FISICA|EDUCACION FISICA/.test(s)) return "educacion-fisica";
  return "otra";
}

/* --------------------------- recorrido y dedup --------------------------- */

async function listar(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await listar(p)));
    else if (/\.(docx|doc)$/i.test(e.name)) out.push(p);
  }
  return out;
}

const slugify = (s) =>
  sinAcentos(s)
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "doc";

async function main() {
  const archivos = await listar(ORIGEN);
  // Hash de contenido para deduplicar.
  const porHash = new Map();
  for (const abs of archivos) {
    const buf = await fs.readFile(abs);
    const h = createHash("sha1").update(buf).digest("hex");
    const rel = path.relative(ORIGEN, abs);
    const penal = PENALIZAR.some((p) => rel.includes(p)) ? 100 : 0;
    const score = penal + rel.split(path.sep).length; // menor = mejor
    const prev = porHash.get(h);
    if (!prev || score < prev.score) porHash.set(h, { abs, rel, buf, h, score });
  }

  const descartados = archivos.length - porHash.size;
  const contenidosTxt = (
    await Promise.all(
      (await fs.readdir(CONTENIDOS))
        .filter((f) => f.endsWith(".ts"))
        .map((f) => fs.readFile(path.join(CONTENIDOS, f), "utf8")),
    )
  ).join("\n");

  await fs.mkdir(DEST_CORPUS, { recursive: true });

  const manifest = [];
  let okDocx = 0,
    okDoc = 0,
    sinTexto = 0;

  for (const { abs, rel, buf, h } of porHash.values()) {
    const esDoc = /\.doc$/i.test(abs);
    const txt = esDoc ? textoDeDoc(buf) : textoDeDocx(buf);
    if (!txt) {
      sinTexto++;
      continue;
    }
    esDoc ? okDoc++ : okDocx++;

    const claveRaw = campo(txt, "CLAVE DE LA ASIGNATURA\\/?CURSO");
    const clave = (claveRaw.match(/[A-Z]{2,4}\s?\d{2,4}/i)?.[0] || claveRaw)
      .replace(/\s+/g, "")
      .toUpperCase();
    const materia =
      campo(txt, "ASIGNATURA\\/?\\s?CURSO").replace(/CLAVE.*/i, "").trim() ||
      "(sin identificar)";
    const docente = campo(txt, "NOMBRE DEL DOCENTE").replace(/\s*HORAS.*/i, "").trim();
    const carrera = detectarCarrera(txt, rel);
    const semestre = detectarSemestre(txt, rel);
    const area = detectarArea(clave, materia);
    const claveOficial = clave && contenidosTxt.includes(clave);

    // Se redacta ANTES de parsear: toda la pedagogía deriva del texto sin PII.
    const txtR = redactar(txt, docente);
    // Las competencias van en 2 columnas que se aplanan mezcladas → un solo campo.
    const competencias = aLista(
      bloque(txtR, ETIQUETAS, 0) + "\n" + bloque(txtR, ETIQUETAS, 1),
    );

    const corpus = {
      id: `${clave || slugify(materia)}_${h.slice(0, 8)}`,
      clave,
      materia,
      carrera,
      semestre,
      area,
      claveCoincideConProgramaOficial: claveOficial,
      origen: { archivo: rel, formato: esDoc ? "doc" : "docx", sha1: h },
      pedagogia: {
        competencias,
        estrategiasEnsenanza: aLista(bloque(txtR, ETIQUETAS, 2)),
        tecnicasEnsenanza: aLista(bloque(txtR, ETIQUETAS, 3)),
        secuenciaDidactica: bloque(txtR, ETIQUETAS, 4).slice(0, 2500),
        productosEvidencias: aLista(bloque(txtR, ETIQUETAS, 6)),
        instrumentosEvaluacion: aLista(bloque(txtR, ETIQUETAS, 7)),
      },
      textoReferenciaRedactado: txtR.slice(0, 9000),
    };

    const carreraDir = carrera === "MN" ? "LMN" : carrera === "PN" ? "LPN" : "ND";
    const sem = semestre ? String(semestre).padStart(2, "0") : "00";
    const nombre = `${carreraDir}_Sem${sem}_${clave || slugify(materia)}_${h.slice(0, 8)}.json`;
    await fs.writeFile(
      path.join(DEST_CORPUS, nombre),
      JSON.stringify(corpus, null, 2),
      "utf8",
    );

    manifest.push({
      id: corpus.id,
      clave,
      materia,
      carrera,
      semestre,
      area,
      docente: docente || "(no identificado)",
      archivoOrigen: rel,
      formato: corpus.origen.formato,
      corpus: `corpus/${nombre}`,
      claveCoincideConProgramaOficial: claveOficial,
    });
  }

  manifest.sort(
    (a, b) =>
      a.carrera.localeCompare(b.carrera) ||
      a.semestre - b.semestre ||
      a.clave.localeCompare(b.clave),
  );

  await fs.writeFile(
    path.join(DEST, "manifest.json"),
    JSON.stringify(
      {
        generado: "fase-0",
        periodo: "Julio-Diciembre 2025",
        totalOrigen: archivos.length,
        duplicadosDescartados: descartados,
        ignorados: "desktop.ini (no documentos)",
        totalCorpus: manifest.length,
        documentos: manifest,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log("=== INGESTIÓN FASE 0 ===");
  console.log("Archivos origen (doc+docx):", archivos.length);
  console.log("Duplicados descartados   :", descartados);
  console.log("Únicos procesados        :", porHash.size);
  console.log("  docx OK:", okDocx, "| doc OK:", okDoc, "| sin texto:", sinTexto);
  console.log("Entradas en corpus       :", manifest.length);
  console.log("Destino                  :", path.relative(RAIZ, DEST));
}

main().catch((e) => {
  console.error("ERROR ingestión:", e);
  process.exit(1);
});
