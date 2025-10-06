// =============================
// 🔧 CONFIGURA TUS CLAVES AQUÍ
// =============================
const SUPABASE_URL = "https://rsjyfchiynskjddpjupt.supabase.co";  // tu URL
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzanlmY2hpeW5za2pkZHBqdXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTkzMzEsImV4cCI6MjA3NTI5NTMzMX0.pxnbFP03pSWra1zOrCsR8ADyWF3wpGN88BQlameVRWM";  // tu anon key de Supabase

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const params = new URLSearchParams(window.location.search);
const guestKey = Array.from(params.keys())[0];

const nombreEl = document.getElementById('nombre');
const mensajeEl = document.getElementById('mensaje');
const form = document.getElementById('formConfirmar');
const btnCambiar = document.getElementById('cambiar');

let invitadoActual = null;

if (!guestKey) {
  nombreEl.textContent = "Invitación no válida.";
} else {
  cargarInvitado();
}

async function cargarInvitado() {
  const { data, error } = await supabase
    .from('guests')
    .select('guest, confirm, persons')
    .eq('key', guestKey)
    .single();

  if (error || !data) {
    nombreEl.textContent = "Invitación no encontrada 😕";
    return;
  }

  invitadoActual = data;
  nombreEl.textContent = `Hola ${data.guest} 👋`;

  if (data.confirm) {
    mensajeEl.textContent = `✅ Ya confirmaste tu asistencia (${data.persons} persona${data.persons > 1 ? 's' : ''}).`;
    btnCambiar.style.display = 'inline';
  } else {
    form.style.display = 'block';
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const persons = parseInt(document.getElementById('cantidad').value);

  const { error } = await supabase
    .from('guests')
    .update({ confirm: true, persons })
    .eq('key', guestKey);

  if (error) {
    mensajeEl.textContent = "❌ Error al confirmar asistencia.";
    console.error(error);
  } else {
    form.style.display = 'none';
    mensajeEl.textContent = "🎉 ¡Gracias por confirmar tu asistencia! Nos vemos pronto 💛";
    btnCambiar.style.display = 'inline';
  }
});

btnCambiar.addEventListener('click', async () => {
  const confirmar = confirm("¿Deseas cambiar tu respuesta?");
  if (!confirmar) return;

  const { error } = await supabase
    .from('guests')
    .update({ confirm: false, persons: null })
    .eq('key', guestKey);

  if (error) {
    mensajeEl.textContent = "❌ No se pudo modificar tu confirmación.";
  } else {
    mensajeEl.textContent = "";
    btnCambiar.style.display = 'none';
    form.style.display = 'block';
    document.getElementById('cantidad').value = invitadoActual.persons || '';
  }
});

// 🎵 Control de música
const btnMusica = document.getElementById('btnMusica');
const musica = document.getElementById('musica');
let sonando = false;

// Intenta reproducir al cargar (en silencio)
window.addEventListener('load', () => {
  musica.volume = 0.4;
  musica.muted = true;
  musica.play().catch(() => {
    // No pasa nada: se reproducirá en scroll
  });
});

// 🔊 Activa el sonido y reproduce cuando el usuario hace scroll por primera vez
let sonidoActivado = false;
window.addEventListener('scroll', () => {
  if (!sonidoActivado) {
    musica.muted = false;
    musica.play().then(() => {
      musica.volume = 0.4;
      btnMusica.textContent = "🔊";
      sonidoActivado = true;
      sonando = true;
    }).catch(err => {
      console.warn("Error al reproducir música:", err);
    });
  }
});

// 🎛 Botón flotante para pausar/reanudar manualmente
btnMusica.addEventListener('click', () => {
  if (musica.paused) {
    musica.play();
    sonando = true;
    btnMusica.textContent = "🔊";
  } else {
    musica.pause();
    sonando = false;
    btnMusica.textContent = "🎵";
  }
});





