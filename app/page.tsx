"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import dynamic from "next/dynamic";

const Mapa = dynamic(() => import("./Mapa"), {
  ssr: false,
});

const rutasDisponibles = [
  "Ruta Haciendas Tampico por UAT",
  "Ruta Tampico Centro",
  "Ruta Madero",
  "Ruta Altamira",
];

export default function Home() {
  const [ruta, setRuta] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [watchId, setWatchId] = useState<number | null>(null);
  const [conteoRutas, setConteoRutas] = useState<any>({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "autobuses"), (snapshot) => {
      const conteo: any = {};

      rutasDisponibles.forEach((ruta) => {
        conteo[ruta] = 0;
      });

      snapshot.forEach((doc) => {
        const data: any = doc.data();

        if (!data.fecha?.seconds) return;

        const fecha = data.fecha.seconds * 1000;
        const ahora = Date.now();
        const minutos = (ahora - fecha) / 1000 / 60;

        if (data.activo === true && minutos <= 30) {
          conteo[data.nombre] = (conteo[data.nombre] || 0) + 1;
        }
      });

      setConteoRutas(conteo);
    });

    return () => unsubscribe();
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

    setMensaje("Enviando ubicación en tiempo real...");

    const deviceId = getDeviceId();

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        await setDoc(doc(db, "autobuses", deviceId), {
          nombre: ruta,
          lat,
          lng,
          activo: true,
          fecha: serverTimestamp(),
        });

        setMensaje("Bus activo en tiempo real.");
      },
      () => {
        setMensaje("No se pudo obtener la ubicación.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    setWatchId(id);
  };

  const detenerReporte = async () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);

      const deviceId = getDeviceId();

      await setDoc(
        doc(db, "autobuses", deviceId),
        {
          activo: false,
          fecha: serverTimestamp(),
        },
        { merge: true }
      );

      setMensaje("Reporte detenido.");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "15px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          background: "linear-gradient(135deg, #1d4ed8, #0f172a)",
          color: "white",
          borderRadius: "24px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
        }}
      >
        <h1 style={{ margin: 0 }}>🚍 Rutas Tampico 2</h1>
        <p style={{ color: "#dbeafe" }}>
          Rastreo comunitario de rutas en tiempo real.
        </p>
      </section>

      <section
        style={{
          height: "340px",
          borderRadius: "22px",
          overflow: "hidden",
          marginBottom: "20px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
        }}
      >
        <Mapa rutaSeleccionada={ruta} />
      </section>

      <section
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "15px",
          marginBottom: "20px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
        }}
      >
        <h2>🚌 Buses activos por ruta</h2>

        {rutasDisponibles.map((nombreRuta) => (
          <div
            key={nombreRuta}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px",
              borderRadius: "14px",
              background: "#f8fafc",
              marginBottom: "10px",
              border: "1px solid #e2e8f0",
            }}
          >
            <span style={{ fontWeight: "bold" }}>{nombreRuta}</span>

            <span
              style={{
                background:
                  conteoRutas[nombreRuta] > 0 ? "#16a34a" : "#94a3b8",
                color: "white",
                padding: "6px 12px",
                borderRadius: "999px",
                fontWeight: "bold",
              }}
            >
              {conteoRutas[nombreRuta] || 0} activo
            </span>
          </div>
        ))}
      </section>

      <section
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "15px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
        }}
      >
        <h2>📍 Selecciona tu ruta</h2>

        <select
          value={ruta}
          onChange={(e) => setRuta(e.target.value)}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: "12px",
            border: "1px solid #cbd5e1",
            fontSize: "16px",
            marginBottom: "15px",
          }}
        >
          <option value="">Selecciona una ruta</option>

          {rutasDisponibles.map((nombreRuta) => (
            <option key={nombreRuta} value={nombreRuta}>
              {nombreRuta}
            </option>
          ))}
        </select>

        <button
          onClick={reportarRuta}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: "12px",
            border: "none",
            background: "#2563eb",
            color: "white",
            fontSize: "17px",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          🚍 Me subí a esta ruta
        </button>

        <button
          onClick={detenerReporte}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: "12px",
            border: "none",
            background: "#dc2626",
            color: "white",
            fontSize: "17px",
            fontWeight: "bold",
          }}
        >
          🛑 Detener reporte
        </button>

        {mensaje && (
          <p style={{ marginTop: "15px", fontWeight: "bold" }}>{mensaje}</p>
        )}
      </section>
    </main>
  );
}