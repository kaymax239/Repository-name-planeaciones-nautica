"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

const iconoBus = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -40],
});

export default function Mapa() {
  const [reportes, setReportes] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "autobuses"), (snapshot) => {
      const ahora = Date.now();

      const datos = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((reporte: any) => {
          if (!reporte.lat || !reporte.lng) return false;
          if (reporte.estado === "Seguimiento terminado") return false;

          const fechaMs = reporte.fecha?.seconds
            ? reporte.fecha.seconds * 1000
            : 0;

          const minutos = (ahora - fechaMs) / 1000 / 60;

          return minutos <= 10;
        })
        .sort((a: any, b: any) => {
          const fechaA = a.fecha?.seconds || 0;
          const fechaB = b.fecha?.seconds || 0;
          return fechaB - fechaA;
        });

      setReportes(datos);
    });

    return () => unsubscribe();
  }, []);

  return (
    <MapContainer
      center={[22.2553, -97.8686]}
      zoom={12}
      scrollWheelZoom={true}
      style={{
        height: "500px",
        width: "100%",
        borderRadius: "20px",
      }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {reportes.map((reporte: any) => (
        <Marker
          key={`${reporte.id}-${reporte.lat}-${reporte.lng}`}
          position={[reporte.lat, reporte.lng]}
          icon={iconoBus}
        >
          <Popup>
            🚌 <b>{reporte.nombre}</b>
            <br />
            Estado: {reporte.estado || "Reporte"}
            <br />
            Ocupación: {reporte.ocupacion || "Sin dato"}
            <br />
            Última actualización:{" "}
            {reporte.fecha?.seconds
              ? new Date(reporte.fecha.seconds * 1000).toLocaleTimeString()
              : "Sin hora"}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}