"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

const iconoBus = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61231.png",
  iconSize: [40, 40],
});

export default function Mapa() {
  const [reportes, setReportes] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "autobuses"), (snapshot) => {
      const datos = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((reporte: any) => reporte.lat && reporte.lng);

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
        borderRadius: "15px",
      }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {reportes.map((reporte: any) => (
        <Marker
          key={reporte.id}
          position={[reporte.lat, reporte.lng]}
          icon={iconoBus}
        >
          <Popup>
            🚌 {reporte.nombre}
            <br />
            Estado: {reporte.estado || "Reporte"}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}