"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61231.png",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

export default function Mapa() {
  const [buses, setBuses] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "autobuses"), (snapshot) => {
      const ahora = Date.now();

      const activos = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((bus: any) => {
          if (typeof bus.lat !== "number") return false;
          if (typeof bus.lng !== "number") return false;

          if (!bus.fecha?.toDate) return true;

          const tiempo = bus.fecha.toDate().getTime();
          return ahora - tiempo < 30 * 60 * 1000;
        });

      setBuses(activos);
    });

    return () => unsub();
  }, []);

  return (
    <MapContainer
      center={[22.2553, -97.8686]}
      zoom={12}
      style={{
        height: "100%",
        width: "100%",
      }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {buses.map((bus: any) => (
        <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={busIcon}>
          <Popup>
            <b>{bus.nombre || "Ruta sin nombre"}</b>
            <br />
            Autobús reportado en tiempo real
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}