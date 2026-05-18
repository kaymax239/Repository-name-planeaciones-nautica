"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const Mapa = dynamic(() => import("./Mapa"), {
  ssr: false,
});

export default function Home() {
  const [zonaActiva, setZonaActiva] = useState("UAT");
  const [rutaSeleccionada, setRutaSeleccionada] = useState("");
  const [seguimientoActivo, setSeguimientoActivo] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [documentoId, setDocumentoId] = useState<string | null>(null);

  const zonas: any = {
    UAT: [
      "Ruta Haciendas Tampico por UAT",
      "Ruta Altamira UAT",
      "Ruta Pedrera UAT",
      "Ruta Azteca UAT",
      "Ruta Niños Héroes",
    ],
    Tampico: [
      "Ruta Haciendas Tampico por Avenida Hidalgo",
      "Ruta Centro",
      "Ruta Tampico",
      "Ruta Circuito Norte",
    ],
    Madero: [
      "Ruta Madero",
    ],
    Altamira: [
      "Ruta Altamira UAT",
      "Ruta Pedrera UAT",
      "Ruta Azteca UAT",
    ],
  };

  const rutasActuales = zonas[zonaActiva];

  async function reportarUnaVez(nombreRuta: string) {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta GPS");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await addDoc(collection(db, "autobuses"), {
          nombre: nombreRuta,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          estado: "Reporte único",
          fecha: serverTimestamp(),
        });

        alert("✅ Reporte guardado");
      },
      () => {
        alert("❌ No se pudo obtener tu ubicación");
      }
    );
  }

  async function iniciarSeguimiento() {
    if (!rutaSeleccionada) {
      alert("Primero selecciona una ruta");
      return;
    }

    if (!navigator.geolocation) {
      alert("Tu navegador no soporta GPS");
      return;
    }

    const nuevoDoc = await addDoc(collection(db, "autobuses"), {
      nombre: rutaSeleccionada,
      lat: 22.2553,
      lng: -97.8686,
      estado: "En vivo",
      fecha: serverTimestamp(),
    });

    setDocumentoId(nuevoDoc.id);

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        await updateDoc(doc(db, "autobuses", nuevoDoc.id), {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          estado: "En vivo",
          fecha: serverTimestamp(),
        });
      },
      () => {
        alert("❌ No se pudo actualizar tu ubicación");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    setWatchId(id);
    setSeguimientoActivo(true);
    alert("🟢 Ubicación en vivo activada");
  }

  async function detenerSeguimiento() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }

    if (documentoId) {
      await updateDoc(doc(db, "autobuses", documentoId), {
        estado: "Seguimiento terminado",
        fecha: serverTimestamp(),
      });
    }

    setWatchId(null);
    setDocumentoId(null);
    setSeguimientoActivo(false);
    alert("🔴 Seguimiento detenido");
  }

  return (
    <main className="min-h-screen bg-slate-100 pb-20">
      
      <div className="bg-gradient-to-r from-blue-700 to-cyan-500 text-white p-5 rounded-b-3xl shadow-xl">
        <h1 className="text-4xl font-extrabold text-center">
          🚌 Rutas Tampico MAFA
        </h1>

        <p className="text-center mt-2 opacity-90">
          Ubicación de autobuses en tiempo real
        </p>
      </div>

      <div className="p-4">
        <div className="overflow-hidden rounded-3xl shadow-2xl border-4 border-white">
          <Mapa />
        </div>

        <div className="mt-5 bg-white p-5 rounded-3xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-slate-800">
            📍 Selecciona zona
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {Object.keys(zonas).map((zona) => (
              <button
                key={zona}
                onClick={() => {
                  setZonaActiva(zona);
                  setRutaSeleccionada("");
                }}
                className={`p-4 rounded-2xl font-bold text-lg transition-all ${
                  zonaActiva === zona
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {zona}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 bg-white p-5 rounded-3xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-slate-800">
            🟢 Compartir ubicación en vivo
          </h2>

          <select
            value={rutaSeleccionada}
            onChange={(e) => setRutaSeleccionada(e.target.value)}
            className="w-full p-4 border-2 border-slate-300 rounded-2xl mb-4 text-lg"
          >
            <option value="">Selecciona una ruta</option>

            {rutasActuales.map((ruta: string) => (
              <option key={ruta} value={ruta}>
                {ruta}
              </option>
            ))}
          </select>

          {!seguimientoActivo ? (
            <button
              onClick={iniciarSeguimiento}
              className="w-full bg-green-600 hover:bg-green-700 text-white p-5 rounded-2xl text-xl font-bold shadow-lg"
            >
              🟢 Estoy en el autobús
            </button>
          ) : (
            <button
              onClick={detenerSeguimiento}
              className="w-full bg-red-600 hover:bg-red-700 text-white p-5 rounded-2xl text-xl font-bold shadow-lg"
            >
              🔴 Detener seguimiento
            </button>
          )}
        </div>

        <div className="mt-5">
          <h2 className="text-2xl font-bold mb-4 text-slate-800">
            🚏 Reportar una vez — {zonaActiva}
          </h2>

          <div className="flex flex-col gap-4">
            {rutasActuales.map((ruta: string) => (
              <button
                key={ruta}
                onClick={() => reportarUnaVez(ruta)}
                className="bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl text-lg font-bold shadow-lg"
              >
                📍 {ruta}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}