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
    <main className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-4">
        Rutas Tampico MAFA
      </h1>

      <Mapa />

      <div className="mt-4 bg-white p-4 rounded-2xl shadow">
        <h2 className="text-xl font-bold mb-3">Selecciona zona</h2>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.keys(zonas).map((zona) => (
            <button
              key={zona}
              onClick={() => {
                setZonaActiva(zona);
                setRutaSeleccionada("");
              }}
              className={`p-3 rounded-xl font-bold ${
                zonaActiva === zona
                  ? "bg-blue-700 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {zona}
            </button>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-3">Compartir ubicación en vivo</h2>

        <select
          value={rutaSeleccionada}
          onChange={(e) => setRutaSeleccionada(e.target.value)}
          className="w-full p-3 border rounded-xl mb-3"
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
            className="w-full bg-green-600 text-white p-4 rounded-xl text-lg"
          >
            🟢 Estoy en el autobús / Compartir en vivo
          </button>
        ) : (
          <button
            onClick={detenerSeguimiento}
            className="w-full bg-red-600 text-white p-4 rounded-xl text-lg"
          >
            🔴 Detener seguimiento
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <h2 className="text-xl font-bold">
          Reportar una vez — {zonaActiva}
        </h2>

        {rutasActuales.map((ruta: string) => (
          <button
            key={ruta}
            onClick={() => reportarUnaVez(ruta)}
            className="bg-blue-600 text-white p-4 rounded-xl text-lg"
          >
            Reportar ubicación: {ruta}
          </button>
        ))}
      </div>
    </main>
  );
}