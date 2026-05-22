"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  html: `<div style="width:42px;height:42px;border-radius:999px;background:linear-gradient(135deg,#16a34a,#22c55e);border:3px solid white;box-shadow:0 10px 30px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:21px;">🚌</div>`,
  className: "",
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -20],
});

const rutas = [
  {
    id: "haciendas",
    nombre: "🏡 Haciendas por Av. Hidalgo",
    color: "#22c55e",
    centro: [22.264, -97.861] as [number, number],
    puntos: [
      [22.2553, -97.8686],
      [22.2595, -97.8652],
      [22.264, -97.861],
      [22.2705, -97.856],
      [22.2765, -97.851],
    ] as [number, number][],
  },
  {
    id: "ninos",
    nombre: "🛣 Ruta Niños Héroes",
    color: "#60a5fa",
    centro: [22.253, -97.862] as [number, number],
    puntos: [
      [22.241, -97.8705],
      [22.247, -97.866],
      [22.253, -97.862],
      [22.2605, -97.858],
    ] as [number, number][],
  },
  {
    id: "aviacion",
    nombre: "✈️ Aviación Américas",
    color: "#f59e0b",
    centro: [22.269, -97.865] as [number, number],
    puntos: [
      [22.289, -97.873],
      [22.283, -97.87],
      [22.277, -97.867],
      [22.271, -97.864],
      [22.265, -97.861],
      [22.259, -97.858],
      [22.253, -97.855],
      [22.247, -97.852],
    ] as [number, number][],
  },
  {
    id: "madero",
    nombre: "🌊 Tampico Madero",
    color: "#a855f7",
    centro: [22.2505, -97.837] as [number, number],
    puntos: [
      [22.255, -97.868],
      [22.252, -97.858],
      [22.25, -97.848],
      [22.248, -97.838],
      [22.245, -97.828],
    ] as [number, number][],
  },
  {
    id: "altamira",
    nombre: "🏭 Tampico Altamira",
    color: "#ef4444",
    centro: [22.31, -97.89] as [number, number],
    puntos: [
      [22.255, -97.868],
      [22.275, -97.875],
      [22.295, -97.884],
      [22.315, -97.895],
      [22.335, -97.905],
    ] as [number, number][],
  },
];

function getDateFromFecha(fecha: any): Date | null {
  if (!fecha) return null;
  if (fecha?.toDate) return fecha.toDate();
  if (fecha?.seconds) return new Date(fecha.seconds * 1000);
  return new Date(fecha);
}

function getMinutesAgo(fecha: any) {
  const date = getDateFromFecha(fecha);
  if (!date) return "ahorita";
  const diff = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diff < 1) return "ahorita";
  if (diff === 1) return "hace 1 min";
  return `hace ${diff} min`;
}

function calculateEta(bus: Bus) {
  const base = Math.abs(bus.lat + bus.lng) % 8;
  return `${Math.max(2, Math.round(base + 3))} min`;
}

function SmoothMarker({ bus }: { bus: Bus }) {
  const markerRef = useRef<L.Marker | null>(null);
  const lastPos = useRef<[number, number]>([bus.lat, bus.lng]);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const start = lastPos.current;
    const end: [number, number] = [bus.lat, bus.lng];
    let frame = 0;
    const totalFrames = 45;

    const animate = () => {
      frame++;
      const progress = frame / totalFrames;
      const smoothProgress = 1 - Math.pow(1 - progress, 3);
      const lat = start[0] + (end[0] - start[0]) * smoothProgress;
      const lng = start[1] + (end[1] - start[1]) * smoothProgress;
      marker.setLatLng([lat, lng]);

      if (frame < totalFrames) requestAnimationFrame(animate);
      else lastPos.current = end;
    };

    animate();
  }, [bus.lat, bus.lng]);

  return (
    <Marker ref={markerRef as any} position={[bus.lat, bus.lng]} icon={busIcon}>
      <Popup>
        <div style={{ minWidth: 190 }}>
          <strong>{bus.nombre || bus.ruta || "Ruta Tampico"}</strong>
          <br />
          🟢 En movimiento
          <br />
          ⏱ ETA: {calculateEta(bus)}
          <br />
          📍 Último reporte: {getMinutesAgo(bus.fecha)}
        </div>
      </Popup>
    </Marker>
  );
}

function MiUbicacionButton() {
  const map = useMap();

  return (
    <button
      onClick={() => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            map.flyTo([pos.coords.latitude, pos.coords.longitude], 16, {
              animate: true,
              duration: 1.5,
            });
          },
          () => alert("No se pudo obtener tu ubicación.")
        );
      }}
      style={{
        position: "absolute",
        bottom: 24,
        right: 16,
        zIndex: 1000,
        border: "none",
        borderRadius: 999,
        padding: "12px 16px",
        background: "#111827",
        color: "white",
        fontWeight: 800,
        boxShadow: "0 10px 25px rgba(0,0,0,.35)",
      }}
    >
      📍 Mi ubicación
    </button>
  );
}

function AutoFollowBus({ bus }: { bus?: Bus }) {
  const map = useMap();

  useEffect(() => {
    if (!bus) return;
    map.flyTo([bus.lat, bus.lng], 15, {
      animate: true,
      duration: 1.8,
    });
  }, [bus?.id, bus?.lat, bus?.lng, map]);

  return null;
}

function FlyToRoute({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 13, {
      animate: true,
      duration: 1.2,
    });
  }, [center, map]);

  return null;
}

export default function Mapa() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [followLive, setFollowLive] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [rutaSeleccionada, setRutaSeleccionada] = useState("haciendas");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "autobuses"), (snapshot) => {
      const data: Bus[] = snapshot.docs
        .map((doc) => {
          const d = doc.data() as any;
          return {
            id: doc.id,
            nombre: d.nombre || d.ruta || "Ruta Tampico",
            ruta: d.ruta,
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

  const busesActivos = useMemo(() => {
    return buses.filter((bus) => {
      const date = getDateFromFecha(bus.fecha);
      if (!date) return true;
      return (Date.now() - date.getTime()) / 60000 <= 30;
    });
  }, [buses]);

  const busMasReciente = useMemo(() => {
    if (busesActivos.length === 0) return undefined;

    return [...busesActivos].sort((a, b) => {
      const da = getDateFromFecha(a.fecha)?.getTime() || 0;
      const db = getDateFromFecha(b.fecha)?.getTime() || 0;
      return db - da;
    })[0];
  }, [busesActivos]);

  const rutaActual = rutas.find((r) => r.id === rutaSeleccionada) || rutas[0];

  const mapUrl = darkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        background: darkMode ? "#020617" : "#f8fafc",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          zIndex: 1000,
          background: darkMode ? "rgba(2,6,23,.94)" : "rgba(255,255,255,.94)",
          color: darkMode ? "white" : "#111827",
          borderRadius: 22,
          padding: 16,
          boxShadow: "0 15px 35px rgba(0,0,0,.35)",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 900 }}>
          Rutas Tampico MAFA
        </div>
        <div style={{ fontSize: 14, opacity: 0.85 }}>
          🟢 {busesActivos.length} buses activos en vivo
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 95,
          left: 16,
          right: 16,
          zIndex: 1000,
          background: darkMode ? "rgba(15,23,42,.95)" : "rgba(255,255,255,.95)",
          borderRadius: 22,
          padding: 16,
          boxShadow: "0 10px 25px rgba(0,0,0,.25)",
        }}
      >
        <div
          style={{
            fontWeight: 900,
            marginBottom: 8,
            color: darkMode ? "white" : "#111827",
          }}
        >
          Escoge tu ruta
        </div>

        <select
          value={rutaSeleccionada}
          onChange={(e) => {
            setRutaSeleccionada(e.target.value);
            setFollowLive(false);
          }}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 14,
            border: "3px solid #2563eb",
            fontSize: 16,
            fontWeight: 800,
            background: darkMode ? "#0f172a" : "#dbeafe",
            color: darkMode ? "white" : "#1d4ed8",
          }}
        >
          {rutas.map((ruta) => (
            <option key={ruta.id} value={ruta.id}>
              {ruta.nombre}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{
          position: "absolute",
          bottom: 144,
          right: 16,
          zIndex: 1000,
          border: "none",
          borderRadius: 999,
          padding: "12px 16px",
          background: darkMode ? "#f8fafc" : "#020617",
          color: darkMode ? "#020617" : "white",
          fontWeight: 900,
          boxShadow: "0 10px 25px rgba(0,0,0,.35)",
        }}
      >
        {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
      </button>

      <button
        onClick={() => setFollowLive(!followLive)}
        style={{
          position: "absolute",
          bottom: 84,
          right: 16,
          zIndex: 1000,
          border: "none",
          borderRadius: 999,
          padding: "12px 16px",
          background: followLive ? "#16a34a" : "#6b7280",
          color: "white",
          fontWeight: 800,
          boxShadow: "0 10px 25px rgba(0,0,0,.35)",
        }}
      >
        {followLive ? "🟢 Siguiendo bus" : "⚪ Seguir bus"}
      </button>

      <MapContainer
        center={[22.2553, -97.8686]}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer attribution="&copy; OpenStreetMap & Carto" url={mapUrl} />

        {rutas.map((ruta) => (
          <Polyline
            key={ruta.id}
            positions={ruta.puntos}
            pathOptions={{
              color: ruta.id === rutaSeleccionada ? ruta.color : "#64748b",
              weight: ruta.id === rutaSeleccionada ? 8 : 4,
              opacity: ruta.id === rutaSeleccionada ? 1 : 0.35,
            }}
          />
        ))}

        <FlyToRoute center={rutaActual.centro} />

        {busesActivos.map((bus) => (
          <SmoothMarker key={bus.id} bus={bus} />
        ))}

        {followLive && <AutoFollowBus bus={busMasReciente} />}

        <MiUbicacionButton />
      </MapContainer>
    </div>
  );
}