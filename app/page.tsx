"use client";

import dynamic from "next/dynamic";
import ViajeSeguro from "./ViajeSeguro";
import PWARegister from "./PWARegister";

const Mapa = dynamic(() => import("./Mapa"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-y-auto pb-40">
      <PWARegister />
      <Mapa />
      <ViajeSeguro />
    </main>
  );
}