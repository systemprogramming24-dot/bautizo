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

// 🎵 Control de música mejorado (funciona en móviles y PC)
const musica = document.getElementById('musica');
const btnMusica = document.getElementById('btnMusica');
const overlayMusica = document.getElementById('overlayMusica');

let sonidoActivado = false;
musica.volume = 0.4;

// 🟣 Reproduce al tocar el overlay (móviles)
overlayMusica.addEventListener('click', async () => {
  try {
    await musica.play();
    musica.muted = false;
    sonidoActivado = true;
    btnMusica.textContent = '🔊';
    overlayMusica.style.display = 'none';
  } catch (e) {
    console.warn('No se pudo reproducir el audio:', e);
  }
});

// 🟣 Si el usuario hace scroll (en escritorio)
window.addEventListener('scroll', async () => {
  if (!sonidoActivado) {
    try {
      await musica.play();
      musica.muted = false;
      sonidoActivado = true;
      btnMusica.textContent = '🔊';
      overlayMusica.style.display = 'none';
    } catch (e) {
      console.warn('Error al iniciar música con scroll:', e);
    }
  }
});

// 🟣 Botón flotante para pausar/reanudar
btnMusica.addEventListener('click', async () => {
  if (musica.paused) {
    try {
      await musica.play();
      musica.muted = false;
      btnMusica.textContent = '🔊';
    } catch (e) {
      console.warn('Error al reanudar música:', e);
    }
  } else {
    musica.pause();
    btnMusica.textContent = '🎵';
  }
});
