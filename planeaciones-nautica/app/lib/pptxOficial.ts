import pptxgen from "pptxgenjs";
import type { Bloque, Diapositiva, Presentacion } from "../data/presentaciones/tipos";

// Paleta institucional (universidad marítima).
export const C = {
  azul: "071A33", // navy principal
  azulMedio: "12365E", // acento azul
  dorado: "C8A45D", // dorado institucional
  doradoClaro: "F2E9D2", // fondo de cajas doradas
  blanco: "FFFFFF",
  gris: "F5F7FA", // fondo de cajas neutras
  grisBorde: "DDE3EC",
  texto: "1F2937",
  tenue: "64748B",
  verde: "0F6E56", // resultado / éxito
  verdeClaro: "E6F4EF",
};

export const PAGE_W = 13.333;
export const LX = 0.62; // margen izquierdo
export const CW = 12.1; // ancho de contenido
export const TOP = 1.62; // inicio del área de contenido

export type MetaPresentacion = {
  docente?: string;
  grupo?: string;
  periodo?: string;
  escuela?: string;
};

/** Genera y descarga un .pptx institucional a partir de una Presentacion. */
export async function generarPresentacionOficial(
  pres: Presentacion,
  meta: MetaPresentacion = {},
): Promise<string> {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
  pptx.author = meta.docente || "Planeaciones Náutica";
  pptx.company = "Universidad Marítima y Portuaria de México";
  pptx.subject = pres.asignatura;
  pptx.title = `${pres.asignatura} — ${pres.unidad}`;
  pptx.theme = { headFontFace: "Arial", bodyFontFace: "Arial" };

  const total = pres.diapositivas.length;
  pres.diapositivas.forEach((d, i) => {
    if (d.layout === "portada") renderPortada(pptx, pres, meta);
    else if (d.layout === "divisor") renderDivisor(pptx, d, i + 1, total);
    else if (d.layout === "cierre") renderCierre(pptx, d, meta);
    else renderContenido(pptx, d, pres, i + 1, total);
  });

  const archivo = `Presentacion_${pres.clave}_U1.pptx`;
  await pptx.writeFile({ fileName: archivo });
  return archivo;
}

/* --------------------------- Layouts especiales --------------------------- */

function renderPortada(pptx: pptxgen, pres: Presentacion, meta: MetaPresentacion) {
  const s = pptx.addSlide();
  s.background = { color: C.azul };

  // Motivo náutico: anillos concéntricos (compás) en la esquina inferior derecha.
  [3.2, 2.4, 1.6, 0.8].forEach((r, i) => {
    s.addShape(pptx.ShapeType.ellipse, {
      x: 10.4 - r / 2,
      y: 6.6 - r / 2,
      w: r,
      h: r,
      fill: { type: "solid", color: C.azul, transparency: 100 },
      line: { color: C.dorado, width: 1, transparency: i === 0 ? 55 : 75 },
    });
  });
  // Banda superior dorada
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: PAGE_W, h: 0.32, fill: { color: C.dorado }, line: { type: "none" } });

  // Escudo placeholder
  s.addShape(pptx.ShapeType.ellipse, { x: 0.8, y: 0.85, w: 1.0, h: 1.0, fill: { color: C.azulMedio }, line: { color: C.dorado, width: 1.5 } });
  s.addText("UMPM", { x: 0.8, y: 0.85, w: 1.0, h: 1.0, fontSize: 13, bold: true, color: C.dorado, align: "center", valign: "middle" });

  s.addText("Universidad Marítima y Portuaria de México", { x: 2.0, y: 0.95, w: 10.4, h: 0.4, fontSize: 16, bold: true, color: C.dorado });
  s.addText(meta.escuela || "Escuela Náutica Mercante de Tampico", { x: 2.0, y: 1.38, w: 10.4, h: 0.35, fontSize: 13, color: "CBD5E1" });

  // Título principal
  s.addText(pres.asignatura, { x: 0.85, y: 2.7, w: 11.6, h: 1.2, fontSize: 48, bold: true, color: C.blanco });
  // Píldora de unidad
  s.addText(pres.unidad.toUpperCase(), {
    x: 0.85, y: 4.05, w: 8.6, h: 0.55, fontSize: 15, bold: true, color: C.azul, align: "center", valign: "middle",
    shape: pptx.ShapeType.roundRect, rectRadius: 0.1, fill: { color: C.dorado },
  });
  s.addShape(pptx.ShapeType.rect, { x: 0.88, y: 4.85, w: 2.6, h: 0.05, fill: { color: C.dorado }, line: { type: "none" } });

  s.addText(`${pres.carrera}   ·   ${pres.semestre}   ·   Clave ${pres.clave}`, { x: 0.85, y: 5.2, w: 11.6, h: 0.35, fontSize: 13, color: "E2E8F0" });

  // Pie con datos del docente
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 6.95, w: PAGE_W, h: 0.55, fill: { color: C.azulMedio }, line: { type: "none" } });
  const pie = `Docente: ${meta.docente || "Por definir"}        Grupo: ${meta.grupo || "—"}        Periodo: ${meta.periodo || "Julio–Diciembre 2026"}`;
  s.addText(pie, { x: 0.85, y: 6.95, w: 11.6, h: 0.55, fontSize: 12, color: "E2E8F0", valign: "middle" });
}

function renderDivisor(pptx: pptxgen, d: Diapositiva, num: number, total: number) {
  const s = pptx.addSlide();
  s.background = { color: C.azul };
  // Líneas decorativas
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.28, h: 7.5, fill: { color: C.dorado }, line: { type: "none" } });
  s.addShape(pptx.ShapeType.ellipse, { x: 9.6, y: -1.6, w: 5.2, h: 5.2, fill: { type: "solid", color: C.azul, transparency: 100 }, line: { color: C.dorado, width: 1, transparency: 70 } });

  if (d.etiqueta)
    s.addText(d.etiqueta.toUpperCase(), { x: 1.0, y: 2.55, w: 11, h: 0.45, fontSize: 16, bold: true, color: C.dorado, charSpacing: 3 });
  s.addText(d.titulo, { x: 1.0, y: 3.05, w: 11.3, h: 1.4, fontSize: 38, bold: true, color: C.blanco, fit: "shrink" });
  s.addShape(pptx.ShapeType.rect, { x: 1.04, y: 4.55, w: 3.2, h: 0.06, fill: { color: C.dorado }, line: { type: "none" } });
  if (d.subtitulo)
    s.addText(d.subtitulo, { x: 1.04, y: 4.8, w: 10.5, h: 0.7, fontSize: 16, color: "CBD5E1", italic: true });
  s.addText(`${num} / ${total}`, { x: 11.9, y: 6.95, w: 1.0, h: 0.35, fontSize: 10, color: C.dorado, align: "right" });
}

function renderCierre(pptx: pptxgen, d: Diapositiva, meta: MetaPresentacion) {
  const s = pptx.addSlide();
  s.background = { color: C.azul };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: PAGE_W, h: 0.32, fill: { color: C.dorado }, line: { type: "none" } });
  s.addShape(pptx.ShapeType.ellipse, { x: 10.2, y: 4.2, w: 4.6, h: 4.6, fill: { type: "solid", color: C.azul, transparency: 100 }, line: { color: C.dorado, width: 1, transparency: 72 } });

  if (d.etiqueta)
    s.addText(d.etiqueta.toUpperCase(), { x: 0.85, y: 0.75, w: 11, h: 0.4, fontSize: 13, bold: true, color: C.dorado, charSpacing: 2 });
  s.addText(d.titulo, { x: 0.85, y: 1.15, w: 11.6, h: 0.8, fontSize: 32, bold: true, color: C.blanco, fit: "shrink" });

  let y = 2.35;
  for (const b of d.bloques) {
    if (b.tipo === "bullets") {
      s.addText(
        b.items.map((t) => ({ text: t, options: { bullet: { code: "25B8" }, color: "E2E8F0", fontSize: 16, paraSpaceAfter: 10 } })),
        { x: 1.0, y, w: 10.6, h: b.items.length * 0.55, valign: "top" },
      );
      y += b.items.length * 0.55 + 0.2;
    } else if (b.tipo === "nota") {
      s.addText(b.texto, {
        x: 1.0, y, w: 10.8, h: 0.8, fontSize: 14, italic: true, color: C.azul, valign: "middle",
        shape: pptx.ShapeType.roundRect, rectRadius: 0.08, fill: { color: C.dorado }, align: "left", inset: 0.12,
      });
      y += 1.0;
    }
  }
  s.addText("¡Gracias!  Continuamos con la Unidad 2.", { x: 0.85, y: 6.55, w: 8, h: 0.5, fontSize: 15, bold: true, color: C.dorado, valign: "middle" });
  s.addText(`Docente: ${meta.docente || "Por definir"}`, { x: 8.5, y: 6.55, w: 4.0, h: 0.5, fontSize: 12, color: "CBD5E1", align: "right", valign: "middle" });
}

/* ------------------------------- Contenido ------------------------------- */

function renderContenido(
  pptx: pptxgen,
  d: Diapositiva,
  pres: Presentacion,
  num: number,
  total: number,
) {
  const s = pptx.addSlide();
  s.background = { color: C.blanco };
  // Encabezado: franja dorada + bloque de etiqueta
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: PAGE_W, h: 0.2, fill: { color: C.dorado }, line: { type: "none" } });
  s.addShape(pptx.ShapeType.rect, { x: LX, y: 0.55, w: 0.12, h: 0.62, fill: { color: C.dorado }, line: { type: "none" } });
  if (d.etiqueta)
    s.addText(d.etiqueta.toUpperCase(), { x: LX + 0.25, y: 0.5, w: 11, h: 0.3, fontSize: 11, bold: true, color: C.dorado, charSpacing: 2 });
  s.addText(d.titulo, { x: LX + 0.25, y: 0.74, w: CW - 0.25, h: 0.6, fontSize: 25, bold: true, color: C.azul, fit: "shrink" });
  if (d.subtitulo)
    s.addText(d.subtitulo, { x: LX + 0.25, y: 1.3, w: CW - 0.25, h: 0.3, fontSize: 13, italic: true, color: C.tenue });

  let y = d.subtitulo ? TOP + 0.25 : TOP;
  for (const b of d.bloques) {
    y = renderBloque(pptx, s, b, y);
  }

  // Pie de página
  s.addShape(pptx.ShapeType.rect, { x: LX, y: 7.02, w: CW, h: 0.012, fill: { color: C.grisBorde }, line: { type: "none" } });
  s.addText(`${pres.asignatura} · ${pres.unidad}`, { x: LX, y: 7.08, w: 9, h: 0.3, fontSize: 9, color: C.tenue });
  s.addText(`${num} / ${total}`, { x: 11.9, y: 7.08, w: 1.0, h: 0.3, fontSize: 9, color: C.tenue, align: "right" });
}

export const estLineas = (txt: string, cpl = 95) => Math.max(1, Math.ceil(txt.length / cpl));

export function renderBloque(pptx: pptxgen, s: pptxgen.Slide, b: Bloque, y: number): number {
  switch (b.tipo) {
    /* ---- texto / listas ---- */
    case "bullets": {
      const h = Math.max(0.6, b.items.length * 0.52);
      s.addText(
        b.items.map((t) => ({
          text: t,
          options: { bullet: { code: "25AA", indent: 18 }, color: C.texto, fontSize: 15, paraSpaceAfter: 9 },
        })),
        { x: LX + 0.15, y, w: CW - 0.15, h, valign: "top", lineSpacingMultiple: 1.05 },
      );
      return y + h + 0.15;
    }

    case "nota": {
      const h = Math.max(0.55, estLineas(b.texto, 110) * 0.32 + 0.3);
      s.addShape(pptx.ShapeType.rect, { x: LX, y, w: 0.1, h, fill: { color: C.dorado }, line: { type: "none" } });
      s.addText(b.texto, { x: LX + 0.25, y, w: CW - 0.3, h, fontSize: 13, italic: true, color: C.tenue, valign: "middle" });
      return y + h + 0.2;
    }

    /* ---- fórmulas ---- */
    case "formulas": {
      const h = Math.max(0.9, b.items.length * 0.5 + 0.35);
      s.addText(
        b.items.map((t) => ({ text: t, options: { color: C.azul, fontSize: 18, bold: true, align: "center", paraSpaceAfter: 8 } })),
        {
          x: 1.1, y, w: 11.0, h, valign: "middle",
          shape: pptx.ShapeType.roundRect, rectRadius: 0.07, fill: { color: C.gris }, line: { color: C.grisBorde, width: 1 },
        },
      );
      return y + h + 0.2;
    }

    case "formulaDestacada": {
      const h = 1.15;
      s.addShape(pptx.ShapeType.roundRect, { x: 2.0, y, w: 9.3, h, rectRadius: 0.1, fill: { color: C.doradoClaro }, line: { color: C.dorado, width: 1.25 } });
      if (b.etiqueta)
        s.addText(b.etiqueta.toUpperCase(), { x: 2.0, y: y + 0.12, w: 9.3, h: 0.3, fontSize: 11, bold: true, color: C.dorado, align: "center", charSpacing: 2 });
      s.addText(b.formula, { x: 2.0, y: y + (b.etiqueta ? 0.38 : 0.1), w: 9.3, h: b.etiqueta ? 0.65 : 0.95, fontSize: 24, bold: true, color: C.azul, align: "center", valign: "middle" });
      return y + h + 0.22;
    }

    /* ---- tabla ---- */
    case "tabla": {
      const rows = [
        b.headers.map((t) => ({ text: t, options: { bold: true, color: C.blanco, fill: { color: C.azul }, fontSize: 13, align: "center" as const, valign: "middle" as const } })),
        ...b.filas.map((f, ri) =>
          f.map((c) => ({ text: c, options: { color: C.texto, fontSize: 13, fill: { color: ri % 2 ? C.gris : C.blanco }, valign: "middle" as const } })),
        ),
      ];
      const h = rows.length * 0.44;
      s.addTable(rows, { x: 1.1, y, w: 11.0, border: { type: "solid", pt: 0.5, color: C.grisBorde }, align: "left", valign: "middle", rowH: 0.4 });
      return y + h + 0.25;
    }

    /* ---- definición (caja conceptual) ---- */
    case "definicion": {
      const h = 0.55 + estLineas(b.texto, 92) * 0.32 + 0.2;
      s.addShape(pptx.ShapeType.roundRect, { x: LX, y, w: CW, h, rectRadius: 0.07, fill: { color: C.doradoClaro }, line: { color: C.dorado, width: 1 } });
      s.addShape(pptx.ShapeType.rect, { x: LX, y, w: 0.12, h, fill: { color: C.dorado }, line: { type: "none" } });
      s.addText(`▍ ${b.titulo}`, { x: LX + 0.3, y: y + 0.12, w: CW - 0.5, h: 0.32, fontSize: 14, bold: true, color: C.azul });
      s.addText(b.texto, { x: LX + 0.3, y: y + 0.5, w: CW - 0.55, h: h - 0.6, fontSize: 14, color: C.texto, valign: "top" });
      return y + h + 0.2;
    }

    /* ---- ejemplo paso a paso ---- */
    case "pasos": {
      const headH = 0.4;
      const enunH = 0.42;
      const stepH = 0.5;
      const resH = b.resultado ? 0.6 : 0;
      const h = 0.2 + headH + enunH + b.pasos.length * stepH + resH + 0.2;
      s.addShape(pptx.ShapeType.roundRect, { x: LX, y, w: CW, h, rectRadius: 0.07, fill: { color: C.gris }, line: { color: C.azulMedio, width: 1 } });
      s.addText("EJEMPLO RESUELTO", { x: LX + 0.25, y: y + 0.12, w: CW - 0.5, h: headH, fontSize: 11, bold: true, color: C.azulMedio, charSpacing: 2 });
      s.addText(b.enunciado, { x: LX + 0.25, y: y + 0.12 + headH, w: CW - 0.5, h: enunH, fontSize: 14, italic: true, color: C.texto });
      let cy = y + 0.2 + headH + enunH;
      b.pasos.forEach((p, i) => {
        s.addText(String(i + 1), {
          x: LX + 0.3, y: cy, w: 0.34, h: 0.34, fontSize: 12, bold: true, color: C.blanco, align: "center", valign: "middle",
          shape: pptx.ShapeType.ellipse, fill: { color: C.dorado },
        });
        s.addText(p, { x: LX + 0.78, y: cy - 0.04, w: CW - 1.1, h: stepH, fontSize: 14, color: C.texto, valign: "middle" });
        cy += stepH;
      });
      if (b.resultado) {
        s.addText(`Resultado:  ${b.resultado}`, {
          x: LX + 0.3, y: cy + 0.05, w: CW - 0.6, h: 0.45, fontSize: 14, bold: true, color: C.verde, valign: "middle",
          shape: pptx.ShapeType.roundRect, rectRadius: 0.06, fill: { color: C.verdeClaro }, inset: 0.12,
        });
      }
      return y + h + 0.22;
    }

    /* ---- ejercicio guiado ---- */
    case "ejercicioGuiado": {
      const baseH = 0.42 + 0.4 + (b.pista ? 0.4 : 0);
      const h = baseH + b.items.length * 0.42 + 0.45;
      s.addShape(pptx.ShapeType.roundRect, { x: LX, y, w: CW, h, rectRadius: 0.07, fill: { color: C.blanco }, line: { color: C.dorado, width: 1.25 } });
      s.addText("✎ EJERCICIO GUIADO", { x: LX + 0.25, y: y + 0.12, w: CW - 0.5, h: 0.32, fontSize: 11, bold: true, color: C.dorado, charSpacing: 1.5 });
      s.addText(b.enunciado, { x: LX + 0.25, y: y + 0.46, w: CW - 0.5, h: 0.4, fontSize: 14, bold: true, color: C.texto });
      let cy = y + 0.46 + 0.4;
      if (b.pista) {
        s.addText(`Pista: ${b.pista}`, { x: LX + 0.25, y: cy, w: CW - 0.5, h: 0.36, fontSize: 12, italic: true, color: C.tenue });
        cy += 0.4;
      }
      s.addText(
        b.items.map((t, i) => ({ text: `${i + 1}.  ${t}`, options: { color: C.texto, fontSize: 13, paraSpaceAfter: 6 } })),
        { x: LX + 0.4, y: cy, w: CW - 0.6, h: b.items.length * 0.42, valign: "top" },
      );
      return y + h + 0.22;
    }

    /* ---- proceso (chevrons) ---- */
    case "proceso": {
      const h = 0.95;
      const n = b.etapas.length;
      const gap = 0.06;
      const cw = (CW - gap * (n - 1)) / n;
      b.etapas.forEach((e, i) => {
        const x = LX + i * (cw + gap);
        s.addText(e, {
          x, y, w: cw, h, fontSize: 13, bold: true, color: C.blanco, align: "center", valign: "middle", inset: 0.15,
          shape: pptx.ShapeType.chevron, fill: { color: i % 2 ? C.azulMedio : C.azul }, line: { type: "none" },
        });
      });
      return y + h + 0.25;
    }

    /* ---- comparación (dos columnas) ---- */
    case "comparacion": {
      const maxItems = Math.max(b.izq.items.length, b.der.items.length);
      const h = 0.55 + maxItems * 0.42 + 0.3;
      const colW = (CW - 0.4) / 2;
      const cols = [
        { d: b.izq, x: LX, acento: C.azul, bg: C.gris },
        { d: b.der, x: LX + colW + 0.4, acento: C.dorado, bg: C.doradoClaro },
      ];
      for (const col of cols) {
        s.addShape(pptx.ShapeType.roundRect, { x: col.x, y, w: colW, h, rectRadius: 0.07, fill: { color: col.bg }, line: { color: col.acento, width: 1 } });
        s.addText(col.d.titulo, {
          x: col.x, y, w: colW, h: 0.45, fontSize: 14, bold: true, color: C.blanco, align: "center", valign: "middle",
          shape: pptx.ShapeType.rect, fill: { color: col.acento },
        });
        s.addText(
          col.d.items.map((t) => ({ text: t, options: { bullet: { code: "25AA", indent: 16 }, color: C.texto, fontSize: 13, paraSpaceAfter: 7 } })),
          { x: col.x + 0.25, y: y + 0.55, w: colW - 0.45, h: h - 0.65, valign: "top" },
        );
      }
      return y + h + 0.25;
    }

    /* ---- aplicación marítima ---- */
    case "aplicacion": {
      const h = 0.45 + 0.42 + b.pasos.length * 0.4 + (b.resultado ? 0.55 : 0) + 0.3;
      s.addShape(pptx.ShapeType.roundRect, { x: LX, y, w: CW, h, rectRadius: 0.07, fill: { color: C.gris }, line: { color: C.azulMedio, width: 1 } });
      s.addText(`⚓  ${b.titulo}`, {
        x: LX, y, w: CW, h: 0.45, fontSize: 13, bold: true, color: C.blanco, valign: "middle", inset: 0.18,
        shape: pptx.ShapeType.rect, fill: { color: C.azulMedio },
      });
      s.addText(b.enunciado, { x: LX + 0.25, y: y + 0.55, w: CW - 0.5, h: 0.4, fontSize: 14, italic: true, color: C.texto });
      let cy = y + 0.55 + 0.42;
      s.addText(
        b.pasos.map((t) => ({ text: t, options: { bullet: { code: "2192", indent: 16 }, color: C.texto, fontSize: 13, paraSpaceAfter: 5 } })),
        { x: LX + 0.4, y: cy, w: CW - 0.7, h: b.pasos.length * 0.4, valign: "top" },
      );
      cy += b.pasos.length * 0.4;
      if (b.resultado) {
        s.addText(`Resultado:  ${b.resultado}`, {
          x: LX + 0.25, y: cy, w: CW - 0.5, h: 0.45, fontSize: 14, bold: true, color: C.verde, valign: "middle",
          shape: pptx.ShapeType.roundRect, rectRadius: 0.06, fill: { color: C.verdeClaro }, inset: 0.12,
        });
      }
      return y + h + 0.22;
    }

    /* ---- compatibilidad (ejemplo / ejercicio simples) ---- */
    case "ejemplo":
      return caja(pptx, s, y, "Ejemplo resuelto", b.enunciado, b.pasos, C.azulMedio);
    case "ejercicio":
      return caja(pptx, s, y, "Ejercicio para el alumno", "", b.items, C.dorado);
  }
}

function caja(
  pptx: pptxgen,
  s: pptxgen.Slide,
  y: number,
  titulo: string,
  enunciado: string,
  lineas: string[],
  acento: string,
): number {
  const nLines = lineas.length + (enunciado ? 1 : 0);
  const h = 0.55 + nLines * 0.42;
  s.addShape(pptx.ShapeType.roundRect, { x: LX, y, w: CW, h, rectRadius: 0.07, fill: { color: C.gris }, line: { color: acento, width: 1 } });
  s.addText(titulo, { x: LX + 0.25, y: y + 0.12, w: CW - 0.5, h: 0.32, fontSize: 13, bold: true, color: acento });
  const cuerpo: { text: string; options: object }[] = [];
  if (enunciado) cuerpo.push({ text: enunciado, options: { fontSize: 14, italic: true, color: C.texto, paraSpaceAfter: 6 } });
  lineas.forEach((l) =>
    cuerpo.push({ text: l, options: { fontSize: 14, color: C.texto, bullet: enunciado ? false : { code: "25AA" }, paraSpaceAfter: 4 } }),
  );
  s.addText(cuerpo, { x: LX + 0.35, y: y + 0.5, w: CW - 0.6, h: h - 0.6, valign: "top" });
  return y + h + 0.2;
}
