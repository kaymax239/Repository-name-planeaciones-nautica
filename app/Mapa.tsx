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
  html: `
    <div style="
      width: 42px;
      height: 42px;
      border-radius: 999px;
      background: linear-gradient(135deg, #16a34a, #22c55e);
      border: 3px solid white;
      box-shadow: 0 10px 30px rgba(0,0,0,.4);
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:21px;
    ">🚌</div>
  `,
  className: "",
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -20],
});

const haciendasRoute: [number, number][] = [
  [22.2553, -97.8686],
  [22.2595, -97.8652],
  [22.264, -97.861],
  [22.2705, -97.856],
  [22.2765, -97.851],
];

const ninosHeroesRoute: [number, number][] = [
  [22.241, -97.8705],
  [22.247, -97.866],
  [22.253, -97.862],
  [22.2605, -97.858],
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
  const eta = Math.max(2, Math.round(base + 3));
  return `${eta} min`;
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

      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      } else {
        lastPos.current = end;
      }
    };

    animate();
  }, [bus.lat, bus.lng]);

  return (
    <Marker
      ref={markerRef as any}
      position={[bus.lat, bus.lng]}
      icon={busIcon}
    >
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

  const irAMiUbicacion = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 16, {
          animate: true,
          duration: 1.5,
        });
      },
      () => {
        alert("No se pudo obtener tu ubicación.");
      }
    );
  };

  return (
    <button
      onClick={irAMiUbicacion}
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

export default function Mapa() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [followLive, setFollowLive] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

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

      const diffMin = (Date.now() - date.getTime()) / 60000;
      return diffMin <= 30;
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

  const etiquetas = busesActivos.map((bus) => ({
    id: bus.id,
    nombre: bus.nombre || "Ruta",
    eta: calculateEta(bus),
    tiempo: getMinutesAgo(bus.fecha),
  }));

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
          background: darkMode
            ? "rgba(2,6,23,.94)"
            : "rgba(255,255,255,.94)",
          color: darkMode ? "white" : "#111827",
          borderRadius: 22,
          padding: 16,
          boxShadow: "0 15px 35px rgba(0,0,0,.35)",
          border: darkMode
            ? "1px solid rgba(255,255,255,.12)"
            : "1px solid rgba(0,0,0,.08)",
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
          left: 12,
          right: 12,
          zIndex: 999,
          display: "flex",
          gap: 10,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {etiquetas.map((e) => (
          <div
            key={e.id}
            style={{
              minWidth: 170,
              background: darkMode
                ? "rgba(15,23,42,.94)"
                : "rgba(255,255,255,.95)",
              color: darkMode ? "white" : "#111827",
              borderRadius: 18,
              padding: "10px 14px",
              boxShadow: "0 8px 20px rgba(0,0,0,.22)",
              fontSize: 13,
              fontWeight: 700,
              backdropFilter: "blur(10px)",
              border: darkMode
                ? "1px solid rgba(255,255,255,.12)"
                : "1px solid rgba(0,0,0,.06)",
            }}
          >
            🚌 {e.nombre}
            <br />
            ⏱ ETA {e.eta}
            <br />
            🟢 {e.tiempo}
          </div>
        ))}
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

        <Polyline
          positions={haciendasRoute}
          pathOptions={{
            color: darkMode ? "#22c55e" : "#16a34a",
            weight: 6,
            opacity: 0.9,
          }}
        />

        <Polyline
          positions={ninosHeroesRoute}
          pathOptions={{
            color: darkMode ? "#60a5fa" : "#2563eb",
            weight: 6,
            opacity: 0.9,
          }}
        />

        {busesActivos.map((bus) => (
          <SmoothMarker key={bus.id} bus={bus} />
        ))}

        {followLive && <AutoFollowBus bus={busMasReciente} />}

        <MiUbicacionButton />
      </MapContainer>
    </div>
  );
}