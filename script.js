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

  envelope.addEventListener('click', () => {
    envelope.classList.add('open');
    setTimeout(() => {
      document.getElementById('section1').style.display = 'none';
      mainContent.style.display = 'block';
      mainContent.style.position = 'relative';
      sec2.scrollIntoView({ behavior: 'smooth' });
      activarPantallaCompleta();

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
  const el = document.getElementById(id);
  const target = new Date('October 28, 2025 22:15:00').getTime();

  function update() {
    const d = target - Date.now();
    if (d <= 0) {
      el.innerHTML = '<strong>¡Hoy es el gran día!</strong>';
      return;
    }
    const days = Math.floor(d / 86400000);
    const hrs = Math.floor((d % 86400000) / 3600000);
    const mins = Math.floor((d % 3600000) / 60000);
    const secs = Math.floor((d % 60000) / 1000);
    el.innerHTML = `<span><strong>${days}</strong><small>Días</small></span><span><strong>${hrs}</strong><small>Horas</small></span><span><strong>${mins}</strong><small>Min</small></span><span><strong>${secs}</strong><small>Seg</small></span>`;
  }
  update();
  setInterval(update, 1000);
}

async function cargarGrupo() {
  const nombreElCover = document.querySelector('.cover-title');
  const confirmLink = document.getElementById('confirmLink');
  if (!groupCode) {
    nombreElCover.textContent = 'Querida Familia'; // Mensaje genérico
    confirmLink.href = "https://bautizo-samantha-sayuri.vercel.app/confirm.html";
    return;
  }
  try {
    const { data, error } = await supabase
      .from('guests_baptism')
      .select('guest, message_invitation')
      .eq('group_code', groupCode)
      .eq('is_leader', true)
      .maybeSingle();
    if (error || !data) {
      nombreElCover.textContent = 'Invitación no encontrada 😕';
      return;
    }
    const textoCompleto = `${data.guest} ${data.message_invitation || ''}`.trim();
    nombreElCover.textContent = textoCompleto;
    confirmLink.href = `https://bautizo-samantha-sayuri.vercel.app/confirm.html?group_code=${groupCode}`;
  } catch (err) {
    console.error(err);
    nombreElCover.textContent = 'Invitación no válida';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Observador para el "Fade In" de los componentes
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

  // Observador para la flecha de scroll
  const scrollArrow = document.getElementById('scrollArrow');
  const finalSection = document.getElementById('section8');

  if (scrollArrow && finalSection) {
    const arrowObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          scrollArrow.classList.remove('visible');
        } else if (document.getElementById('mainContent').style.display === 'block') {
          scrollArrow.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    arrowObserver.observe(finalSection);
  }
});
