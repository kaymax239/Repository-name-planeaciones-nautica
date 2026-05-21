"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { collection, onSnapshot } from "firebase/firestore";

import { db } from "./firebase";

const busIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/61/61231.png",

  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

function CenterButton({
  userLocation,
}: {
  userLocation: [number, number] | null;
}) {
  const map = useMap();

  return (
    <button
      onClick={() => {
        if (userLocation) {
          map.flyTo(userLocation, 15);
        }
      }}
      style={{
        position: "absolute",
        right: "15px",
        bottom: "20px",
        zIndex: 9999,
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "50%",
        width: "55px",
        height: "55px",
        fontSize: "24px",
        cursor: "pointer",
        boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
      }}
    >
      📍
    </button>
  );
}

export default function Mapa() {
  const [buses, setBuses] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<
    [number, number] | null
  >(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation([
        pos.coords.latitude,
        pos.coords.longitude,
      ]);
    });

    const unsub = onSnapshot(
      collection(db, "autobuses"),
      (snapshot) => {
        const ahora = Date.now();

        const activos = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((bus: any) => {
            if (!bus.fecha?.toDate) return true;

            const tiempo = bus.fecha
              .toDate()
              .getTime();

            return (
              ahora - tiempo <
              30 * 60 * 1000
            );
          });

        setBuses(activos);
      }
    );

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
        <Marker
          key={bus.id}
          position={[bus.lat, bus.lng]}
          icon={busIcon}
        >
          <Popup>
            <b>{bus.nombre}</b>

            <br />

            Autobús reportado en tiempo real
          </Popup>
        </Marker>
      ))}

      <CenterButton userLocation={userLocation} />
    </MapContainer>
  );
}