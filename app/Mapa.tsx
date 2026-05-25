<button
  onClick={() => setDarkMode(!darkMode)}
  style={{
    position: "absolute",
    top: 175,
    right: 16,
    zIndex: 2000,
    border: "none",
    borderRadius: 999,
    padding: "12px 16px",
    background: darkMode ? "#f8fafc" : "#020617",
    color: darkMode ? "#020617" : "white",
    fontWeight: 900,
    boxShadow: "0 10px 25px rgba(0,0,0,.35)",
  }}
>
  {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
</button>