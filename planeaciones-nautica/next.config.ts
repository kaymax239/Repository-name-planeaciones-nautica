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
      ".indice-ingles/**",
      "salidas/**",
      "**/*.pptx",
    ],
  },
};

export default nextConfig;
