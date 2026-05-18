"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";

import {
  collection,
  onSnapshot,
  query,
} from "firebase/firestore";

import { db } from "./firebase";

import "leaflet/dist/leaflet.css";

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61231.png",
  iconSize: [38, 38],
});

export default function Mapa() {
  const [reportes, setReportes] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "autobuses"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datos: any[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();

        if (data.estado !== "Seguimiento terminado") {
          datos.push({
            id: doc.id,
            ...data,
          });
        }
      });

      setReportes(datos);
    });

    return () => unsubscribe();
  }, []);

  return (
    <MapContainer
      center={[22.2553, -97.8686]}
      zoom={11}
      style={{
        height: "450px",
        width: "100%",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {reportes.map((reporte: any) => (
        <Marker
          key={reporte.id}
          position={[reporte.lat, reporte.lng]}
          icon={busIcon}
        >
          <Popup>
            <div style={{ minWidth: "220px" }}>
              <h3>
                🚌 <b>{reporte.nombre}</b>
              </h3>

              <p>
                Estado:
                {" "}
                {reporte.estado}
              </p>

              <p>
                Ocupación:
                {" "}
                <b>{reporte.ocupacion || "Sin dato"}</b>
              </p>

              <p>
                Lat:
                {" "}
                {reporte.lat}
              </p>

              <p>
                Lng:
                {" "}
                {reporte.lng}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}