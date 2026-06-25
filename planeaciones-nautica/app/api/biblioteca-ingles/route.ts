// Endpoint de la Biblioteca de Inglés. Devuelve el resumen del corpus histórico
// (conteo, tipos y listado) leyendo el filesystem en el servidor. La interfaz de
// Inglés (componente cliente) lo consume; el navegador nunca accede al FS.
//
// Aislado del flujo PN/MN y de las presentaciones (Gemini). No genera nada.

import { BibliotecaIngles } from "../../lib/bibliotecaIngles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const resumen = await BibliotecaIngles.leer();
    return Response.json(resumen);
  } catch (error) {
    const mensaje =
      error instanceof Error ? error.message : "Error desconocido";
    return Response.json(
      { error: "lectura_fallida", mensaje },
      { status: 500 },
    );
  }
}
