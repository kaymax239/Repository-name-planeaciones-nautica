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

const rutas = [
  "Haciendas por Av. Hidalgo",
  "Ruta Niños Héroes",
  "Tampico Madero",
  "Tampico Altamira",
  "Morelos",
  "Borreguera",
  "Echeverría",
  "Madero Centro",
  "Altamira Centro",
  "Germinal",
  "Enrique Cárdenas",
];

export default function Home() {
  const [ruta, setRuta] = useState("Haciendas por Av. Hidalgo");
  const [mensaje, setMensaje] = useState("");
  const [watchId, setWatchId] = useState<number | null>(null);
  const [modo, setModo] = useState<"chofer" | "pasajero">("pasajero");
  const [ocupacion, setOcupacion] = useState("Medio");

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

    setMensaje("🟢 Ubicación en vivo activada");

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        await setDoc(doc(db, "autobuses", `${idRuta}_${deviceId}`), {
          nombre: ruta,
          tipo: modo,
          ocupacion,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          fecha: serverTimestamp(),
        });

        setMensaje("✅ Ubicación compartida correctamente.");
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
    <main className="min-h-screen bg-[#eef3f8] text-slate-950">
      <section className="mx-auto max-w-md pb-10">
        <div className="rounded-b-[42px] bg-gradient-to-br from-blue-700 via-blue-900 to-slate-950 px-7 pb-14 pt-10 text-white shadow-2xl">
          <h1 className="text-4xl font-black leading-tight">
            🚌 Rutas Tampico MAFA
          </h1>
          <p className="mt-4 text-lg text-blue-100">
            Rastreo comunitario de rutas en tiempo real.
          </p>
        </div>

        <div className="-mt-8 mx-4 rounded-[30px] bg-white p-5 shadow-2xl">
          <h2 className="text-2xl font-black">¿Cómo usarás la app?</h2>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={() => setModo("chofer")}
              className={`rounded-2xl border-2 p-4 text-lg font-black ${
                modo === "chofer"
                  ? "border-blue-600 bg-blue-100 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              🚌 Soy chofer
            </button>

            <button
              onClick={() => setModo("pasajero")}
              className={`rounded-2xl border-2 p-4 text-lg font-black ${
                modo === "pasajero"
                  ? "border-blue-600 bg-blue-100 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              🚶 Soy pasajero
            </button>
          </div>

          <button
            onClick={reportarRuta}
            className="mt-6 w-full rounded-2xl bg-green-600 p-5 text-xl font-black text-white shadow-xl shadow-green-200"
          >
            📍 Compartir mi ubicación
          </button>

          <button
            onClick={detenerRuta}
            className="mt-3 w-full rounded-2xl bg-red-600 p-4 text-lg font-black text-white shadow-lg"
          >
            🛑 Dejar de compartir
          </button>

          {mensaje && (
            <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-lg font-black text-slate-900">
              {mensaje}
            </div>
          )}
        </div>

        <div className="mx-4 mt-6 rounded-[30px] bg-white p-5 shadow-2xl">
          <h2 className="text-2xl font-black">Escoge tu ruta</h2>

          <select
            value={ruta}
            onChange={(e) => setRuta(e.target.value)}
            className="mt-5 w-full rounded-2xl border-4 border-blue-600 bg-blue-100 p-4 text-lg font-black text-blue-700"
          >
            {rutas.map((r) => (
              <option key={r} value={r}>
                🛣️ {r}
              </option>
            ))}
          </select>

          <h2 className="mt-6 text-2xl font-black">¿Cómo va el autobús?</h2>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {["Vacío", "Medio", "Lleno"].map((estado) => (
              <button
                key={estado}
                onClick={() => setOcupacion(estado)}
                className={`rounded-2xl p-3 text-base font-black ${
                  ocupacion === estado
                    ? "bg-yellow-400 text-black"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {estado === "Vacío" && "🟢 "}
                {estado === "Medio" && "🟡 "}
                {estado === "Lleno" && "🔴 "}
                {estado}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-4 mt-6 h-[520px] overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl">
          <Mapa />
        </div>

        <div className="mx-4 mt-6 rounded-[30px] bg-white p-5 shadow-2xl">
          <h2 className="text-2xl font-black">🚌 Buses activos por ruta</h2>

          <div className="mt-4 space-y-3">
            {rutas.slice(0, 6).map((r) => (
              <div
                key={r}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-lg font-black">{r}</p>
                <span className="rounded-full bg-blue-700 px-4 py-3 text-lg font-black text-white">
                  0
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}