"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const Mapa = dynamic(() => import("./Mapa"), {
  ssr: false,
});

const rutas = [
  "Haciendas por Av. Hidalgo",
  "Circuito Norte",
  "Tampico - Playa",
  "Tampico - Madero",
  "Tampico - Altamira",
  "Borreguera",
  "Echeverría",
  "Morelos",
  "Tancol",
  "Águila - Centro",
];

export default function Home() {
  const [ruta, setRuta] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [favoritos, setFavoritos] = useState<string[]>([]);

  useEffect(() => {
    const guardados = localStorage.getItem("favoritosRutas");
    if (guardados) {
      setFavoritos(JSON.parse(guardados));
    }
  }, []);

  const guardarFavoritos = (nuevosFavoritos: string[]) => {
    setFavoritos(nuevosFavoritos);
    localStorage.setItem("favoritosRutas", JSON.stringify(nuevosFavoritos));
  };

  const toggleFavorito = (nombreRuta: string) => {
    if (favoritos.includes(nombreRuta)) {
      guardarFavoritos(favoritos.filter((r) => r !== nombreRuta));
    } else {
      guardarFavoritos([...favoritos, nombreRuta]);
    }
  };

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

    setMensaje("Obteniendo ubicación...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const deviceId = getDeviceId();

        await setDoc(doc(db, "autobuses", deviceId), {
          nombre: ruta,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          fecha: serverTimestamp(),
          activo: true,
        });

        setMensaje(`✅ Ruta reportada: ${ruta}`);
      },
      () => {
        setMensaje("No se pudo obtener tu ubicación.");
      }
    );
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        color: "white",
        padding: "16px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: "480px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: "32px", marginBottom: "4px" }}>
          🚍 Rutas Tampico
        </h1>

        <p style={{ color: "#cbd5e1", marginBottom: "18px" }}>
          Reporta y encuentra rutas en tiempo real.
        </p>

        {favoritos.length > 0 && (
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              padding: "12px",
              borderRadius: "16px",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>⭐ Tus rutas favoritas</h3>

            <div style={{ display: "grid", gap: "8px" }}>
              {favoritos.map((fav) => (
                <button
                  key={fav}
                  onClick={() => setRuta(fav)}
                  style={{
                    padding: "10px",
                    borderRadius: "12px",
                    border: "none",
                    background: ruta === fav ? "#22c55e" : "#334155",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  {fav}
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            padding: "12px",
            borderRadius: "16px",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>Selecciona tu ruta</h3>

          <div style={{ display: "grid", gap: "8px" }}>
            {rutas.map((r) => (
              <div
                key={r}
                style={{
                  display: "flex",
                  gap: "8px",
                }}
              >
                <button
                  onClick={() => setRuta(r)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "12px",
                    border: "none",
                    background: ruta === r ? "#2563eb" : "#475569",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  {r}
                </button>

                <button
                  onClick={() => toggleFavorito(r)}
                  style={{
                    width: "48px",
                    borderRadius: "12px",
                    border: "none",
                    background: favoritos.includes(r) ? "#facc15" : "#64748b",
                    color: "black",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  ⭐
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={reportarRuta}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "16px",
            border: "none",
            background: "#22c55e",
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "12px",
          }}
        >
          Me subí a esta ruta
        </button>

        {mensaje && (
          <p
            style={{
              background: "rgba(255,255,255,0.1)",
              padding: "10px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            {mensaje}
          </p>
        )}

        <div
          style={{
            marginTop: "16px",
            height: "420px",
            borderRadius: "18px",
            overflow: "hidden",
          }}
        >
          <Mapa />
        </div>
      </section>
    </main>
  );
}