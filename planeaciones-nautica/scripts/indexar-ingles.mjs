// Indexador del corpus histórico de Inglés.
//
// Lee (SOLO LECTURA) los .docx de la carpeta "planeaciones historicas ingles",
// extrae su texto con PizZip (un .docx es un zip; el texto vive en
// word/document.xml) y construye un índice JSON local. NO mueve, renombra ni
// modifica ningún documento original. Ignora .zip. No usa STCW. No toca PN/MN,
// presentaciones, F-32, F-51 ni exámenes. No llama a Gemini.
//
// Salida: .indice-ingles/indice.json (carpeta ignorada por git). Se regenera
// con: node scripts/indexar-ingles.mjs
//
// La extracción reutiliza el mismo enfoque probado de scripts/ingestar-historicas.mjs.

import { promises as fs } from "fs";
import { mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PizZip from "pizzip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(__dirname, "..");
const NOMBRE_BIBLIOTECA = "planeaciones historicas ingles";
const BIBLIOTECA = path.join(RAIZ, NOMBRE_BIBLIOTECA);
const DEST_DIR = path.join(RAIZ, ".indice-ingles");
const DEST_FILE = path.join(DEST_DIR, "indice.json");

const VERSION_INDICE = 1;

/* --------------------------- utilidades de texto --------------------------- */

const sinAcentos = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

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

/** Cuenta palabras de forma simple (tokens separados por espacios). */
function contarPalabras(texto) {
  const t = texto.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

/** Intenta inferir el nivel a partir del nombre del archivo (best-effort). */
function inferirNivel(nombre) {
  const base = sinAcentos(nombre).toLowerCase();
  const m = base.match(/(?:lvl|lv|level|nivel)\s*\.?\s*([1-9]\d?)/);
  return m ? m[1] : null;
}

/* ------------------------------- recorrido --------------------------------- */

async function listarDocx(dir, raiz, acc) {
  const entradas = await fs.readdir(dir, { withFileTypes: true });
  for (const entrada of entradas) {
    const abs = path.join(dir, entrada.name);
    if (entrada.isDirectory()) {
      await listarDocx(abs, raiz, acc);
      continue;
    }
    if (!entrada.isFile()) continue;
    const ext = path.extname(entrada.name).slice(1).toLowerCase();
    if (ext !== "docx") continue; // ignora .zip y cualquier otro formato
    acc.push(abs);
  }
}

async function main() {
  // Carpeta presente?
  try {
    const st = await fs.stat(BIBLIOTECA);
    if (!st.isDirectory()) throw new Error("no es carpeta");
  } catch {
    console.error(`✗ No se encontró la carpeta: ${BIBLIOTECA}`);
    process.exit(1);
  }

  const rutasDocx = [];
  await listarDocx(BIBLIOTECA, BIBLIOTECA, rutasDocx);
  rutasDocx.sort((a, b) => a.localeCompare(b));

  console.log(`Encontrados ${rutasDocx.length} .docx. Extrayendo texto…`);

  const documentos = [];
  let fallidos = 0;
  for (const abs of rutasDocx) {
    const rutaRelativa = path.relative(BIBLIOTECA, abs).split(path.sep).join("/");
    const nombre = path.basename(abs);
    const origen = path.basename(path.dirname(abs)); // docente / carpeta origen
    try {
      const buf = await fs.readFile(abs);
      const texto = textoDeDocx(buf);
      documentos.push({
        id: rutaRelativa,
        nombre,
        rutaRelativa,
        origen,
        nivel: inferirNivel(nombre),
        palabras: contarPalabras(texto),
        texto,
      });
      console.log(`  ✓ ${rutaRelativa} (${contarPalabras(texto)} palabras)`);
    } catch (e) {
      fallidos++;
      console.warn(`  ✗ ${rutaRelativa}: ${e instanceof Error ? e.message : e}`);
    }
  }

  const indice = {
    version: VERSION_INDICE,
    generadoEn: new Date().toISOString(),
    ruta: NOMBRE_BIBLIOTECA,
    totalDocumentos: documentos.length,
    documentos,
  };

  mkdirSync(DEST_DIR, { recursive: true });
  await fs.writeFile(DEST_FILE, JSON.stringify(indice, null, 2), "utf8");

  const palabrasTotales = documentos.reduce((s, d) => s + d.palabras, 0);
  console.log("");
  console.log(`Índice escrito: ${path.relative(RAIZ, DEST_FILE)}`);
  console.log(`  documentos indexados: ${documentos.length}`);
  console.log(`  fallidos: ${fallidos}`);
  console.log(`  palabras totales: ${palabrasTotales}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
