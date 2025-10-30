/* ---------------- Supabase config ---------------- */
//const SUPABASE_URL = "https://rsjyfchiynskjddpjupt.supabase.co";
const SUPABASE_URL = "https://ubyvqwwkklsrimfxnuye.supabase.co";
//const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzanlmY2hpeW5za2pkZHBqdXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTkzMzEsImV4cCI6MjA3NTI5NTMzMX0.pxnbFP03pSWra1zOrCsR8ADyWF3wpGN88BQlameVRWM";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVieXZxd3dra2xzcmltZnhudXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTIxMTYsImV4cCI6MjA3NzE4ODExNn0.OExoTR1zJobgv-c0ynFdNmZDiXrcbFl5uNP7SfexBp0";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const urlParams = new URLSearchParams(window.location.search);
const groupCode = urlParams.get("group_code");

function activarPantallaCompleta() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
}

(function() {
  const envelope = document.getElementById('envelope');
  const mainContent = document.getElementById('mainContent');
  const music = document.getElementById('bgMusic');
  const sec2 = document.getElementById('section2');
  const scrollArrow = document.getElementById('scrollArrow');
  const musicControl = document.getElementById('musicControl');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const tooltip = document.getElementById('tooltip');

  envelope.addEventListener('click', () => {
    envelope.classList.add('open');
    setTimeout(() => {
      document.getElementById('section1').style.display = 'none';
      mainContent.style.display = 'block';
      mainContent.style.position = 'relative';
      sec2.scrollIntoView({ behavior: 'smooth' });
      //activarPantallaCompleta();

      // Reproducir música
      music.volume = 0.8;
      music.play().then(() => {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
      }).catch(() => {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
      });

      setTimeout(() => {
        scrollArrow.classList.add('visible');
        musicControl.classList.add('visible');
        tooltip.classList.add('visible'); // Show the tooltip

        // Hide the tooltip after 5 seconds
        setTimeout(() => {
          tooltip.classList.remove('visible');
        }, 5000);
      }, 500);

    }, 900);
  });

  // Lógica del botón de música
  musicControl.addEventListener('click', () => {
    if (music.paused) {
      music.play();
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
    } else {
      music.pause();
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    }
  });


  iniciarCountdown('countdown2');
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (6 + Math.random() * 6) + 's';
    p.style.animationDelay = (Math.random() * 4) + 's';
    document.body.appendChild(p);
  }
  cargarGrupo();
})();
function iniciarCountdown(id) {
  const countdownEl = document.getElementById(id);
  const finalMessageEl = document.getElementById('finalMessageContainer');
  const target = new Date('October 29, 2025 20:44:00').getTime();
  let countdownInterval;

  function update() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      // --- NUEVA LÓGICA ---
      // 1. Ocultamos el contador.
      countdownEl.style.display = 'none';

      // 2. Creamos el mensaje final y lo mostramos.
      finalMessageEl.innerHTML = '¡Hoy es el gran día!';
      finalMessageEl.className = 'final-countdown-message'; // Aplicamos la clase CSS
      finalMessageEl.style.display = 'block'; // Lo hacemos visible

      // 3. Detenemos el intervalo para no gastar recursos.
      if (countdownInterval) clearInterval(countdownInterval);
      return;
      // --- FIN DE LA LÓGICA ---
    }
    
    const days = Math.floor(diff / 86400000);
    const hrs = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    countdownEl.innerHTML = `<span><strong>${days}</strong><small>Días</small></span><span><strong>${hrs}</strong><small>Horas</small></span><span><strong>${mins}</strong><small>Min</small></span><span><strong>${secs}</strong><small>Seg</small></span>`;
  }
  
  update();
  countdownInterval = setInterval(update, 1000);
}


async function cargarGrupo() {
  // --- Elementos del DOM con los que vamos a interactuar ---
  const envelope = document.getElementById('envelope');
  const nombreElCover = document.querySelector('.cover-title');
  const openPrompt = document.querySelector('.message div:first-child'); // El texto "Toca para abrir..."
  const confirmLink = document.getElementById('confirmLink');
  
  // URL base para el link de confirmación
  const baseURL = "https://bautizo-samantha-sayuri.vercel.app/confirm.html";

  // --- 1. INICIAMOS EL ESTADO DE CARGA ---
  envelope.classList.add('loading');
  nombreElCover.textContent = 'Cargando...'; // Mensaje de carga opcional

  try {
    if (!groupCode) {
      nombreElCover.textContent = 'Querida Familia';
      confirmLink.href = baseURL;
      return; // Salimos de la función aquí si no hay código
    }

    const { data, error } = await supabase
      .from('guests_baptism')
      .select('guest, message_invitation')
      .eq('group_code', groupCode)
      .eq('is_leader', true)
      .maybeSingle();

    if (error || !data) {
      console.error('Error o invitado no encontrado:', error);
      nombreElCover.textContent = 'Invitación no encontrada 😕';
      return; // Salimos tras el error
    }
    
    // Si todo va bien, construimos el texto final
    const textoCompleto = `${data.guest} ${data.message_invitation || ''}`.trim();
    nombreElCover.textContent = textoCompleto;
    confirmLink.href = `${baseURL}?group_code=${groupCode}`;

  } catch (err) {
    console.error('Error inesperado al cargar el grupo:', err);
    nombreElCover.textContent = 'Invitación no válida';
  } finally {
    // --- 2. FINALIZAMOS EL ESTADO DE CARGA ---
    // Este bloque se ejecuta SIEMPRE, después del try o del catch.
    envelope.classList.remove('loading');
  }
}
document.addEventListener("DOMContentLoaded", () => {
  // Observador para el "Fade In" de los componentes (esto no cambia)
  const fadeItems = document.querySelectorAll(".fade-in-item");
  const fadeInObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
  fadeItems.forEach(item => fadeInObserver.observe(item));

  // --- INICIO DEL CÓDIGO FINAL Y CORRECTO ---

  const scrollArrow = document.getElementById('scrollArrow');
  const finalSection = document.getElementById('section8');

  // 1. Lógica de clic para la flecha de scroll
  if (scrollArrow) {
    scrollArrow.addEventListener('click', () => {
      // Definimos todos los elementos que pueden ser un "punto de parada" lógico.
      const anchors = Array.from(document.querySelectorAll('#mainContent h1, #mainContent .family-photo-wrapper, #mainContent .item, #mainContent .dress-code-section'));
      
      // Obtenemos la posición actual del scroll + un pequeño margen para asegurar que no nos quedemos en el mismo sitio.
      const currentPosition = window.scrollY + 20;

      // Buscamos el primer "punto de parada" que esté más abajo de nuestra posición actual.
      let nextAnchor = null;
      for (const anchor of anchors) {
        if (anchor.offsetTop > currentPosition) {
          nextAnchor = anchor;
          break; // Encontramos el siguiente, así que detenemos la búsqueda.
        }
      }

      // Si encontramos un siguiente punto, nos desplazamos a él.
      if (nextAnchor) {
        // 'block: "start"' asegura que el elemento se alinee con la parte superior de la pantalla.
        nextAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Si no hay más puntos de parada, significa que estamos al final.
        // Como fallback, nos desplazamos al final del documento.
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    });
  }

  // 2. Observador para ocultar la flecha en la última sección (esto no cambia)
  if (scrollArrow && finalSection) {
    const arrowVisibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          scrollArrow.classList.remove('visible');
        } else if (document.getElementById('mainContent').style.display === 'block') {
          scrollArrow.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    arrowVisibilityObserver.observe(finalSection);
  }
  // --- FIN DEL CÓDIGO FINAL Y CORRECTO ---
});