"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const Mapa = dynamic(() => import("./Mapa"), {
  ssr: false,
});

const rutas = ["Haciendas por Av. Hidalgo"];

export default function Home() {
  const [ruta, setRuta] = useState("");
  const [mensaje, setMensaje] = useState("");

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
      setMensaje("Primero selecciona una ruta.");
      return;
    }

    if (!navigator.geolocation) {
      setMensaje("Tu celular no permite usar ubicación.");
      return;
    }

    setMensaje("Buscando tu ubicación...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const deviceId = getDeviceId();

        await setDoc(doc(db, "autobuses", deviceId), {
          nombre: ruta,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          fecha: serverTimestamp(),
        });

        setMensaje("✅ Ruta reportada correctamente.");
      },
      () => {
        setMensaje("No se pudo obtener tu ubicación.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f4f7fb" }}>
      <section
        style={{
          padding: "24px",
          background: "linear-gradient(135deg, #1d4ed8, #111827)",
          color: "white",
          borderRadius: "0 0 24px 24px",
        }}
      >
        <h1 style={{ fontSize: "32px", margin: 0 }}>🚌 Rutas Tampico MAFA</h1>
        <p>Rastreo comunitario de rutas en tiempo real.</p>
      </section>

      <section style={{ padding: "16px" }}>
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "16px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
            marginBottom: "16px",
          }}
        >
          <h2>Selecciona tu ruta</h2>

          {rutas.map((r) => (
            <button
              key={r}
              onClick={() => setRuta(r)}
              style={{
                width: "100%",
                padding: "14px",
                marginBottom: "10px",
                borderRadius: "14px",
                border: ruta === r ? "3px solid #2563eb" : "1px solid #ddd",
                background: ruta === r ? "#dbeafe" : "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {r}
            </button>
          ))}

          <button
            onClick={reportarRuta}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "16px",
              border: "none",
              background: "#16a34a",
              color: "white",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            📍 Me subí a esta ruta
          </button>

          {mensaje && <p style={{ marginTop: "12px" }}>{mensaje}</p>}
        </div>

        <div
          style={{
            height: "500px",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
          }}
        >
          <Mapa />
        </div>
      </section>
    </main>
  );
}