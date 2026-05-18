import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata = {
  title: "Rutas Tampico MAFA",
  description: "Rastreo en tiempo real de rutas de autobuses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}