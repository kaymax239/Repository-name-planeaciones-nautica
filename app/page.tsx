"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const Mapa = dynamic(() => import("./Mapa"), {
  ssr: false,
});

export default function Home() {
  const [rutaSeleccionada, setRutaSeleccionada] = useState("");

  const rutas = [
    "Ruta Circuito Norte",
    "Ruta Centro",
    "Ruta Madero",
    "Ruta Tampico",
  ];

  function reportarSubida(ruta: string) {
    setRutaSeleccionada(ruta);
    alert(`Reportaste que subiste a: ${ruta}`);
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Aplicación rutas autobuses Tampico
      </h1>

      <Mapa />

      <div className="mt-4 grid gap-3">
        {rutas.map((ruta) => (
          <button
            key={ruta}
            onClick={() => reportarSubida(ruta)}
            className="bg-blue-600 text-white px-4 py-3 rounded-xl"
          >
            Me subí a esta ruta: {ruta}
          </button>
        ))}
      </div>

      {rutaSeleccionada && (
        <div className="mt-4 bg-green-600 text-white px-4 py-3 rounded-xl">
          Ruta seleccionada: {rutaSeleccionada}
        </div>
      )}
    </main>
  );
}