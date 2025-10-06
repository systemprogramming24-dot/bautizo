/* script.js - final story-mode invitation
   Supabase integration, cover slide -> reveal content, gold flash + petals + music,
   petal rain across all sections, personalized guest loading and confirmation,
   countdown with seconds, large typography.
*/

/* ---------------- Supabase config (your keys) ---------------- */
const SUPABASE_URL = "https://rsjyfchiynskjddpjupt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzanlmY2hpeW5za2pkZHBqdXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTkzMzEsImV4cCI6MjA3NTI5NTMzMX0.pxnbFP03pSWra1zOrCsR8ADyWF3wpGN88BQlameVRWM";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------------- DOM ---------------- */
const cover = document.getElementById('cover');
const content = document.getElementById('content');
const musica = document.getElementById('musica');
const btnMusica = document.getElementById('btnMusica');
const goldFlash = document.getElementById('gold-flash');
const petalsContainer = document.getElementById('petals');

const form = document.getElementById('formConfirmar');
const mensajeEl = document.getElementById('mensaje');
const btnCambiar = document.getElementById('cambiar');
const nombreCover = document.querySelector('.cover-title');

const coverDays = document.getElementById('cover-days');
const coverHours = document.getElementById('cover-hours');
const coverMinutes = document.getElementById('cover-minutes');
const coverSeconds = document.getElementById('cover-seconds');

const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

/* guest key from querystring (first key) */
const params = new URLSearchParams(window.location.search);
const guestKey = Array.from(params.keys())[0] || null;

let invitadoActual = null;
let sonidoActivado = false;
let petalInterval = null;

/* ---------------- Petals (white) ---------------- */
function createPetal() {
  const el = document.createElement('div');
  el.className = 'petal';
  const size = 16 + Math.random() * 36;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.left = `${Math.random() * 100}%`;
  el.style.opacity = 0.8 + Math.random() * 0.2;
  el.style.transform = `translateY(-100px) rotate(${Math.random() * 360}deg)`;
  petalsContainer.appendChild(el);

  // trigger falling
  requestAnimationFrame(() => {
    el.style.transform = `translateY(${window.innerHeight + 150}px) rotate(${Math.random() * 720 - 360}deg)`;
    el.style.opacity = 0.05;
  });

  // cleanup
  setTimeout(() => el.remove(), 8000 + Math.random()*3000);
}

function startPetals(rate = 700) {
  if (petalInterval) return;
  petalInterval = setInterval(createPetal, rate);
}

function stopPetals() {
  if (!petalInterval) return;
  clearInterval(petalInterval);
  petalInterval = null;
}

/* ---------------- Gold glows ---------------- */
function crearBrillosDorado(cantidad = 10) {
  for (let i=0;i<cantidad;i++){
    const d = document.createElement('div');
    d.className = 'brillo-dorado';
    const size = 20 + Math.random()*80;
    d.style.width = `${size}px`;
    d.style.height = `${size}px`;
    d.style.left = `${Math.random()*100}%`;
    d.style.top = `${Math.random()*100}%`;
    d.style.animationDelay = `${Math.random()*6}s`;
    d.style.opacity = 0.2 + Math.random()*0.6;
    document.body.appendChild(d);
  }
}
crearBrillosDorado(12);

/* ---------------- Reveal cover -> content ---------------- */
function revealContent() {
  if (cover.classList.contains('slid')) return;
  cover.classList.add('slid');
  content.classList.add('revealed');

  // gold flash for 1s, then start petals and music
  goldFlash.style.opacity = '1';
  setTimeout(() => {
    goldFlash.style.opacity = '0';
    startPetals(650);
    activarMusica();
  }, 1000);
}

/* cover interactions */
let startX = null;
cover.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
cover.addEventListener('touchend', (e) => {
  if (startX === null) return;
  const dx = e.changedTouches[0].clientX - startX;
  if (dx < -40) revealContent();
  startX = null;
}, { passive: true });
cover.addEventListener('wheel', (e) => { if (e.deltaY > 20 || e.deltaX > 20) revealContent(); }, { passive: true });
window.addEventListener('keydown', (e) => { if ((e.key === 'ArrowRight' || e.key === 'PageDown') && !cover.classList.contains('slid')) revealContent(); });

/* ---------------- Music controls ---------------- */
window.addEventListener('load', () => {
  musica.volume = 0.35;
  musica.muted = true;
  musica.pause();
});

async function activarMusica() {
  if (sonidoActivado) return;
  try {
    musica.muted = false;
    musica.currentTime = 0;
    const p = musica.play();
    if (p !== undefined) await p;
    sonidoActivado = true;
    btnMusica.textContent = '🔊';
  } catch (err) {
    console.warn('No se pudo iniciar la música:', err);
  }
}

btnMusica.addEventListener('click', async () => {
  if (!sonidoActivado) { await activarMusica(); return; }
  if (musica.paused) { await musica.play(); btnMusica.textContent = '🔊'; }
  else { musica.pause(); btnMusica.textContent = '🎶'; }
});

/* ---------------- Countdown (cover + final) ---------------- */
const countdownDate = new Date('Nov 22, 2025 20:00:00').getTime();

function actualizarContador() {
  const now = Date.now();
  const distance = countdownDate - now;
  if (distance <= 0) {
    if (coverDays) coverDays.textContent = '00';
    const countdown = document.getElementById('countdown');
    if (countdown) countdown.innerHTML = "<p style='font-size:1.1rem'>🎉 ¡Hoy es el gran día! 🎉</p>";
    clearInterval(window._invCountdown);
    return;
  }
  const days = Math.floor(distance / (1000*60*60*24));
  const hours = Math.floor((distance % (1000*60*60*24)) / (1000*60*60));
  const minutes = Math.floor((distance % (1000*60*60)) / (1000*60));
  const seconds = Math.floor((distance % (1000*60)) / 1000);

  // cover compact
  coverDays && (coverDays.textContent = String(days).padStart(2,'0'));
  coverHours && (coverHours.textContent = String(hours).padStart(2,'0'));
  coverMinutes && (coverMinutes.textContent = String(minutes).padStart(2,'0'));
  coverSeconds && (coverSeconds.textContent = String(seconds).padStart(2,'0'));

  // full countdown
  daysEl && (daysEl.textContent = String(days).padStart(2,'0'));
  hoursEl && (hoursEl.textContent = String(hours).padStart(2,'0'));
  minutesEl && (minutesEl.textContent = String(minutes).padStart(2,'0'));
  secondsEl && (secondsEl.textContent = String(seconds).padStart(2,'0'));
}
window._invCountdown = setInterval(actualizarContador, 1000);
actualizarContador();

/* ---------------- Supabase: load guest, show form, confirm, change ---------------- */
async function cargarInvitado() {
  const nombreElCover = document.querySelector('.cover-title');
  if (!guestKey) {
    nombreElCover && (nombreElCover.textContent = 'Querido invitado');
    return;
  }
  try {
    const { data, error } = await supabase
      .from('guests')
      .select('guest, confirm, persons')
      .eq('key', guestKey)
      .single();

    if (error || !data) {
      console.warn('Invitación no encontrada:', error);
      nombreElCover && (nombreElCover.textContent = 'Invitación no encontrada 😕');
      return;
    }

    invitadoActual = data;
    nombreElCover && (nombreElCover.textContent = `Hola ${data.guest} 👋`);

    if (data.confirm) {
      mensajeEl && (mensajeEl.textContent = `✅ Ya confirmaste tu asistencia (${data.persons} persona${data.persons > 1 ? 's' : ''}).`);
      btnCambiar && (btnCambiar.style.display = 'inline-block');
    } else {
      form && (form.style.display = 'block');
    }
  } catch (err) {
    console.error('Error cargando invitado', err);
    nombreElCover && (nombreElCover.textContent = 'Invitación no válida');
  }
}

form && form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const persons = parseInt(document.getElementById('cantidad').value);
  if (!guestKey) return;
  try {
    const { error } = await supabase
      .from('guests')
      .update({ confirm: true, persons })
      .eq('key', guestKey);
    if (error) {
      mensajeEl.textContent = '❌ Error al confirmar asistencia.';
      console.error(error);
      return;
    }
    form.style.display = 'none';
    mensajeEl.textContent = '🎉 ¡Gracias por confirmar tu asistencia! Nos vemos pronto 💛';
    btnCambiar.style.display = 'inline-block';
  } catch (err) {
    console.error(err);
    mensajeEl.textContent = '❌ Error inesperado, intenta de nuevo.';
  }
});

btnCambiar && btnCambiar.addEventListener('click', async () => {
  if (!confirm('¿Deseas cambiar tu respuesta?')) return;
  if (!guestKey) return;
  try {
    const { error } = await supabase
      .from('guests')
      .update({ confirm: false, persons: null })
      .eq('key', guestKey);
    if (error) {
      mensajeEl.textContent = '❌ No se pudo modificar tu confirmación.';
      console.error(error);
      return;
    }
    mensajeEl.textContent = '';
    btnCambiar.style.display = 'none';
    form.style.display = 'block';
    document.getElementById('cantidad').value = invitadoActual?.persons || '';
  } catch (err) {
    console.error(err);
    mensajeEl.textContent = '❌ Error al intentar cambiar respuesta.';
  }
});

/* ---------------- Init ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  cargarInvitado();
  content.classList.remove('revealed'); // start with cover visible
});
