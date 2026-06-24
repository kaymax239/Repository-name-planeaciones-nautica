// Fase 3A+ — Comparación de CALIDAD pedagógica para NAV530 (Unidad 1).
//
// Reúne lado a lado las tres versiones para evaluar si el Modo Premium mejora
// realmente la calidad (no solo que el JSON sea válido):
//   (1) HISTÓRICA   — planeación real del docente (corpus Fase 0)
//   (2) ACTUAL      — texto determinista que genera HOY el botón (distribucion.ts)
//   (3) PREMIUM     — enriquecimiento de Gemini vía /api/planeacion-enriquecida
//
// El contenido oficial (tema/subtemas/objetivo) se extrae del programa oficial y
// es idéntico en las tres (no cambia). Solo se compara la PARTE PEDAGÓGICA.
//
// No toca generarWord ni F-32.docx. Uso:
//   npx next dev -p 3100   (en otra terminal, con .env.local si hay key)
//   node scripts/comparar-planeacion-premium.mjs

import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(__dirname, "..");
const BASE_URL = process.env.BASE_URL || "http://localhost:3100";
const MATERIA = "Navegación III";
const UNIDAD = 1;

/* ---------------- (0) Programa oficial: extracción del literal TS ---------------- */

function extraerPrograma(materia) {
  const txt = readFileSync(
    path.join(RAIZ, "app/data/contenidos/semestre5.ts"),
    "utf8",
  );
  const marca = `"${materia}":`;
  const i = txt.indexOf(marca);
  if (i < 0) throw new Error(`No se encontró ${materia} en semestre5.ts`);
  // brace-matching desde la primera "{" tras la marca
  let j = txt.indexOf("{", i);
  let depth = 0,
    fin = -1;
  for (let k = j; k < txt.length; k++) {
    if (txt[k] === "{") depth++;
    else if (txt[k] === "}") {
      depth--;
      if (depth === 0) {
        fin = k;
        break;
      }
    }
  }
  return JSON.parse(txt.slice(j, fin + 1)); // el literal es JSON-compatible
}

/* ---------------- (2) Determinista: puerto fiel de distribucion.ts ---------------- */

const ESTRATEGIA_DET =
  "Activación de conocimientos previos, exposición del docente, aprendizaje situado, resolución de ejercicios y análisis de casos, trabajo individual y colaborativo, elaboración de productos y prácticas supervisadas.";

function secuenciaDeterminista(unidad) {
  const foco =
    unidad.subtemas.length > 0
      ? unidad.subtemas
          .map((s) => s.replace(/^\d+(\.\d+)*\.?\s*/, "").replace(/\.\s*$/, ""))
          .join("; ")
      : unidad.tema;
  return {
    inicio: `El docente activa los conocimientos previos mediante preguntas detonadoras sobre "${unidad.tema}" y su relación con el ámbito marítimo; los cadetes comparten lo que conocen y se encuadra el propósito de la sesión.`,
    desarrollo: `El docente explica ${foco}, con exposición y ejemplos aplicados; los cadetes desarrollan ejercicios y actividades —individuales y en equipo— aplicando los contenidos, con acompañamiento y resolución de dudas.`,
    cierre: `Se socializan los resultados y, con base en una rúbrica o lista de cotejo, se proporciona retroalimentación identificando fortalezas y áreas de mejora; se registra la evidencia de aprendizaje de la sesión.`,
    estrategias: ESTRATEGIA_DET,
    tecnicas: "(no contemplado en el F-32 actual)",
    competencias: "(no contemplado en el F-32 actual)",
    instrumentos:
      "Criterios DEN globales (lista de cotejo y rúbrica); sin instrumento por sesión.",
  };
}

/* ---------------- (1) Histórica: del corpus Fase 0 ---------------- */

function historica() {
  const manifest = JSON.parse(
    readFileSync(
      path.join(RAIZ, "app/data/planeaciones-historicas/manifest.json"),
      "utf8",
    ),
  );
  const ent =
    manifest.documentos.find((d) => d.clave === "NAV530" && d.formato === "docx") ||
    manifest.documentos.find((d) => d.clave === "NAV530");
  if (!ent) return null;
  const c = JSON.parse(
    readFileSync(path.join(RAIZ, "app/data/planeaciones-historicas", ent.corpus), "utf8"),
  );
  return c.pedagogia;
}

/* ---------------- (3) Premium: endpoint Gemini ---------------- */

async function premium() {
  try {
    const res = await fetch(`${BASE_URL}/api/planeacion-enriquecida`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        carrera: "PN",
        materia: MATERIA,
        semestreDisplay: "V SEMESTRE",
        unidadNumero: UNIDAD,
      }),
    });
    const data = await res.json();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/* ---------------- Render ---------------- */

const trunc = (s, n = 280) => (s || "").toString().slice(0, n);
const lst = (a) => (Array.isArray(a) && a.length ? a.join(" · ") : "(vacío)");

async function main() {
  const prog = extraerPrograma(MATERIA);
  const u = prog.unidades.find((x) => x.numero === UNIDAD);
  console.log("================= COMPARACIÓN DE CALIDAD — NAV530 U1 =================");
  console.log(`OFICIAL (idéntico en las 3, NO cambia):`);
  console.log(`  Unidad ${u.numero}: ${u.tema}`);
  console.log(`  Objetivo: ${u.objetivoEspecifico}`);
  console.log(`  Subtemas: ${u.subtemas.map((s) => s.trim()).join(" | ")}`);
  console.log(`  Bibliografía oficial: ${prog.bibliografia.length} fuentes`);

  const det = secuenciaDeterminista(u);
  const his = historica() || {};
  const prem = await premium();

  const G = prem.ok ? prem.data.enriquecimiento : null;
  const gu = G?.unidades?.[0];
  const estado = !prem.ok
    ? `endpoint inaccesible (${prem.error})`
    : G
      ? prem.data.cacheado
        ? "GEMINI (cache)"
        : "GEMINI real"
      : `FALLBACK (${prem.data.motivo})`;

  const dim = (titulo, h, d, g) => {
    console.log("\n" + "─".repeat(70));
    console.log("▶ " + titulo);
    console.log("  (1) HISTÓRICA :", trunc(h));
    console.log("  (2) ACTUAL    :", trunc(d));
    console.log("  (3) PREMIUM   :", trunc(g));
  };

  console.log("\nEstado columna PREMIUM:", estado);

  dim("INICIO", his.secuenciaDidactica, det.inicio, gu?.secuencia?.inicio);
  dim("DESARROLLO", "(ver secuencia histórica)", det.desarrollo, gu?.secuencia?.desarrollo);
  dim("CIERRE", "(ver secuencia histórica)", det.cierre, gu?.secuencia?.cierre);
  dim("ESTRATEGIAS", lst(his.estrategiasEnsenanza), det.estrategias, lst(gu?.estrategiasEnsenanza));
  dim("TÉCNICAS", lst(his.tecnicasEnsenanza), det.tecnicas, lst(gu?.tecnicasEnsenanza));
  dim("COMPETENCIAS", lst(his.competencias), det.competencias,
      lst([...(G?.competenciasGenericas||[]), ...((gu?.competenciasDisciplinares)||[])]));
  dim("INSTRUMENTOS", lst(his.instrumentosEvaluacion), det.instrumentos,
      lst((gu?.instrumentosEvaluacion||[]).map(i=>`${i.nombre} (${i.tipo})`)));

  if (!G) {
    console.log(
      "\nℹ️  Columna PREMIUM pendiente: define GEMINI_API_KEY en .env.local y reinicia el server.",
    );
  } else {
    console.log("\n✅ Tres columnas listas para calificación académica 1–10.");
  }
}

main().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
});
