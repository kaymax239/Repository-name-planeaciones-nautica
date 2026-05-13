"use client";

import { useState } from "react";
import Mapa from "./Mapa";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function Home() {
  const [rutaSeleccionada, setRutaSeleccionada] = useState("");

  const guardarRuta = async (ruta: string) => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          await addDoc(collection(db, "autobuses"), {
            nombre: ruta,
            lat: lat,
            lng: lng,
            fecha: new Date(),
          });

          setRutaSeleccionada(ruta);

          alert(`Reporte guardado con tu ubicación: ${ruta}`);
        } catch (error) {
          console.error(error);
          alert("Error guardando en Firebase");
        }
      },
      (error) => {
        console.error(error);
        alert("No diste permiso de ubicación");
      }
    );
  };

  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center">
        🚍 Rutas de Autobuses Tampico
      </h1>

      <Mapa />

      <div className="space-y-3 mt-5">
        <button
          onClick={() => guardarRuta("Ruta Circuito Norte")}
          className="w-full bg-blue-600 text-white p-4 rounded-xl text-lg"
        >
          Me subí a esta ruta: Ruta Circuito Norte
        </button>

        <button
          onClick={() => guardarRuta("Ruta Centro")}
          className="w-full bg-blue-600 text-white p-4 rounded-xl text-lg"
        >
          Me subí a esta ruta: Ruta Centro
        </button>

        <button
          onClick={() => guardarRuta("Ruta Madero")}
          className="w-full bg-blue-600 text-white p-4 rounded-xl text-lg"
        >
          Me subí a esta ruta: Ruta Madero
        </button>

        <button
          onClick={() => guardarRuta("Ruta Tampico")}
          className="w-full bg-blue-600 text-white p-4 rounded-xl text-lg"
        >
          Me subí a esta ruta: Ruta Tampico
        </button>
      </div>

      {rutaSeleccionada && (
        <div className="mt-4 p-3 bg-green-600 text-white rounded text-center">
          Ruta seleccionada: {rutaSeleccionada}
        </div>
      )}
    </main>
  );
}