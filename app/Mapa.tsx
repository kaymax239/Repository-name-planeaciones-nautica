"use client";

export default function Mapa() {
  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden">
      <iframe
        title="Mapa Tampico"
        src="https://www.openstreetmap.org/export/embed.html?bbox=-98.05%2C22.15%2C-97.75%2C22.35&layer=mapnik"
        className="w-full h-full"
      />
    </div>
  );
}