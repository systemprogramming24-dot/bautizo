// =============================
// script.js - completo & funcional
// - Supabase (usa tu key ya conocida)
// - Música con overlay + botón flotante
// - Cargar invitado desde tabla "guests" por key en URL
// - Mostrar formulario / confirmar asistencia / cambiar
// - Contador regresivo
// - Brillos dorados decorativos
// =============================

// ---------- Supabase config (la tuya) ----------
const SUPABASE_URL = "https://rsjyfchiynskjddpjupt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzanlmY2hpeW5za2pkZHBqdXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTkzMzEsImV4cCI6MjA3NTI5NTMzMX0.pxnbFP03pSWra1zOrCsR8ADyWF3wpGN88BQlameVRWM";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------- Elementos DOM ----------
const musica = document.getElementById("musica");
const overlayMusica = document.getElementById("overlayMusica");
const btnStart = document.getElementById("btnStart");
const btnMusica = document.getElementById("btnMusica");

const nombreEl = document.getElementById("nombre");
const mensajeEl = document.getElementById("mensaje");
const form = document.getElementById("formConfirmar");
const btnCambiar = document.getElementById("cambiar");

// contador
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

// Key del invitado: uso la primera key de query string como en tu flujo anterior
const params = new URLSearchParams(window.location.search);
const guestKey = Array.from(params.keys())[0] || null;

let invitadoActual = null;
let sonidoActivado = false;

// ---------- Música: activar con interacción (robusto) ----------
window.addEventListener("load", () => {
  musica.volume = 0.35;
  musica.muted = true;
  musica.pause();
});

async function activarMusica() {
  try {
    // intentar reproducir con promesa
    musica.muted = false;
    musica.currentTime = 0;
    const playPromise = musica.play();
    if (playPromise !== undefined) {
      await playPromise;
    }
    sonidoActivado = true;
    btnMusica.textContent = "🔊";
    overlayMusica.classList.add("fade-out");
    setTimeout(() => overlayMusica.style.display = "none", 650);
  } catch (e) {
    console.warn("No se pudo iniciar la música automáticamente:", e);
    // mantener overlay visible si falla
  }
}

// eventos overlay y boton
btnStart && btnStart.addEventListener("click", activarMusica);
overlayMusica && overlayMusica.addEventListener("click", activarMusica);

btnMusica.addEventListener("click", async () => {
  if (!sonidoActivado) {
    await activarMusica();
    return;
  }
  if (musica.paused) {
    await musica.play();
    btnMusica.textContent = "🔊";
  } else {
    musica.pause();
    btnMusica.textContent = "🎶";
  }
});

// ---------- Cargar invitado desde Supabase ----------
async function cargarInvitado() {
  if (!guestKey) {
    // Si no hay key, mostrar nombre genérico y no mostrar form
    nombreEl.textContent = "Querido invitado";
    // dejamos form oculto
    return;
  }

  try {
    const { data, error } = await supabase
      .from("guests")
      .select("guest, confirm, persons")
      .eq("key", guestKey)
      .single();

    if (error || !data) {
      console.warn("Invitación no encontrada o error:", error);
      nombreEl.textContent = "Invitación no encontrada 😕";
      return;
    }

    invitadoActual = data;
    nombreEl.textContent = `Hola ${data.guest} 👋`;

    if (data.confirm) {
      mensajeEl.textContent = `✅ Ya confirmaste tu asistencia (${data.persons} persona${data.persons > 1 ? "s" : ""}).`;
      btnCambiar.style.display = "inline-block";
    } else {
      form.style.display = "block";
    }

  } catch (err) {
    console.error("Error al cargar invitado:", err);
    nombreEl.textContent = "Invitación no válida";
  }
}

// formulario: confirmar asistencia
form && form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const persons = parseInt(document.getElementById("cantidad").value);
  if (!guestKey) return;

  try {
    const { error } = await supabase
      .from("guests")
      .update({ confirm: true, persons })
      .eq("key", guestKey);

    if (error) {
      mensajeEl.textContent = "❌ Error al confirmar asistencia.";
      console.error(error);
      return;
    }

    form.style.display = "none";
    mensajeEl.textContent = "🎉 ¡Gracias por confirmar tu asistencia! Nos vemos pronto 💛";
    btnCambiar.style.display = "inline-block";
  } catch (err) {
    console.error(err);
    mensajeEl.textContent = "❌ Error inesperado, intenta de nuevo.";
  }
});

// cambiar respuesta
btnCambiar && btnCambiar.addEventListener("click", async () => {
  if (!confirm("¿Deseas cambiar tu respuesta?")) return;
  if (!guestKey) return;

  try {
    const { error } = await supabase
      .from("guests")
      .update({ confirm: false, persons: null })
      .eq("key", guestKey);

    if (error) {
      mensajeEl.textContent = "❌ No se pudo modificar tu confirmación.";
      console.error(error);
      return;
    }

    mensajeEl.textContent = "";
    btnCambiar.style.display = "none";
    form.style.display = "block";
    document.getElementById("cantidad").value = invitadoActual?.persons || "";
  } catch (err) {
    console.error(err);
    mensajeEl.textContent = "❌ Error al intentar cambiar respuesta.";
  }
});

// ---------- Contador regresivo ----------
const countdownDate = new Date("Nov 22, 2025 20:00:00").getTime();

function actualizarContador() {
  const now = Date.now();
  const distance = countdownDate - now;

  if (distance <= 0) {
    const countdown = document.getElementById("countdown");
    if (countdown) countdown.innerHTML = "<p style='font-size:1.1rem;'>🎉 ¡Hoy es el gran día! 🎉</p>";
    clearInterval(window._invCountdown);
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  daysEl && (daysEl.textContent = String(days).padStart(2, "0"));
  hoursEl && (hoursEl.textContent = String(hours).padStart(2, "0"));
  minutesEl && (minutesEl.textContent = String(minutes).padStart(2, "0"));
  secondsEl && (secondsEl.textContent = String(seconds).padStart(2, "0"));
}

window._invCountdown = setInterval(actualizarContador, 1000);
actualizarContador();

// ---------- Brillos dorados decorativos ----------
function crearBrillosDorado(cantidad = 12) {
  for (let i=0;i<cantidad;i++){
    const d = document.createElement("div");
    d.className = "brillo-dorado";
    const size = 8 + Math.random()*36;
    d.style.width = `${size}px`;
    d.style.height = `${size}px`;
    d.style.left = `${Math.random()*100}%`;
    d.style.top = `${Math.random()*100}%`;
    d.style.animationDelay = `${Math.random()*6}s`;
    d.style.opacity = 0.6 + Math.random()*0.4;
    document.body.appendChild(d);
  }
}
crearBrillosDorado(14);

// ---------- Inicialización ----------
document.addEventListener("DOMContentLoaded", () => {
  // cargar invitado desde supabase
  cargarInvitado();

  // intentar auto activar musica si usuario ya interactuó (some browsers)
  // not forced: requires user interaction per browser policy
});
