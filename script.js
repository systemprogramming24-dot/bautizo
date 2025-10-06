// =============================
// 🔗 Conexión a Supabase
// =============================
const SUPABASE_URL = "https://rsjyfchiynskjddpjupt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzanlmY2hpeW5za2pkZHBqdXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTkzMzEsImV4cCI6MjA3NTI5NTMzMX0.pxnbFP03pSWra1zOrCsR8ADyWF3wpGN88BQlameVRWM";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =============================
// 🎵 Control de música
// =============================
const musica = document.getElementById("musica");
const btnMusica = document.getElementById("btnMusica");
const overlayMusica = document.getElementById("overlayMusica");

let sonidoActivado = false;

window.addEventListener("load", () => {
  musica.volume = 0.4;
  musica.muted = true;
  musica.pause();
});

async function activarMusica() {
  try {
    musica.muted = false;
    musica.currentTime = 0;
    await musica.play();
    overlayMusica.classList.add("fade-out");
    btnMusica.textContent = "🔊";
    sonidoActivado = true;
    setTimeout(() => {
      overlayMusica.style.display = "none";
    }, 700);
  } catch (e) {
    console.error("Error al reproducir música:", e);
  }
}

overlayMusica.addEventListener("click", activarMusica);

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
    btnMusica.textContent = "🎵";
  }
});

// =============================
// 🎟️ Confirmación de asistencia
// =============================
const nombreEl = document.getElementById("nombre");
const mensajeEl = document.getElementById("mensaje");
const form = document.getElementById("formConfirmar");
const btnCambiar = document.getElementById("cambiar");

const params = new URLSearchParams(window.location.search);
const guestKey = Array.from(params.keys())[0];

let invitadoActual = null;

if (!guestKey) {
  nombreEl.textContent = "Invitación no válida.";
} else {
  cargarInvitado();
}

async function cargarInvitado() {
  const { data, error } = await supabase
    .from("guests")
    .select("guest, confirm, persons")
    .eq("key", guestKey)
    .single();

  if (error || !data) {
    nombreEl.textContent = "Invitación no encontrada 😕";
    return;
  }

  invitadoActual = data;
  nombreEl.textContent = `Hola ${data.guest} 👋`;

  if (data.confirm) {
    mensajeEl.textContent = `✅ Ya confirmaste tu asistencia (${data.persons} persona${data.persons > 1 ? "s" : ""}).`;
    btnCambiar.style.display = "inline";
  } else {
    form.style.display = "block";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const persons = parseInt(document.getElementById("cantidad").value);

  const { error } = await supabase
    .from("guests")
    .update({ confirm: true, persons })
    .eq("key", guestKey);

  if (error) {
    mensajeEl.textContent = "❌ Error al confirmar asistencia.";
    console.error(error);
  } else {
    form.style.display = "none";
    mensajeEl.textContent = "🎉 ¡Gracias por confirmar tu asistencia! Nos vemos pronto 💛";
    btnCambiar.style.display = "inline";
  }
});

btnCambiar.addEventListener("click", async () => {
  const confirmar = confirm("¿Deseas cambiar tu respuesta?");
  if (!confirmar) return;

  const { error } = await supabase
    .from("guests")
    .update({ confirm: false, persons: null })
    .eq("key", guestKey);

  if (error) {
    mensajeEl.textContent = "❌ No se pudo modificar tu confirmación.";
  } else {
    mensajeEl.textContent = "";
    btnCambiar.style.display = "none";
    form.style.display = "block";
    document.getElementById("cantidad").value = invitadoActual.persons || "";
  }
});

// =============================
// ⏳ Contador regresivo
// =============================
const countdownDate = new Date("Nov 22, 2025 20:00:00").getTime();
const countdownEl = document.getElementById("countdown");

if (countdownEl) {
  const timer = setInterval(() => {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    if (distance <= 0) {
      clearInterval(timer);
      countdownEl.innerHTML = "<p style='font-size:1.5rem;'>🎉 ¡Hoy es el gran día! 🎉</p>";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = days.toString().padStart(2, "0");
    document.getElementById("hours").textContent = hours.toString().padStart(2, "0");
    document.getElementById("minutes").textContent = minutes.toString().padStart(2, "0");
    document.getElementById("seconds").textContent = seconds.toString().padStart(2, "0");
  }, 1000);
}

// =============================
// ✨ Efecto de brillos dorados
// =============================
function crearBrillosDorado(cantidad = 15) {
  for (let i = 0; i < cantidad; i++) {
    const brillo = document.createElement("div");
    brillo.classList.add("brillo-dorado");
    brillo.style.left = `${Math.random() * 100}%`;
    brillo.style.top = `${Math.random() * 100}%`;
    brillo.style.animationDelay = `${Math.random() * 5}s`;
    brillo.style.width = `${5 + Math.random() * 10}px`;
    brillo.style.height = brillo.style.width;
    document.body.appendChild(brillo);
  }
}
crearBrillosDorado();
