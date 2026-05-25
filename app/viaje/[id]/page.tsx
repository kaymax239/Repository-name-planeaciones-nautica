"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);

export default function ViajePage() {
  const params = useParams();
  const id = params.id as string;

  const [pos, setPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(
      doc(db, "viajesSeguros", id),
      (snap) => {
        const data = snap.data();

        if (data?.lat && data?.lng) {
          setPos([data.lat, data.lng]);
        }
      }
    );

    return () => unsub();
  }, [id]);

  if (!pos) {
    return (
      <main className="flex h-screen items-center justify-center text-xl font-bold bg-slate-900 text-white">
        Esperando ubicación del viaje...
      </main>
    );
  }

  return (
    <main className="h-screen w-screen">
      <MapContainer
        center={pos}
        zoom={16}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={pos} />
      </MapContainer>
    </main>
  );
}