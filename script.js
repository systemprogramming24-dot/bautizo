/* Horizontal-slideshow synchronized backgrounds + Supabase + music + confirm + countdown */

// ---------- Supabase ----------
const SUPABASE_URL = "https://rsjyfchiynskjddpjupt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzanlmY2hpeW5za2pkZHBqdXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTkzMzEsImV4cCI6MjA3NTI5NTMzMX0.pxnbFP03pSWra1zOrCsR8ADyWF3wpGN88BQlameVRWM";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------- DOM ----------
const slides = Array.from(document.querySelectorAll('.slide'));
const total = slides.length;
let current = slides.findIndex(s => s.classList.contains('active'));
if (current < 0) current = 0;

const bgWrapper = document.getElementById('bg-wrapper');
const musica = document.getElementById('musica');
const overlay = document.getElementById('overlayMusica');
const btnStart = document.getElementById('btnStart');
const btnMusica = document.getElementById('btnMusica');

const nombreEl = document.getElementById('nombre');
const form = document.getElementById('formConfirmar');
const mensajeEl = document.getElementById('mensaje');
const btnCambiar = document.getElementById('cambiar');

const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

// guest key from querystring
const params = new URLSearchParams(window.location.search);
const guestKey = Array.from(params.keys())[0] || null;

let invitadoActual = null;
let animating = false;
let sonidoActivado = false;

// helper: set active slide and move bgWrapper
function goTo(index) {
  if (animating) return;
  index = Math.max(0, Math.min(index, total - 1));
  if (index === current) return;
  animating = true;

  // update slides
  slides[current].classList.remove('active');
  slides[index].classList.add('active');

  // move bg-wrapper (translateX = -index * 100vw)
  bgWrapper.style.transform = `translateX(-${index * 100}vw)`;

  current = index;
  setTimeout(() => animating = false, 820);
}

// navigation: wheel (throttle)
let wheelTimeout = null;
window.addEventListener('wheel', (e) => {
  if (animating) return;
  if (wheelTimeout) return;
  wheelTimeout = setTimeout(()=> wheelTimeout = null, 700);

  const d = e.deltaY;
  if (d > 0) goTo(current + 1);
  else if (d < 0) goTo(current - 1);
}, { passive: true });

// keyboard
window.addEventListener('keydown', (e) => {
  if (animating) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown') goTo(current + 1);
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') goTo(current - 1);
  if (e.key === 'Home') goTo(0);
  if (e.key === 'End') goTo(total - 1);
});

// touch (swipe)
let touchStartX = null;
window.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
window.addEventListener('touchend', e => {
  if (touchStartX === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) {
    if (dx < 0) goTo(current + 1); else goTo(current - 1);
  }
  touchStartX = null;
}, { passive: true });

// ---------- Music activation ----------
window.addEventListener('load', () => {
  musica.volume = 0.35;
  musica.muted = true;
  musica.pause();
});

async function activarMusica() {
  try {
    musica.muted = false;
    musica.currentTime = 0;
    const p = musica.play();
    if (p !== undefined) await p;
    sonidoActivado = true;
    btnMusica.textContent = '🔊';
    overlay.classList.add('fade-out');
    setTimeout(()=> overlay.style.display = 'none', 650);
  } catch (err) {
    console.warn('No se pudo iniciar la música:', err);
  }
}
btnStart && btnStart.addEventListener('click', activarMusica);
overlay && overlay.addEventListener('click', activarMusica);

btnMusica.addEventListener('click', async () => {
  if (!sonidoActivado) { await activarMusica(); return; }
  if (musica.paused) { await musica.play(); btnMusica.textContent = '🔊'; }
  else { musica.pause(); btnMusica.textContent = '🎶'; }
});

// ---------- Supabase: cargar invitado, mostrar form, confirmar ----------
async function cargarInvitado() {
  if (!guestKey) {
    nombreEl.textContent = 'Querido invitado';
    return;
  }

  try {
    const { data, error } = await supabase
      .from('guests')
      .select('guest, confirm, persons')
      .eq('key', guestKey)
      .single();

    if (error || !data) {
      console.warn('Invitación no encontrada', error);
      nombreEl.textContent = 'Invitación no encontrada 😕';
      return;
    }

    invitadoActual = data;
    nombreEl.textContent = `Hola ${data.guest} 👋`;

    if (data.confirm) {
      mensajeEl.textContent = `✅ Ya confirmaste tu asistencia (${data.persons} persona${data.persons > 1 ? 's' : ''}).`;
      btnCambiar.style.display = 'inline-block';
    } else {
      form.style.display = 'block';
    }
  } catch (err) {
    console.error('Error cargando invitado', err);
    nombreEl.textContent = 'Invitación no válida';
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

// ---------- Countdown ----------
const countdownDate = new Date('Nov 22, 2025 20:00:00').getTime();

function actualizarContador() {
  const now = Date.now();
  const distance = countdownDate - now;
  if (distance <= 0) {
    const countdown = document.getElementById('countdown');
    if (countdown) countdown.innerHTML = "<p style='font-size:1.2rem;'>🎉 ¡Hoy es el gran día! 🎉</p>";
    clearInterval(window._invCountdown);
    return;
  }
  const days = Math.floor(distance / (1000*60*60*24));
  const hours = Math.floor((distance % (1000*60*60*24)) / (1000*60*60));
  const minutes = Math.floor((distance % (1000*60*60)) / (1000*60));
  const seconds = Math.floor((distance % (1000*60)) / 1000);
  daysEl && (daysEl.textContent = String(days).padStart(2,'0'));
  hoursEl && (hoursEl.textContent = String(hours).padStart(2,'0'));
  minutesEl && (minutesEl.textContent = String(minutes).padStart(2,'0'));
  secondsEl && (secondsEl.textContent = String(seconds).padStart(2,'0'));
}
window._invCountdown = setInterval(actualizarContador, 1000);
actualizarContador();

// ---------- Decorative golden glows ----------
function crearBrillosDorado(cantidad = 12) {
  for (let i=0;i<cantidad;i++){
    const el = document.createElement('div');
    el.className = 'brillo-dorado';
    const size = 10 + Math.random()*60;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.left = `${Math.random()*100}%`;
    el.style.top = `${Math.random()*100}%`;
    el.style.animationDelay = `${Math.random()*6}s`;
    el.style.opacity = 0.25 + Math.random()*0.7;
    document.body.appendChild(el);
  }
}
crearBrillosDorado(14);

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  // position bgWrapper to current slide at start
  bgWrapper.style.transform = `translateX(-${current * 100}vw)`;
  // ensure slides active class
  slides.forEach((s,i)=> s.classList.toggle('active', i===current));
  // load guest data
  cargarInvitado();
});
