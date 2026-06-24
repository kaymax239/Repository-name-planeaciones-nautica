// Fase 3A — Prueba controlada del endpoint Premium con NAV530.
//
// NO modifica el flujo del botón ni F-32.docx. Solo ejercita el endpoint
// /api/planeacion-enriquecida de forma aislada y valida sus garantías.
//
// Requiere el servidor Next corriendo. Por defecto apunta a localhost:3100:
//   npx next dev -p 3100            (en otra terminal)
//   node scripts/probar-planeacion-premium.mjs
// O define BASE_URL=http://localhost:3000 si usas otro puerto.
//
// Con GEMINI_API_KEY en .env.local → prueba el enriquecimiento real (o cache).
// Sin la clave → valida la RUTA DE FALLBACK (enriquecimiento:null, sin romper).

import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(__dirname, "..");
const BASE_URL = process.env.BASE_URL || "http://localhost:3100";

const CASO = {
  carrera: "PN",
  materia: "Navegación III",
  semestreDisplay: "V SEMESTRE",
  unidadNumero: 1, // prueba controlada: una sola unidad
};

// Campos OFICIALES que el enriquecimiento NUNCA debe contener.
const PROHIBIDOS = [
  "tema",
  "temas",
  "subtema",
  "subtemas",
  "objetivo",
  "objetivoEspecifico",
  "objetivoGeneral",
  "bibliografia",
  "bibliografía",
];

function buscarClavesProhibidas(obj, ruta = "") {
  const hits = [];
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => hits.push(...buscarClavesProhibidas(v, `${ruta}[${i}]`)));
  } else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      if (PROHIBIDOS.includes(k)) hits.push(`${ruta}.${k}`);
      hits.push(...buscarClavesProhibidas(v, `${ruta}.${k}`));
    }
  }
  return hits;
}

const ok = (b) => (b ? "✅" : "❌");
const line = (n) => console.log("─".repeat(n));

/* ---------- 1) Vista previa de históricas (desde el manifest, sin red) ---------- */

function previewHistoricas() {
  const manifest = JSON.parse(
    readFileSync(
      path.join(RAIZ, "app/data/planeaciones-historicas/manifest.json"),
      "utf8",
    ),
  );
  const norm = (s) =>
    (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const docs = manifest.documentos.filter(
    (d) => norm(d.clave) === norm("NAV530"),
  );
  console.log("\n📚 Históricas que seleccionaría la cascada para NAV530 (clave-exacta):");
  docs.forEach((d) =>
    console.log(
      `   - ${d.clave} | ${d.carrera} sem${d.semestre} | ${d.materia} [${d.id}] (${d.formato})`,
    ),
  );
  if (!docs.length) console.log("   (ninguna)");
}

/* ---------- 2) Llamada al endpoint ---------- */

async function probarEndpoint() {
  console.log(`\n🌐 POST ${BASE_URL}/api/planeacion-enriquecida`);
  console.log("   body:", JSON.stringify(CASO));
  let res, data;
  try {
    res = await fetch(`${BASE_URL}/api/planeacion-enriquecida`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(CASO),
    });
    data = await res.json();
  } catch (e) {
    console.log(`\n❌ No se pudo contactar el endpoint: ${e.message}`);
    console.log("   ¿Está corriendo el servidor?  npx next dev -p 3100");
    process.exitCode = 1;
    return;
  }

  console.log(`   HTTP ${res.status}`);
  line(60);

  const enr = data.enriquecimiento;

  // Verdict de origen
  if (enr && data.cacheado) console.log("🟦 Origen: CACHE (no se llamó a Gemini)");
  else if (enr) console.log("🟩 Origen: GEMINI REAL");
  else console.log(`🟨 Origen: FALLBACK (enriquecimiento:null) — motivo: ${data.motivo}`);

  // Históricas usadas (solo si el endpoint llegó a seleccionarlas)
  if (data.historicasUsadas?.length) {
    console.log("\n📚 Históricas USADAS por el endpoint:");
    data.historicasUsadas.forEach((h) =>
      console.log(`   - ${h.clave} | ${h.materia} (${h.relacion})`),
    );
  }

  if (!enr) {
    console.log(
      "\nℹ️  Sin enriquecimiento: el botón actual generaría el F-32 determinista de SIEMPRE.",
    );
    console.log(
      data.motivo === "sin_api_key"
        ? "   → Configura GEMINI_API_KEY en .env.local para probar el enriquecimiento real."
        : "   → Revisa el motivo arriba.",
    );
    // La ruta de fallback es un resultado VÁLIDO de esta prueba.
    return;
  }

  /* ---------- 3) Validación del contenido enriquecido ---------- */
  const u = enr.unidades?.[0] ?? {};
  const checks = [
    ["competencias genéricas", Array.isArray(enr.competenciasGenericas) && enr.competenciasGenericas.length > 0],
    ["competencias disciplinares (U)", (u.competenciasDisciplinares || []).length > 0],
    ["estrategias de enseñanza (U)", (u.estrategiasEnsenanza || []).length > 0],
    ["técnicas de enseñanza (U)", (u.tecnicasEnsenanza || []).length > 0],
    ["inicio", !!u.secuencia?.inicio],
    ["desarrollo", !!u.secuencia?.desarrollo],
    ["cierre", !!u.secuencia?.cierre],
    ["productos/evidencias (U)", (u.productosEvidencias || []).length > 0],
    ["instrumentos de evaluación (U)", (u.instrumentosEvaluacion || []).length > 0],
  ];
  console.log("\n🧪 Campos pedagógicos presentes:");
  for (const [n, b] of checks) console.log(`   ${ok(b)} ${n}`);

  // Garantía: NO devuelve campos oficiales
  const prohibidos = buscarClavesProhibidas(enr, "enriquecimiento");
  console.log("\n🔒 Garantía (no toca lo oficial):");
  console.log(
    `   ${ok(prohibidos.length === 0)} el enriquecimiento NO contiene temas/subtemas/objetivos/bibliografía`,
  );
  if (prohibidos.length) console.log("   ⚠️ encontrados:", prohibidos);

  // Merge (lo devuelve el endpoint): lo oficial debe seguir intacto
  if (data.merge) {
    const m = data.merge;
    const mu = m.unidades?.find((x) => x.numero === CASO.unidadNumero);
    console.log("\n🔗 Merge (oficial ⊕ IA):");
    console.log(`   tema oficial U${CASO.unidadNumero}: "${mu?.tema}"`);
    console.log(`   subtemas oficiales: ${(mu?.subtemas || []).length}`);
    console.log(`   bibliografía oficial: ${(m.bibliografia || []).length} fuentes`);
    console.log(`   ${ok(m.enriquecido)} unidad enriquecida con pedagogía IA`);
    console.log(
      `   ${ok((m.unidadesDescartadas || []).length === 0)} sin unidades fantasma descartadas: ${JSON.stringify(m.unidadesDescartadas || [])}`,
    );
  }

  // Muestra ejemplo de secuencia
  if (u.secuencia) {
    console.log("\n📝 Secuencia generada (extracto):");
    console.log("   Inicio:    ", (u.secuencia.inicio || "").slice(0, 160));
    console.log("   Desarrollo:", (u.secuencia.desarrollo || "").slice(0, 160));
    console.log("   Cierre:    ", (u.secuencia.cierre || "").slice(0, 160));
  }
}

console.log("===== PRUEBA F-32 PREMIUM — NAV530 (Fase 3A) =====");
previewHistoricas();
await probarEndpoint();
console.log("\n===== FIN =====");
