"use client";

import { useEffect, useMemo, useState } from "react";
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

import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

type Bus = {
  id: string;
  nombre?: string;
  ruta?: string;
  lat: number;
  lng: number;
  fecha?: any;
};

const busIcon = new L.DivIcon({
  html: `
    <div style="
      width:22px;
      height:22px;
      background:white;
      border:4px solid #22c55e;
      border-radius:999px;
      box-shadow:0 4px 12px rgba(0,0,0,.45);
    "></div>
  `,
  className: "",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -12],
});

const miUbicacionIcon = new L.DivIcon({
  html: `<div style="
    width:18px;
    height:18px;
    background:#2563eb;
    border:3px solid white;
    border-radius:999px;
    box-shadow:0 0 12px rgba(37,99,235,.8);
  "></div>`,
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const rutas = [
  {
    nombre: "Haciendas",
    color: "#22c55e",
    puntos: [
      [22.2553, -97.8686],
      [22.2605, -97.8601],
      [22.266, -97.852],
      [22.273, -97.845],
    ],
  },
  {
    nombre: "Niños Héroes",
    color: "#3b82f6",
    puntos: [
      [22.243, -97.865],
      [22.2505, -97.858],
      [22.257, -97.849],
      [22.265, -97.841],
    ],
  },
  {
    nombre: "Circuito Norte",
    color: "#f97316",
    puntos: [
      [22.275, -97.895],
      [22.282, -97.881],
      [22.287, -97.865],
      [22.292, -97.849],
    ],
  },
  {
    nombre: "Tampico - Madero",
    color: "#a855f7",
    puntos: [
      [22.2553, -97.8686],
      [22.244, -97.849],
      [22.236, -97.836],
      [22.225, -97.821],
    ],
  },
  {
    nombre: "Altamira",
    color: "#ef4444",
    puntos: [
      [22.2553, -97.8686],
      [22.295, -97.875],
      [22.335, -97.884],
      [22.392, -97.92],
    ],
  },
  {
    nombre: "Centro Tampico",
    color: "#14b8a6",
    puntos: [
      [22.216, -97.858],
      [22.224, -97.862],
      [22.234, -97.866],
      [22.245, -97.87],
    ],
  },
  {
    nombre: "Borreguera",
    color: "#eab308",
    puntos: [
      [22.255, -97.868],
      [22.264, -97.878],
      [22.274, -97.888],
      [22.283, -97.899],
    ],
  },
  {
    nombre: "Tancol",
    color: "#06b6d4",
    puntos: [
      [22.255, -97.868],
      [22.27, -97.86],
      [22.285, -97.852],
      [22.302, -97.845],
    ],
  },
];

function AjustarMapa({ ubicacion }: { ubicacion: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (ubicacion) {
      map.flyTo(ubicacion, 15, { duration: 1 });
    }
  }, [ubicacion, map]);

  return null;
}

export default function Mapa() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [ubicacion, setUbicacion] = useState<[number, number] | null>(null);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<string>("Todas");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "autobuses"), (snapshot) => {
      const data: Bus[] = snapshot.docs
        .map((doc) => {
          const d = doc.data() as any;
          return {
            id: doc.id,
            nombre: d.nombre || d.ruta || "Autobús",
            ruta: d.ruta || d.nombre || "Sin ruta",
            lat: Number(d.lat),
            lng: Number(d.lng),
            fecha: d.fecha,
          };
        })
        .filter((b) => !isNaN(b.lat) && !isNaN(b.lng));

      setBuses(data);
    });

    return () => unsub();
  }, []);

  const busesFiltrados = useMemo(() => {
    if (rutaSeleccionada === "Todas") return buses;
    return buses.filter(
      (b) =>
        b.nombre?.toLowerCase().includes(rutaSeleccionada.toLowerCase()) ||
        b.ruta?.toLowerCase().includes(rutaSeleccionada.toLowerCase())
    );
  }, [buses, rutaSeleccionada]);

  const obtenerMiUbicacion = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no permite ubicación.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        alert("No se pudo obtener tu ubicación.");
      }
    );
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          right: 12,
          zIndex: 1000,
          background: "rgba(15,23,42,.92)",
          color: "white",
          borderRadius: 18,
          padding: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,.35)",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800 }}>Rutas Tampico</div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>
          Autobuses activos: {busesFiltrados.length}
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            marginTop: 10,
            paddingBottom: 4,
          }}
        >
          <button
            onClick={() => setRutaSeleccionada("Todas")}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "none",
              background: rutaSeleccionada === "Todas" ? "#22c55e" : "white",
              color: rutaSeleccionada === "Todas" ? "white" : "#111827",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            Todas
          </button>

          {rutas.map((ruta) => (
            <button
              key={ruta.nombre}
              onClick={() => setRutaSeleccionada(ruta.nombre)}
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                border: "none",
                background:
                  rutaSeleccionada === ruta.nombre ? ruta.color : "white",
                color: rutaSeleccionada === ruta.nombre ? "white" : "#111827",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {ruta.nombre}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={obtenerMiUbicacion}
        style={{
          position: "absolute",
          right: 14,
          bottom: 24,
          zIndex: 1000,
          background: "#2563eb",
          color: "white",
          border: "none",
          padding: "12px 16px",
          borderRadius: 999,
          fontWeight: 800,
          boxShadow: "0 8px 20px rgba(0,0,0,.35)",
        }}
      >
        Mi ubicación
      </button>

      <MapContainer
        center={[22.2553, -97.8686]}
        zoom={12}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        <AjustarMapa ubicacion={ubicacion} />

        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {rutas.map((ruta) => (
          <Polyline
            key={ruta.nombre}
            positions={ruta.puntos as [number, number][]}
            pathOptions={{
              color: ruta.color,
              weight: 5,
              opacity:
                rutaSeleccionada === "Todas" ||
                rutaSeleccionada === ruta.nombre
                  ? 0.85
                  : 0.15,
            }}
          />
        ))}

        {ubicacion && (
          <Marker position={ubicacion} icon={miUbicacionIcon}>
            <Popup>Estás aquí</Popup>
          </Marker>
        )}

        {busesFiltrados.map((bus) => (
          <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={busIcon}>
            <Popup>
              <b>{bus.nombre}</b>
              <br />
              Ruta: {bus.ruta}
              <br />
              Ubicación reportada en vivo
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}