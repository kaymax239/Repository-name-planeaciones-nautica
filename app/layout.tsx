import "./globals.css";
import "leaflet/dist/leaflet.css";

import PWARegister from "./PWARegister";

export const metadata = {
  title: "Rutas Tampico MAFA",
  description: "Rutas en tiempo real",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}