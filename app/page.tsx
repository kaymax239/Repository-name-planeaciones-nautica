"use client";

import dynamic from "next/dynamic";

const Mapa = dynamic(() => import("./Mapa"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Aplicación rutas autobuses Tampico
      </h1>

      <Mapa />
    </main>
  );
}