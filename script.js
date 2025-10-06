// =============================
// 🔗 Conexión a Supabase
// =============================
const SUPABASE_URL = "https://tusupabaseurl.supabase.co"; // 🔹 cambia por tu URL real
const SUPABASE_KEY = "tu_public_anon_key"; // 🔹 cambia por tu clave real
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
const formConfirmar = document.getElementById("formConfirmar");
const cantidadInput = document.getElementById("cantidad");
const mensaje = document.getElementById("mensaje");
const cambiarBtn = document.getElementById("cambiar");
const nombreSpan = document.getElementById("nombre");

// Obtener ID desde la URL
const params = new URLSearchParams(window.location.search);
const invitadoId = params.get("id");

async function cargarInvitado() {
  if (!invitadoId) {
    nombreSpan.textContent = "Invitado Especial 💛";
    formConfirmar.style.display = "none";
    return;
  }

  const { data, error } = await supabaseClient
    .from("invitados")
    .select("*")
    .eq("id", invitadoId)
    .single();

  if (error || !data) {
    console.error("Error cargando invitado:", error);
    nombreSpan.textContent = "Invitado Especial 💛";
    formConfirmar.style.display = "none";
    return;
  }

  nombreSpan.textContent = data.nombre;

  // Mostrar formulario o mensaje según asistencia
  if (data.asistencia && data.asistencia > 0) {
    mensaje.textContent = `Gracias ${data.nombre}, confirmaste ${data.asistencia} asistente(s). 💖`;
    cambiarBtn.style.display = "inline-block";
  } else {
    formConfirmar.style.display = "block";
  }
}

// Confirmar asist
