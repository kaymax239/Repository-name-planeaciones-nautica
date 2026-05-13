"use client";

import dynamic from "next/dynamic";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

const Mapa = dynamic(() => import("./Mapa"), {
  ssr: false,
});

export default function Home() {
  async function reportarRuta(nombreRuta: string) {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta GPS");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await addDoc(collection(db, "autobuses"), {
            nombre: nombreRuta,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            fecha: new Date(),
          });

          alert("✅ Reporte guardado en Firebase con tu ubicación");
        } catch (error) {
          console.error(error);
          alert("❌ Error guardando en Firebase");
        }
      },
      () => {
        alert("❌ No se pudo obtener tu ubicación");
      }
    );
  }

  return (
    <main className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-4">
        Rutas Tampico MAFA
      </h1>

      <Mapa />

      <div className="mt-4 flex flex-col gap-3">
        {["Ruta Circuito Norte", "Ruta Centro", "Ruta Madero", "Ruta Tampico"].map(
          (ruta) => (
            <button
              key={ruta}
              onClick={() => reportarRuta(ruta)}
              className="bg-blue-600 text-white p-4 rounded-xl text-lg"
            >
              Reportar ubicación: {ruta}
            </button>
          )
        )}
      </div>
    </main>
  );
}