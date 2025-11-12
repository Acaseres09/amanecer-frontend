import React, { useEffect, useState } from "react";
import "./styles.css";

// ✅ CAMBIO PARA PRODUCCIÓN: Vuelve a usar localhost como fallback.
// La URL de producción (HTTPS) se inyectará en Vercel/Netlify usando VITE_BACKEND_URL.
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3500";
 

export default function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [permission, setPermission] = useState(Notification.permission);
  const [current, setCurrent] = useState({ index: 0, text: "", date: "" }); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Fetch mensaje diario desde backend ---
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/mensajes`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setCurrent({
          index: data.index,
          text: data.mensaje,
          date: data.fecha // Recibe correctamente la fecha
        });
      } catch (err) {
        console.error(err);
        setError("No se pudo conectar con el backend");
        setCurrent(prev => ({
          ...prev,
          text: "Aquí debería aparecer tu mensaje diario."
        }));
      } finally {
        setLoading(false);
      }
    };
    fetchMessage();
  }, []);

  // --- Modo oscuro/claro ---
  useEffect(() => {
    const body = document.body;
    body.classList.add("transitioning");
    body.className = darkMode ? "dark" : "light";
    localStorage.setItem("darkMode", darkMode);
    const timeout = setTimeout(() => body.classList.remove("transitioning"), 500);
    return () => clearTimeout(timeout);
  }, [darkMode]);

  // --- Solicitar permiso de notificaciones ---
  async function requestPermission() {
    const p = await Notification.requestPermission();
    setPermission(p);
    if (p === "granted") subscribeAndSendToServer();

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "schedule-notifications" });
    } else {
      setTimeout(() => {
        if (navigator.serviceWorker.controller)
          navigator.serviceWorker.controller.postMessage({ type: "schedule-notifications" });
      }, 1500);
    }
  }

  function toggleDarkMode() {
    setDarkMode(prev => !prev);
  }

  return (
    <div className="container" role="application" aria-label="Mensajes que iluminan">
      <div className="header">
        <div>
          <div className="title">{darkMode ? "🌙 Aurora Nocturna" : "🌅 Amanecer "}</div>
          <div className="subtitle">Una dosis amable</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <button className="btn small" onClick={toggleDarkMode}>
            {darkMode ? "☀️ Modo claro" : "🌙 Modo noche"}
          </button>
        </div>
      </div>

      <div className="card" aria-live="polite">
        <div className="msg fade-in" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontWeight: "600", fontSize: "16px" }}>Mensaje #{current.index}</div>
          <div style={{ fontSize: "13px", color: "var(--muted)" }}>{current.date}</div> 
          <div style={{ fontSize: "18px", lineHeight: "1.5" }}>
            {loading ? "Cargando..." : current.text}
          </div>
          {error && (
            <div style={{ fontSize: "14px", color: "red" }}>
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="controls">
        <button className="btn accent" onClick={requestPermission}>
          {permission === "granted" ? "Notificaciones activas" : "Activar notificaciones"}
        </button>
      </div>

      <div className="small">
        Puedes instalar la app (Agregar a pantalla de inicio) para recibir
        notificaciones en segundo plano cuando el navegador lo permita.
      </div>

      <div className="footer">Hecho con amor para ti, Anto.</div>
    </div>
  );
}

// --- Helper para Push Notifications ---
async function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function subscribeAndSendToServer() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const resp = await fetch(`${BACKEND_URL}/vapid-public`);
    let vapidPublic = null;
    if (resp.ok) {
      const data = await resp.json();
      vapidPublic = data.publicKey;
    }
    if (!vapidPublic) {
      console.warn("No VAPID public key available.");
    }
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublic ? await urlBase64ToUint8Array(vapidPublic) : undefined,
    });
    await fetch(`${BACKEND_URL}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub),
    });
    return sub;
  } catch (e) {
    console.error("subscribe failed", e);
  }
}