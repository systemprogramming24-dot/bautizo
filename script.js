/* script.js - Final implementation
   - Cover slide left -> reveals content vertical
   - Gold flash (1s) then starts music (musica.mp3)
   - Larger typography, framed panels, petals and golden glows
   - Supabase integration (guests table using 'key' from query string)
   - Confirm attendance + change response
   - Countdown in cover and final panel
*/

/* ---------------- Supabase (tu configuración) ---------------- */
const SUPABASE_URL = "https://rsjyfchiynskjddpjupt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzanlmY2hpeW5za2pkZHBqdXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTkzMzEsImV4cCI6MjA3NTI5NTMzMX0.pxnbFP03pSWra1zOrCsR8ADyWF3wpGN88BQlameVRWM";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------------- DOM refs ---------------- */
const cover = document.getElementById('cover');
const content = document.getElementById('content');
const musica = document.getElementById('musica');
const btnMusica = document.getElementById('btnMusica');
const goldFlash = document.getElementById('gold-flash');

const form = document.getElementById('formConfirmar');
const mensajeEl = document.getElementById('mensaje');
const btnCambiar = document.getElementById('cambiar');
const nombreCover = document.querySelector('.cover-title');

const coverDays = document.getElementById('cover-days');
const coverHours = document.getElementById('cover-hours');
const coverMinutes = document.getElementById('cover-minutes');

const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

const petalsContainer = document.getElementById('petals');

const params = new URLSearchParams(window.location.search);
const guestKey = Array.from(params.keys())[0] || null;

let invitadoActual = null;
let sonidoActivado = false;

/* ---------------- Petals animation (generate SVG petals falling) ---------------- */
function createPetal() {
  const el = document.createElement('div');
  el.className = 'petal';
  const size = 18 + Math.random() * 36;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.left = `${Math.random() * 100}%`;
  el.style.opacity = 0.7 + Math.random() * 0.3;
  el.style.transform = `rotate(${Math.random() * 360}deg)`;
  petalsContainer.appendChild(el);

  // animate falling using CSS
  setTimeout(() => {
    el.style.transform = `translateY(${window.innerHeight + 200}px) rotate(${Math.random() * 720 - 360}deg)`;
    el.style.opacity = 0.1;
  }, 50);

  // remove after animation
  setTimeout(() => {
    el.remove();
  }, 7000 + Math.random() * 3000);
}

function startPetals(rate = 900) {
  // create an interval to spawn petals
  setInterval(() => createPetal(), rate);
}

/* add minimal petal CSS via JS to avoid separate file edits (in case) */
(function insertPetalStyles(){
  const css = `
    .petal{ position:fixed; top:-80px; pointer-events:none; z-index:2600; background-image: url('petal.png'); background-size:contain; background-repeat:no-repeat; transform-origin:center; transition: transform 7s linear, opacity 6s linear; filter: drop-shadow(0 6px 12px rgba(200,150,150,0.12)); }
  `;
  const s = document.createElement('style'); s.appendChild(document.createTextNode(css)); document.head.appendChild(s);
})();

/* ---------------- Gold glows (brillo) ---------------- */
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

/* ---------------- Cover reveal + gold flash + start music ---------------- */
function revealContent() {
  if (cover.classList.contains('slid')) return;
  cover.classList.add('slid');          // slide cover left
  content.classList.add('revealed');    // bring content in
  // gold flash (fade-in ~1s) then start music
  goldFlash.style.opacity = '1';
  setTimeout(() => {
    goldFlash.style.opacity = '0';
    // start petals and music after flash
    startPetals(900);
    activarMusica();
  }, 1000);
}

/* Events on cover: swipe left, wheel, right arrow */
let startX = null;
cover.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
cover.addEventListener('touchend', (e) => {
  if (startX === null) return;
  const dx = e.changedTouches[0].clientX - startX;
  if (dx < -50) revealContent();
  startX = null;
}, { passive: true });

cover.addEventListener('wheel', (e) => { if (e.deltaY > 30 || e.deltaX > 30) revealContent(); }, { passive: true });

window.addEventListener('keydown', (e) => {
  if ((e.key === 'ArrowRight' || e.key === 'PageDown') && !cover.classList.contains('slid')) revealContent();
});

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
    console.warn('No se pudo iniciar música:', err);
  }
}

btnMusica.addEventListener('click', async () => {
  if (!sonidoActivado) { await activarMusica(); return; }
  if (musica.paused) { await musica.play(); btnMusica.textContent = '🔊'; }
  else { musica.pause(); btnMusica.textContent = '🎶'; }
});

/* ---------------- Countdown (cover small & full) ---------------- */
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

  coverDays && (coverDays.textContent = String(days).padStart(2,'0'));
  coverHours && (coverHours.textContent = String(hours).padStart(2,'0'));
  coverMinutes && (coverMinutes.textContent = String(minutes).padStart(2,'0'));

  daysEl && (daysEl.textContent = String(days).padStart(2,'0'));
  hoursEl && (hoursEl.textContent = String(hours).padStart(2,'0'));
  minutesEl && (minutesEl.textContent = String(minutes).padStart(2,'0'));
  secondsEl && (secondsEl.textContent = String(seconds).padStart(2,'0'));
}
window._invCountdown = setInterval(actualizarContador, 1000);
actualizarContador();

/* ---------------- Petal spawn start immediately hidden (will start on reveal) ---------------- */
/* startPetals called on reveal */

/* ---------------- Supabase: load guest, show form, confirm, change ---------------- */
async function cargarInvitado() {
  if (!guestKey) {
    nombreCover && (nombreCover.textContent = 'Querido invitado');
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
      nombreCover && (nombreCover.textContent = 'Invitación no encontrada 😕');
      return;
    }

    invitadoActual = data;
    nombreCover && (nombreCover.textContent = `${data.guest}`);

    if (data.confirm) {
      mensajeEl && (mensajeEl.textContent = `✅ Ya confirmaste tu asistencia (${data.persons} persona${data.persons > 1 ? 's' : ''}).`);
      btnCambiar && (btnCambiar.style.display = 'inline-block');
    } else {
      form && (form.style.display = 'block');
    }
  } catch (err) {
    console.error('Error cargando invitado', err);
    nombreCover && (nombreCover.textContent = 'Invitación no válida');
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
  // load guest data
  cargarInvitado();
  // set initial content translate (cover visible)
  content.classList.remove('revealed');
});
