// Prueba E2E — Planeación de Inglés (Nivel 3) a .docx con la MISMA plantilla
// institucional F-32 y el MISMO generador (Docxtemplater) que usan PN/MN.
//
// Flujo: nivel -> /api/planeacion-ingles (Gemini, corpus histórico del nivel) ->
// JSON -> construirDatosF32DesdeIngles -> public/templates/F-32.docx -> .docx.
//
// Salida: planeaciones-nautica/salidas/F32_INGLES_NIVEL3_PRUEBA.docx (git-ignored).
//
// Uso: con el server corriendo (npx next start -p 3140 o next dev):
//   BASE_URL=http://localhost:3140 node scripts/generar-planeacion-ingles-docx.mjs
//
// No toca PN/MN, presentaciones, exámenes ni F-32 existente. No define plantilla
// nueva: reutiliza public/templates/F-32.docx tal cual.

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { construirDatosF32DesdeIngles } from "../app/lib/planeacionInglesF32.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(__dirname, "..");
const BASE_URL = process.env.BASE_URL || "http://localhost:3140";

// Datos NEUTROS de prueba (no son datos reales de ningún docente).
const PETICION = {
  nivel: "3",
  grupo: "II A PN",
  semanas: 18,
  horasPorSemana: 4,
  observaciones:
    "Generar una planeación institucional espejeando las históricas de nivel 3. Mantener estructura, secuencia, actividades, evaluación y estilo de las planeaciones previas. Usar iDiscover como base conceptual. No usar STCW.",
};

async function obtenerPlaneacion() {
  // Modo offline: si INGLES_JSON apunta a un archivo, reutiliza ese JSON ya
  // generado (no llama a Gemini). El JSON puede ser la respuesta completa del
  // endpoint ({planeacion,...}) o directamente el objeto planeación.
  if (process.env.INGLES_JSON) {
    const ruta = process.env.INGLES_JSON;
    console.log(`Leyendo planeación desde archivo (sin Gemini): ${ruta}`);
    const data = JSON.parse(readFileSync(ruta, "utf8"));
    return {
      planeacion: data.planeacion || data,
      modelo: data.modelo || "(archivo)",
      referenciasUsadas: data.referenciasUsadas || [],
    };
  }

  console.log(`POST ${BASE_URL}/api/planeacion-ingles (nivel ${PETICION.nivel})…`);
  const res = await fetch(`${BASE_URL}/api/planeacion-ingles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(PETICION),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("✗ Error del endpoint:", data.error, "-", data.mensaje);
    if (data.respuestaOriginal) {
      console.error("\n=== respuestaOriginal ===\n", data.respuestaOriginal);
    }
    process.exit(1);
  }
  return data;
}

async function main() {
  const data = await obtenerPlaneacion();
  const planeacion = data.planeacion;
  console.log("✓ Planeación lista. Modelo:", data.modelo);
  console.log(
    "  referencias:",
    (data.referenciasUsadas || []).map((r) => r.nombre).join(" | ") || "(n/d)",
  );

  // Mismo generador que PN/MN: plantilla F-32 + Docxtemplater.
  const plantilla = readFileSync(
    path.join(RAIZ, "public/templates/F-32.docx"),
  );
  const zip = new PizZip(plantilla);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render(
    construirDatosF32DesdeIngles(planeacion, {
      nivel: PETICION.nivel,
      grupo: PETICION.grupo,
      semanas: PETICION.semanas,
      horasPorSemana: PETICION.horasPorSemana,
      docente: "Docente de prueba",
      cadetes: "28",
      periodo: "Julio-Diciembre 2026",
    }),
  );

  const buf = doc.getZip().generate({ type: "nodebuffer" });
  const destDir = path.join(RAIZ, "salidas");
  mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, "F32_INGLES_NIVEL3_PRUEBA.docx");
  writeFileSync(dest, buf);

  console.log(`\n✓ Archivo escrito: ${path.relative(RAIZ, dest)} (${buf.length} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
