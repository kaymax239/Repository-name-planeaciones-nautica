"use client";

// Sección INGLÉS — flujo paralelo al de PN/MN: Carrera → Nivel → Generar Word.
//
// La pantalla replica la experiencia del flujo principal de Planeaciones: el
// usuario elige un NIVEL (como elige un semestre en PN/MN) y luego captura los
// datos para generar la planeación de Inglés en Word (formato F-32).
//
// No expone detalles internos (corpus, índice, rutas, errores técnicos): toda
// la mecánica (biblioteca histórica + Gemini) ocurre en el servidor. Aquí solo
// se muestra una experiencia institucional para el usuario final.

import { useState } from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { construirDatosF32DesdeIngles } from "../lib/planeacionInglesF32.js";

type Props = {
  onVolver: () => void;
};

// Estilos alineados al diseño institucional actual (navy #071a33, dorado #c8a45d).
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/30";
const readOnlyClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm";
const labelClass =
  "mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#0b1f3a]";

// Niveles de Inglés (tarjetas equivalentes a los semestres de PN/MN).
const NIVELES = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

const MENSAJE_BIBLIOTECA_NO_DISPONIBLE =
  "La biblioteca académica de este nivel aún no está disponible.";
const MENSAJE_ERROR_GENERICO =
  "No se pudo generar la planeación en este momento. Inténtalo de nuevo.";

// Texto institucional de relleno del cuadro "Competencias disciplinares" en la
// plantilla F-32 (es texto ESTÁTICO, sin placeholder). Nunca debe aparecer en
// una planeación generada de Inglés: se reemplaza por las disciplinares reales
// o se deja vacío. Tolerante al acento ("integrará"/"integrara").
const RE_RUN_DISCIPLINARES_DEFECTO =
  /<w:t[^>]*>Estas competencias las integrar[^<]*<\/w:t>/;
const RE_DISCIPLINARES_RELLENO = /integrar[aá][^<]*?(docente|instructor)/i;

function escaparXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Extrae las competencias disciplinares REALES del JSON, descartando vacíos y el
// texto institucional de relleno.
function disciplinaresReales(planeacion: unknown): string[] {
  if (!planeacion || typeof planeacion !== "object") return [];
  const comp = (planeacion as { competencias?: unknown }).competencias;
  if (!comp || typeof comp !== "object") return [];
  const arr = (comp as { disciplinares?: unknown }).disciplinares;
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim())
    .filter((x) => x.length > 0 && !RE_DISCIPLINARES_RELLENO.test(x));
}

// Rellena el cuadro "Competencias disciplinares" del F-32 ya renderizado con las
// disciplinares históricas (una por línea) o lo deja VACÍO. El texto de relleno
// por defecto nunca permanece. Solo se aplica al Word de Inglés; no toca PN/MN
// ni la plantilla original.
function rellenarDisciplinaresDocx(
  zip: InstanceType<typeof PizZip>,
  disciplinares: string[],
): void {
  const ruta = "word/document.xml";
  const archivo = zip.file(ruta);
  if (!archivo) return;
  let xml = archivo.asText();
  if (!RE_RUN_DISCIPLINARES_DEFECTO.test(xml)) return;
  const reemplazo = disciplinares.length
    ? disciplinares
        .map((d) => `<w:t xml:space="preserve">${escaparXml(d)}</w:t>`)
        .join("<w:br/>")
    : "<w:t></w:t>";
  xml = xml.replace(RE_RUN_DISCIPLINARES_DEFECTO, reemplazo);
  zip.file(ruta, xml);
}

// Traduce cualquier código interno del servidor a un mensaje amable. El usuario
// nunca ve "sin_corpus", rutas ni detalles técnicos.
function mensajeAmigable(codigo?: string): string {
  switch (codigo) {
    case "sin_corpus":
    case "sin_historicas_nivel":
    case "sin_api_key":
      return MENSAJE_BIBLIOTECA_NO_DISPONIBLE;
    default:
      return MENSAJE_ERROR_GENERICO;
  }
}

export function SeccionIngles({ onVolver }: Props) {
  // Nivel elegido (null = pantalla de tarjetas de niveles).
  const [nivel, setNivel] = useState<string | null>(null);

  // Datos del formulario de generación.
  const [grupo, setGrupo] = useState("");
  const [semanas, setSemanas] = useState("");
  const [horasPorSemana, setHorasPorSemana] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // Estado de la generación.
  const [generando, setGenerando] = useState(false);
  const [mensaje, setMensaje] = useState<{
    tipo: "exito" | "error";
    texto: string;
  } | null>(null);

  const seleccionarNivel = (n: string) => {
    setNivel(n);
    setMensaje(null);
  };

  const regresarANiveles = () => {
    setNivel(null);
    setMensaje(null);
  };

  // Genera la planeación de Inglés y descarga el Word automáticamente. Toda la
  // lógica de IA/biblioteca vive en /api/planeacion-ingles (servidor). El usuario
  // nunca ve JSON ni errores técnicos.
  const generarWord = async () => {
    if (!nivel) return;
    setGenerando(true);
    setMensaje(null);
    try {
      const res = await fetch("/api/planeacion-ingles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nivel,
          grupo,
          semanas,
          horasPorSemana,
          observaciones,
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.planeacion) {
        setMensaje({ tipo: "error", texto: mensajeAmigable(data?.error) });
        return;
      }

      // Rellena la MISMA plantilla institucional F-32 (sin tocar PN/MN).
      const plantilla = await fetch("/templates/F-32.docx");
      if (!plantilla.ok) {
        setMensaje({ tipo: "error", texto: MENSAJE_ERROR_GENERICO });
        return;
      }
      const content = await plantilla.arrayBuffer();
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
      doc.render(
        construirDatosF32DesdeIngles(data.planeacion, {
          nivel,
          grupo,
          semanas,
          horasPorSemana,
        }),
      );
      // El cuadro de competencias disciplinares del F-32 es texto estático: se
      // sustituye por las disciplinares históricas reales (o se deja vacío).
      const zipFinal = doc.getZip();
      rellenarDisciplinaresDocx(zipFinal, disciplinaresReales(data.planeacion));
      const blob = zipFinal.generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const nombreArchivo = `F32_INGLES_NIVEL${nivel}.docx`;
      saveAs(blob, nombreArchivo);

      setMensaje({
        tipo: "exito",
        texto: `Planeación generada y descargada: ${nombreArchivo}`,
      });
    } catch {
      setMensaje({ tipo: "error", texto: MENSAJE_ERROR_GENERICO });
    } finally {
      setGenerando(false);
    }
  };

  // ── Pantalla 1: tarjetas de niveles (como los semestres en PN/MN) ──────────
  if (!nivel) {
    return (
      <div className="px-6 py-10 sm:px-10">
        <div className="rounded-3xl border border-dashed border-[#c8a45d] bg-[#fffaf0] p-6 text-center sm:p-8">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#071a33] text-xs font-black uppercase tracking-[0.18em] text-[#d7bd7a]">
            ENG
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c8a45d]">
            Inglés
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#071a33] sm:text-3xl">
            Selecciona un nivel
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Elige el nivel de Inglés para capturar los datos y generar la
            planeación en Word.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {NIVELES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => seleccionarNivel(n)}
                className="rounded-2xl border border-[#c8a45d]/40 bg-white px-5 py-6 text-lg font-black text-[#071a33] shadow-sm transition hover:-translate-y-0.5 hover:border-[#c8a45d] hover:bg-[#071a33] hover:text-white hover:shadow-xl"
              >
                Nivel {n}
                <span className="mt-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#c8a45d]">
                  Inglés
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onVolver}
            className="mt-8 rounded-2xl border border-[#071a33] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#071a33] transition hover:bg-[#071a33] hover:text-white"
          >
            Regresar al inicio
          </button>
        </div>
      </div>
    );
  }

  // ── Pantalla 2: generación de la planeación del nivel elegido ──────────────
  return (
    <div className="px-6 py-8 sm:px-10">
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={regresarANiveles}
              className="rounded-xl border border-[#071a33] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#071a33] transition hover:bg-[#071a33] hover:text-white"
            >
              Regresar a niveles
            </button>
            <button
              type="button"
              onClick={onVolver}
              className="rounded-xl border border-[#c8a45d] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#071a33] transition hover:bg-[#c8a45d]"
            >
              Regresar al inicio
            </button>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c8a45d]">
            Inglés
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#071a33]">
            Planeación de Inglés · Nivel {nivel}
          </h2>
        </div>
        <div className="hidden rounded-2xl bg-[#071a33] px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.16em] text-white sm:block">
          Nivel {nivel}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Formulario de datos */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c8a45d]">
            Datos de la planeación
          </p>
          <h3 className="mt-2 text-xl font-black text-[#071a33]">
            Captura los datos del grupo
          </h3>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <label>
              <span className={labelClass}>Nivel</span>
              <input className={readOnlyClass} value={`Nivel ${nivel}`} readOnly />
            </label>
            <label>
              <span className={labelClass}>Grupo</span>
              <input
                className={inputClass}
                placeholder="Ej. 101-A"
                value={grupo}
                onChange={(e) => setGrupo(e.target.value)}
              />
            </label>
            <label>
              <span className={labelClass}>Semanas</span>
              <input
                className={inputClass}
                type="number"
                min={1}
                placeholder="Ej. 18"
                value={semanas}
                onChange={(e) => setSemanas(e.target.value)}
              />
            </label>
            <label>
              <span className={labelClass}>Horas por semana</span>
              <input
                className={inputClass}
                type="number"
                min={1}
                placeholder="Ej. 3"
                value={horasPorSemana}
                onChange={(e) => setHorasPorSemana(e.target.value)}
              />
            </label>
            <label className="md:col-span-2">
              <span className={labelClass}>Observaciones (opcional)</span>
              <textarea
                className={`${inputClass} min-h-20 resize-y`}
                placeholder="Indicaciones adicionales para la planeación…"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* Panel de acción */}
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl bg-[#071a33] p-6 text-white shadow-xl shadow-slate-300/60">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d7bd7a]">
              Vista institucional
            </p>
            <h3 className="mt-3 text-2xl font-black leading-tight">
              Inglés · Nivel {nivel}
            </h3>
            <div className="mt-6 space-y-4 rounded-2xl border border-white/15 bg-white/10 p-5">
              <div className="flex justify-between gap-4 border-b border-white/10 pb-3 text-sm">
                <span className="text-slate-300">Grupo</span>
                <span className="font-bold">{grupo || "Por definir"}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/10 pb-3 text-sm">
                <span className="text-slate-300">Semanas</span>
                <span className="font-bold">{semanas || "Por definir"}</span>
              </div>
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-300">Horas por semana</span>
                <span className="font-bold">{horasPorSemana || "Por definir"}</span>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-300">
              La biblioteca académica de Inglés se utiliza automáticamente para
              generar la planeación del nivel seleccionado.
            </p>
          </div>

          <button
            type="button"
            onClick={generarWord}
            disabled={generando}
            className="rounded-2xl bg-[#c8a45d] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-[#071a33] shadow-lg shadow-[#c8a45d]/30 transition hover:bg-[#d7bd7a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generando ? "Generando planeación…" : "Generar planeación en Word"}
          </button>

          {generando && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              Generando la planeación… puede tardar hasta ~1 minuto. No cierres la
              página.
            </div>
          )}

          {mensaje && (
            <div
              role="alert"
              className={`rounded-2xl border px-5 py-4 text-sm font-semibold ${
                mensaje.tipo === "exito"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {mensaje.texto}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
