import "./globals.css";
import "leaflet/dist/leaflet.css";

import ServiceWorker from "./ServiceWorker";

export const metadata = {
  title: "Rutas Tampico MAFA",
  description: "Rutas en tiempo real",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <ServiceWorker />
        {children}
      </body>
    </html>
  );
}