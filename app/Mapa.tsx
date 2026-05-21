"use client";

import { useEffect, useMemo, useState } from "react";
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
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61231.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function MyLocation({ setUserLocation }: any) {
  const map = useMap();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = [pos.coords.latitude, pos.coords.longitude] as [number, number];
      setUserLocation(loc);
      map.setView(loc, 14);
    });
  }, [map, setUserLocation]);

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
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export default function Mapa() {
  const [buses, setBuses] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [favoritos, setFavoritos] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("favoritosRutas");
    if (saved) setFavoritos(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "autobuses"), (snapshot) => {
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
    });

    return () => unsub();
  }, []);

  const busesConETA = useMemo(() => {
    return buses.map((bus) => {
      const km = distanceKm(userLocation, [bus.lat, bus.lng]);
      const eta = km ? Math.max(1, Math.round((km / 25) * 60)) : null;

      return {
        ...bus,
        km,
        eta,
      };
    });
  }, [buses, userLocation]);

  const toggleFavorito = (ruta: string) => {
    let nuevos;

    if (favoritos.includes(ruta)) {
      nuevos = favoritos.filter((r) => r !== ruta);
    } else {
      nuevos = [...favoritos, ruta];
    }

    setFavoritos(nuevos);
    localStorage.setItem("favoritosRutas", JSON.stringify(nuevos));
  };

  return (
    <div className="relative h-screen w-full overflow-hidden rounded-2xl bg-black">
      <MapContainer
        center={[22.2553, -97.8686]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <MyLocation setUserLocation={setUserLocation} />

        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Capa estilo tráfico/ciudad */}
        <TileLayer
          attribution="Traffic style"
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          opacity={0.35}
        />

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>📍 Tú estás aquí</Popup>
          </Marker>
        )}

        {busesConETA.map((bus, index) => (
          <Marker
            key={index}
            position={[bus.lat, bus.lng]}
            icon={busIcon}
          >
            <Popup>
              <div className="text-center">
                <h2 className="font-bold text-lg">🚌 {bus.nombre}</h2>
                <p>Ruta activa</p>
                {bus.eta && <p>⏱️ Aprox. {bus.eta} min</p>}
                {bus.km && <p>📍 {bus.km.toFixed(1)} km de ti</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Panel tipo Uber */}
      <div className="absolute top-4 left-4 right-4 z-[999] rounded-2xl bg-white/95 p-4 shadow-xl">
        <h1 className="text-xl font-bold text-gray-900">
          Rutas Tampico MAFA
        </h1>

        <p className="text-sm text-gray-600">
          🟢 {busesConETA.length} rutas activas en vivo
        </p>

        <p className="text-xs text-gray-500">
          Usuarios activos y estadísticas completas vienen en el siguiente paso.
        </p>
      </div>

      {/* Tarjetas de rutas */}
      <div className="absolute bottom-4 left-4 right-4 z-[999] flex gap-3 overflow-x-auto pb-2">
        {busesConETA.map((bus, index) => (
          <div
            key={index}
            className="min-w-[210px] rounded-2xl bg-white p-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">🚌 {bus.nombre}</h2>

              <button
                onClick={() => toggleFavorito(bus.nombre)}
                className="text-xl"
              >
                {favoritos.includes(bus.nombre) ? "⭐" : "☆"}
              </button>
            </div>

            <p className="text-sm text-gray-600">
              {bus.eta ? `Llega aprox. en ${bus.eta} min` : "Calculando ETA..."}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {bus.km ? `${bus.km.toFixed(1)} km de distancia` : "Ubicación pendiente"}
            </p>

            <div className="mt-2 rounded-full bg-green-100 px-3 py-1 text-center text-xs font-bold text-green-700">
              En movimiento
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}