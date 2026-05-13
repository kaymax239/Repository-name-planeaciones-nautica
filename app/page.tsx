"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const Mapa = dynamic(() => import("./Mapa"), {
  ssr: false,
});

export default function Home() {
  const [rutaSeleccionada, setRutaSeleccionada] = useState("");

  const rutas = [
    "Ruta Centro",
    "Ruta Norte",
    "Ruta Sur",
    "Ruta Playa",
  ];

  return (
    <main className="p-4">
      <h1 className="text-3xl font-bold mb-4">
        Aplicación rutas autobuses Tampico
      </h1>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">
          Selecciona una ruta:
        </h2>

        <div className="flex gap-2 flex-wrap">
          {rutas.map((ruta) => (
            <button
              key={ruta}
              onClick={() => setRutaSeleccionada(ruta)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
            >
              {ruta}
            </button>
          ))}
        </div>
      </div>

      {rutaSeleccionada && (
        <div className="mb-4 p-3 bg-green-600 text-white rounded">
          Ruta seleccionada: {rutaSeleccionada}
        </div>
      )}

      <Mapa />
    </main>
  );
}