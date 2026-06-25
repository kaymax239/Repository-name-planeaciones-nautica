import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Excluye del bundle de las funciones serverless archivos pesados que NINGUNA
  // función lee por fs (se sirven como estáticos o son datos locales). Evita el
  // over-tracing que inflaba api/planeacion-enriquecida >250 MB en Vercel.
  // No cambia la lógica: la función sigue leyendo el corpus de app/data, y los
  // estáticos de public/templates se siguen sirviendo por HTTP.
  outputFileTracingExcludes: {
    "*": [
      "public/templates/**",
      "importacines/**",
      "importaciones/**",
      "planeaciones historicas ingles/**",
      "salidas/**",
      "**/*.pptx",
    ],
  },
  // Incluye el índice de Inglés SOLO en la función que lo lee, para que en
  // producción BibliotecaIngles.leerIndice() pueda abrir el JSON ya generado.
  // Acotado a esta ruta para no reintroducir el over-tracing en otras funciones.
  outputFileTracingIncludes: {
    "/api/planeacion-ingles": [".indice-ingles/indice.json"],
  },
};

export default nextConfig;
