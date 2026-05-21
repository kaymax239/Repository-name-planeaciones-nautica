"use client";

import { useEffect, useMemo, useState } from "react";
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

import { collection, onSnapshot } from "firebase/firestore";

import { db } from "./firebase";

const busIcon = new L.DivIcon({
  html: `
    <div style="
      background: white;
      width: 22px;
      height: 22px;
      border-radius: 999px;
      border: 3px solid #22c55e;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
    "></div>
  `,
  className: "",
  iconSize: [22, 22],
});

const haciendasRoute = [
  [22.286, -97.877],
  [22.284, -97.873],
  [22.281, -97.870],
  [22.276, -97.868],
  [22.271, -97.866],
  [22.266, -97.864],
  [22.260, -97.862],
  [22.2553, -97.8686],
];

function MyLocation() {
  const map = useMap();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      map.setView([pos.coords.latitude, pos.coords.longitude], 13);
    });
  }, [map]);

  return null;
}

function distanceKm(a: any, b: any) {
  if (!a || !b) return null;

  const R = 6371;

  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;

  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 *
      Math.cos(lat1) *
      Math.cos(lat2);

  return (
    R *
    2 *
    Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  );
}

export default function Mapa() {
  const [buses, setBuses] = useState<any[]>([]);
  const [userLocation, setUserLocation] =
    useState<[number, number] | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation([
        pos.coords.latitude,
        pos.coords.longitude,
      ]);
    });
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "autobuses"),
      (snapshot) => {
        const data: any[] = [];

        snapshot.forEach((doc) => {
          data.push(doc.data());
        });

        const rutasUnicas = new Map();

        data.forEach((bus) => {
          if (bus.nombre && bus.lat && bus.lng) {
            rutasUnicas.set(bus.nombre, bus);
          }
        });

        setBuses(Array.from(rutasUnicas.values()));
      }
    );

    return () => unsub();
  }, []);

  const busesConETA = useMemo(() => {
    return buses.map((bus) => {
      const km = distanceKm(userLocation, [
        bus.lat,
        bus.lng,
      ]);

      const eta = km
        ? Math.max(1, Math.round((km / 25) * 60))
        : null;

      return {
        ...bus,
        km,
        eta,
      };
    });
  }, [buses, userLocation]);

  return (
    <div className="h-screen w-full bg-[#020617] flex justify-center overflow-hidden">
      <div className="relative h-screen w-full max-w-md">

        <MapContainer
          center={[22.2553, -97.8686]}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full z-0"
        >
          <MyLocation />

          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Polyline
            positions={haciendasRoute as any}
            pathOptions={{
              color: "#2563eb",
              weight: 6,
            }}
          />

          {busesConETA.map((bus, index) => (
            <Marker
              key={index}
              position={[bus.lat, bus.lng]}
              icon={busIcon}
            >
              <Popup>
                <div className="text-center">
                  <h2 className="font-bold text-lg">
                    🚌 {bus.nombre}
                  </h2>

                  {bus.eta && (
                    <p>
                      ⏱️ Aprox. {bus.eta} min
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

      </div>
    </div>
  );
}