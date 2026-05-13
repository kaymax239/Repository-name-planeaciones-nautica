"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const Mapa = dynamic(() => import("./Mapa"), {
  ssr: false,
});

export default function Home() {
  const [rutaSeleccionada, setRutaSeleccionada] = useState("");

  function reportarSubida(ruta: string) {
    setRutaSeleccionada(ruta);

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      await setDoc(doc(db, "reportes", Date.now().toString()), {
        ruta,
        lat,
        lng,
        fecha: serverTimestamp(),
      });

      alert("Reporte enviado correctamente");
    });
  }

  return (
    <main className="min-h-screen bg-blue-900 text-white p-4">
      <h1 className="text-4xl font-bold text-center mb-2">
        RutaTampico 🚌
      </h1>

      <p className="text-center mb-4">
        Ubica tu autobús en tiempo real
      </p>

      <div className="mb-4">
        <Mapa />
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {[
          "Circuito Norte",
          "Circuito Sur",
          "Playa",
          "Centro",
        ].map((ruta) => (
          <button
            key={ruta}
            onClick={() => reportarSubida(ruta)}
            className="bg-green-500 px-4 py-2 rounded-xl"
          >
            Me subí a esta ruta
          </button>
        ))}
      </div>

      {rutaSeleccionada && (
        <div className="bg-green-600 text-white px-6 py-3 rounded-xl mt-6 text-center">
          Ruta seleccionada: {rutaSeleccionada}
        </div>
      )}
    </main>
  );
}