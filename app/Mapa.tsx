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

import {
  collection,
  onSnapshot,
  query,
} from "firebase/firestore";

import { db } from "./firebase";

const busIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/61/61231.png",
  iconSize: [38, 38],
});

const userIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconSize: [35, 35],
});

const rutaHaciendas = [
  [22.2786, -97.8771],
  [22.2765, -97.8732],
  [22.2734, -97.8695],
  [22.2691, -97.8650],
  [22.2650, -97.8610],
  [22.2600, -97.8570],
  [22.2550, -97.8530],
];

function MoverMapa({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
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

      const ultimosPorRuta: Record<string, any> = {};

      activos.forEach((bus) => {
        if (!ultimosPorRuta[bus.nombre]) {
          ultimosPorRuta[bus.nombre] = bus;
        } else {
          const actual =
            ultimosPorRuta[bus.nombre].fecha.seconds;

          if (bus.fecha.seconds > actual) {
            ultimosPorRuta[bus.nombre] = bus;
          }
        }
      });

      setAutobuses(Object.values(ultimosPorRuta));
    });

    return () => unsubscribe();
  }, []);

  const haciendasActivo = autobuses.some((bus) =>
    bus.nombre?.toLowerCase().includes("haciendas")
  );

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100%",
      }}
    >
      {/* TARJETA SUPERIOR */}
      <div
        style={{
          position: "absolute",
          top: "15px",
          left: "15px",
          right: "15px",
          zIndex: 1000,
          background: "white",
          borderRadius: "18px",
          padding: "14px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.25)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          🚌 Rutas Tampico MAFA
        </div>

        <div
          style={{
            fontSize: "14px",
            marginTop: "5px",
            color: "#666",
          }}
        >
          Transporte en tiempo real
        </div>

        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            borderRadius: "12px",
            background: haciendasActivo
              ? "#e8f8ee"
              : "#f2f2f2",
            border: haciendasActivo
              ? "1px solid #22c55e"
              : "1px solid #ccc",
          }}
        >
          <strong>
            Haciendas por Av. Hidalgo
          </strong>

          <br />

          <span
            style={{
              color: haciendasActivo
                ? "#16a34a"
                : "#777",
              fontSize: "14px",
            }}
          >
            {haciendasActivo
              ? "🟢 Activa ahora"
              : "⚪ Sin reportes activos"}
          </span>
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

        {/* MOVER MAPA */}
        {miUbicacion && (
          <MoverMapa
            lat={miUbicacion.lat}
            lng={miUbicacion.lng}
          />
        )}

        {/* LINEA HACIENDAS */}
        <Polyline
          positions={rutaHaciendas as any}
          pathOptions={{
            color: "blue",
            weight: 6,
          }}
        />

        {/* MI UBICACION */}
        {miUbicacion && (
          <Marker
            position={[
              miUbicacion.lat,
              miUbicacion.lng,
            ]}
            icon={userIcon}
          >
            <Popup>📍 Tú estás aquí</Popup>
          </Marker>
        )}

        {/* BUSES */}
        {autobuses.map((bus: any) => (
          <Marker
            key={bus.id}
            position={[bus.lat, bus.lng]}
            icon={busIcon}
          >
            <Popup>
              🚌 {bus.nombre}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}