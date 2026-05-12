"use client";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const iconoBus = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61231.png",
  iconSize: [40, 40],
});

export default function Mapa() {
    const [buses, setBuses] = useState<any[]>([]);
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, "autobuses"),
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBuses(data);
    }
  );

  return () => unsubscribe();
}, []);
 return (
  <MapContainer
    center={[22.2553, -97.8686]}
    zoom={13}
    scrollWheelZoom={true}
    style={{ height: "500px", width: "100%" }}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    <Marker position={[22.2553, -97.8686]} icon={iconoBus}>
      <Popup>Ruta Centro</Popup>
    </Marker>
  <MapContainer<any>
);
}