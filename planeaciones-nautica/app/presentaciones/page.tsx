"use client";

import { useState } from "react";
import pptxgen from "pptxgenjs";
import { materiasPorSemestre } from "../data/materias";
import { contenidosMaterias } from "../data/contenidosMaterias";

type SemanaMateria = {
  semana: string;
  tema: string;
};

type DatosMateria = {
  unidad?: string;
  objetivoGeneral?: string;
  objetivoEspecifico?: string;
  estrategia?: string;
  fuentes?: string;
  semanas?: SemanaMateria[];
};

type DiapositivaIA = {
  tipo: string;
  titulo: string;
  contenido: string[];
  notas?: string;
};

type PresentacionIA = {
  titulo: string;
  subtitulo?: string;
  bibliografia?: Array<{
    titulo: string;
    url: string;
    descripcion?: string;
  }>;
  diapositivas: DiapositivaIA[];
};

const limpiarTema = (tema: string) => tema.trim().replace(/\.$/, "");

const nombreArchivoSeguro = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

const dividirTexto = (texto: string, maximo: number) => {
  const palabras = texto.split(/\s+/);
  const lineas: string[] = [];
  let linea = "";

  palabras.forEach((palabra) => {
    const siguiente = linea ? `${linea} ${palabra}` : palabra;
    if (siguiente.length > maximo) {
      lineas.push(linea);
      linea = palabra;
    } else {
      linea = siguiente;
    }
  });

  if (linea) {
    lineas.push(linea);
  }

  return lineas;
};

const formatearErrorOpenAI = (error: unknown) => {
  const errorData = error as {
    message?: unknown;
    status?: unknown;
    code?: unknown;
    type?: unknown;
  };
  const resumen =
    typeof error === "object" && error !== null
      ? [
          "OpenAI Error",
          `Status: ${errorData.status ?? "N/A"}`,
          `Code: ${errorData.code ?? "N/A"}`,
          `Type: ${errorData.type ?? "N/A"}`,
          `Message: ${errorData.message ?? "Error desconocido"}`,
          "",
          JSON.stringify(error, null, 2),
        ].join("\n")
      : JSON.stringify(error, null, 2);

  return resumen;
};

export default function PresentacionesPage() {
  const [semestreSeleccionado, setSemestreSeleccionado] = useState("");
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [unidadSeleccionada, setUnidadSeleccionada] = useState("");
  const [temaGenerando, setTemaGenerando] = useState("");

  const semestres = Object.keys(materiasPorSemestre);
  const materias = semestreSeleccionado
    ? materiasPorSemestre[semestreSeleccionado as keyof typeof materiasPorSemestre] || []
    : [];
  const datosMateria = materiaSeleccionada
    ? (contenidosMaterias[
        materiaSeleccionada as keyof typeof contenidosMaterias
      ] as DatosMateria | undefined)
    : undefined;
  const unidades = datosMateria
    ? [
        {
          id: datosMateria.unidad || "I",
          nombre: `Unidad ${datosMateria.unidad || "I"}`,
          temas: datosMateria.semanas || [],
        },
      ]
    : [];
  const unidadActual = unidades.find((unidad) => unidad.id === unidadSeleccionada);

  const seleccionarSemestre = (semestre: string) => {
    setSemestreSeleccionado(semestre);
    setMateriaSeleccionada("");
    setUnidadSeleccionada("");
  };

  const seleccionarMateria = (materia: string) => {
    setMateriaSeleccionada(materia);
    setUnidadSeleccionada("");
  };

  const generarPresentacion = async (tema: SemanaMateria) => {
    const temaLimpio = limpiarTema(tema.tema);

    try {
      setTemaGenerando(`${tema.semana}-${tema.tema}`);
      const objetivo =
        datosMateria?.objetivoEspecifico ||
        datosMateria?.objetivoGeneral ||
        `Comprender y aplicar ${temaLimpio} en la asignatura ${materiaSeleccionada}.`;
      const temasRelacionados =
        datosMateria?.semanas?.map(
          (semana) => `${semana.semana}: ${limpiarTema(semana.tema)}`,
        ) || [];

      const response = await fetch("/api/presentaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          semestre: semestreSeleccionado,
          materia: materiaSeleccionada,
          unidad: `Unidad ${datosMateria?.unidad || "I"}`,
          tema: temaLimpio,
          objetivo,
          temasRelacionados,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: unknown }
          | null;
        const error =
          data?.error || "No se pudo generar el contenido IA.";
        console.error("OPENAI ERROR:", error);
        alert(formatearErrorOpenAI(error));
        return;
      }

      const contenidoIA = (await response.json()) as PresentacionIA;
      const diapositivas = contenidoIA.diapositivas || [];

      if (diapositivas.length === 0) {
        alert("La IA no devolvió diapositivas para la presentación.");
        return;
      }

      const pptx = new pptxgen();
      pptx.layout = "LAYOUT_WIDE";
      pptx.author = "Planeaciones Nautica";
      pptx.subject = materiaSeleccionada;
      pptx.title = contenidoIA.titulo || `${materiaSeleccionada} - ${temaLimpio}`;
      pptx.company = "Universidad Maritima y Portuaria de Mexico";
      pptx.theme = {
        headFontFace: "Arial",
        bodyFontFace: "Arial",
      };

      const colores = {
        azul: "071A33",
        dorado: "C8A45D",
        blanco: "FFFFFF",
        gris: "F4F6F8",
        texto: "1F2937",
      };

      const agregarTitulo = (titulo: string, subtitulo?: string) => {
        const slide = pptx.addSlide();
        slide.background = { color: colores.blanco };
        slide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: 13.333,
          h: 0.28,
          fill: { color: colores.dorado },
          line: { color: colores.dorado },
        });
        slide.addText(titulo, {
          x: 0.6,
          y: 0.45,
          w: 12.1,
          h: 0.45,
          fontFace: "Arial",
          fontSize: 22,
          bold: true,
          color: colores.azul,
          margin: 0,
          fit: "shrink",
        });
        if (subtitulo) {
          slide.addText(subtitulo, {
            x: 0.6,
            y: 0.96,
            w: 12.1,
            h: 0.35,
            fontSize: 11,
            color: "64748B",
            margin: 0,
          });
        }

        return slide;
      };

      const agregarContenido = (diapositiva: DiapositivaIA, subtitulo?: string) => {
        const slide = agregarTitulo(diapositiva.titulo, subtitulo);
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.75,
          y: 1.45,
          w: 11.8,
          h: 4.8,
          rectRadius: 0.08,
          fill: { color: colores.gris },
          line: { color: "E2E8F0" },
        });
        slide.addText(
          diapositiva.contenido
            .flatMap((punto) => dividirTexto(`• ${punto}`, 115))
            .join("\n"),
          {
            x: 1.05,
            y: 1.75,
            w: 11.2,
            h: 4.15,
            fontSize: 17,
            color: colores.texto,
            fit: "shrink",
            valign: "middle",
          },
        );
      };

      const agregarPortada = () => {
        const portada = pptx.addSlide();
        portada.background = { color: colores.azul };
        portada.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: 13.333,
          h: 0.35,
          fill: { color: colores.dorado },
          line: { color: colores.dorado },
        });
        portada.addText("Universidad Maritima y Portuaria de Mexico", {
          x: 0.75,
          y: 0.85,
          w: 11.8,
          h: 0.35,
          fontSize: 16,
          bold: true,
          color: colores.dorado,
          margin: 0,
        });
        portada.addText("Escuela Nautica Mercante de Tampico", {
          x: 0.75,
          y: 1.25,
          w: 11.8,
          h: 0.3,
          fontSize: 13,
          color: colores.blanco,
          margin: 0,
        });
        portada.addText(contenidoIA.titulo || temaLimpio, {
          x: 0.75,
          y: 2.05,
          w: 11.8,
          h: 1.25,
          fontSize: 34,
          bold: true,
          color: colores.blanco,
          fit: "shrink",
          margin: 0,
        });
        portada.addText(
          contenidoIA.subtitulo || `${materiaSeleccionada} | ${semestreSeleccionado}`,
          {
            x: 0.75,
            y: 3.55,
            w: 11.8,
            h: 0.4,
            fontSize: 16,
            color: colores.dorado,
            margin: 0,
          },
        );
        portada.addText("Cap. de Altura Luis Gonzaga Priego Gonzalez", {
          x: 0.75,
          y: 6.55,
          w: 11.8,
          h: 0.25,
          fontSize: 11,
          color: "CBD5E1",
          margin: 0,
        });
      };

      diapositivas.forEach((diapositiva, index) => {
        if (index === 0 || diapositiva.tipo === "portada") {
          agregarPortada();
          return;
        }

        agregarContenido(diapositiva, `${materiaSeleccionada} | ${tema.semana}`);
      });

      await pptx.writeFile({
        fileName: `${nombreArchivoSeguro(materiaSeleccionada)}-${nombreArchivoSeguro(
          temaLimpio,
        )}.pptx`,
      });
    } catch (error) {
      console.error("OPENAI ERROR:", error);
      alert(formatearErrorOpenAI(error));
    } finally {
      setTemaGenerando("");
    }
  };

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-900">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] bg-[#071a33] p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d7bd7a]">
              Sistema academico UMPM
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Presentaciones
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">
              Selecciona semestre, materia, unidad y tema para generar una
              presentacion IA profesional de 10 a 15 diapositivas.
            </p>
          </div>
          <a
            href="/"
            className="rounded-2xl border border-[#c8a45d] px-5 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-[#d7bd7a] transition hover:bg-[#c8a45d] hover:text-[#071a33]"
          >
            Volver
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c8a45d]">
                1. Semestre
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {semestres.map((semestre) => (
                  <button
                    key={semestre}
                    type="button"
                    onClick={() => seleccionarSemestre(semestre)}
                    className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                      semestreSeleccionado === semestre
                        ? "bg-[#071a33] text-white"
                        : "bg-slate-100 text-[#071a33] hover:bg-slate-200"
                    }`}
                  >
                    {semestre.replace(" SEMESTRE", "")}
                  </button>
                ))}
              </div>
            </div>

            {semestreSeleccionado && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c8a45d]">
                  2. Materia
                </p>
                <div className="mt-4 space-y-2">
                  {materias.map((materia) => (
                    <button
                      key={materia}
                      type="button"
                      onClick={() => seleccionarMateria(materia)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
                        materiaSeleccionada === materia
                          ? "border-[#c8a45d] bg-[#fffaf0] text-[#071a33]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-[#c8a45d]"
                      }`}
                    >
                      {materia}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <section className="space-y-6">
            {!materiaSeleccionada ? (
              <div className="rounded-3xl border border-dashed border-[#c8a45d] bg-[#fffaf0] p-8 text-center">
                <h2 className="text-2xl font-black text-[#071a33]">
                  Selecciona una materia
                </h2>
                <p className="mt-3 text-sm text-slate-600">
                  Al elegir una materia se mostraran sus unidades y temas.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c8a45d]">
                    3. Unidades
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-[#071a33]">
                    {materiaSeleccionada}
                  </h2>
                  {!datosMateria ? (
                    <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
                      No hay contenidos registrados para esta materia.
                    </p>
                  ) : (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {unidades.map((unidad) => (
                        <button
                          key={unidad.id}
                          type="button"
                          onClick={() => setUnidadSeleccionada(unidad.id)}
                          className={`rounded-2xl border p-5 text-left transition ${
                            unidadSeleccionada === unidad.id
                              ? "border-[#c8a45d] bg-[#071a33] text-white"
                              : "border-slate-200 bg-white text-[#071a33] hover:border-[#c8a45d]"
                          }`}
                        >
                          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#c8a45d]">
                            Unidad
                          </span>
                          <span className="mt-2 block text-xl font-black">
                            {unidad.nombre}
                          </span>
                          <span className="mt-1 block text-sm opacity-80">
                            {unidad.temas.length} temas disponibles
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {unidadActual && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c8a45d]">
                      4. Temas
                    </p>
                    <h3 className="mt-2 text-xl font-black text-[#071a33]">
                      {unidadActual.nombre}
                    </h3>
                    <div className="mt-5 grid gap-3">
                      {unidadActual.temas.map((tema) => (
                        <button
                          key={`${tema.semana}-${tema.tema}`}
                          type="button"
                          onClick={() => generarPresentacion(tema)}
                          disabled={temaGenerando === `${tema.semana}-${tema.tema}`}
                          className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-[#c8a45d] hover:shadow-lg"
                        >
                          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#c8a45d]">
                            {tema.semana}
                          </span>
                          <span className="mt-1 block text-base font-bold text-[#071a33]">
                            {limpiarTema(tema.tema)}
                          </span>
                          <span className="mt-2 block text-sm text-slate-500">
                            {temaGenerando === `${tema.semana}-${tema.tema}`
                              ? "Generando contenido IA y PPTX..."
                              : "Clic para generar presentacion IA profesional."}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
