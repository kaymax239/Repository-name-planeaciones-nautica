"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import {
  collection,
  onSnapshot,
  query,
} from "firebase/firestore";

import { db } from "../firebase";

const busIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/61/61231.png",
  iconSize: [38, 38],
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

export default function Mapa() {
  const [autobuses, setAutobuses] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "autobuses"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ahora = Date.now();

      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      // SOLO ACTIVOS
      const activos = docs.filter((bus) => {
        if (!bus.fecha?.seconds) return false;

        const tiempoBus = bus.fecha.seconds * 1000;

        return ahora - tiempoBus < 30 * 60 * 1000;
      });

      // SOLO EL ÚLTIMO POR RUTA
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

  return (
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

      {/* LINEA HACIENDAS */}
      <Polyline
        positions={rutaHaciendas as any}
        pathOptions={{
          color: "blue",
          weight: 6,
        }}
      />

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
  );
}