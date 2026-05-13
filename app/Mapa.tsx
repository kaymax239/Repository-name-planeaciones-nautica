"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "./firebase";

export default function Mapa() {
  const [reportes, setReportes] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "autobuses"),
      (snapshot) => {
        const datos: any[] = [];

        snapshot.forEach((doc) => {
          datos.push(doc.data());
        });

        setReportes(datos);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <MapContainer
      center={[22.2553, -97.8686]}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {reportes.map((reporte, index) => (
        <Marker
          key={index}
          position={[reporte.lat, reporte.lng]}
        >
          <Popup>
            {reporte.nombre || reporte.ruta}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}