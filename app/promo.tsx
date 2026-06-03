"use client";

import { useEffect, useState } from "react";

const escenas = [
  ["🚍", "¿Esperando el camión?", "Rutas Tampico MAFA te ayuda a ubicar rutas de forma más fácil."],
  ["📍", "Busca tu ruta", "Encuentra rutas disponibles en Tampico, Madero y Altamira."],
  ["🚌", "Reporta tu camión", "Cuando te subas, ayuda a otros usuarios reportando la ruta."],
  ["🗺️", "Ve el mapa", "Entre más personas la usen, mejor funcionará para todos."],
  ["📲", "Comparte la app", "Mándala por WhatsApp o Facebook a quien use transporte público."],
];

export default function Promo() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setI((prev) => (prev + 1) % escenas.length);
    }, 2800);

    return () => clearInterval(t);
  }, []);

  const [icono, titulo, texto] = escenas[i];

  return (
    <main style={styles.fondo}>
      <section style={styles.video}>
        <div style={styles.logo}>🚍 Rutas Tampico MAFA</div>

        <div style={styles.mapa}>
          <div style={styles.linea1}></div>
          <div style={styles.linea2}></div>
          <div style={styles.bus}>🚌</div>
          <div style={styles.pin}>📍</div>
        </div>

        <div style={styles.card}>
          <div style={styles.icono}>{icono}</div>
          <h1 style={styles.titulo}>{titulo}</h1>
          <p style={styles.texto}>{texto}</p>
        </div>

        <div style={styles.footer}>
          Entra desde tu celular<br />
          <strong>rutas-tampico-mafa.vercel.app</strong>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  fondo: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #001b3a, #005f99, #00b894)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
  },
  video: {
    width: "390px",
    height: "690px",
    background: "linear-gradient(180deg, #06203f, #061526)",
    borderRadius: "32px",
    padding: "24px",
    color: "white",
    boxShadow: "0 20px 60px rgba(0,0,0,.45)",
    position: "relative",
    overflow: "hidden",
  },
  logo: {
    fontSize: "18px",
    fontWeight: 800,
    marginBottom: "30px",
  },
  mapa: {
    height: "210px",
    background: "rgba(255,255,255,.08)",
    borderRadius: "26px",
    position: "relative",
    marginBottom: "34px",
  },
  linea1: {
    position: "absolute",
    width: "220px",
    height: "5px",
    background: "#38bdf8",
    top: "75px",
    left: "70px",
    borderRadius: "10px",
  },
  linea2: {
    position: "absolute",
    width: "250px",
    height: "5px",
    background: "#2ee59d",
    top: "130px",
    left: "45px",
    borderRadius: "10px",
  },
  bus: {
    position: "absolute",
    fontSize: "44px",
    top: "92px",
    left: "145px",
  },
  pin: {
    position: "absolute",
    fontSize: "34px",
    top: "85px",
    left: "80px",
  },
  card: {
    background: "white",
    color: "#111827",
    borderRadius: "28px",
    padding: "26px",
    minHeight: "220px",
  },
  icono: {
    fontSize: "52px",
    marginBottom: "12px",
  },
  titulo: {
    fontSize: "34px",
    lineHeight: "36px",
    margin: "0 0 14px",
    fontWeight: 900,
  },
  texto: {
    fontSize: "18px",
    lineHeight: "25px",
    color: "#374151",
  },
  footer: {
    position: "absolute",
    bottom: "22px",
    left: "24px",
    right: "24px",
    textAlign: "center",
    background: "rgba(255,255,255,.15)",
    padding: "14px",
    borderRadius: "18px",
    fontSize: "15px",
  },
};