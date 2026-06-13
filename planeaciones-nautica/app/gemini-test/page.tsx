"use client";

import { useState } from "react";

export default function GeminiTestPage() {
  const [resultado, setResultado] = useState<unknown>(null);
  const [cargando, setCargando] = useState(false);

  const probarGemini = async () => {
    setCargando(true);
    setResultado(null);

    try {
      const response = await fetch("/api/test-gemini");
      const data = await response.json();
      setResultado(data);
    } catch (error) {
      setResultado({
        ok: false,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#eef2f7] px-4 py-8 text-slate-900 sm:px-8">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c8a45d]">
          Prueba Gemini API
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#071a33]">
          Verificación de conexión con Gemini
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Esta página llama a <code>/api/test-gemini</code>, que usa
          <code> GEMINI_API_KEY </code> desde el backend.
        </p>

        <button
          type="button"
          onClick={probarGemini}
          disabled={cargando}
          className="mt-6 rounded-2xl bg-[#071a33] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-lg transition hover:bg-[#0b2a52] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cargando ? "Probando Gemini..." : "Probar Gemini"}
        </button>

        <pre className="mt-6 max-h-[620px] overflow-auto rounded-2xl bg-slate-950 p-5 text-sm leading-6 text-slate-100">
          {resultado
            ? JSON.stringify(resultado, null, 2)
            : "Presiona el botón para ejecutar la prueba."}
        </pre>
      </section>
    </main>
  );
}
