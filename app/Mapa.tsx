"use client";

import { useEffect, useState } from "react";
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
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/61/61231.png",
  iconSize: [40, 40],
});

const userIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/149/149060.png",
  iconSize: [35, 35],
});

const rutaHaciendasHidalgo: [number, number][] = [
  [22.3005, -97.8755],
  [22.2920, -97.8730],
  [22.2820, -97.8700],
  [22.2720, -97.8665],
  [22.2620, -97.8635],
  [22.2520, -97.8605],
  [22.2420, -97.8580],
  [22.2320, -97.8560],
  [22.2220, -97.8540],
  [22.2120, -97.8520],
  [22.2040, -97.8500],
];

function SeguirBus({
  buses,
  seguirBus,
}: any) {
  const map = useMap();

  useEffect(() => {
    if (
      seguirBus &&
      buses.length > 0
    ) {
      const ultimoBus = buses[0];

      map.setView(
        [ultimoBus.lat, ultimoBus.lng],
        14
      );
    }
  }, [buses, map, seguirBus]);

  return null;
}

function BotonMiUbicacion({
  setMiUbicacion,
  setSeguirBus,
}: any) {
  const map = useMap();

  const irAMiUbicacion = () => {
    if (!navigator.geolocation) {
      alert(
        "Tu dispositivo no permite usar ubicación."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

        setMiUbicacion({
          lat,
          lng,
        });

        setSeguirBus(false);

        map.setView([lat, lng], 16);
      },
      () => {
        alert(
          "No se pudo obtener tu ubicación."
        );
      }
    );
  };

  return (
    <button
      onClick={irAMiUbicacion}
      style={{
        position: "absolute",
        bottom: "25px",
        right: "15px",
        zIndex: 1000,
        background: "#ffffff",
        border: "none",
        borderRadius: "999px",
        padding: "12px 16px",
        fontSize: "15px",
        fontWeight: "bold",
        boxShadow:
          "0 4px 12px rgba(0,0,0,0.3)",
        cursor: "pointer",
      }}
    >
      📍 Mi ubicación
    </button>
  );
}

export default function Mapa() {
  const [buses, setBuses] =
    useState<any[]>([]);

  const [miUbicacion, setMiUbicacion] =
    useState<any>(null);

  const [seguirBus, setSeguirBus] =
    useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "autobuses"),
      (snapshot) => {
        const rutas: any = {};

        snapshot.forEach((doc) => {
          const data: any = doc.data();

          if (!data.fecha?.seconds)
            return;

          const fecha =
            data.fecha.seconds * 1000;

          const ahora = Date.now();

          const minutos =
            (ahora - fecha) /
            1000 /
            60;

          if (
            data.activo === true &&
            minutos <= 30
          ) {
            const ruta = data.nombre;

            if (
              !rutas[ruta] ||
              fecha >
                rutas[ruta].fecha
                  .seconds *
                  1000
            ) {
              rutas[ruta] = {
                id: doc.id,
                ...data,
              };
            }
          }
        });

        setBuses(
          Object.values(rutas)
        );
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <MapContainer
      center={[22.2553, -97.8686]}
      zoom={12}
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <SeguirBus
        buses={buses}
        seguirBus={seguirBus}
      />

      <BotonMiUbicacion
        setMiUbicacion={
          setMiUbicacion
        }
        setSeguirBus={
          setSeguirBus
        }
      />

      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      

<Polyline
  positions={rutaHaciendasHidalgo}
  pathOptions={{
    color: "black",
    weight: 12,
    opacity: 0.8,
  }}
/>

<Polyline
  positions={rutaHaciendasHidalgo}
  pathOptions={{
    color: "#ff1744",
    weight: 7,
    opacity: 1,
  }}
/>

      {miUbicacion && (
        <Marker
          position={[
            miUbicacion.lat,
            miUbicacion.lng,
          ]}
          icon={userIcon}
        >
          <Popup>
            📍 Tú estás aquí
          </Popup>
        </Marker>
      )}

      {buses.map((bus: any) => (
        <Marker
          key={bus.id}
          position={[
            bus.lat,
            bus.lng,
          ]}
          icon={busIcon}
        >
          <Popup>
            <div
              style={{
                minWidth: "170px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                }}
              >
                🚌 {bus.nombre}
              </h3>

              <p
                style={{
                  margin: "5px 0",
                }}
              >
                Ruta activa en tiempo real
              </p>

              <small>
                Última actualización:
                <br />
                {new Date(
                  bus.fecha.seconds *
                    1000
                ).toLocaleTimeString()}
              </small>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}