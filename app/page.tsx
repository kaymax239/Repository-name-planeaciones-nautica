"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const Mapa = dynamic(() => import("./Mapa"), {
  ssr: false,
});

export default function Home() {
  const [ruta, setRuta] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    const registrarUsuario = async () => {
      await addDoc(collection(db, "usuarios_activos"), {
        fecha: serverTimestamp(),
      });
    };

    registrarUsuario();
  }, []);

  const getDeviceId = () => {
    let deviceId = localStorage.getItem("deviceId");

    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", deviceId);
    }

    return deviceId;
  };

  const reportarRuta = async () => {
    if (!ruta) {
      setMensaje("Primero selecciona una ruta.");
      return;
    }

    if (!navigator.geolocation) {
      setMensaje("Tu celular no permite usar ubicación.");
      return;
    }

    const deviceId = getDeviceId();
    const idRuta = ruta.replaceAll(" ", "_").toLowerCase();

    setMensaje("Compartiendo ubicación en vivo...");

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        await setDoc(doc(db, "autobuses", `${idRuta}_${deviceId}`), {
          nombre: ruta,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          fecha: serverTimestamp(),
        });

        setMensaje(`Compartiendo ubicación: ${ruta}`);
      },
      () => {
        setMensaje("No se pudo obtener tu ubicación.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    setWatchId(id);
  };

  const detenerRuta = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setMensaje("Dejaste de compartir ubicación.");
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto max-w-md px-4 py-5">
        <div className="rounded-3xl bg-slate-900/90 p-5 shadow-2xl border border-slate-700">
          <h1 className="text-3xl font-black">Rutas Tampico MAFA</h1>

          <p className="mt-2 text-sm text-slate-300">
            Comparte tu ubicación cuando vayas en una ruta para ayudar a otros usuarios.
          </p>

          <select
            value={ruta}
            onChange={(e) => setRuta(e.target.value)}
            className="mt-4 w-full rounded-2xl bg-white p-4 text-black font-bold"
          >
            <option value="">Selecciona una ruta</option>
            <option value="Haciendas por Av. Hidalgo">Haciendas por Av. Hidalgo</option>
            <option value="Ruta Niños Héroes">Ruta Niños Héroes</option>
            <option value="Tampico Madero">Tampico Madero</option>
            <option value="Tampico Altamira">Tampico Altamira</option>
            <option value="Morelos">Morelos</option>
            <option value="Borreguera">Borreguera</option>
            <option value="Echeverría">Echeverría</option>
            <option value="Madero Centro">Madero Centro</option>
            <option value="Altamira Centro">Altamira Centro</option>
            <option value="Germinal">Germinal</option>
            <option value="Enrique Cárdenas">Enrique Cárdenas</option>
          </select>

          <button
            onClick={reportarRuta}
            className="mt-4 w-full rounded-2xl bg-green-500 p-4 font-black text-white shadow-lg"
          >
            🚌 Compartir ubicación
          </button>

          <button
            onClick={detenerRuta}
            className="mt-3 w-full rounded-2xl bg-red-600 p-4 font-black text-white shadow-lg"
          >
            🛑 Dejar de compartir ubicación
          </button>

          {mensaje && (
            <p className="mt-3 rounded-2xl bg-slate-800 p-3 text-center text-sm">
              {mensaje}
            </p>
          )}
        </div>

        <div className="mt-5 h-[680px] overflow-hidden rounded-3xl border border-slate-700 shadow-2xl">
          <Mapa />
        </div>
      </div>
    </main>
  );
}