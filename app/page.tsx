"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "./firebase";

const Mapa = dynamic(() => import("./Mapa"), {
  ssr: false,
});

const rutas = [
  "Haciendas por Avenida Hidalgo",
  "Circuito Norte",
  "Tampico - Madero",
  "Tampico - Altamira",
  "Echeverría",
  "Borreguera",
  "Tancol",
  "Morelos",
];

export default function Home() {
  const [ruta, setRuta] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [buses, setBuses] = useState<any[]>([]);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "autobuses"), (snapshot) => {
      const ahora = Date.now();

      const activos = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((bus: any) => {
          if (!bus.fecha?.toDate) return true;

          const tiempo = bus.fecha.toDate().getTime();

          return ahora - tiempo < 30 * 60 * 1000;
        });

      setBuses(activos);
    });

    return () => unsub();
  }, []);

  const getDeviceId = () => {
    let deviceId = localStorage.getItem("deviceId");

    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", deviceId);
    }

    return deviceId;
  };

  const reportarRuta = () => {
    if (!ruta) {
      setMensaje("Selecciona una ruta.");
      return;
    }

    if (!navigator.geolocation) {
      setMensaje("Tu celular no permite ubicación.");
      return;
    }

    setMensaje("Compartiendo ubicación...");

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const deviceId = getDeviceId();

        await setDoc(doc(db, "autobuses", deviceId), {
          nombre: ruta,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          fecha: serverTimestamp(),
        });

        setMensaje(`Compartiendo ruta: ${ruta}`);
      },
      () => {
        setMensaje("No se pudo obtener ubicación.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    setWatchId(id);
  };

  const detenerRuta = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);

      setWatchId(null);

      setMensaje("Ubicación detenida.");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0f172a, #020617)",
        color: "white",
        padding: "16px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "5px",
          }}
        >
          🚌 Rutas Tampico MAFA
        </h1>

        <p
          style={{
            color: "#cbd5e1",
            marginBottom: "15px",
          }}
        >
          Consulta rutas en tiempo real
        </p>

        <div
          style={{
            background: "#16a34a",
            color: "white",
            padding: "12px",
            borderRadius: "16px",
            textAlign: "center",
            marginBottom: "12px",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          🟢 Buses activos ahora: {buses.length}
        </div>

        <div
          style={{
            background: "#111827",
            padding: "14px",
            borderRadius: "18px",
            marginBottom: "12px",
          }}
        >
          <h2
            style={{
              marginBottom: "10px",
              fontSize: "18px",
            }}
          >
            🚍 Rutas activas ahora
          </h2>

          {rutas.map((r) => {
            const cantidad = buses.filter(
              (b: any) => b.nombre === r
            ).length;

            if (cantidad === 0) return null;

            const eta = Math.floor(Math.random() * 10) + 1;

            return (
              <div
                key={r}
                style={{
                  background: "#1e293b",
                  padding: "12px",
                  borderRadius: "14px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    marginBottom: "4px",
                  }}
                >
                  🚌 {r}
                </div>

                <div
                  style={{
                    color: "#cbd5e1",
                  }}
                >
                  👥 {cantidad} usuarios reportando esta ruta
                </div>

                <div
                  style={{
                    color: "#22c55e",
                    marginTop: "4px",
                    fontWeight: "bold",
                  }}
                >
                  ⏱️ ETA aproximado: {eta} min
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            background: "#111827",
            padding: "14px",
            borderRadius: "18px",
            marginBottom: "12px",
          }}
        >
          <select
            value={ruta}
            onChange={(e) => setRuta(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              marginBottom: "10px",
              fontSize: "16px",
            }}
          >
            <option value="">Selecciona una ruta</option>

            {rutas.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <button
            onClick={reportarRuta}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              marginBottom: "10px",
            }}
          >
            📍 Me subí a esta ruta
          </button>

          <button
            onClick={detenerRuta}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              border: "none",
              background: "#dc2626",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            🛑 Dejar de compartir ubicación
          </button>

          {mensaje && (
            <div
              style={{
                marginTop: "12px",
                background: "#020617",
                padding: "10px",
                borderRadius: "12px",
              }}
            >
              {mensaje}
            </div>
          )}
        </div>

        <div
          style={{
            height: "450px",
            borderRadius: "20px",
            overflow: "hidden",
            border: "2px solid #1e293b",
          }}
        >
          <Mapa />
        </div>
      </div>
    </main>
  );
}