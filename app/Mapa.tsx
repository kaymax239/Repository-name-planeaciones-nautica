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
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

function MyLocation() {
  const map = useMap();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      map.setView(
        [pos.coords.latitude, pos.coords.longitude],
        14
      );
    });
  }, [map]);

  return null;
}

export default function Mapa() {
  const [buses, setBuses] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "autobuses"),
      (snapshot) => {
        const data: any[] = [];

        snapshot.forEach((doc) => {
          data.push(doc.data());
        });

        // SOLO EL ÚLTIMO BUS POR RUTA
        const rutasUnicas = new Map();

        data.forEach((bus) => {
          rutasUnicas.set(bus.nombre, bus);
        });

        setBuses(Array.from(rutasUnicas.values()));
      }
    );

    return () => unsub();
  }, []);

  return (
    <div className="h-screen w-full rounded-2xl overflow-hidden">

      <MapContainer
        center={[22.2553, -97.8686]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >

        <MyLocation />

        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {buses.map((bus, index) => (
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

                <p>Ruta activa</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}