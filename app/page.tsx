"use client";

import dynamic from "next/dynamic";
import ViajeSeguro from "./ViajeSeguro";
import PWARegister from "./PWARegister";

const Mapa = dynamic(() => import("./Mapa"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <PWARegister />
      <Mapa />
      <ViajeSeguro />
    </main>
  );
}