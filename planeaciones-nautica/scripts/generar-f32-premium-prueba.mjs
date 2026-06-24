// Fase 3A — Generador de PRUEBA del F-32 Premium (NAV530) a archivo .docx.
//
// Artefacto de VERIFICACIÓN, no es el flujo del botón. Llama al endpoint
// /api/planeacion-enriquecida (Gemini real o cache), toma el `merge` (programa
// oficial ⊕ pedagogía IA) y rellena la plantilla public/templates/F-32.docx,
// dejando TODA la pedagogía de Gemini visible para revisión humana.
//
// Salida: planeaciones-nautica/salidas/F32_PREMIUM_NAV530_PRUEBA.docx (git-ignored).
//
// Uso: con el server dev corriendo (npx next dev -p 3100):
//   node scripts/generar-f32-premium-prueba.mjs
//
// Datos personales (docente/grupo/cadetes/fechas) son NEUTROS de prueba: este
// documento NO contiene datos reales de ningún docente.

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(__dirname, "..");
const BASE_URL = process.env.BASE_URL || "http://localhost:3100";

const CASO = {
  carrera: "PN",
  materia: "Navegación III",
  carreraDisplay: "PILOTO NAVAL",
  semestreDisplay: "V SEMESTRE",
  // sin unidadNumero => enriquece TODAS las unidades del programa
};

// Datos de cabecera del programa NAV530 (del programa oficial; no los devuelve el
// endpoint). Solo lectura, no se inventan temas/subtemas/objetivos.
const PROGRAMA = {
  objetivoGeneral:
    "Conocer y comprender los principios de las Derrota Loxodrómica y Ortodrómica, así como los componentes de un Radar convencional y APRA, además de su interacción con los aparatos que alimentan el Sistema (giroscópica, G.P.S., corredera, AIS, etc.) y los factores que afectan la detección así como el uso correcto del mismo, para desarrollar una navegación eficiente y segura.",
  horas: { semanas: 18, porSemana: 6, teoricas: 64, practicas: 44, independientes: 12, total: 120 },
};

// Valores NEUTROS de prueba (sin datos personales reales).
const CABECERA_PRUEBA = {
  escuela: "Tampico",
  escuelaNautica: "Escuela Náutica Mercante de Tampico",
  licenciatura: "Licenciatura de Piloto Naval",
  periodo: "PRUEBA — Enero/Junio",
  docente: "DOCENTE DE PRUEBA",
  nombreDocente: "DOCENTE DE PRUEBA",
  grupo: "PN-5",
  grupoAsignatura: "PN-5",
  cadetes: "—",
  numeroCadetes: "—",
  fecha: "—",
  fechaInicio: "—",
  fechaParcial1: "—",
  fechaParcial2: "—",
  pctConocimiento: "60",
  pctActividades: "30",
  pctParticipacion: "10",
};

const RECURSOS = "Computadora, presentación, cartas náuticas, tablas de navegación y recursos digitales.";
const EST_FALLBACK =
  "Activación de conocimientos previos, exposición del docente, resolución de ejercicios y análisis de casos, trabajo individual y colaborativo.";

const lista = (arr) => (arr || []).map((s) => `• ${s}`).join("\n");

function bloqueDeUnidad(u) {
  const ped = u.pedagogia;
  const objetivo = u.objetivoEspecifico || "—";
  if (!ped) {
    // Sin enriquecimiento IA (p. ej. unidad no solicitada): determinista mínimo.
    return {
      objetivoEspecifico: objetivo,
      estrategia: EST_FALLBACK,
      semanas: [
        {
          semana: `Unidad ${u.numero}`,
          tema: `${u.tema}\n${(u.subtemas || []).join("\n")}`,
          secuencia: "(Sin enriquecimiento IA en esta unidad.)",
          recursos: RECURSOS,
          producto: "Actividad y evidencia de la sesión.",
          evaluacion: "Diagnóstica / formativa / sumativa.",
        },
      ],
    };
  }
  const estrategia = [
    "COMPETENCIAS DISCIPLINARES (IA):",
    lista(ped.competenciasDisciplinares),
    "",
    "ESTRATEGIAS DE ENSEÑANZA (IA):",
    lista(ped.estrategiasEnsenanza),
    "",
    "TÉCNICAS DE ENSEÑANZA (IA):",
    lista(ped.tecnicasEnsenanza),
  ].join("\n");

  const sec = ped.secuencia || {};
  const secuencia = [
    `INICIO: ${sec.inicio || "—"}`,
    "",
    `DESARROLLO: ${sec.desarrollo || "—"}`,
    "",
    `CIERRE: ${sec.cierre || "—"}`,
  ].join("\n");

  const evaluacion = (ped.instrumentosEvaluacion || [])
    .map((i) => `• ${i.nombre} (${i.tipo})`)
    .join("\n");

  return {
    objetivoEspecifico: objetivo,
    estrategia,
    semanas: [
      {
        semana: `Unidad ${u.numero}`,
        tema: `${u.tema}\n${(u.subtemas || []).join("\n")}`,
        secuencia,
        recursos: RECURSOS,
        producto: lista(ped.productosEvidencias),
        evaluacion: evaluacion || "—",
      },
    ],
  };
}

async function main() {
  console.log("===== GENERAR F-32 PREMIUM (NAV530) — PRUEBA =====");
  console.log(`POST ${BASE_URL}/api/planeacion-enriquecida  (todas las unidades)`);

  const t0 = Date.now();
  const res = await fetch(`${BASE_URL}/api/planeacion-enriquecida`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(CASO),
  });
  const data = await res.json();
  const ms = Date.now() - t0;

  if (!data.merge) {
    console.log(`❌ El endpoint no devolvió merge. motivo: ${data.motivo}`);
    console.log("   ¿GEMINI_API_KEY en .env.local y server reiniciado?");
    process.exit(2);
  }
  const origen = data.cacheado ? "CACHE" : data.enriquecimiento ? "GEMINI REAL" : "FALLBACK";
  console.log(`HTTP ${res.status} | ${ms} ms | origen: ${origen}`);
  const m = data.merge;
  const nEnr = (m.unidades || []).filter((u) => u.pedagogia).length;
  console.log(`Unidades: ${(m.unidades || []).length} | enriquecidas con IA: ${nEnr}`);

  // Construir datos de render.
  const datosRender = {
    ...CABECERA_PRUEBA,
    asignatura: m.asignatura,
    clave: m.clave,
    claveAsignatura: m.clave,
    claveAsignaturaCurso: m.clave,
    horasTotales: String(PROGRAMA.horas.total),
    horasTeoricas: String(PROGRAMA.horas.teoricas),
    horasPracticas: String(PROGRAMA.horas.practicas),
    horasIndependientes: String(PROGRAMA.horas.independientes),
    horasPorSemana: String(PROGRAMA.horas.porSemana),
    horasSemana: String(PROGRAMA.horas.porSemana),
    horasXSemana: String(PROGRAMA.horas.porSemana),
    objetivoGeneral:
      PROGRAMA.objetivoGeneral +
      "\n\nCOMPETENCIAS GENÉRICAS (IA):\n" +
      lista(m.competenciasGenericas),
    fuentes: (m.bibliografia || []).join("\n") || "Pendiente de revisión.",
    unidadBloques: (m.unidades || []).map(bloqueDeUnidad),
  };

  // Render de la plantilla.
  const plantilla = readFileSync(path.join(RAIZ, "public/templates/F-32.docx"));
  const zip = new PizZip(plantilla);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
  doc.render(datosRender);
  const buf = doc.getZip().generate({ type: "nodebuffer" });

  const dirSalida = path.join(RAIZ, "salidas");
  mkdirSync(dirSalida, { recursive: true });
  const destino = path.join(dirSalida, "F32_PREMIUM_NAV530_PRUEBA.docx");
  writeFileSync(destino, buf);

  console.log(`\n✅ Word generado: ${destino}`);
  console.log(`   tamaño: ${(buf.length / 1024).toFixed(1)} KB`);
  console.log("===== FIN =====");
}

main().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});
