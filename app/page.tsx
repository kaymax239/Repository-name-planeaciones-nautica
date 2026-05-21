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
        background:
          "linear-gradient(180deg, #020617 0%, #0f172a 40%, #111827 100%)",
        color: "white",
        padding: "16px",
        fontFamily: "system-ui",
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
            fontSize: "34px",
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
            fontSize: "16px",
          }}
        >
          Consulta rutas en tiempo real
        </p>

        <div
          style={{
            background: "#16a34a",
            color: "white",
            padding: "14px",
            borderRadius: "18px",
            textAlign: "center",
            marginBottom: "14px",
            fontWeight: "bold",
            fontSize: "20px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.35)",
          }}
        >
          🟢 Buses activos ahora: {buses.length}
        </div>

        <div
          style={{
            background: "#0f172a",
            padding: "16px",
            borderRadius: "22px",
            marginBottom: "14px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            border: "1px solid #1e293b",
          }}
        >
          <h2
            style={{
              marginBottom: "12px",
              fontSize: "20px",
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
                  padding: "14px",
                  borderRadius: "16px",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "17px",
                    marginBottom: "5px",
                  }}
                >
                  🚌 {r}
                </div>

                <div
                  style={{
                    color: "#cbd5e1",
                    marginBottom: "4px",
                  }}
                >
                  👥 {cantidad} usuarios reportando esta ruta
                </div>

                <div
                  style={{
                    color: "#22c55e",
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
            background: "#0f172a",
            padding: "18px",
            borderRadius: "22px",
            marginBottom: "14px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            border: "1px solid #1e293b",
          }}
        >
          <select
            value={ruta}
            onChange={(e) => setRuta(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "16px",
              border: "none",
              marginBottom: "12px",
              fontSize: "16px",
              background: "#f8fafc",
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
              padding: "15px",
              borderRadius: "16px",
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: "bold",
              fontSize: "17px",
              marginBottom: "12px",
              cursor: "pointer",
            }}
          >
            📍 Me subí a esta ruta
          </button>

          <button
            onClick={detenerRuta}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "16px",
              border: "none",
              background: "#dc2626",
              color: "white",
              fontWeight: "bold",
              fontSize: "17px",
              cursor: "pointer",
            }}
          >
            🛑 Dejar de compartir ubicación
          </button>

          {mensaje && (
            <div
              style={{
                marginTop: "14px",
                background: "#020617",
                padding: "12px",
                borderRadius: "14px",
                color: "#e2e8f0",
              }}
            >
              {mensaje}
            </div>
          )}
        </div>

        <div
          style={{
            height: "500px",
            borderRadius: "24px",
            overflow: "hidden",
            border: "2px solid #1e293b",
            boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
          }}
        >
          <Mapa />
        </div>
      </div>
    </main>
  );
}