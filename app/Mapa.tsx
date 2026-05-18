"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

function crearIconoBus(color: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        background:${color};
        width:42px;
        height:42px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        border:3px solid white;
        box-shadow:0 3px 10px rgba(0,0,0,0.4);
        font-size:24px;
      ">
        🚌
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -22],
  });
}

function colorPorOcupacion(ocupacion: string) {
  if (ocupacion === "Vacío") return "#16a34a";
  if (ocupacion === "Medio") return "#facc15";
  if (ocupacion === "Lleno") return "#dc2626";
  return "#2563eb";
}

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

      {reportes.map((reporte: any) => {
        const color = colorPorOcupacion(reporte.ocupacion);

        return (
          <Marker
            key={`${reporte.id}-${reporte.lat}-${reporte.lng}-${reporte.ocupacion}`}
            position={[reporte.lat, reporte.lng]}
            icon={crearIconoBus(color)}
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
        );
      })}
    </MapContainer>
  );
}