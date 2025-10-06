/* script.js
  - Portada (cover) deslizable a la izquierda para revelar contenido vertical
  - Al deslizar la portada se inicia la música y aparece un destello dorado
  - Confirmación con Supabase (usa tu tabla "guests")
  - Contadores (en portada y en sección final)
  - Brillos decorativos
*/

/* ---------------- Supabase ---------------- */
const SUPABASE_URL = "https://rsjyfchiynskjddpjupt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzanlmY2hpeW5za2pkZHBqdXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTkzMzEsImV4cCI6MjA3NTI5NTMzMX0.pxnbFP03pSWra1zOrCsR8ADyWF3wpGN88BQlameVRWM";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------------- DOM ---------------- */
const cover = document.getElementById('cover');
const content = document.getElementById('content');
const btnStart = document.getElementById('btnStart'); // not present now (cover clickable area), but keep for compatibility
const musica = document.getElementById('musica');
const btnMusica = document.getElementById('btnMusica');
const goldFlash = document.getElementById('gold-flash');

const nombreCover = document.querySelector('.cover-title');

const form = document.getElementById('formConfirmar');
const mensajeEl = document.getElementById('mensaje');
const btnCambiar = document.getElementById('cambiar');

const coverDays = document.getElementById('cover-days');
const coverHours = document.getElementById('cover-hours');
const coverMinutes = document.getElementById('cover-minutes');

const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

/* guestKey: first key present in querystring (same logic you used) */
const params = new URLSearchParams(window.location.search);
const guestKey = Array.from(params.keys())[0] || null;

let invitadoActual = null;
let sonidoActivado = false;

/* ---------------- Helper: slide cover left to reveal content ---------------- */
function revealContent() {
  if (cover.classList.contains('slid')) return;
  // slide cover left
  cover.classList.add('slid');
  // reveal content (translateX -> 0)
  content.classList.add('revealed');
  // start music
  activarMusica();
  // golden flash
  goldFlash.style.opacity = '1';
  setTimeout(()=> { goldFlash.style.opacity = '0'; }, 650);
  // focus content for keyboard/scroll
  setTimeout(()=> content.focus(), 900);
}

/* ---------------- Detect swipe left / wheel / key on cover ---------------- */
let startX = null;
cover.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
cover.addEventListener('touchend', (e) => {
  if (startX === null) return;
  const dx = e.changedTouches[0].clientX - startX;
  if (dx < -50) revealContent(); // swipe left
  startX = null;
}, { passive: true });

// wheel: if user scrolls right (deltaX) or vertical scroll while on cover => reveal
cover.addEventListener('wheel', (e) => {
  // if horizontal wheel or vertical down significant
  if (e.deltaY > 30 || e.deltaX > 30) revealContent();
}, { passive: true });

// keyboard: right arrow to reveal
window.addEventListener('keydown', (e) => {
  if ((e.key === 'ArrowRight' || e.key === 'PageDown') && !cover.classList.contains('slid')) {
    revealContent();
  }
});

/* ---------------- Music control ---------------- */
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
    if (daysEl) document.getElementById('countdown').innerHTML = "<p>🎉 ¡Hoy es el gran día!</p>";
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

  // full countdown
  daysEl && (daysEl.textContent = String(days).padStart(2,'0'));
  hoursEl && (hoursEl.textContent = String(hours).padStart(2,'0'));
  minutesEl && (minutesEl.textContent = String(minutes).padStart(2,'0'));
  secondsEl && (secondsEl.textContent = String(seconds).padStart(2,'0'));
}
window._invCountdown = setInterval(actualizarContador, 1000);
actualizarContador();

/* ---------------- Decorative golden glows ---------------- */
function crearBrillosDorado(cantidad = 10) {
  for (let i=0;i<cantidad;i++){
    const d = document.createElement('div');
    d.className = 'brillo-dorado';
    const size = 8 + Math.random()*60;
    d.style.width = `${size}px`;
    d.style.height = `${size}px`;
    d.style.left = `${Math.random()*100}%`;
    d.style.top = `${Math.random()*100}%`;
    d.style.animationDelay = `${Math.random()*7}s`;
    d.style.opacity = 0.2 + Math.random()*0.6;
    document.body.appendChild(d);
  }
}
crearBrillosDorado(12);

/* ---------------- Supabase: cargar invitado, mostrar formulario, confirmar ---------------- */
async function cargarInvitado() {
  const nombreTitle = document.querySelector('.cover-title');
  if (!guestKey) {
    nombreTitle && (nombreTitle.textContent = 'Querido invitado');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('guests')
      .select('guest, confirm, persons')
      .eq('key', guestKey)
      .single();

    if (error || !data) {
      console.warn('Invitacion no encontrada', error);
      nombreTitle && (nombreTitle.textContent = 'Invitación no encontrada 😕');
      return;
    }

    invitadoActual = data;
    nombreTitle && (nombreTitle.textContent = `Hola ${data.guest} 👋`);

    if (data.confirm) {
      mensajeEl && (mensajeEl.textContent = `✅ Ya confirmaste tu asistencia (${data.persons} persona${data.persons > 1 ? 's' : ''}).`);
      btnCambiar && (btnCambiar.style.display = 'inline-block');
    } else {
      form && (form.style.display = 'block');
    }
  } catch (err) {
    console.error('Error cargando invitado', err);
    nombreTitle && (nombreTitle.textContent = 'Invitación no válida');
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
  // prepare content backgrounds (already set by CSS using filenames)
  // load guest
  cargarInvitado();
});
