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
        height: "520px",
        width: "100%",
        background: darkMode ? "#020617" : "white",
      }}
    >
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{
          position: "absolute",
          top: "15px",
          right: "15px",
          zIndex: 1000,
          background: darkMode ? "#facc15" : "#111827",
          color: darkMode ? "#111827" : "white",
          border: "none",
          borderRadius: "14px",
          padding: "10px 12px",
          fontSize: "18px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
          cursor: "pointer",
        }}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      <MapContainer
        center={[22.2553, -97.8686]}
        zoom={12}
        style={{
          height: "520px",
          width: "100%",
          filter: darkMode ? "brightness(0.75)" : "none",
        }}
      >
        <TileLayer
          attribution="OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <BotonMiUbicacion miUbicacion={miUbicacion} />

        <Polyline
          positions={rutaHaciendas as any}
          pathOptions={{
            color: darkMode ? "#60a5fa" : "#2563eb",
            weight: 6,
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
          <MarkerAnimado key={bus.id} bus={bus} />
        ))}
      </MapContainer>
    </div>
  );
}