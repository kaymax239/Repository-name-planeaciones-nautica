"use client";

import Mapa from "./Mapa";

import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

import { useState } from "react";

export default function Home() {
  const [rutaSeleccionada, setRutaSeleccionada] = useState("");

  const guardarRuta = async (ruta: string) => {
    setRutaSeleccionada(ruta);

    await addDoc(collection(db, "reportes"), {
      ruta: ruta,
      fecha: new Date(),
      lat: 22.2553,
      lng: -97.8686,
    });

    alert("Reporte guardado en Firebase");
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Aplicación rutas autobuses Tampico
      </h1>

      {rutaSeleccionada && (
        <div className="mb-4 p-3 bg-green-600 text-white rounded">
          Ruta seleccionada: {rutaSeleccionada}
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={() => guardarRuta("Ruta Circuito Norte")}
          className="w-full bg-blue-600 text-white p-4 rounded mb-3"
        >
          Me subí a esta ruta: Ruta Circuito Norte
        </button>

        <button
          onClick={() => guardarRuta("Ruta Centro")}
          className="w-full bg-blue-600 text-white p-4 rounded mb-3"
        >
          Me subí a esta ruta: Ruta Centro
        </button>

        <button
          onClick={() => guardarRuta("Ruta Madero")}
          className="w-full bg-blue-600 text-white p-4 rounded mb-3"
        >
          Me subí a esta ruta: Ruta Madero
        </button>

        <button
          onClick={() => guardarRuta("Ruta Tampico")}
          className="w-full bg-blue-600 text-white p-4 rounded mb-3"
        >
          Me subí a esta ruta: Ruta Tampico
        </button>
      </div>

      <Mapa />
    </main>
  );
}