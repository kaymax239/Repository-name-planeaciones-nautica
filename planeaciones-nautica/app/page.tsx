"use client";

import { useState } from "react";
import { materiasPorSemestre } from "./data/materias";
import { contenidosMaterias } from "./data/contenidosMaterias";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

export default function Home() {
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [docente, setDocente] = useState("");
  const [tipo, setTipo] = useState("");
  const [grupo, setGrupo] = useState("");
  const [cadetes, setCadetes] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");

  const menu = materiasPorSemestre;

  const generarWord = async () => {
    try {
      const response = await fetch("/templates/F-32.docx");
      const content = await response.arrayBuffer();

      const zip = new PizZip(content);

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      const datosMateria: any =
  contenidosMaterias[materiaSeleccionada as keyof typeof contenidosMaterias];

      const semanas = (datosMateria?.semanas || []).map(
        (s: any) => ({
          semana: s.semana,
          tema: s.tema,
          secuencia:
            "Inicio: activación de conocimientos previos. Desarrollo: explicación docente, práctica guiada y ejercicios aplicados. Cierre: reflexión y retroalimentación.",
          recursos:
            "Computadora, presentación, material didáctico y recursos digitales.",
          producto:
            "Actividad, evidencia y participación.",
          evaluacion:
            "Lista de cotejo, participación y evaluación formativa.",
        })
      );

      doc.render({
        asignatura: materiaSeleccionada,
        escuela: "Tampico",

        objetivoGeneral:
          "Objetivo general generado automáticamente.",

        unidadBloques: [
          {
            unidad:
              datosMateria?.unidad || "I",

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
        tipo,
        cadetes,
        fechaInicio,

        fuentes:
          "Bibliografía y materiales de consulta.",
      });

      const blob = doc.getZip().generate({
        type: "blob",
      });

      saveAs(
        blob,
        `F32_${materiaSeleccionada || "Planeacion"}.docx`
      );
    } catch (error) {
      console.log(error);
      alert("Error generando F-32");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-80 bg-white border-r border-slate-300 p-4 overflow-y-auto">
          <h1 className="text-xl font-bold mb-4 text-blue-900">
            Programas de Estudio
          </h1>

          <div className="space-y-5">
            {Object.entries(menu).map(
              ([semestre, materias]) => (
                <div key={semestre}>
                  <h2 className="font-bold text-sm text-slate-700 mb-2">
                    {semestre}
                  </h2>

                  <div className="space-y-2">
                    {materias.map((materia) => (
                      <button
                        key={materia}
                        onClick={() =>
                          setMateriaSeleccionada(
                            materia
                          )
                        }
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                          materiaSeleccionada === materia
                            ? "bg-blue-800 text-white"
                            : "bg-blue-100 text-blue-900 hover:bg-blue-200"
                        }`}
                      >
                        {materia}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </aside>

        <section className="flex-1 p-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h1 className="text-2xl font-bold text-blue-900 mb-4">
              Planeación F-32
            </h1>

            {materiaSeleccionada ? (
              <>
                <p className="text-lg mb-4">
                  Materia seleccionada:
                  <span className="font-bold">
                    {" "}
                    {materiaSeleccionada}
                  </span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <input
                    className="border rounded-lg p-2 md:col-span-2"
                    placeholder="Nombre del docente"
                    value={docente}
                    onChange={(e) =>
                      setDocente(e.target.value)
                    }
                  />

                  <input
                    className="border rounded-lg p-2"
                    placeholder="Tipo"
                    value={tipo}
                    onChange={(e) =>
                      setTipo(e.target.value)
                    }
                  />

                  <input
                    className="border rounded-lg p-2"
                    placeholder="Grupo"
                    value={grupo}
                    onChange={(e) =>
                      setGrupo(e.target.value)
                    }
                  />

                  <input
                    className="border rounded-lg p-2"
                    placeholder="Número de cadetes"
                    value={cadetes}
                    onChange={(e) =>
                      setCadetes(e.target.value)
                    }
                  />

                  <input
                    className="border rounded-lg p-2"
                    placeholder="Fecha de inicio"
                    value={fechaInicio}
                    onChange={(e) =>
                      setFechaInicio(e.target.value)
                    }
                  />
                </div>

                <button
                  onClick={generarWord}
                  className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800"
                >
                  Generar planeación F-32
                </button>
              </>
            ) : (
              <p>Selecciona materia.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}