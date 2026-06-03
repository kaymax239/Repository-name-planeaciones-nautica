"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
//import { db } from "./firebase";

type Bus = {
  id: string;
  nombre?: string;
  ruta?: string;
  lat: number;
  lng: number;
  fecha?: any;
};

type Zona = "Tampico / Madero" | "Zona Norte / Altamira";

type Ruta = {
  zona: Zona;
  nombre: string;
  color: string;
  puntos: [number, number][];
};

const busIcon = new L.DivIcon({
  html: `
    <div style="
      display:flex;
      align-items:center;
      justify-content:center;
      width:42px;
      height:42px;
      background:white;
      border-radius:14px;
      box-shadow:0 8px 22px rgba(0,0,0,.35);
      border:3px solid #22c55e;
      font-size:24px;
      transform: rotate(-8deg);
    ">
      🚌
    </div>
  `,
  className: "",
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -18],
});

const miUbicacionIcon = new L.DivIcon({
  html: `
    <div style="
      width:18px;
      height:18px;
      background:#2563eb;
      border:3px solid white;
      border-radius:999px;
      box-shadow:0 0 12px rgba(37,99,235,.8);
    "></div>
  `,
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const rutas: Ruta[] = [
  {
    zona: "Tampico / Madero",
    nombre: "Candelario Garza",
    color: "#f59e0b",
    puntos: [
      [22.2553, -97.8686],
      [22.263, -97.857],
      [22.272, -97.846],
      [22.281, -97.836],
    ],
  },
  {
    zona: "Tampico / Madero",
    nombre: "Serapio Venegas",
    color: "#a855f7",
    puntos: [
      [22.244, -97.862],
      [22.251, -97.851],
      [22.259, -97.839],
      [22.268, -97.828],
    ],
  },
  {
    zona: "Tampico / Madero",
    nombre: "Haciendas",
    color: "#22c55e",
    puntos: [
      [22.2553, -97.8686],
      [22.2605, -97.8601],
      [22.266, -97.852],
      [22.273, -97.845],
    ],
  },
  {
    zona: "Tampico / Madero",
    nombre: "Niños Héroes",
    color: "#3b82f6",
    puntos: [
      [22.243, -97.865],
      [22.2505, -97.858],
      [22.257, -97.849],
      [22.265, -97.841],
    ],
  },
  {
    zona: "Tampico / Madero",
    nombre: "Circuito Norte",
    color: "#f97316",
    puntos: [
      [22.275, -97.895],
      [22.282, -97.881],
      [22.287, -97.865],
      [22.292, -97.849],
    ],
  },
  {
    zona: "Tampico / Madero",
    nombre: "Tampico - Madero",
    color: "#a855f7",
    puntos: [
      [22.2553, -97.8686],
      [22.244, -97.849],
      [22.236, -97.836],
      [22.225, -97.821],
    ],
  },
  {
    zona: "Tampico / Madero",
    nombre: "Borreguera",
    color: "#eab308",
    puntos: [
      [22.255, -97.868],
      [22.264, -97.878],
      [22.274, -97.888],
      [22.283, -97.899],
    ],
  },
  {
    zona: "Tampico / Madero",
    nombre: "Tancol",
    color: "#06b6d4",
    puntos: [
      [22.255, -97.868],
      [22.27, -97.86],
      [22.285, -97.852],
      [22.302, -97.845],
    ],
  },
  {
    zona: "Tampico / Madero",
    nombre: "Playa Norte",
    color: "#0ea5e9",
    puntos: [
      [22.2553, -97.8686],
      [22.248, -97.844],
      [22.24, -97.826],
      [22.233, -97.807],
      [22.229, -97.79],
    ],
  },
  {
    zona: "Tampico / Madero",
    nombre: "Águila - Madero",
    color: "#84cc16",
    puntos: [
      [22.216, -97.858],
      [22.225, -97.847],
      [22.235, -97.833],
      [22.244, -97.82],
    ],
  },
  {
    zona: "Tampico / Madero",
    nombre: "Madero - Borreguera",
    color: "#f43f5e",
    puntos: [
      [22.244, -97.82],
      [22.25, -97.842],
      [22.262, -97.866],
      [22.276, -97.889],
    ],
  },
  {
    zona: "Tampico / Madero",
    nombre: "Tampico - Fovissste - Playa",
    color: "#6366f1",
    puntos: [
      [22.216, -97.858],
      [22.226, -97.846],
      [22.236, -97.828],
      [22.245, -97.805],
      [22.255, -97.785],
    ],
  },
  {
    zona: "Tampico / Madero",
    nombre: "Germinal - Boulevard",
    color: "#ec4899",
    puntos: [
      [22.233, -97.86],
      [22.24, -97.846],
      [22.247, -97.831],
      [22.255, -97.816],
    ],
  },
  {
    zona: "Tampico / Madero",
    nombre: "Bosque - Boulevard",
    color: "#10b981",
    puntos: [
      [22.246, -97.875],
      [22.252, -97.858],
      [22.26, -97.84],
      [22.269, -97.824],
    ],
  },
  {
    zona: "Tampico / Madero",
    nombre: "Tampico - Valle",
    color: "#f59e0b",
    puntos: [
      [22.216, -97.858],
      [22.228, -97.866],
      [22.241, -97.875],
      [22.255, -97.884],
    ],
  },
  {
    zona: "Tampico / Madero",
    nombre: "Tampico - Niños Héroes - Isleta",
    color: "#14b8a6",
    puntos: [
      [22.216, -97.858],
      [22.228, -97.862],
      [22.242, -97.865],
      [22.257, -97.849],
      [22.269, -97.836],
    ],
  },
  {
    zona: "Tampico / Madero",
    nombre: "Madero - Ganadera - Niños Héroes",
    color: "#8b5cf6",
    puntos: [
      [22.244, -97.82],
      [22.252, -97.835],
      [22.26, -97.85],
      [22.268, -97.865],
      [22.276, -97.878],
    ],
  },
  {
    zona: "Zona Norte / Altamira",
    nombre: "Altamira - Tampico",
    color: "#ef4444",
    puntos: [
      [22.392, -97.92],
      [22.35, -97.9],
      [22.31, -97.88],
      [22.2553, -97.8686],
    ],
  },
  {
    zona: "Zona Norte / Altamira",
    nombre: "Altamira - Nuevo Tampico",
    color: "#f97316",
    puntos: [
      [22.392, -97.92],
      [22.37, -97.9],
      [22.34, -97.885],
      [22.31, -97.875],
    ],
  },
  {
    zona: "Zona Norte / Altamira",
    nombre: "Altamira - Borreguera",
    color: "#eab308",
    puntos: [
      [22.392, -97.92],
      [22.35, -97.9],
      [22.31, -97.885],
      [22.276, -97.889],
    ],
  },
  {
    zona: "Zona Norte / Altamira",
    nombre: "Altamira - Centro",
    color: "#22c55e",
    puntos: [
      [22.392, -97.92],
      [22.385, -97.91],
      [22.376, -97.9],
      [22.365, -97.89],
    ],
  },
  {
    zona: "Zona Norte / Altamira",
    nombre: "Altamira - Guadalupe Victoria",
    color: "#3b82f6",
    puntos: [
      [22.392, -97.92],
      [22.405, -97.91],
      [22.42, -97.9],
      [22.435, -97.89],
    ],
  },
];
function BusAnimado({ bus }: { bus: Bus }) {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (markerRef.current) {
     markerRef.current.setLatLng([bus.lat, bus.lng]);

    
  }, [bus.lat, bus.lng]);

  return (
    <Marker
      ref={markerRef}
      position={[bus.lat, bus.lng]}
      icon={busIcon}
      riseOnHover={true}
    >
      <Popup>
        <b>{bus.nombre}</b>
        <br />
        Ruta: {bus.ruta}
        <br />
        Ubicación reportada en vivo
      </Popup>
    </Marker>
  );
}
function AjustarMapa({ ubicacion }: { ubicacion: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (ubicacion) {
      map.flyTo(ubicacion, 15, { duration: 1 });
    }
  }, [ubicacion, map]);

  return null;
}

export default function Mapa() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [ubicacion, setUbicacion] = useState<[number, number] | null>(null);
  const [pasajeroActivo, setPasajeroActivo] = useState(false);
  const [zonaSeleccionada, setZonaSeleccionada] =
    useState<Zona>("Tampico / Madero");
  const [rutaSeleccionada, setRutaSeleccionada] = useState<string>("");
const [pantallaPasajero, setPantallaPasajero] = useState<"zonas" | "rutas" | "mapa">("zonas");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "autobuses"), (snapshot) => {
      const data: Bus[] = snapshot.docs
        .map((docSnap) => {
          const d = docSnap.data() as any;

          return {
            id: docSnap.id,
            nombre: d.nombre || d.ruta || "Autobús",
            ruta: d.ruta || d.nombre || "Sin ruta",
            lat: Number(d.lat),
            lng: Number(d.lng),
            fecha: d.fecha,
          };
        })
.filter((b) => {
  if (isNaN(b.lat) || isNaN(b.lng)) return false;

  if (!b.fecha?.toDate) return false;

  const minutos =
    (Date.now() - b.fecha.toDate().getTime()) / 1000 / 60;

  return minutos <= 30;
});

setBuses(data);
   }); 

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!pasajeroActivo) return;

    if (!navigator.geolocation) {
      alert("Tu navegador no permite ubicación.");
      setPasajeroActivo(false);
      return;
    }

    const pasajeroId =
      localStorage.getItem("pasajeroId") ||
      `pasajero-${Math.random().toString(36).substring(2, 12)}`;

    localStorage.setItem("pasajeroId", pasajeroId);

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setUbicacion([lat, lng]);

        await setDoc(doc(db, "autobuses", pasajeroId), {
          nombre:
            rutaSeleccionada === "Todas" ? "Pasajero activo" : rutaSeleccionada,
          ruta:
            rutaSeleccionada === "Todas" ? "Pasajero activo" : rutaSeleccionada,
          lat,
          lng,
          tipo: "pasajero",
          activo: true,
          fecha: serverTimestamp(),
        });
      },
      () => {
        alert("No se pudo activar la ubicación del pasajero.");
        setPasajeroActivo(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [pasajeroActivo, rutaSeleccionada]);

  const rutasDeZona = useMemo(() => {
    return rutas.filter((ruta) => ruta.zona === zonaSeleccionada);
  }, [zonaSeleccionada]);

  const busesFiltrados = useMemo(() => {
  if (!rutaSeleccionada) return [];

    return buses.filter(
      (b) =>
        b.nombre?.toLowerCase().includes(rutaSeleccionada.toLowerCase()) ||
        b.ruta?.toLowerCase().includes(rutaSeleccionada.toLowerCase())
    );
  }, [buses, rutaSeleccionada]);

  const cambiarZona = (zona: Zona) => {
  setZonaSeleccionada(zona);
  setRutaSeleccionada("");
  setPantallaPasajero("rutas");
};

  const obtenerMiUbicacion = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no permite ubicación.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        alert("No se pudo obtener tu ubicación.");
      }
    );
  };

    const activarPasajero = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no permite ubicación");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        setPasajeroActivo((prev) => !prev);
      },
      () => {
        alert("Debes permitir ubicación para activar modo pasajero");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  if (pantallaPasajero === "zonas") {
    return (
      <div
        style={{
          height: "100vh",
          background: "#0f172a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 24,
          gap: 18,
        }}
      >
        <h1 style={{ color: "white", textAlign: "center", fontSize: 28, fontWeight: 800 }}>
          Selecciona tu zona
        </h1>

        <button
          onClick={() => cambiarZona("Tampico / Madero")}
          style={{
            padding: 22,
            borderRadius: 20,
            border: "none",
            background: "#22c55e",
            color: "white",
            fontSize: 22,
            fontWeight: 800,
          }}
        >
          📍 Tampico / Madero
        </button>

        <button
          onClick={() => cambiarZona("Zona Norte / Altamira")}
          style={{
            padding: 22,
            borderRadius: 20,
            border: "none",
            background: "#2563eb",
            color: "white",
            fontSize: 22,
            fontWeight: 800,
          }}
        >
          📍 Zona Norte / Altamira
        </button>
      </div>
    );
  }

  if (pantallaPasajero === "rutas") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          padding: 24,
          color: "white",
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Selecciona tu ruta
        </h1>

        <p style={{ color: "#cbd5e1", marginBottom: 20 }}>
          Zona: {zonaSeleccionada}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rutasDeZona.map((ruta) => (
            <button
              key={ruta.nombre}
              onClick={() => {
                setRutaSeleccionada(ruta.nombre);
                setPantallaPasajero("mapa");
              }}
              style={{
                padding: 18,
                borderRadius: 18,
                border: "none",
                background: ruta.color,
                color: "white",
                fontSize: 18,
                fontWeight: 800,
                textAlign: "left",
              }}
            >
              🚍 {ruta.nombre}
            </button>
          ))}
        </div>

        <button
          onClick={() => setPantallaPasajero("zonas")}
          style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 999,
            border: "none",
            background: "white",
            color: "#111827",
            fontWeight: 800,
            width: "100%",
          }}
        >
          ← Regresar a zonas
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          right: 12,
          zIndex: 99999,
          background: "rgba(15,23,42,.92)",
          color: "white",
          borderRadius: 18,
          padding: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,.35)",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800 }}>Rutas Tampico</div>

        <div style={{ fontSize: 13, opacity: 0.85 }}>
          🚍 Usuarios en esta ruta: {busesFiltrados.length}
        </div>

        <button
          id="activar-pasajero"
          type="button"
          onClick={activarPasajero}
          style={{
            width: "100%",
            marginTop: 10,
            padding: "11px 14px",
            borderRadius: 999,
            border: "none",
            background: pasajeroActivo ? "#22c55e" : "#facc15",
            color: pasajeroActivo ? "white" : "#111827",
            fontWeight: 900,
          }}
        >
          {pasajeroActivo
            ? "Pasajero activo: compartiendo ubicación"
            : "Compartir ubicación"}
        </button>

        <button
          onClick={() => setPantallaPasajero("rutas")}
          style={{
            width: "100%",
            marginTop: 8,
            padding: "10px 14px",
            borderRadius: 999,
            border: "none",
            background: "white",
            color: "#111827",
            fontWeight: 800,
          }}
        >
          Cambiar ruta
        </button>
      </div>

      <button
        type="button"
        onClick={obtenerMiUbicacion}
        style={{
          position: "absolute",
          right: 14,
          bottom: 24,
          zIndex: 99999,
          background: "#2563eb",
          color: "white",
          border: "none",
          padding: "12px 16px",
          borderRadius: 999,
          fontWeight: 800,
        }}
      >
        Mi ubicación
      </button>

      <MapContainer
        center={[22.2553, -97.8686]}
        zoom={12}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        <AjustarMapa ubicacion={ubicacion} />

        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {rutasDeZona
          .filter((ruta) => ruta.nombre === rutaSeleccionada)
          .map((ruta) => (
            <Polyline
              key={ruta.nombre}
              positions={ruta.puntos}
              pathOptions={{
                color: ruta.color,
                weight: 6,
                opacity: 0.9,
              }}
            />
          ))}

        {ubicacion && (
          <Marker position={ubicacion} icon={miUbicacionIcon}>
            <Popup>Estás aquí</Popup>
          </Marker>
        )}

        {busesFiltrados.map((bus) => (
          <BusAnimado key={bus.id} bus={bus} />
        ))}
      </MapContainer>
    </div>
  );
}