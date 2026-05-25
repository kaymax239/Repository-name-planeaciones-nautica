"use client";

import { useState } from "react";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export default function ViajeSeguro() {
  const [viajeId, setViajeId] = useState("");
  const [activo, setActivo] = useState(false);

  const iniciarViaje = () => {
    if (!navigator.geolocation) {
      alert("Tu celular no permite ubicación.");
      return;
    }

    const id = crypto.randomUUID();
    setViajeId(id);
    setActivo(true);

    navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        await setDoc(
          doc(db, "viajesSeguros", id),
          {
            lat,
            lng,
            activo: true,
            fecha: serverTimestamp(),
          },
          { merge: true }
        );
      },
      () => {
        alert("Activa la ubicación para usar Viaje Seguro.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );
  };

  const terminarViaje = async () => {
    if (!viajeId) return;

    await updateDoc(doc(db, "viajesSeguros", viajeId), {
      activo: false,
      terminado: serverTimestamp(),
    });

    setActivo(false);
    alert("Viaje terminado.");
  };

  const compartirWhatsApp = () => {
    const liga = `${window.location.origin}/viaje/${viajeId}`;
    const mensaje = `Estoy compartiendo mi viaje en Rutas Tampico. Sígueme aquí: ${liga}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  const emergencia = () => {
    window.location.href = "tel:911";
  };

  return (
    <div className="fixed bottom-5 left-4 right-4 z-[9999] flex flex-col gap-2">
      {!activo ? (
        <button
          onClick={iniciarViaje}
          className="w-full rounded-2xl bg-blue-600 py-4 text-white font-bold shadow-lg"
        >
          🛡️ Viaje Seguro
        </button>
      ) : (
        <>
          <button
            onClick={compartirWhatsApp}
            className="w-full rounded-2xl bg-green-600 py-4 text-white font-bold shadow-lg"
          >
            Compartir mi viaje por WhatsApp
          </button>

          <button
            onClick={emergencia}
            className="w-full rounded-2xl bg-red-600 py-4 text-white font-bold shadow-lg"
          >
            🚨 Emergencia 911
          </button>

          <button
            onClick={terminarViaje}
            className="w-full rounded-2xl bg-gray-900 py-4 text-white font-bold shadow-lg"
          >
            Ya llegué / Terminar viaje
          </button>
        </>
      )}
    </div>
  );
}