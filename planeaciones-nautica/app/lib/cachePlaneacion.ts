// Fase 2 — Cache en disco del enriquecimiento pedagógico generado por IA.
//
// El currículo es fijo: cada (materia · unidades · modelo · versión) se genera
// con IA UNA vez y se reutiliza. Mismo patrón que cachePresentacion.ts. Guarda
// solo el objeto PlaneacionEnriquecida validado (JSON pequeño).
//
// Persiste entre reinicios donde el disco persista (local / `next start`). En
// Vercel el FS del proyecto es de solo lectura y /tmp es efímero.

import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { createHash } from "crypto";
import type { PlaneacionEnriquecida } from "./esquemaPlaneacion";

const CACHE_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), "planeaciones-cache")
  : path.join(process.cwd(), ".planeaciones-cache");

// Súbela si cambias el prompt o el esquema: invalida entradas anteriores.
export const CACHE_VERSION = "v1";

export interface DatosClavePlaneacion {
  modelo: string;
  carrera: string;
  clave: string;
  /** Números de unidad incluidos en la solicitud (orden indiferente). */
  unidades: number[];
}

export function claveCache(d: DatosClavePlaneacion): string {
  return [
    CACHE_VERSION,
    d.modelo,
    d.carrera,
    d.clave,
    [...d.unidades].sort((a, b) => a - b).join(","),
  ].join("|");
}

function archivoDeClave(clave: string): string {
  const hash = createHash("sha1").update(clave).digest("hex").slice(0, 32);
  return path.join(CACHE_DIR, `${hash}.json`);
}

/** Devuelve el enriquecimiento cacheado, o null si no existe / no se puede leer. */
export async function leerCache(
  clave: string,
): Promise<PlaneacionEnriquecida | null> {
  try {
    const txt = await fs.readFile(archivoDeClave(clave), "utf8");
    return JSON.parse(txt) as PlaneacionEnriquecida;
  } catch {
    return null;
  }
}

/** Guarda el enriquecimiento. Nunca lanza: si falla, solo registra el aviso. */
export async function escribirCache(
  clave: string,
  datos: PlaneacionEnriquecida,
): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(archivoDeClave(clave), JSON.stringify(datos), "utf8");
  } catch (e) {
    console.warn("No se pudo escribir el cache de planeaciones:", e);
  }
}
