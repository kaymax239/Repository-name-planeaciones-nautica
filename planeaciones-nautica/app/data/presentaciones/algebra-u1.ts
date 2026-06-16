import type { Presentacion } from "./tipos";

// Presentación profesional: Álgebra (ALG103) — Unidad 1: Álgebra Elemental.
// Fuente académica (temario, objetivo y bibliografía): programa oficial
// PPE_LPN_FIDENA_2022. Subtemas 1.1–1.8 verbatim del PDF.
// Ejemplos, fórmulas, diagramas y ejercicios ilustran esos subtemas oficiales
// (material didáctico del docente; no inventan temario nuevo, no usan IA).

export const presentacionAlgebraU1: Presentacion = {
  asignatura: "Álgebra",
  clave: "ALG103",
  unidad: "Unidad 1: Álgebra Elemental",
  carrera: "Licenciatura en Piloto Naval",
  semestre: "I Semestre",
  diapositivas: [
    /* 1 — Portada */
    {
      layout: "portada",
      titulo: "Álgebra",
      subtitulo: "Unidad 1 · Álgebra Elemental",
      bloques: [],
    },

    /* 2 — Objetivo */
    {
      etiqueta: "Propósito de la unidad",
      titulo: "¿Qué lograremos en esta unidad?",
      bloques: [
        {
          tipo: "definicion",
          titulo: "Objetivo específico (programa oficial)",
          texto:
            "Relacionar la aritmética y el álgebra mediante letras y números, interpretando fórmulas y utilizando el lenguaje algebraico, para la correcta resolución de problemas.",
        },
        {
          tipo: "bullets",
          items: [
            "Traducir situaciones al lenguaje algebraico y operar con expresiones.",
            "Dominar exponentes, radicales, productos notables y factorización.",
            "Aplicar el álgebra a problemas inherentes a la profesión náutica.",
          ],
        },
        {
          tipo: "nota",
          texto:
            "Objetivo general del curso: obtener los conocimientos matemáticos básicos para resolver algebraicamente problemáticas inherentes a la profesión.",
        },
      ],
    },

    /* 3 — Agenda */
    {
      etiqueta: "Agenda",
      titulo: "Ruta de la Unidad 1",
      bloques: [
        {
          tipo: "proceso",
          etapas: [
            "Bloque I · Fundamentos (1.1–1.3)",
            "Bloque II · Operaciones (1.4–1.6)",
            "Bloque III · Fracciones y binomio (1.7–1.8)",
          ],
        },
        {
          tipo: "comparacion",
          izq: {
            titulo: "Lenguaje y estructura",
            items: [
              "1.1 Conceptos fundamentales de álgebra",
              "1.2 Expresiones algebraicas",
              "1.3 Exponentes y radicales",
              "1.4 Operaciones algebraicas básicas",
            ],
          },
          der: {
            titulo: "Técnicas y aplicaciones",
            items: [
              "1.5 Productos notables",
              "1.6 Factorización",
              "1.7 Operaciones con fracciones algebraicas",
              "1.8 Teorema del binomio",
            ],
          },
        },
      ],
    },

    /* 4 — Divisor Bloque I */
    {
      layout: "divisor",
      etiqueta: "Bloque I",
      titulo: "Fundamentos del lenguaje algebraico",
      subtitulo: "Subtemas 1.1 a 1.3 — del número a la literal",
      bloques: [],
    },

    /* 5 — 1.1 Conceptos */
    {
      etiqueta: "Subtema 1.1",
      titulo: "Conceptos fundamentales de álgebra",
      bloques: [
        {
          tipo: "comparacion",
          izq: {
            titulo: "Aritmética",
            items: ["Trabaja con números concretos", "3 + 5 = 8", "Doble de 7 = 14", "Área = 4 × 6"],
          },
          der: {
            titulo: "Álgebra (lenguaje simbólico)",
            items: ["Generaliza con literales", "a + b", "2x", "A = b · h"],
          },
        },
        {
          tipo: "definicion",
          titulo: "Términos clave",
          texto:
            "Variable: símbolo que representa un valor que puede cambiar (x, y, t). Constante: valor fijo. Coeficiente: factor numérico de un término. Término: producto de constantes y variables, separados por + o −.",
        },
      ],
    },

    /* 6 — 1.1 Lenguaje algebraico */
    {
      etiqueta: "Subtema 1.1",
      titulo: "Lenguaje algebraico",
      bloques: [
        {
          tipo: "bullets",
          items: [
            "«El doble de un número» → 2x",
            "«Un número disminuido en 5» → x − 5",
            "«El cuadrado de la suma de dos números» → (a + b)²",
          ],
        },
        {
          tipo: "pasos",
          enunciado: "Expresar: «el triple de un número aumentado en 7».",
          pasos: ["Un número: x", "El triple del número: 3x", "Aumentado en 7: 3x + 7"],
          resultado: "3x + 7",
        },
      ],
    },

    /* 7 — 1.2 Expresiones algebraicas */
    {
      etiqueta: "Subtema 1.2",
      titulo: "Expresiones algebraicas",
      bloques: [
        {
          tipo: "comparacion",
          izq: {
            titulo: "Por número de términos",
            items: ["Monomio: 1 término (5x²)", "Binomio: 2 términos (x + 3)", "Trinomio: 3 términos (x² + 5x + 6)", "Polinomio: varios términos"],
          },
          der: {
            titulo: "Propiedades",
            items: ["Grado: mayor exponente de la variable", "Términos semejantes: igual parte literal", "Se reducen sumando coeficientes", "Evaluar: sustituir la variable por un valor"],
          },
        },
        { tipo: "formulaDestacada", etiqueta: "Forma general de un polinomio", formula: "P(x) = aₙxⁿ + … + a₁x + a₀" },
      ],
    },

    /* 8 — 1.2 Práctica */
    {
      etiqueta: "Subtema 1.2",
      titulo: "Práctica: evaluar y clasificar",
      bloques: [
        {
          tipo: "pasos",
          enunciado: "Evaluar P(x) = 2x² − 3x + 1 para x = 2.",
          pasos: ["P(2) = 2(2)² − 3(2) + 1", "= 2·4 − 6 + 1", "= 8 − 6 + 1"],
          resultado: "P(2) = 3",
        },
        {
          tipo: "ejercicioGuiado",
          enunciado: "Clasifica y evalúa los siguientes polinomios.",
          pista: "Cuenta los términos para clasificar; sustituye con cuidado los signos.",
          items: ["Clasifica y da el grado de 5x³ − 2x + 7.", "Evalúa Q(x) = x² + 4x − 5 para x = −1."],
        },
      ],
    },

    /* 9 — 1.3 Exponentes */
    {
      etiqueta: "Subtema 1.3",
      titulo: "Leyes de los exponentes",
      bloques: [
        {
          tipo: "formulas",
          items: [
            "aᵐ · aⁿ = aᵐ⁺ⁿ          aᵐ ÷ aⁿ = aᵐ⁻ⁿ          (aᵐ)ⁿ = aᵐⁿ",
            "(a·b)ⁿ = aⁿ · bⁿ          a⁰ = 1  (a ≠ 0)          a⁻ⁿ = 1 / aⁿ",
          ],
        },
        {
          tipo: "nota",
          texto: "Estas leyes permiten simplificar productos, cocientes y potencias antes de operar polinomios.",
        },
      ],
    },

    /* 10 — 1.3 Radicales */
    {
      etiqueta: "Subtema 1.3",
      titulo: "Radicales",
      bloques: [
        { tipo: "formulas", items: ["√(a·b) = √a · √b          ⁿ√(aᵐ) = a^(m/n)          1/√a = √a / a"] },
        {
          tipo: "pasos",
          enunciado: "Simplificar √50 y racionalizar 1/√2.",
          pasos: ["√50 = √(25·2) = √25 · √2 = 5√2", "1/√2 = (1·√2)/(√2·√2) = √2 / 2"],
          resultado: "5√2   y   √2⁄2",
        },
      ],
    },

    /* 11 — Divisor Bloque II */
    {
      layout: "divisor",
      etiqueta: "Bloque II",
      titulo: "Operaciones y estructura algebraica",
      subtitulo: "Subtemas 1.4 a 1.6 — operar, multiplicar y factorizar",
      bloques: [],
    },

    /* 12 — 1.4 Operaciones */
    {
      etiqueta: "Subtema 1.4",
      titulo: "Operaciones algebraicas básicas",
      bloques: [
        { tipo: "proceso", etapas: ["Suma y resta", "Multiplicación", "División"] },
        {
          tipo: "bullets",
          items: [
            "Suma y resta: reducir términos semejantes (sumar coeficientes).",
            "Multiplicación: propiedad distributiva + ley de exponentes.",
            "División: entre monomios o división larga de polinomios.",
          ],
        },
      ],
    },

    /* 13 — 1.4 Práctica */
    {
      etiqueta: "Subtema 1.4",
      titulo: "Práctica: operaciones con polinomios",
      bloques: [
        {
          tipo: "pasos",
          enunciado: "Sumar (2x² + 3x − 5) + (x² − x + 2).",
          pasos: ["Agrupar semejantes: (2x² + x²) + (3x − x) + (−5 + 2)", "Sumar coeficientes en cada grupo"],
          resultado: "3x² + 2x − 3",
        },
        {
          tipo: "pasos",
          enunciado: "Dividir (x² + 5x + 6) ÷ (x + 2).",
          pasos: ["Factorizar el dividendo: x² + 5x + 6 = (x + 2)(x + 3)", "Cancelar el factor (x + 2)"],
          resultado: "x + 3",
        },
      ],
    },

    /* 14 — 1.5 Productos notables */
    {
      etiqueta: "Subtema 1.5",
      titulo: "Productos notables",
      bloques: [
        {
          tipo: "formulas",
          items: [
            "(a + b)² = a² + 2ab + b²          (a − b)² = a² − 2ab + b²",
            "(a + b)(a − b) = a² − b²          (a + b)³ = a³ + 3a²b + 3ab² + b³",
          ],
        },
        { tipo: "nota", texto: "Son patrones que evitan multiplicar término a término: reconocerlos acelera el cálculo." },
      ],
    },

    /* 15 — 1.5 Práctica */
    {
      etiqueta: "Subtema 1.5",
      titulo: "Práctica: productos notables",
      bloques: [
        {
          tipo: "pasos",
          enunciado: "Desarrollar (x + 4)² y (2x − 3)(2x + 3).",
          pasos: ["(x + 4)² = x² + 2(x)(4) + 4² = x² + 8x + 16", "(2x − 3)(2x + 3) = (2x)² − 3² = 4x² − 9"],
          resultado: "x² + 8x + 16   y   4x² − 9",
        },
        {
          tipo: "ejercicioGuiado",
          enunciado: "Aplica el patrón correcto en cada caso.",
          pista: "Identifica primero si es cuadrado de un binomio o suma por diferencia.",
          items: ["Desarrolla (3x − 2)².", "Desarrolla (x + 5)(x − 5)."],
        },
      ],
    },

    /* 16 — 1.6 Factorización */
    {
      etiqueta: "Subtema 1.6",
      titulo: "Factorización",
      bloques: [
        { tipo: "proceso", etapas: ["Identificar la forma", "Elegir el método", "Verificar el producto"] },
        {
          tipo: "bullets",
          items: [
            "Factor común: ax + ay = a(x + y).",
            "Agrupación de términos.",
            "Diferencia de cuadrados: a² − b² = (a + b)(a − b).",
            "Trinomio cuadrado perfecto y trinomio x² + bx + c.",
            "Suma / diferencia de cubos: a³ ± b³.",
          ],
        },
      ],
    },

    /* 17 — 1.6 Práctica */
    {
      etiqueta: "Subtema 1.6",
      titulo: "Práctica: factorización",
      bloques: [
        {
          tipo: "pasos",
          enunciado: "Factorizar x² − 9 y x² + 5x + 6.",
          pasos: ["x² − 9 es diferencia de cuadrados → (x + 3)(x − 3)", "x² + 5x + 6: dos números que sumen 5 y multipliquen 6 → 2 y 3"],
          resultado: "(x + 3)(x − 3)   y   (x + 2)(x + 3)",
        },
        {
          tipo: "ejercicioGuiado",
          enunciado: "Factoriza completamente.",
          pista: "Revisa primero si hay factor común; luego identifica el patrón.",
          items: ["Factoriza 4x² − 25.", "Factoriza x² − 7x + 12."],
        },
      ],
    },

    /* 18 — Divisor Bloque III */
    {
      layout: "divisor",
      etiqueta: "Bloque III",
      titulo: "Fracciones algebraicas y teorema del binomio",
      subtitulo: "Subtemas 1.7 y 1.8 — generalizar y expandir",
      bloques: [],
    },

    /* 19 — 1.7 Fracciones */
    {
      etiqueta: "Subtema 1.7",
      titulo: "Operaciones con fracciones algebraicas",
      bloques: [
        {
          tipo: "bullets",
          items: [
            "Simplificar: factorizar numerador y denominador y cancelar factores comunes.",
            "Suma / resta: usar común denominador.",
            "Multiplicación: numerador × numerador, denominador × denominador.",
            "División: multiplicar por el recíproco.",
          ],
        },
        {
          tipo: "pasos",
          enunciado: "Simplificar (x² − 9) / (x + 3).",
          pasos: ["Factorizar el numerador: x² − 9 = (x + 3)(x − 3)", "Cancelar el factor común (x + 3)"],
          resultado: "x − 3   (x ≠ −3)",
        },
      ],
    },

    /* 20 — 1.7 Práctica */
    {
      etiqueta: "Subtema 1.7",
      titulo: "Práctica: fracciones algebraicas",
      bloques: [
        {
          tipo: "ejercicioGuiado",
          enunciado: "Opera y simplifica.",
          pista: "Para simplificar, factoriza antes de cancelar; para sumar, busca el común denominador.",
          items: ["Simplifica (x² − 4)/(x − 2).", "Suma 1/x + 1/(x + 1)."],
        },
        {
          tipo: "nota",
          texto: "Recuerda indicar las restricciones del dominio: los valores que anulan el denominador no son válidos.",
        },
      ],
    },

    /* 21 — 1.8 Teorema del binomio */
    {
      etiqueta: "Subtema 1.8",
      titulo: "Teorema del binomio",
      bloques: [
        { tipo: "formulaDestacada", etiqueta: "Desarrollo de una potencia de binomio", formula: "(a + b)ⁿ = Σ C(n,k) · aⁿ⁻ᵏ · bᵏ ,   C(n,k) = n! / [k!(n − k)!]" },
        {
          tipo: "tabla",
          headers: ["n", "Coeficientes (Triángulo de Pascal)"],
          filas: [
            ["1", "1   1"],
            ["2", "1   2   1"],
            ["3", "1   3   3   1"],
            ["4", "1   4   6   4   1"],
          ],
        },
      ],
    },

    /* 22 — 1.8 Práctica */
    {
      etiqueta: "Subtema 1.8",
      titulo: "Práctica: teorema del binomio",
      bloques: [
        {
          tipo: "pasos",
          enunciado: "Desarrollar (x + 2)³.",
          pasos: [
            "Coeficientes (n = 3) del Triángulo de Pascal: 1, 3, 3, 1",
            "= 1·x³ + 3·x²·2 + 3·x·2² + 1·2³",
            "= x³ + 3·2·x² + 3·4·x + 8",
          ],
          resultado: "x³ + 6x² + 12x + 8",
        },
        {
          tipo: "ejercicioGuiado",
          enunciado: "Desarrolla usando los coeficientes de Pascal.",
          pista: "Para (2x − 1)³ recuerda que el segundo término es negativo: alterna los signos.",
          items: ["Desarrolla (x + 1)⁴.", "Desarrolla (2x − 1)³."],
        },
      ],
    },

    /* 23 — Aplicación marítima */
    {
      etiqueta: "Aplicación profesional",
      titulo: "El álgebra en el ámbito marítimo",
      bloques: [
        {
          tipo: "aplicacion",
          titulo: "Consumo de combustible (proporcionalidad)",
          enunciado: "El consumo es proporcional a la distancia: C = k·d. Un buque consume 1 200 L en 300 mn.",
          pasos: ["Calcular la constante: k = C / d = 1200 / 300 = 4 L/mn", "Estimar para 450 mn: C = 4 · 450"],
          resultado: "C = 1 800 L",
        },
        {
          tipo: "aplicacion",
          titulo: "Velocidad, distancia y tiempo (despeje)",
          enunciado: "De la fórmula v = d / t se despeja la incógnita requerida en la navegación.",
          pasos: ["Recorrer 120 mn a 15 nudos: t = d / v = 120 / 15", "El lenguaje algebraico permite despejar t, d o v según el dato buscado"],
          resultado: "t = 8 h",
        },
      ],
    },

    /* 24 — Formulario */
    {
      etiqueta: "Síntesis",
      titulo: "Formulario de la unidad",
      bloques: [
        {
          tipo: "formulas",
          items: [
            "Exponentes:  aᵐ·aⁿ = aᵐ⁺ⁿ    (aᵐ)ⁿ = aᵐⁿ    a⁻ⁿ = 1/aⁿ",
            "Productos notables:  (a ± b)² = a² ± 2ab + b²    (a + b)(a − b) = a² − b²",
            "Factorización:  a² − b² = (a + b)(a − b)",
            "Binomio:  (a + b)ⁿ = Σ C(n,k) aⁿ⁻ᵏ bᵏ",
          ],
        },
      ],
    },

    /* 25 — Resumen */
    {
      etiqueta: "Resumen",
      titulo: "Mapa de la Unidad 1",
      bloques: [
        {
          tipo: "proceso",
          etapas: ["Lenguaje (1.1–1.2)", "Reglas: exponentes y operaciones (1.3–1.4)", "Productos y factorización (1.5–1.6)", "Fracciones y binomio (1.7–1.8)"],
        },
        {
          tipo: "comparacion",
          izq: {
            titulo: "Qué aprendiste",
            items: ["Traducir y operar expresiones", "Productos notables y factorización", "Fracciones algebraicas y binomio"],
          },
          der: {
            titulo: "Para qué lo aplicas",
            items: ["Modelar cálculos a bordo (C = k·d)", "Despejar fórmulas (v = d/t)", "Resolver problemas de la profesión"],
          },
        },
      ],
    },

    /* 26 — Evaluación */
    {
      etiqueta: "Evaluación",
      titulo: "Plan de evaluación (DEN/526/2025)",
      bloques: [
        {
          tipo: "tabla",
          headers: ["Criterio", "Ponderación"],
          filas: [
            ["Prácticas y actividades de aprendizaje", "70%"],
            ["Conocimiento", "20%"],
            ["Participaciones y uso de las TIC's", "10%"],
          ],
        },
        {
          tipo: "nota",
          texto:
            "Escala: 7.0 a 10.0 Competente (aprobatorio); 0.0 a 6.9 Aún no competente. Mínima aprobatoria: 7.0.",
        },
      ],
    },

    /* 27 — Cierre */
    {
      layout: "cierre",
      etiqueta: "Cierre de la sesión",
      titulo: "Lo esencial que te llevas",
      bloques: [
        {
          tipo: "bullets",
          items: [
            "El álgebra generaliza la aritmética con literales y fórmulas.",
            "Productos notables y factorización son operaciones inversas.",
            "El despeje de fórmulas resuelve problemas reales de navegación.",
          ],
        },
        {
          tipo: "nota",
          texto: "Para la próxima sesión: repasar el formulario y resolver los ejercicios guiados de cada subtema.",
        },
      ],
    },

    /* 28 — Bibliografía */
    {
      etiqueta: "Fuentes de consulta",
      titulo: "Bibliografía oficial",
      bloques: [
        {
          tipo: "definicion",
          titulo: "Bibliografía básica",
          texto:
            "Swokowski, Earl W. Álgebra y Trigonometría con Geometría Analítica. Grupo Iberoamérica, 1988.",
        },
        {
          tipo: "bullets",
          items: [
            "Baldor, Aurelio. Álgebra. Publicaciones Culturales, 2009.",
            "Rees, Paul; Sparks, Fred. Álgebra. Reverté, 2003.",
          ],
        },
        {
          tipo: "nota",
          texto: "Referencias del programa oficial de la asignatura (PPE_LPN_FIDENA_2022).",
        },
      ],
    },
  ],
};
