"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "./firebase";

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61231.png",
  iconSize: [38, 38],
});

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconSize: [35, 35],
});

const rutasMapa = [
  {
    nombre: "Haciendas por Av. Hidalgo",
    color: "#2563eb",
    puntos: [
      [22.2786, -97.8771],
      [22.2765, -97.8732],
      [22.2734, -97.8695],
      [22.2691, -97.865],
      [22.265, -97.861],
      [22.26, -97.857],
      [22.255, -97.853],
    ],
  },
  {
    nombre: "Tancol - Centro",
    color: "#16a34a",
    puntos: [
      [22.2908, -97.8908],
      [22.2822, -97.8834],
      [22.2722, -97.8755],
      [22.2621, -97.869],
      [22.2535, -97.862],
      [22.2458, -97.858],
    ],
  },
  {
    nombre: "Borreguera - Centro",
    color: "#dc2626",
    puntos: [
      [22.302, -97.896],
      [22.292, -97.889],
      [22.282, -97.881],
      [22.271, -97.873],
      [22.258, -97.864],
      [22.2458, -97.858],
    ],
  },
  {
    nombre: "Echeverría - Centro",
    color: "#9333ea",
    puntos: [
      [22.292, -97.903],
      [22.284, -97.893],
      [22.275, -97.884],
      [22.265, -97.873],
      [22.254, -97.864],
      [22.2458, -97.858],
    ],
  },
  {
    nombre: "Madero - Tampico",
    color: "#f97316",
    puntos: [
      [22.2475, -97.836],
      [22.25, -97.845],
      [22.2515, -97.853],
      [22.2485, -97.858],
      [22.2458, -97.858],
    ],
  },
  {
    nombre: "Altamira - Tampico",
    color: "#0891b2",
    puntos: [
      [22.3922, -97.938],
      [22.36, -97.921],
      [22.328, -97.905],
      [22.295, -97.887],
      [22.265, -97.87],
      [22.2458, -97.858],
    ],
  },
];

function BotonMiUbicacion({
  miUbicacion,
}: {
  miUbicacion: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  const centrarMapa = () => {
    if (miUbicacion) {
      map.setView([miUbicacion.lat, miUbicacion.lng], 16);
    }
  };

  return (
    <button
      onClick={centrarMapa}
      style={{
        position: "absolute",
        right: "18px",
        bottom: "30px",
        zIndex: 1000,
        width: "58px",
        height: "58px",
        borderRadius: "50%",
        border: "none",
        background: "#2563eb",
        color: "white",
        fontSize: "26px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
        cursor: "pointer",
      }}
    >
      📍
    </button>
  );
}

function MarkerAnimado({ bus }: { bus: any }) {
  const [posicion, setPosicion] = useState<[number, number]>([
    bus.lat,
    bus.lng,
  ]);

  useEffect(() => {
    const inicio = posicion;
    const fin: [number, number] = [bus.lat, bus.lng];

    let frame = 0;
    const totalFrames = 35;

    const animar = () => {
      frame++;
      const progreso = frame / totalFrames;

      const lat = inicio[0] + (fin[0] - inicio[0]) * progreso;
      const lng = inicio[1] + (fin[1] - inicio[1]) * progreso;

      setPosicion([lat, lng]);

      if (frame < totalFrames) {
        requestAnimationFrame(animar);
      }
    };

    requestAnimationFrame(animar);
  }, [bus.lat, bus.lng]);

  return (
    <Marker position={posicion} icon={busIcon}>
      <Popup>
        🚌 {bus.nombre}
        <br />
        Tipo: {bus.tipoUsuario || "Usuario"}
      </Popup>
    </Marker>
  );
}

export default function Mapa() {
  const [autobuses, setAutobuses] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  const [miUbicacion, setMiUbicacion] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    const guardado = localStorage.getItem("darkMode");
    if (guardado === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMiUbicacion({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => console.log(error)
    );
  }, []);

  useEffect(() => {
    const q = query(collection(db, "autobuses"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ahora = Date.now();

      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      const activos = docs.filter((bus) => {
        if (!bus.fecha?.seconds) return false;
        const tiempoBus = bus.fecha.seconds * 1000;
        return ahora - tiempoBus < 30 * 60 * 1000;
      });

      setAutobuses(activos);
    });

    return () => unsubscribe();
  }, []);

  const choferes = autobuses.filter((bus) => bus.tipoUsuario === "chofer");
  const pasajeros = autobuses.filter((bus) => bus.tipoUsuario === "pasajero");

  const ultimoReporte = autobuses
    .filter((bus) => bus.fecha?.seconds)
    .sort((a, b) => b.fecha.seconds - a.fecha.seconds)[0];

  let ultimoTexto = "Sin reportes";

  if (ultimoReporte?.fecha?.seconds) {
    const minutos = Math.floor(
      (Date.now() - ultimoReporte.fecha.seconds * 1000) / 1000 / 60
    );

    if (minutos <= 0) ultimoTexto = "Hace segundos";
    else if (minutos === 1) ultimoTexto = "Hace 1 minuto";
    else ultimoTexto = `Hace ${minutos} minutos`;
  }

  const ultimosPorRuta: Record<string, any> = {};

  autobuses.forEach((bus) => {
    if (!ultimosPorRuta[bus.nombre]) {
      ultimosPorRuta[bus.nombre] = bus;
    } else {
      const actual = ultimosPorRuta[bus.nombre].fecha.seconds;
      if (bus.fecha.seconds > actual) {
        ultimosPorRuta[bus.nombre] = bus;
      }
    }
  });

  const busesMapa = Object.values(ultimosPorRuta);

  return (
    <div
      style={{
        position: "relative",
        height: "540px",
        width: "100%",
        background: darkMode ? "#020617" : "white",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "14px",
          left: "14px",
          right: "14px",
          zIndex: 1000,
          background: darkMode ? "rgba(15,23,42,0.94)" : "rgba(255,255,255,0.96)",
          borderRadius: "22px",
          padding: "14px",
          boxShadow: "0 10px 28px rgba(0,0,0,0.30)",
          color: darkMode ? "white" : "#111827",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>
              🚍 Panel en vivo
            </div>
            <div style={{ fontSize: "13px", color: darkMode ? "#cbd5e1" : "#64748b" }}>
              Último reporte: {ultimoTexto}
            </div>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: darkMode ? "#facc15" : "#111827",
              color: darkMode ? "#111827" : "white",
              border: "none",
              borderRadius: "14px",
              padding: "10px 12px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "8px",
            marginTop: "12px",
          }}
        >
          <div style={boxStyle(darkMode)}>
            🟢
            <br />
            <b>{autobuses.length}</b>
            <br />
            activos
          </div>

          <div style={boxStyle(darkMode)}>
            🚍
            <br />
            <b>{choferes.length}</b>
            <br />
            choferes
          </div>

          <div style={boxStyle(darkMode)}>
            🧍
            <br />
            <b>{pasajeros.length}</b>
            <br />
            pasajeros
          </div>
        </div>
      </div>

      <MapContainer
        center={[22.2553, -97.8686]}
        zoom={12}
        style={{
          height: "540px",
          width: "100%",
          filter: darkMode ? "brightness(0.75)" : "none",
        }}
      >
        <TileLayer
          attribution="OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <BotonMiUbicacion miUbicacion={miUbicacion} />

        {rutasMapa.map((ruta) => (
          <Polyline
            key={ruta.nombre}
            positions={ruta.puntos as any}
            pathOptions={{
              color: ruta.color,
              weight: 5,
              opacity: 0.85,
            }}
          />
        ))}

        {miUbicacion && (
          <Marker position={[miUbicacion.lat, miUbicacion.lng]} icon={userIcon}>
            <Popup>📍 Tú estás aquí</Popup>
          </Marker>
        )}

        {busesMapa.map((bus: any) => (
          <MarkerAnimado key={bus.id} bus={bus} />
        ))}
      </MapContainer>
    </div>
  );
}

function boxStyle(darkMode: boolean) {
  return {
    textAlign: "center" as const,
    background: darkMode ? "#1e293b" : "#f1f5f9",
    borderRadius: "16px",
    padding: "10px 6px",
    fontSize: "12px",
    lineHeight: "18px",
  };
}