"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const Mapa = dynamic(() => import("./Mapa"), {
  ssr: false,
});

const rutas = [
  "Haciendas por Av. Hidalgo",
  "Tancol - Centro",
  "Borreguera - Centro",
  "Echeverría - Centro",
  "Madero - Tampico",
  "Altamira - Tampico",
  "Morelos - Centro",
  "Germinal - Centro",
  "Enrique Cárdenas - Centro",
  "Niños Héroes - Centro",
];

export default function Home() {
  const [tipoUsuario, setTipoUsuario] = useState("");
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

  const compartirUbicacion = () => {
    if (!tipoUsuario) {
      setMensaje("Primero selecciona si eres chofer o pasajero.");
      return;
    }

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
          tipoUsuario,
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
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#eef3f8",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          padding: "26px 18px 34px",
          background: "linear-gradient(135deg, #1d4ed8, #020617)",
          color: "white",
          borderRadius: "0 0 32px 32px",
          boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
        }}
      >
        <h1 style={{ fontSize: "30px", margin: 0 }}>
          🚌 Rutas Tampico MAFA
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: "15px", opacity: 0.9 }}>
          Rastreo comunitario de rutas en tiempo real.
        </p>
      </section>

      <section style={{ padding: "16px", marginTop: "-20px" }}>
        <div
          style={{
            background: "white",
            borderRadius: "26px",
            padding: "18px",
            boxShadow: "0 12px 28px rgba(0,0,0,0.14)",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: "22px" }}>
            ¿Cómo usarás la app?
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "18px",
            }}
          >
            <button
              onClick={() => setTipoUsuario("chofer")}
              style={{
                padding: "18px 10px",
                borderRadius: "18px",
                border:
                  tipoUsuario === "chofer"
                    ? "3px solid #2563eb"
                    : "1px solid #d1d5db",
                background: tipoUsuario === "chofer" ? "#dbeafe" : "#ffffff",
                fontWeight: "bold",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              🚍<br />
              Soy chofer
            </button>

            <button
              onClick={() => setTipoUsuario("pasajero")}
              style={{
                padding: "18px 10px",
                borderRadius: "18px",
                border:
                  tipoUsuario === "pasajero"
                    ? "3px solid #2563eb"
                    : "1px solid #d1d5db",
                background:
                  tipoUsuario === "pasajero" ? "#dbeafe" : "#ffffff",
                fontWeight: "bold",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              🧍<br />
              Soy pasajero
            </button>
          </div>

          <button
            onClick={compartirUbicacion}
            style={{
              width: "100%",
              padding: "18px",
              borderRadius: "20px",
              border: "none",
              background: "#16a34a",
              color: "white",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(22,163,74,0.35)",
            }}
          >
            📍 Compartir mi ubicación
          </button>

          {mensaje && (
            <p
              style={{
                marginTop: "14px",
                padding: "12px",
                borderRadius: "14px",
                background: "#f1f5f9",
                color: "#111827",
                fontWeight: "bold",
              }}
            >
              {mensaje}
            </p>
          )}
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "26px",
            padding: "18px",
            boxShadow: "0 12px 28px rgba(0,0,0,0.14)",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: "22px" }}>
            Escoge tu ruta
          </h2>

          <div style={{ display: "grid", gap: "10px" }}>
            {rutas.map((r) => (
              <button
                key={r}
                onClick={() => setRuta(r)}
                style={{
                  width: "100%",
                  padding: "15px",
                  borderRadius: "18px",
                  border:
                    ruta === r ? "3px solid #2563eb" : "1px solid #d1d5db",
                  background: ruta === r ? "#dbeafe" : "#ffffff",
                  fontWeight: "bold",
                  fontSize: "15px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                🛣️ {r}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            height: "540px",
            borderRadius: "26px",
            overflow: "hidden",
            boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
            marginBottom: "24px",
          }}
        >
          <Mapa />
        </div>
      </section>
    </main>
  );
}