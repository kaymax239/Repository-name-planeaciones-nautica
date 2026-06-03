"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { useOnlineUsers, useUserPresence } from "./useUserPresence";

const Mapa = dynamic(() => import("./Mapa"), {
  ssr: false,
});

export default function Home() {
  const [modo, setModo] = useState<"inicio" | "chofer" | "pasajero">("inicio");
  const [rutaActiva, setRutaActiva] = useState<string | null>(null);
  const usuariosEnLinea = useOnlineUsers();

  useUserPresence(modo === "inicio" ? null : rutaActiva);

  const cambiarRutaActiva = useCallback((ruta: string | null) => {
    setRutaActiva(ruta);
  }, []);

  const volverInicio = () => {
    setRutaActiva(null);
    setModo("inicio");
  };

  const abrirWhatsAppPasajeroSeguro = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no permite compartir ubicación.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const linkMapa = `https://www.google.com/maps?q=${lat},${lng}`;
        const mensaje =
          `Estoy usando Rutas Tampico.\n\n` +
          `Te comparto mi ubicación como pasajero seguro durante mi viaje.\n\n` +
          `Mi ubicación actual:\n${linkMapa}\n\n` +
          `Por favor mantente pendiente.`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          mensaje
        )}`;
        window.location.href = url;
      },
      () => {
        alert("No se pudo obtener tu ubicación. Activa el GPS y permite ubicación.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const llamarEmergencias = () => {
    window.location.href = "tel:911";
  };

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
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <h1 style={{ color: "white", fontSize: 30, fontWeight: 800 }}>
            🚍 Rutas Tampico
          </h1>

          <p style={{ color: "#cbd5e1", marginBottom: 16 }}>
            Transporte en vivo para Tampico, Madero y Altamira
          </p>

          <div
            style={{
              background: "rgba(34,197,94,.14)",
              border: "1px solid rgba(34,197,94,.45)",
              color: "#bbf7d0",
              borderRadius: 16,
              padding: "12px 14px",
              fontWeight: 800,
              marginBottom: 4,
            }}
          >
            👥 Usuarios en línea:{" "}
            {usuariosEnLinea.loading ? "..." : usuariosEnLinea.total}
          </div>

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

          <button
            onClick={abrirWhatsAppPasajeroSeguro}
            style={{
              width: "100%",
              background: "#16a34a",
              color: "white",
              border: "none",
              padding: 14,
              borderRadius: 16,
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            🛡️ Pasajero Seguro WhatsApp
          </button>

          <button
            onClick={llamarEmergencias}
            style={{
              width: "100%",
              background: "#dc2626",
              color: "white",
              border: "none",
              padding: 14,
              borderRadius: 16,
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            🚨 Emergencia 911
          </button>
        </div>
      </main>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <Mapa
        conteoUsuariosPorRuta={usuariosEnLinea.byRoute}
        onRutaSeleccionada={cambiarRutaActiva}
      />
      <button
        onClick={volverInicio}
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
    </div>
  );
}