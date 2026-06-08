"use client";

import { useState } from "react";
import { materiasPorSemestre } from "./data/materias";
import { contenidosMaterias } from "./data/contenidosMaterias";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

type SemanaMateria = {
  semana: string;
  tema: string;
};

type DatosMateria = {
  unidad?: string;
  objetivoEspecifico?: string;
  estrategia?: string;
  semanas?: SemanaMateria[];
};

export default function Home() {
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [semestreSeleccionado, setSemestreSeleccionado] =
    useState("I SEMESTRE");

  const [docente, setDocente] = useState("");
  const [grupo, setGrupo] = useState("");
  const [cadetes, setCadetes] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");

  const periodo = "Julio-Diciembre 2026";
  const escuelaNautica =
    'Escuela Náutica Mercante de Tampico "Cap. de Altura Luis Gonzaga Priego González"';

  const horasPorSemana = "1";
  const horasTotales = "18";
  const horasTeoricas = "18";
  const horasIndependientes = "0";

  const menu = materiasPorSemestre;
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#c8a45d] focus:ring-2 focus:ring-[#c8a45d]/30";
  const readOnlyClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm";
  const labelClass =
    "mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#0b1f3a]";

  const generarWord = async () => {
    try {
      const response = await fetch("/templates/F-32.docx");
      const content = await response.arrayBuffer();

      const zip = new PizZip(content);

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      const datosMateria =
        contenidosMaterias[
          materiaSeleccionada as keyof typeof contenidosMaterias
        ] as DatosMateria | undefined;

      const semanas = (datosMateria?.semanas || []).map((s: SemanaMateria) => ({
        semana: s.semana,
        tema: s.tema,
        secuencia:
          "Inicio: activación de conocimientos previos. Desarrollo: explicación docente, práctica guiada y ejercicios aplicados. Cierre: reflexión y retroalimentación.",
        recursos:
          "Computadora, presentación, material didáctico y recursos digitales.",
        producto: "Actividad, evidencia y participación.",
        evaluacion: "Lista de cotejo, participación y evaluación formativa.",
      }));

      doc.render({
        asignatura: materiaSeleccionada,
        escuela:"Tampico",

        periodo,
        escuelaNautica,
        horasPorSemana,
        horasTotales,
        horasTeoricas,
        horasIndependientes,
        claveAsignatura: materiaSeleccionada,
horasPracticas: "0",
clave: materiaSeleccionada,
claveAsignaturaCurso: materiaSeleccionada,
horasSemana: horasPorSemana,
horasXSemana: horasPorSemana,

        objetivoGeneral:
          datosMateria?.objetivoEspecifico ||
          "Objetivo general de la asignatura.",

        unidadBloques: [
          {
            unidad: datosMateria?.unidad || "I",

            objetivoEspecifico:
              datosMateria?.objetivoEspecifico ||
              "Objetivo específico de la unidad.",

            estrategia:
              datosMateria?.estrategia ||
              "Aprendizaje guiado, explicación docente y actividades colaborativas.",

            semanas,
          },
        ],

        docente,
        grupo,
        grupoAsignatura: grupo,
        cadetes,
        fechaInicio,
        nombreDocente: docente,
numeroCadetes: cadetes,
fecha: fechaInicio,

        fuentes: "Bibliografía y materiales de consulta.",
      });

      const blob = doc.getZip().generate({
        type: "blob",
      });

      saveAs(blob, `F32_${materiaSeleccionada || "Planeacion"}.docx`);
    } catch (error) {
      console.log(error);
      alert("Error generando F-32");
    }
  };

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-900">
      <div className="flex min-h-screen flex-col xl:flex-row">
        <aside className="bg-[#071a33] text-white xl:w-88 xl:min-h-screen">
          <div className="sticky top-0 flex h-full flex-col gap-8 overflow-y-auto p-6">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/20">
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-[#c8a45d] bg-white/95 text-center text-[10px] font-black uppercase leading-tight text-[#071a33] shadow-lg">
                  Logo
                  <br />
                  UMPM
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d7bd7a]">
                    Sistema académico
                  </p>
                  <h1 className="mt-1 text-2xl font-black leading-tight">
                    Planeación F-32
                  </h1>
                </div>
              </div>

              <div className="space-y-2 border-t border-white/15 pt-5">
                <p className="text-sm font-bold text-white">
                  Universidad Marítima y Portuaria de México
                </p>
                <p className="text-sm text-slate-200">
                  Escuela Náutica Mercante de Tampico
                </p>
                <p className="text-xs leading-relaxed text-slate-300">
                  Cap. de Altura Luis Gonzaga Priego González
                </p>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#d7bd7a]">
                Semestres
              </p>
              <div className="grid grid-cols-2 gap-2">
              {Object.keys(menu).map((semestre) => (
                <button
                  key={semestre}
                  type="button"
                  onClick={() => {
                    setSemestreSeleccionado(semestre);
                    setMateriaSeleccionada("");
                  }}
                  className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                    semestreSeleccionado === semestre
                      ? "bg-[#c8a45d] text-[#071a33] shadow-lg shadow-[#c8a45d]/25"
                      : "bg-white/10 text-slate-100 hover:bg-white/20"
                  }`}
                >
                  {semestre}
                </button>
              ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#d7bd7a]">
                {semestreSeleccionado}
              </h2>

              <div className="space-y-2 pb-2">
                {menu[
                  semestreSeleccionado as keyof typeof menu
                ]?.map((materia) => (
                  <button
                    key={materia}
                    type="button"
                    onClick={() => setMateriaSeleccionada(materia)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      materiaSeleccionada === materia
                        ? "border-[#c8a45d] bg-white text-[#071a33] shadow-lg shadow-black/10"
                        : "border-white/10 bg-white/10 text-slate-100 hover:border-white/30 hover:bg-white/20"
                    }`}
                  >
                    {materia}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className="flex-1 p-4 sm:p-8">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-300/60">
            <header className="relative bg-[#071a33] px-6 py-8 text-white sm:px-10">
              <div className="absolute inset-x-0 top-0 h-2 bg-[#c8a45d]" />
              <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-[#d7bd7a]">
                    Universidad Marítima y Portuaria de México
                  </p>
                  <h1 className="max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
                    Portada institucional de planeación académica
                  </h1>
                  <div className="mt-6 h-1 w-28 rounded-full bg-[#c8a45d]" />
                </div>

                <div className="grid grid-cols-2 gap-4 sm:w-72">
                  <div className="flex aspect-square items-center justify-center rounded-3xl border-2 border-[#c8a45d] bg-white text-center text-xs font-black uppercase tracking-[0.18em] text-[#071a33] shadow-xl">
                    Escudo
                    <br />
                    institucional
                  </div>
                  <div className="flex aspect-square items-center justify-center rounded-3xl border-2 border-white/40 bg-white/10 text-center text-xs font-black uppercase tracking-[0.18em] text-white shadow-xl">
                    Logo
                    <br />
                    escuela
                  </div>
                </div>
              </div>
            </header>

            <div className="border-b border-slate-200 bg-[#f8fafc] px-6 py-5 sm:px-10">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c8a45d]">
                    Institución
                  </p>
                  <p className="mt-2 font-bold text-[#071a33]">
                    Universidad Marítima y Portuaria de México
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c8a45d]">
                    Plantel
                  </p>
                  <p className="mt-2 font-bold text-[#071a33]">
                    Escuela Náutica Mercante de Tampico
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c8a45d]">
                    Nombre oficial
                  </p>
                  <p className="mt-2 font-bold text-[#071a33]">
                    Cap. de Altura Luis Gonzaga Priego González
                  </p>
                </div>
              </div>
            </div>

            {materiaSeleccionada ? (
              <div className="grid gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c8a45d]">
                        Formato F-32
                      </p>
                      <h2 className="mt-2 text-2xl font-black text-[#071a33]">
                        Datos generales de la portada
                      </h2>
                    </div>
                    <div className="hidden rounded-2xl bg-[#071a33] px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.16em] text-white sm:block">
                      {semestreSeleccionado}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <label className="md:col-span-2">
                      <span className={labelClass}>Nombre del docente</span>
                      <input
                        className={inputClass}
                        placeholder="Nombre completo del docente"
                        value={docente}
                        onChange={(e) => setDocente(e.target.value)}
                      />
                    </label>

                    <label className="md:col-span-2">
                      <span className={labelClass}>Asignatura</span>
                      <input
                        className={readOnlyClass}
                        value={materiaSeleccionada}
                        readOnly
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
                      <span className={labelClass}>Número de cadetes</span>
                      <input
                        className={inputClass}
                        placeholder="Ej. 28"
                        value={cadetes}
                        onChange={(e) => setCadetes(e.target.value)}
                      />
                    </label>

                    <label>
                      <span className={labelClass}>Periodo escolar</span>
                      <input
                        className={readOnlyClass}
                        value={periodo}
                        readOnly
                      />
                    </label>

                    <label>
                      <span className={labelClass}>Fecha de inicio</span>
                      <input
                        className={inputClass}
                        placeholder="Fecha de inicio"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                      />
                    </label>

                    <label className="md:col-span-2">
                      <span className={labelClass}>Escuela</span>
                      <input
                        className={readOnlyClass}
                        value={escuelaNautica}
                        readOnly
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="rounded-3xl bg-[#071a33] p-6 text-white shadow-xl shadow-slate-300/60">
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d7bd7a]">
                      Vista institucional
                    </p>
                    <h3 className="mt-3 text-2xl font-black leading-tight">
                      {materiaSeleccionada}
                    </h3>
                    <div className="mt-6 space-y-4 rounded-2xl border border-white/15 bg-white/10 p-5">
                      <div className="flex justify-between gap-4 border-b border-white/10 pb-3 text-sm">
                        <span className="text-slate-300">Docente</span>
                        <span className="font-bold text-right">
                          {docente || "Por definir"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-white/10 pb-3 text-sm">
                        <span className="text-slate-300">Grupo</span>
                        <span className="font-bold">{grupo || "Por definir"}</span>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-white/10 pb-3 text-sm">
                        <span className="text-slate-300">Cadetes</span>
                        <span className="font-bold">
                          {cadetes || "Por definir"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-slate-300">Periodo</span>
                        <span className="font-bold">{periodo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className={readOnlyClass}
                      value={`Horas/semana: ${horasPorSemana}`}
                      readOnly
                    />

                    <input
                      className={readOnlyClass}
                      value={`Horas totales: ${horasTotales}`}
                      readOnly
                    />

                    <input
                      className={readOnlyClass}
                      value={`Horas teóricas: ${horasTeoricas}`}
                      readOnly
                    />

                    <input
                      className={readOnlyClass}
                      value={`Independientes: ${horasIndependientes}`}
                      readOnly
                    />
                  </div>

                  <button
                    type="button"
                    onClick={generarWord}
                    className="rounded-2xl bg-[#c8a45d] px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-[#071a33] shadow-lg shadow-[#c8a45d]/30 transition hover:bg-[#d7bd7a]"
                  >
                    Generar planeación F-32
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 py-10 sm:px-10">
                <div className="rounded-3xl border border-dashed border-[#c8a45d] bg-[#fffaf0] p-8 text-center">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#071a33] text-xs font-black uppercase tracking-[0.18em] text-[#d7bd7a]">
                    F-32
                  </div>
                  <h2 className="text-2xl font-black text-[#071a33]">
                    Selecciona una asignatura para iniciar
                  </h2>
                  <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                    Usa el panel lateral para elegir semestre y materia. Después
                    captura los datos de portada y genera la planeación en Word
                    con el formato F-32.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}