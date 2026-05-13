"use client";

import { useState } from "react";

import Mapa from "./Mapa";

import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function Home() {
  const [rutaSeleccionada, setRutaSeleccionada] = useState("");

  const guardarRuta = async (ruta: string) => {
    try {
      setRutaSeleccionada(ruta);

      await addDoc(collection(db, "autobuses"), {
        nombre: ruta,
        lat: 22.2553,
        lng: -97.8686,
        fecha: new Date(),
      });

      alert(`Reporte guardado en Firebase: ${ruta}`);
    } catch (error) {
      console.error(error);
      alert("Error guardando reporte");
    }
  };

  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center">
        🚍 Rutas de Autobuses Tampico
      </h1>

      {rutaSeleccionada && (
        <div className="mb-4 p-3 bg-green-600 text-white rounded text-center">
          Ruta seleccionada: {rutaSeleccionada}
        </div>
      )}

      <div className="space-y-3 mb-5">
        <button
          onClick={() => guardarRuta("Ruta Circuito Norte")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl text-lg"
        >
          Me subí a esta ruta: Ruta Circuito Norte
        </button>

        <button
          onClick={() => guardarRuta("Ruta Centro")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl text-lg"
        >
          Me subí a esta ruta: Ruta Centro
        </button>

        <button
          onClick={() => guardarRuta("Ruta Madero")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl text-lg"
        >
          Me subí a esta ruta: Ruta Madero
        </button>

        <button
          onClick={() => guardarRuta("Ruta Tampico")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl text-lg"
        >
          Me subí a esta ruta: Ruta Tampico
        </button>
      </div>

      <Mapa />
    </main>
  );
}