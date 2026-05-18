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

const rutaHaciendas = [
  [22.2786, -97.8771],
  [22.2765, -97.8732],
  [22.2734, -97.8695],
  [22.2691, -97.865],
  [22.265, -97.861],
  [22.26, -97.857],
  [22.255, -97.853],
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

function MarkerAnimado({
  bus,
}: {
  bus: any;
}) {
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

      const lat =
        inicio[0] + (fin[0] - inicio[0]) * progreso;

      const lng =
        inicio[1] + (fin[1] - inicio[1]) * progreso;

      setPosicion([lat, lng]);

      if (frame < totalFrames) {
        requestAnimationFrame(animar);
      }
    };

    requestAnimationFrame(animar);
  }, [bus.lat, bus.lng]);

  return (
    <Marker position={posicion} icon={busIcon}>
      <Popup>🚌 {bus.nombre}</Popup>
    </Marker>
  );
}

export default function Mapa() {
  const [autobuses, setAutobuses] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const [miUbicacion, setMiUbicacion] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    const guardado = localStorage.getItem("darkMode");

    if (guardado === "true") {
      setDarkMode(true);
    }
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
      (error) => {
        console.log(error);
      }
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

  const busesHaciendas = autobuses.filter((bus) =>
    bus.nombre?.toLowerCase().includes("haciendas")
  );

  const haciendasActivo = busesHaciendas.length > 0;

  const mostrarHaciendas =
    busqueda.trim() === "" ||
    "haciendas por av. hidalgo"
      .toLowerCase()
      .includes(busqueda.toLowerCase());

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

  const ultimoBusHaciendas = busesHaciendas.sort(
    (a, b) => b.fecha.seconds - a.fecha.seconds
  )[0];

  let tiempoTexto = "Sin reportes";

  if (ultimoBusHaciendas?.fecha?.seconds) {
    const ahora = Date.now();
    const tiempoBus =
      ultimoBusHaciendas.fecha.seconds * 1000;

    const minutos = Math.floor(
      (ahora - tiempoBus) / 1000 / 60
    );

    if (minutos <= 0) {
      tiempoTexto = "Hace unos segundos";
    } else if (minutos === 1) {
      tiempoTexto = "Hace 1 minuto";
    } else {
      tiempoTexto = `Hace ${minutos} minutos`;
    }
  }

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100%",
        fontFamily: "Arial, sans-serif",
        background: darkMode ? "#020617" : "white",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "15px",
          left: "15px",
          right: "15px",
          zIndex: 1000,
          background: darkMode
            ? "linear-gradient(135deg, #020617, #111827)"
            : "linear-gradient(135deg, #ffffff, #f3f6ff)",
          borderRadius: "22px",
          padding: "16px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "21px",
                fontWeight: "bold",
                color: darkMode ? "#f8fafc" : "#111827",
              }}
            >
              🚌 Rutas Tampico MAFA
            </div>

            <div
              style={{
                fontSize: "14px",
                marginTop: "4px",
                color: darkMode ? "#cbd5e1" : "#6b7280",
              }}
            >
              Reportes ciudadanos en tiempo real
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

        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar ruta..."
          style={{
            marginTop: "14px",
            width: "100%",
            padding: "12px",
            borderRadius: "14px",
            border: "none",
            fontSize: "15px",
            outline: "none",
            boxSizing: "border-box",
            background: darkMode ? "#0f172a" : "white",
            color: darkMode ? "#f8fafc" : "#111827",
          }}
        />

        {mostrarHaciendas && (
          <div
            style={{
              marginTop: "14px",
              padding: "14px",
              borderRadius: "16px",
              background: haciendasActivo
                ? darkMode
                  ? "#064e3b"
                  : "#ecfdf5"
                : darkMode
                ? "#1e293b"
                : "#f3f4f6",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                color: darkMode ? "#f8fafc" : "#111827",
                fontSize: "16px",
              }}
            >
              Haciendas por Av. Hidalgo
            </div>

            <div
              style={{
                marginTop: "5px",
                fontSize: "14px",
                color: haciendasActivo
                  ? "#22c55e"
                  : "#6b7280",
              }}
            >
              {haciendasActivo
                ? `🟢 ${busesHaciendas.length} bus(es) activos`
                : "⚪ Sin buses activos"}
            </div>

            <div
              style={{
                marginTop: "6px",
                fontSize: "13px",
                color: darkMode ? "#cbd5e1" : "#475569",
              }}
            >
              Último reporte: {tiempoTexto}
            </div>
          </div>
        )}
      </div>

      <MapContainer
        center={[22.2553, -97.8686]}
        zoom={12}
        style={{
          height: "100vh",
          width: "100%",
          filter: darkMode ? "brightness(0.75)" : "none",
        }}
      >
        <TileLayer
          attribution="OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <BotonMiUbicacion miUbicacion={miUbicacion} />

        {mostrarHaciendas && (
          <Polyline
            positions={rutaHaciendas as any}
            pathOptions={{
              color: darkMode ? "#60a5fa" : "#2563eb",
              weight: 6,
            }}
          />
        )}

        {miUbicacion && (
          <Marker
            position={[miUbicacion.lat, miUbicacion.lng]}
            icon={userIcon}
          >
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