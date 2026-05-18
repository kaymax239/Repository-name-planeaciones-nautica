import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rutas Tampico MAFA",
    short_name: "Rutas MAFA",
    description:
      "App ciudadana para reportar rutas de transporte en tiempo real.",

    start_url: "/",

    display: "standalone",

    background_color: "#020617",

    theme_color: "#2563eb",

    orientation: "portrait",

    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}