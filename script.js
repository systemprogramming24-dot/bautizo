// =============================
// 🎵 Control de música
// =============================
const musica = document.getElementById("musica");
const btnMusica = document.getElementById("btnMusica");
const overlayMusica = document.getElementById("overlayMusica");

let sonidoActivado = false;

window.addEventListener("load", () => {
  musica.volume = 0.4;
});

// 🔹 Función principal para iniciar la música
async function activarMusica() {
  try {
    overlayMusica.classList.add("fade-out");

    musica.muted = false;
    musica.volume = 0.4;

    const playPromise = musica.play();

    if (playPromise !== undefined) {
      await playPromise;
      sonidoActivado = true;
      btnMusica.textContent = "🔊";

      setTimeout(() => {
        overlayMusica.style.display = "none";
      }, 600);
    }
  } catch (e) {
    console.warn("⚠️ No se pudo iniciar la música:", e);
  }
}

// 🔹 Eventos de interacción
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
// ✨ Brillos dorados flotantes
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
// ☁️ Conexión Supabase + Vercel
// =============================

// Claves del proyecto Supabase (reemplaza si usas tus propias credenciales)
const SUPABASE_URL = "https://jxdwlmktzcbmjdqzihcm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4ZHdsbWt0emNibWpkcXppaGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MDAwMDAsImV4cCI6MjA0NjM3NjAwMH0.6OAZDqAAMc7IjghzF93xXfFPPMuV1HYYSkFa_6T7Q7A";

// Inicializa Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Registrar visita
async function registrarVisita() {
  try {
    const { data, error } = await supabase
      .from("visitas")
      .insert([{ fecha: new Date().toISOString() }]);
    if (error) console.error("❌ Error al registrar visita:", error);
    else console.log("✅ Visita registrada:", data);
  } catch (err) {
    console.error("⚠️ Error general al registrar visita:", err);
  }
}

// Ejecutar automáticamente al cargar la página
window.addEventListener("load", registrarVisita);
