"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const Mapa = dynamic(() => import("./Mapa"), {
  ssr: false,
});

export default function Home() {
  const [modo, setModo] = useState<"inicio" | "chofer" | "pasajero">("inicio");

  if (modo === "inicio") {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            background: "#111827",
            padding: 30,
            borderRadius: 24,
            width: "100%",
            maxWidth: 420,
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,.45)",
          }}
        >
          <h1
            style={{
              color: "white",
              fontSize: 30,
              fontWeight: 800,
              marginBottom: 10,
            }}
          >
            🚍 Rutas Tampico
          </h1>

          <p style={{ color: "#cbd5e1", marginBottom: 28 }}>
            Transporte en vivo para Tampico, Madero y Altamira
          </p>

          <button
            onClick={() => setModo("chofer")}
            style={{
              width: "100%",
              background: "#22c55e",
              color: "white",
              border: "none",
              padding: 18,
              borderRadius: 16,
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 14,
              cursor: "pointer",
            }}
          >
            🚌 Soy Chofer
          </button>

          <button
            onClick={() => setModo("pasajero")}
            style={{
              width: "100%",
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: 18,
              borderRadius: 16,
              fontSize: 18,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            👤 Soy Pasajero
          </button>
        </div>
      </main>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <Mapa />

      <button
        onClick={() => setModo("inicio")}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 9999,
          background: "#111827",
          color: "white",
          border: "none",
          borderRadius: 999,
          padding: "10px 16px",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(0,0,0,.35)",
        }}
      >
        ← Inicio
      </button>

      {modo === "chofer" && (
        <div
          style={{
            position: "absolute",
            bottom: 90,
            left: 12,
            zIndex: 9999,
            background: "#22c55e",
            color: "white",
            padding: 14,
            borderRadius: 16,
            fontWeight: 700,
          }}
        >
          🚌 Modo Chofer activo
        </div>
      )}

      {modo === "pasajero" && (
        <div
          style={{
            position: "absolute",
            bottom: 90,
            left: 12,
            zIndex: 9999,
            background: "#2563eb",
            color: "white",
            padding: 14,
            borderRadius: 16,
            fontWeight: 700,
          }}
        >
          👤 Modo Pasajero activo
        </div>
      )}
    </div>
  );
}