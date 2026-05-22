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
      position: relative;
      width: 34px;
      height: 34px;
      border-radius: 999px;
      background: linear-gradient(135deg, #16a34a, #22c55e);
      border: 4px solid white;
      box-shadow: 0 8px 22px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    ">
      🚌
      <span style="
        position:absolute;
        inset:-9px;
        border-radius:999px;
        border:2px solid rgba(34,197,94,.35);
      "></span>
    </div>
  `,
  className: "",
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const userIcon = new L.DivIcon({
  html: `
    <div style="
      width: 26px;
      height: 26px;
      border-radius: 999px;
      background: #2563eb;
      border: 4px solid white;
      box-shadow: 0 8px 18px rgba(37,99,235,.45);
    "></div>
  `,
  className: "",
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

const haciendasRoute: [number, number][] = [
  [22.286, -97.877],
  [22.284, -97.873],
  [22.281, -97.87],
  [22.276, -97.868],
  [22.271, -97.866],
  [22.266, -97.864],
  [22.26, -97.862],
  [22.2553, -97.8686],
];

function distanceKm(a: [number, number] | null, b: [number, number]) {
  if (!a || !b) return null;

  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function LocationButton({
  userLocation,
}: {
  userLocation: [number, number] | null;
}) {
  const map = useMap();

  return (
    <button
      type="button"
      onClick={() => {
        if (userLocation) {
          map.setView(userLocation, 15);
        }
      }}
      className="absolute bottom-6 right-5 z-[999] rounded-2xl bg-white px-5 py-3 text-base font-black text-slate-900 shadow-2xl"
    >
      📍 Mi ubicación
    </button>
  );
}

function FlyToUser({
  userLocation,
}: {
  userLocation: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView(userLocation, 13);
    }
  }, [map, userLocation]);

  return null;
}

export default function Mapa() {
  const [buses, setBuses] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        setUserLocation(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "autobuses"), (snapshot) => {
      const data: any[] = [];

      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      const now = Date.now();
      const latestByRoute = new Map();

      data.forEach((bus) => {
        if (!bus.nombre || !bus.lat || !bus.lng) return;

        const fechaMs = bus.fecha?.toDate ? bus.fecha.toDate().getTime() : now;
        const ageMinutes = (now - fechaMs) / 60000;

        if (ageMinutes > 30) return;

        const current = latestByRoute.get(bus.nombre);
        const currentFecha = current?.fecha?.toDate
          ? current.fecha.toDate().getTime()
          : 0;

        if (!current || fechaMs > currentFecha) {
          latestByRoute.set(bus.nombre, bus);
        }
      });

      setBuses(Array.from(latestByRoute.values()));
    });

    return () => unsub();
  }, []);

  const busesConETA = useMemo(() => {
    return buses.map((bus) => {
      const km = distanceKm(userLocation, [bus.lat, bus.lng]);

      const eta = km ? Math.max(1, Math.round((km / 22) * 60)) : null;

      return {
        ...bus,
        km,
        eta,
      };
    });
  }, [buses, userLocation]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      <MapContainer
        center={[22.2553, -97.8686]}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToUser userLocation={userLocation} />
        <LocationButton userLocation={userLocation} />

        <Polyline
          positions={haciendasRoute}
          pathOptions={{
            color: "#2563eb",
            weight: 7,
            opacity: 0.85,
          }}
        />

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <strong>📍 Tú estás aquí</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {busesConETA.map((bus) => (
          <Marker key={bus.id || bus.nombre} position={[bus.lat, bus.lng]} icon={busIcon}>
            <Popup>
              <div style={{ minWidth: 170, textAlign: "center" }}>
                <h2 style={{ fontWeight: 900, fontSize: 17 }}>
                  🚌 {bus.nombre}
                </h2>

                <p style={{ marginTop: 6, fontWeight: 700 }}>
                  {bus.tipo === "chofer" ? "Chofer compartiendo" : "Pasajero reportando"}
                </p>

                {bus.ocupacion && (
                  <p style={{ marginTop: 4 }}>
                    Ocupación: <strong>{bus.ocupacion}</strong>
                  </p>
                )}

                {bus.eta && (
                  <p style={{ marginTop: 6, fontWeight: 900, color: "#2563eb" }}>
                    ⏱️ Aprox. {bus.eta} min de ti
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}