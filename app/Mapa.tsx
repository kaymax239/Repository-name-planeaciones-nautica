"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const iconoBus = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61231.png",
  iconSize: [40, 40],
});

export default function Mapa() {
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
        <Popup>Ruta Circuito Norte</Popup>
      </Marker>
    </MapContainer>
  );
}