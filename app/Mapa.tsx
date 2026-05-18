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

function MoverMapa({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);

  return null;
}

export default function Mapa({
  rutaSeleccionada,
}: {
  rutaSeleccionada?: string;
}) {
  const [autobuses, setAutobuses] = useState<any[]>([]);
  const [miUbicacion, setMiUbicacion] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

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
        height: "100vh",
        width: "100%",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* PANEL PREMIUM */}
      <div
        style={{
          position: "absolute",
          top: "15px",
          left: "15px",
          right: "15px",
          zIndex: 1000,
          background: "linear-gradient(135deg, #ffffff, #f3f6ff)",
          borderRadius: "22px",
          padding: "16px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
          border: "1px solid rgba(255,255,255,0.8)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "21px",
                fontWeight: "bold",
                color: "#111827",
              }}
            >
              🚌 Rutas Tampico MAFA
            </div>

            <div
              style={{
                fontSize: "14px",
                marginTop: "4px",
                color: "#6b7280",
              }}
            >
              Transporte en tiempo real
            </div>
          </div>

          <div
            style={{
              background: "#2563eb",
              color: "white",
              padding: "10px 14px",
              borderRadius: "16px",
              textAlign: "center",
              minWidth: "70px",
              boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: "bold" }}>
              {autobuses.length}
            </div>
            <div style={{ fontSize: "11px" }}>activos</div>
          </div>
        </div>

        <div
          style={{
            marginTop: "14px",
            padding: "13px",
            borderRadius: "16px",
            background: haciendasActivo ? "#ecfdf5" : "#f3f4f6",
            border: haciendasActivo
              ? "1px solid #22c55e"
              : "1px solid #d1d5db",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              color: "#111827",
              fontSize: "15px",
            }}
          >
            Haciendas por Av. Hidalgo
          </div>

          <div
            style={{
              marginTop: "4px",
              color: haciendasActivo ? "#16a34a" : "#6b7280",
              fontSize: "14px",
            }}
          >
            {haciendasActivo
              ? `🟢 ${busesHaciendas.length} bus(es) reportando`
              : "⚪ Sin reportes activos"}
          </div>

          {rutaSeleccionada && (
            <div
              style={{
                marginTop: "6px",
                color: "#2563eb",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              Ruta seleccionada: {rutaSeleccionada}
            </div>
          )}
        </div>
      </div>

      <MapContainer
        center={[22.2553, -97.8686]}
        zoom={12}
        style={{
          height: "100vh",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {miUbicacion && (
          <MoverMapa lat={miUbicacion.lat} lng={miUbicacion.lng} />
        )}

        <Polyline
          positions={rutaHaciendas as any}
          pathOptions={{
            color: "#2563eb",
            weight: 6,
            opacity: 0.85,
          }}
        />

        {miUbicacion && (
          <Marker
            position={[miUbicacion.lat, miUbicacion.lng]}
            icon={userIcon}
          >
            <Popup>📍 Tú estás aquí</Popup>
          </Marker>
        )}

        {busesMapa.map((bus: any) => (
          <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={busIcon}>
            <Popup>🚌 {bus.nombre}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}