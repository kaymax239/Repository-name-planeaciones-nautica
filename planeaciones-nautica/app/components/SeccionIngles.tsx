"use client";

// Sección INGLÉS — flujo independiente del procesamiento masivo PN/MN.
//
// MVP (Opción A): UI completa y autónoma. NO toca el estado `carrera`, ni los
// flujos de F-32/F-51/exámenes/presentaciones, ni ningún endpoint. La subida de
// históricas y la biblioteca viven SOLO en memoria del navegador (sin backend,
// sin persistencia en repo). La generación con IA queda preparada como
// placeholder: se conectará a Gemini en una fase posterior dedicada.

import { useEffect, useState } from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { construirDatosF32DesdeIngles } from "../lib/planeacionInglesF32.js";

type ArchivoHistorico = {
  id: string;
  nombre: string;
  tamano: number;
  tipo: string;
};

// Resumen del corpus histórico oficial (carpeta del servidor). Coincide con la
// forma devuelta por /api/biblioteca-ingles (ResumenBibliotecaIngles).
type ResumenBiblioteca = {
  existe: boolean;
  ruta: string;
  totalArchivos: number;
  totalDocumentos: number;
  totalIndexados: number;
  porTipo: Record<string, number>;
  fechaIndice: string | null;
  indiceListo: boolean;
};

type Props = {
  onVolver: () => void;
};

// Estilos alineados al diseño institucional actual (navy #071a33, dorado #c8a45d).
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/30";
const labelClass =
  "mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#0b1f3a]";

const EXTENSIONES_ACEPTADAS = ".doc,.docx,.pdf,.txt";

function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SeccionIngles({ onVolver }: Props) {
  // Biblioteca de inglés: planeaciones históricas subidas (solo en sesión).
  const [historicas, setHistoricas] = useState<ArchivoHistorico[]>([]);

  // Biblioteca histórica OFICIAL (carpeta del servidor). Se carga al montar.
  const [biblioteca, setBiblioteca] = useState<ResumenBiblioteca | null>(null);
  const [cargandoBiblioteca, setCargandoBiblioteca] = useState(true);
  const [errorBiblioteca, setErrorBiblioteca] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    setCargandoBiblioteca(true);
    fetch("/api/biblioteca-ingles")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: ResumenBiblioteca) => {
        if (activo) setBiblioteca(data);
      })
      .catch((e: unknown) => {
        if (activo)
          setErrorBiblioteca(
            e instanceof Error ? e.message : "No se pudo leer la biblioteca.",
          );
      })
      .finally(() => {
        if (activo) setCargandoBiblioteca(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  // Datos del formulario de generación (flujo por nivel / espejeo).
  const [nivel, setNivel] = useState("");
  const [grupo, setGrupo] = useState("");
  const [semanas, setSemanas] = useState("");
  const [horasPorSemana, setHorasPorSemana] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // Estado de la generación con Gemini.
  const [generando, setGenerando] = useState(false);
  const [errorGenerar, setErrorGenerar] = useState<string | null>(null);
  const [resultado, setResultado] = useState<unknown>(null);
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null);
  const [referenciasUsadas, setReferenciasUsadas] = useState<
    { nombre: string; origen: string; nivel: string | null }[]
  >([]);

  const agregarArchivos = (lista: FileList | null) => {
    if (!lista || lista.length === 0) return;
    const nuevos: ArchivoHistorico[] = Array.from(lista).map((archivo, i) => ({
      // id estable dentro de la sesión sin depender de Date.now()/random.
      id: `${archivo.name}-${archivo.size}-${historicas.length + i}`,
      nombre: archivo.name,
      tamano: archivo.size,
      tipo: archivo.type || "desconocido",
    }));
    // Evita duplicados por nombre+tamaño.
    setHistoricas((prev) => {
      const claves = new Set(prev.map((a) => `${a.nombre}-${a.tamano}`));
      const filtrados = nuevos.filter(
        (a) => !claves.has(`${a.nombre}-${a.tamano}`),
      );
      return [...prev, ...filtrados];
    });
  };

  const quitarArchivo = (id: string) => {
    setHistoricas((prev) => prev.filter((a) => a.id !== id));
  };

  const generar = async () => {
    setErrorGenerar(null);
    if (!nivel.trim()) {
      setErrorGenerar("Selecciona el nivel.");
      return;
    }
    setGenerando(true);
    setResultado(null);
    setReferenciasUsadas([]);
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
      const data = await res.json();
      if (!res.ok) {
        // Mensaje claro de error (incluye código del backend si llega).
        const cod = data?.error ? ` [${data.error}]` : "";
        throw new Error(`${data?.mensaje ?? `HTTP ${res.status}`}${cod}`);
      }
      setResultado(data.planeacion ?? data);
      setReferenciasUsadas(data.referenciasUsadas ?? []);
    } catch (e) {
      setErrorGenerar(
        e instanceof Error ? e.message : "No se pudo generar la planeación.",
      );
    } finally {
      setGenerando(false);
    }
  };

  // Descarga la planeación generada en Word reutilizando EXACTAMENTE la misma
  // plantilla institucional F-32 y el mismo generador (Docxtemplater) que PN/MN.
  const descargarWord = async () => {
    setErrorDescarga(null);
    if (!resultado) return;
    try {
      const response = await fetch("/templates/F-32.docx");
      if (!response.ok) {
        throw new Error(
          `No se pudo cargar la plantilla F-32 (HTTP ${response.status}).`,
        );
      }
      const content = await response.arrayBuffer();
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
      doc.render(
        construirDatosF32DesdeIngles(resultado, {
          nivel,
          grupo,
          semanas,
          horasPorSemana,
        }),
      );
      const blob = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const nivelSeguro = nivel.replace(/[^a-zA-Z0-9]+/g, "") || "X";
      saveAs(blob, `F32_INGLES_NIVEL${nivelSeguro}.docx`);
    } catch (e) {
      setErrorDescarga(
        e instanceof Error ? e.message : "No se pudo generar el Word.",
      );
    }
  };

  return (
    <div className="px-6 py-8 sm:px-10">
      {/* Encabezado de la sección */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c8a45d]">
            Sección independiente
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#071a33]">Inglés</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Flujo separado del procesamiento de Piloto Naval y Máquinas Navales.
            Sube planeaciones históricas de inglés, consúltalas como biblioteca y
            úsalas como base para generar nuevas planeaciones.
          </p>
        </div>
        <button
          type="button"
          onClick={onVolver}
          className="shrink-0 rounded-2xl border border-[#071a33] px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#071a33] transition hover:bg-[#071a33] hover:text-white"
        >
          Regresar al inicio
        </button>
      </div>

      {/* Biblioteca histórica OFICIAL (corpus del servidor para la IA) */}
      <div className="mb-6 rounded-3xl border border-[#071a33]/15 bg-[#071a33] p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d7bd7a]">
              Biblioteca histórica
            </p>
            {cargandoBiblioteca ? (
              <p className="mt-2 text-lg font-bold text-slate-200">
                Leyendo biblioteca…
              </p>
            ) : errorBiblioteca ? (
              <p className="mt-2 text-lg font-bold text-red-300">
                No se pudo leer la biblioteca ({errorBiblioteca})
              </p>
            ) : biblioteca && biblioteca.existe ? (
              <p className="mt-2 text-2xl font-black">
                <span className="text-[#7fe3a4]">✓</span>{" "}
                {biblioteca.totalDocumentos} documentos encontrados
              </p>
            ) : (
              <p className="mt-2 text-lg font-bold text-amber-300">
                Carpeta no encontrada en este entorno
              </p>
            )}

            {biblioteca && biblioteca.existe && (
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                <span className="text-slate-200">
                  Documentos indexados:{" "}
                  <strong className="text-white">
                    {biblioteca.totalIndexados}/{biblioteca.totalDocumentos}
                  </strong>
                </span>
                <span className="text-slate-200">
                  Índice:{" "}
                  {biblioteca.indiceListo ? (
                    <strong className="text-[#7fe3a4]">listo</strong>
                  ) : (
                    <strong className="text-amber-300">no listo</strong>
                  )}
                </span>
              </div>
            )}

            <p className="mt-3 text-xs font-bold uppercase tracking-[0.24em] text-[#d7bd7a]">
              Ruta
            </p>
            <p className="mt-1 font-mono text-sm text-slate-200">
              {biblioteca?.ruta ?? "planeaciones historicas ingles"}
            </p>
          </div>

          {biblioteca && biblioteca.existe && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(biblioteca.porTipo)
                .sort((a, b) => b[1] - a[1])
                .map(([ext, n]) => (
                  <span
                    key={ext}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-slate-100"
                  >
                    {n} .{ext}
                  </span>
                ))}
            </div>
          )}
        </div>
        <p className="mt-4 border-t border-white/10 pt-3 text-xs text-slate-300">
          Este corpus será la base que la IA consulte antes de generar nuevas
          planeaciones de inglés (indexación pendiente para la siguiente fase).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Paso 1: Subir planeaciones históricas */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c8a45d]">
            Paso 1
          </p>
          <h3 className="mt-2 text-xl font-black text-[#071a33]">
            Subir planeaciones históricas
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Formatos aceptados: Word (.doc, .docx), PDF y texto (.txt). Los
            archivos se mantienen solo en esta sesión del navegador.
          </p>

          <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#c8a45d]/60 bg-[#fffaf0] px-6 py-10 text-center transition hover:border-[#c8a45d]">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#071a33] text-xs font-black uppercase tracking-[0.18em] text-[#d7bd7a]">
              ENG
            </span>
            <span className="mt-4 text-sm font-bold text-[#071a33]">
              Haz clic para seleccionar archivos
            </span>
            <span className="mt-1 text-xs text-slate-500">
              Puedes subir varios a la vez
            </span>
            <input
              type="file"
              multiple
              accept={EXTENSIONES_ACEPTADAS}
              className="hidden"
              onChange={(e) => {
                agregarArchivos(e.target.files);
                // Permite volver a subir el mismo archivo si se quitó.
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {/* Paso 2: Biblioteca de inglés */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c8a45d]">
                Paso 2
              </p>
              <h3 className="mt-2 text-xl font-black text-[#071a33]">
                Biblioteca de inglés
              </h3>
            </div>
            <span className="rounded-full bg-[#071a33] px-3 py-1 text-xs font-black text-white">
              {historicas.length}
            </span>
          </div>

          {historicas.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm font-semibold text-slate-500">
              Aún no hay planeaciones de inglés. Sube archivos en el Paso 1 para
              construir tu biblioteca.
            </div>
          ) : (
            <ul className="mt-5 space-y-2">
              {historicas.map((archivo) => (
                <li
                  key={archivo.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#071a33]">
                      {archivo.nombre}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatearTamano(archivo.tamano)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => quitarArchivo(archivo.id)}
                    className="shrink-0 rounded-xl border border-red-200 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-red-600 transition hover:bg-red-50"
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Paso 3: Generar nuevas planeaciones con Gemini (corpus histórico base) */}
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c8a45d]">
          Paso 3
        </p>
        <h3 className="mt-2 text-xl font-black text-[#071a33]">
          Generar por nivel usando planeaciones históricas
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Elige el nivel: la IA (Gemini) toma las planeaciones históricas de ese
          nivel y espeja sus temas, secuencia, actividades, evaluación y formato,
          con el enfoque iDiscover. No usa STCW ni temas manuales.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <label>
            <span className={labelClass}>Nivel</span>
            <input
              className={inputClass}
              placeholder="Ej. 3, 4, 5, 6, 7…"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
            />
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

        <button
          type="button"
          onClick={generar}
          disabled={generando}
          className="mt-5 w-full rounded-2xl bg-[#071a33] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white shadow-sm transition hover:bg-[#0b294f] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {generando
            ? "Generando con IA…"
            : "Generar por nivel usando planeaciones históricas"}
        </button>

        {generando && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            Generando con Gemini usando el corpus histórico… puede tardar hasta
            ~1 minuto. No cierres la página.
          </div>
        )}

        {errorGenerar && (
          <div
            role="alert"
            className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          >
            {errorGenerar}
          </div>
        )}

        {resultado != null && (
          <div className="mt-5">
            {referenciasUsadas.length > 0 && (
              <div className="mb-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <span className="font-bold">
                  Planeación generada espejando {referenciasUsadas.length}{" "}
                  referencia(s) histórica(s):
                </span>{" "}
                {referenciasUsadas
                  .map(
                    (r) =>
                      `${r.nombre}${r.nivel ? ` (nivel ${r.nivel})` : ""}`,
                  )
                  .join(" · ")}
              </div>
            )}
            <div className="mb-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={descargarWord}
                className="rounded-2xl bg-[#c8a45d] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#071a33] shadow-sm transition hover:bg-[#b8934d]"
              >
                Descargar Word (formato F-32)
              </button>
            </div>
            {errorDescarga && (
              <div
                role="alert"
                className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                {errorDescarga}
              </div>
            )}
            <PlaneacionFormateada planeacion={resultado} />
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Ver JSON estructurado
              </summary>
              <pre className="mt-2 max-h-96 overflow-auto rounded-2xl bg-[#0b1f3a] p-4 text-xs leading-relaxed text-slate-100">
                {JSON.stringify(resultado, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

// Vista legible de la planeación (best-effort: el JSON de la IA puede variar).
function PlaneacionFormateada({ planeacion }: { planeacion: unknown }) {
  if (!planeacion || typeof planeacion !== "object") return null;
  const p = planeacion as Record<string, unknown>;
  const texto = (v: unknown) => (typeof v === "string" ? v : "");
  const lista = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

  const secuencia = Array.isArray(p.secuenciaSemanal)
    ? (p.secuenciaSemanal as Record<string, unknown>[])
    : [];
  const evaluacion = Array.isArray(p.evaluacion)
    ? (p.evaluacion as Record<string, unknown>[])
    : [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h4 className="text-lg font-black text-[#071a33]">
        {texto(p.asignatura) || "Planeación de Inglés"}
        {texto(p.nivel) ? ` · Nivel ${texto(p.nivel)}` : ""}
      </h4>
      {texto(p.tema) && (
        <p className="mt-1 text-sm font-semibold text-slate-700">
          Tema: {texto(p.tema)}
        </p>
      )}
      {texto(p.enfoque) && (
        <p className="mt-1 text-xs text-slate-500">{texto(p.enfoque)}</p>
      )}
      {texto(p.objetivoGeneral) && (
        <p className="mt-3 text-sm text-slate-700">
          <span className="font-bold">Objetivo general: </span>
          {texto(p.objetivoGeneral)}
        </p>
      )}

      {lista(p.objetivosEspecificos).length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#c8a45d]">
            Objetivos específicos
          </p>
          <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
            {lista(p.objetivosEspecificos).map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </div>
      )}

      <BloqueCompetencias competencias={p.competencias} lista={lista} />

      {secuencia.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#c8a45d]">
            Secuencia semanal ({secuencia.length})
          </p>
          <ol className="mt-2 space-y-2">
            {secuencia.map((s, i) => (
              <li
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-3 text-sm"
              >
                <p className="font-bold text-[#071a33]">
                  Semana {String(s.semana ?? i + 1)}
                  {texto(s.contenido) ? `: ${texto(s.contenido)}` : ""}
                </p>
                {lista(s.actividades).length > 0 && (
                  <ul className="mt-1 list-disc pl-5 text-slate-700">
                    {lista(s.actividades).map((a, j) => (
                      <li key={j}>{a}</li>
                    ))}
                  </ul>
                )}
                {texto(s.evidencias) && (
                  <p className="mt-1 text-slate-600">
                    <span className="font-semibold">Evidencias: </span>
                    {texto(s.evidencias)}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {evaluacion.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#c8a45d]">
            Evaluación
          </p>
          <ul className="mt-1 space-y-1 text-sm text-slate-700">
            {evaluacion.map((e, i) => (
              <li key={i}>
                <span className="font-semibold">{texto(e.instrumento)}</span>
                {texto(e.ponderacion) ? ` — ${texto(e.ponderacion)}` : ""}
                {texto(e.descripcion) ? `: ${texto(e.descripcion)}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      {texto(p.observaciones) && (
        <p className="mt-3 text-sm text-slate-600">
          <span className="font-bold">Observaciones: </span>
          {texto(p.observaciones)}
        </p>
      )}
    </div>
  );
}

// Renderiza competencias en su forma nueva (categorizada: disciplinares +
// genéricas {instrumentales, interpersonales, sistémicas}) o la antigua (array).
function BloqueCompetencias({
  competencias,
  lista,
}: {
  competencias: unknown;
  lista: (v: unknown) => string[];
}) {
  if (Array.isArray(competencias)) {
    if (competencias.length === 0) return null;
    return (
      <div className="mt-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#c8a45d]">
          Competencias
        </p>
        <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
          {lista(competencias).map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>
    );
  }
  if (!competencias || typeof competencias !== "object") return null;
  const c = competencias as Record<string, unknown>;
  const gen = (c.genericas && typeof c.genericas === "object"
    ? c.genericas
    : {}) as Record<string, unknown>;

  const grupos: [string, string[]][] = [
    ["Disciplinares", lista(c.disciplinares)],
    ["Genéricas · Instrumentales", lista(gen.instrumentales)],
    ["Genéricas · Interpersonales", lista(gen.interpersonales)],
    ["Genéricas · Sistémicas", lista(gen.sistemicas)],
  ];
  if (grupos.every(([, arr]) => arr.length === 0)) return null;

  return (
    <div className="mt-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#c8a45d]">
        Competencias
      </p>
      {grupos
        .filter(([, arr]) => arr.length > 0)
        .map(([titulo, arr]) => (
          <div key={titulo} className="mt-2">
            <p className="text-xs font-semibold text-slate-500">{titulo}</p>
            <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
              {arr.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}
