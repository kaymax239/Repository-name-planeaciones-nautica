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

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        await addDoc(collection(db, "autobuses"), {
          nombre: nombreRuta,
          lat: lat,
          lng: lng,
          fecha: new Date(),
        });

        alert("Reporte guardado con tu ubicación");
      },

      () => {
        alert("No se pudo obtener tu ubicación");
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

        <button
          onClick={() => reportarRuta("Ruta Circuito Norte")}
          className="bg-blue-600 text-white p-4 rounded-xl text-lg"
        >
          Me subí a esta ruta: Ruta Circuito Norte
        </button>

        <button
          onClick={() => reportarRuta("Ruta Centro")}
          className="bg-blue-600 text-white p-4 rounded-xl text-lg"
        >
          Me subí a esta ruta: Ruta Centro
        </button>

        <button
          onClick={() => reportarRuta("Ruta Madero")}
          className="bg-blue-600 text-white p-4 rounded-xl text-lg"
        >
          Me subí a esta ruta: Ruta Madero
        </button>

        <button
          onClick={() => reportarRuta("Ruta Tampico")}
          className="bg-blue-600 text-white p-4 rounded-xl text-lg"
        >
          Me subí a esta ruta: Ruta Tampico
        </button>

      </div>

    </main>

  );
}