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
      mensajeEl.textContent = `✅ Ya confirmaste tu asistenci
