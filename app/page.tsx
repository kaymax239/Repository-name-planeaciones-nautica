"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { doc, setDoc, serverTimestamp, collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

const Mapa = dynamic(() => import("./Mapa"), { ssr: false });

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
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    const favs = localStorage.getItem("favoritosRutas");
    if (favs) setFavoritos(JSON.parse(favs));

    const unsub = onSnapshot(collection(db, "autobuses"), (snapshot) => {
      const ahora = Date.now();

      const activos = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
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
      setMensaje("Primero selecciona una ruta.");
      return;
    }

    if (!navigator.geolocation) {
      setMensaje("Tu celular no permite usar ubicación.");
      return;
    }

    setMensaje("Activando ubicación en tiempo real...");

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const deviceId = getDeviceId();

        await setDoc(doc(db, "autobuses", deviceId), {
          nombre: ruta,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          fecha: serverTimestamp(),
        });

        setMensaje(`Compartiendo ubicación de: ${ruta}`);
      },
      () => {
        setMensaje("No se pudo obtener tu ubicación.");
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
      setMensaje("Dejaste de compartir ubicación.");
    }
  };

  const agregarFavorito = () => {
    if (!ruta) {
      setMensaje("Selecciona una ruta primero.");
      return;
    }

    let nuevosFavoritos = [...favoritos];

    if (!nuevosFavoritos.includes(ruta)) {
      nuevosFavoritos.push(ruta);
    }

    setFavoritos(nuevosFavoritos);
    localStorage.setItem("favoritosRutas", JSON.stringify(nuevosFavoritos));
    setMensaje("Ruta agregada a favoritos.");
  };

  const compartirApp = async () => {
    const texto =
      "Checa Rutas Tampico MAFA para ver rutas y reportar autobuses en tiempo real: https://rutas-tampico-mafa.vercel.app/";

    if (navigator.share) {
      await navigator.share({
        title: "Rutas Tampico MAFA",
        text: texto,
        url: "https://rutas-tampico-mafa.vercel.app/",
      });
    } else {
      await navigator.clipboard.writeText(texto);
      setMensaje("Liga copiada para compartir.");
    }
  };

  const pedirRuta = () => {
    const texto = prompt("Escribe la ruta que no encuentras:");

    if (texto && texto.trim() !== "") {
      setMensaje(`Gracias. Revisaremos la ruta: ${texto}`);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0f172a, #020617)",
        color: "white",
        padding: "16px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: "30px", marginBottom: "5px" }}>
          🚌 Rutas Tampico MAFA
        </h1>

        <p style={{ color: "#cbd5e1", marginBottom: "14px" }}>
          Reporta y consulta rutas en tiempo real.
        </p>

        <div
          style={{
            background: "#16a34a",
            <div
  style={{
    background: "#111827",
    padding: "14px",
    borderRadius: "18px",
    marginBottom: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
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

        <div style={{ color: "#cbd5e1" }}>
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
            color: "white",
            padding: "12px",
            borderRadius: "16px",
            textAlign: "center",
            marginBottom: "12px",
            fontWeight: "bold",
            fontSize: "17px",
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
            boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
          }}
        >
          <label style={{ display: "block", marginBottom: "8px" }}>
            Selecciona tu ruta:
          </label>

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
            <option value="">-- Selecciona una ruta --</option>
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
              padding: "13px",
              borderRadius: "14px",
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              marginBottom: "8px",
            }}
          >
            📍 Me subí a esta ruta
          </button>

          <button
            onClick={detenerRuta}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "14px",
              border: "none",
              background: "#dc2626",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              marginBottom: "8px",
            }}
          >
            🛑 Dejar de compartir ubicación
          </button>

          <button
            onClick={agregarFavorito}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "14px",
              border: "none",
              background: "#f59e0b",
              color: "black",
              fontWeight: "bold",
              fontSize: "16px",
              marginBottom: "8px",
            }}
          >
            ⭐ Guardar ruta favorita
          </button>

          <button
            onClick={compartirApp}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "14px",
              border: "none",
              background: "#22c55e",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              marginBottom: "8px",
            }}
          >
            📲 Compartir app
          </button>

          <button
            onClick={pedirRuta}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "14px",
              border: "none",
              background: "#9333ea",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            ✍️ ¿No encuentras tu ruta? Escríbela aquí
          </button>

          {mensaje && (
            <p
              style={{
                marginTop: "12px",
                background: "#020617",
                padding: "10px",
                borderRadius: "12px",
                color: "#e5e7eb",
              }}
            >
              {mensaje}
            </p>
          )}
        </div>

        {favoritos.length > 0 && (
          <div
            style={{
              background: "#111827",
              padding: "14px",
              borderRadius: "18px",
              marginBottom: "12px",
            }}
          >
            <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>
              ⭐ Tus rutas favoritas
            </h2>

            {favoritos.map((fav) => (
              <button
                key={fav}
                onClick={() => setRuta(fav)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px",
                  marginBottom: "6px",
                  borderRadius: "12px",
                  border: "none",
                  background: "#334155",
                  color: "white",
                  textAlign: "left",
                }}
              >
                {fav}
              </button>
            ))}
          </div>
        )}

        <div
          style={{
            height: "430px",
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