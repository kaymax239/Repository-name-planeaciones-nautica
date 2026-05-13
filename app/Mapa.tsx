"use client";

export default function Mapa() {
  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden border">
      <iframe
        title="Mapa Tampico"
        src="https://www.openstreetmap.org/export/embed.html?bbox=-97.95%2C22.18%2C-97.78%2C22.32&layer=mapnik&marker=22.2553%2C-97.8686"
        className="w-full h-full"
      />
    </div>
  );
}
// cambio nuevo