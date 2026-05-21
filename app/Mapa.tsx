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

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61231.png",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
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

        <div className="absolute top-4 left-4 right-4 z-[999]">
          <div className="rounded-3xl bg-[#0f172acc] backdrop-blur-xl p-5 shadow-2xl border border-white/10">
            <h1 className="text-4xl font-black text-white">
              Rutas Tampico MAFA
            </h1>

            <p className="text-gray-300 mt-2 text-sm">
              Comparte tu ubicación cuando vayas
              en una ruta para ayudar a otros
              usuarios.
            </p>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-[999] flex gap-3 overflow-x-auto pb-2">

          {busesConETA.map((bus, index) => (
            <div
              key={index}
              className="min-w-[190px] rounded-3xl bg-white/90 backdrop-blur-xl p-4 shadow-2xl"
            >
              <h2 className="font-bold text-gray-900 text-lg">
                🚌 {bus.nombre}
              </h2>

              <p className="text-gray-600 text-sm mt-1">
                {bus.eta
                  ? `Llega aprox. en ${bus.eta} min`
                  : "Calculando ETA"}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {bus.km
                  ? `${bus.km.toFixed(1)} km de distancia`
                  : "Ubicación pendiente"}
              </p>

              <div className="mt-3 rounded-full bg-green-100 py-2 text-center text-xs font-bold text-green-700">
                En movimiento
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}