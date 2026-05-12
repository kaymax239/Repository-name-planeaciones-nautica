"use client";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import Mapa from "./Mapa";

export default function Home() {
  const [rutaSeleccionada, setRutaSeleccionada] = useState("");

  function reportarSubida(ruta: string) {
    setRutaSeleccionada(ruta);
  }

  function compartirUbicacion() {
    if (!navigator.geolocation) {
      alert("Tu celular no permite ubicación.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        await setDoc(doc(db, "pasajeros", "pasajero1"), {
          lat,
          lng,
          fecha: serverTimestamp(),
        });

        alert("Ubicación compartida correctamente.");
      },
      () => {
        alert("No se pudo obtener tu ubicación.");
      }
    );
  }

  return (
    <main className="min-h-screen bg-blue-900 text-white flex flex-col items-center p-4">
      <h1 className="text-5xl font-bold mb-4">
        RutaTampico 🚌
      </h1>

      <p className="text-xl mb-8 text-center">
        Ubica tu autobús en tiempo real
      </p>

      <Mapa />

      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        {["Circuito Norte", "Águila Madero", "Tampico Altamira"].map(
          (ruta) => (
            <div
              key={ruta}
              className="bg-white text-black p-4 rounded-2xl shadow-lg"
            >
              <h2 className="text-xl font-bold mb-2">{ruta}</h2>

              <button
                onClick={() => {
                  reportarSubida(ruta);
                  compartirUbicacion();
                }}
                className="bg-blue-700 text-white px-4 py-2 rounded-xl"
              >
                Me subí a esta ruta
              </button>
            </div>
          )
        )}
      </div>

      {rutaSeleccionada && (
        <div className="bg-green-600 text-white px-6 py-3 rounded-xl mt-6">
          Ruta seleccionada: {rutaSeleccionada}
        </div>
      )}
    </main>
  );
}