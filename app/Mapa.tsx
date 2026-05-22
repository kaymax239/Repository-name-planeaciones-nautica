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
      width: 38px;
      height: 38px;
      border-radius: 999px;
      background: linear-gradient(135deg, #16a34a, #22c55e);
      border: 3px solid white;
      box-shadow: 0 8px 25px rgba(0,0,0,.35);
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:20px;
    ">
      🚌
    </div>
  `,
  className: "",
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -18],
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

function getMinutesAgo(fecha: any) {
  if (!fecha) return "ahorita";

  let date: Date;

  if (fecha?.toDate) {
    date = fecha.toDate();
  } else if (fecha?.seconds) {
    date = new Date(fecha.seconds * 1000);
  } else {
    date = new Date(fecha);
  }

  const diff = Math.floor((Date.now() - date.getTime()) / 60000);

  if (diff < 1) return "ahorita";
  if (diff === 1) return "hace 1 min";

  return `hace ${diff} min`;
}

function calculateEta(bus: Bus) {
  const randomEta = Math.max(
    2,
    Math.min(12, Math.round(5 + Math.random() * 5))
  );

  return `${randomEta} min`;
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

    const totalFrames = 30;

    const animate = () => {
      frame++;

      const progress = frame / totalFrames;

      const lat = start[0] + (end[0] - start[0]) * progress;

      const lng = start[1] + (end[1] - start[1]) * progress;

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
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 16);
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
        fontWeight: 700,
        boxShadow: "0 10px 25px rgba(0,0,0,.35)",
      }}
    >
      📍 Mi ubicación
    </button>
  );
}

export default function Mapa() {
  const [buses, setBuses] = useState<Bus[]>([]);

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
      if (!bus.fecha) return true;

      let date: Date;

      if (bus.fecha?.toDate) {
        date = bus.fecha.toDate();
      } else if (bus.fecha?.seconds) {
        date = new Date(bus.fecha.seconds * 1000);
      } else {
        date = new Date(bus.fecha);
      }

      const diffMin = (Date.now() - date.getTime()) / 60000;

      return diffMin <= 30;
    });
  }, [buses]);

  const etiquetas = busesActivos.map((bus) => ({
    id: bus.id,
    nombre: bus.nombre || "Ruta",
    eta: calculateEta(bus),
    tiempo: getMinutesAgo(bus.fecha),
  }));

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          zIndex: 1000,
          background: "rgba(17,24,39,.92)",
          color: "white",
          borderRadius: 22,
          padding: 16,
          boxShadow: "0 15px 35px rgba(0,0,0,.35)",
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
          }}
        >
          Rutas Tampico MAFA
        </div>

        <div
          style={{
            fontSize: 14,
            opacity: 0.85,
          }}
        >
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
              background: "rgba(255,255,255,.95)",
              borderRadius: 18,
              padding: "10px 14px",
              boxShadow: "0 8px 20px rgba(0,0,0,.15)",
              fontSize: 13,
              fontWeight: 700,
              backdropFilter: "blur(10px)",
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

      <MapContainer
        center={[22.2553, -97.8686]}
        zoom={13}
        style={{
          width: "100%",
          height: "100%",
        }}
        zoomControl={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline
          positions={haciendasRoute}
          pathOptions={{
            color: "#22c55e",
            weight: 6,
            opacity: 0.8,
          }}
        />

        <Polyline
          positions={ninosHeroesRoute}
          pathOptions={{
            color: "#3b82f6",
            weight: 6,
            opacity: 0.8,
          }}
        />

        {busesActivos.map((bus) => (
          <SmoothMarker key={bus.id} bus={bus} />
        ))}

        <MiUbicacionButton />
      </MapContainer>
    </div>
  );
}