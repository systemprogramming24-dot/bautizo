function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const guestName = decodeURIComponent(getQueryParam('nombre') || "").trim();
const nameInput = document.getElementById('name');
const guestNameDisplay = document.getElementById('guestName');
const form = document.getElementById('rsvpForm');
const thanksMsg = document.getElementById('thanksMsg');
const guestCountWrapper = document.getElementById('guestCountWrapper');
const confirmSection = document.querySelector('.confirm');

const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');

guestNameDisplay.textContent = guestName || 'Invitado';
nameInput.value = guestName;

// Enviar datos con iframe para evitar CORS
function sendPost(data, callback) {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = 'about:blank';

  document.body.appendChild(iframe);

  window.addEventListener('message', function handler(event) {
    try {
      const response = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      callback(response);
      window.removeEventListener('message', handler);
      document.body.removeChild(iframe);
    } catch {
      // ignorar errores de parseo
    }
  });

  const html = `
    <form id="proxyForm" action="https://script.google.com/macros/s/AKfycbzjyES7ZSOrsIyavG8ut7QskCmZorr7L-FkVigZj74lCD80Of95AtyxkGIsnj4o3My0JA/exec" method="post" target="proxyFrame">
      <input type="hidden" name="data" value='${JSON.stringify(data)}'>
    </form>
    <iframe name="proxyFrame" style="display:none;"></iframe>
    <script>
      document.getElementById('proxyForm').submit();
    </script>
  `;

  iframe.srcdoc = html;
}

// Verificar si está en la lista
sendPost({ name: guestName, validateOnly: true }, (data) => {
  if (data.result === "notFound") {
    confirmSection.innerHTML = `<p style="color:red;">❌ Lo sentimos, no estás en la lista de invitados.</p>`;
  } else if (data.result === "alreadyConfirmed") {
    confirmSection.innerHTML = `<p style="color:green;">✅ Ya has confirmado tu asistencia. ¡Gracias!</p>`;
  } else {
    form.style.display = 'block';
  }
});

yesBtn.addEventListener('click', () => {
  guestCountWrapper.style.display = 'block';
  document.getElementById('guests').required = true;

  setTimeout(() => {
    if (document.getElementById('guests').value) {
      sendConfirmation("Sí");
    }
  }, 500);
});

noBtn.addEventListener('click', () => {
  guestCountWrapper.style.display = 'none';
  document.getElementById('guests').required = false;
  sendConfirmation("No");
});

function sendConfirmation(response) {
  const data = {
    name: nameInput.value,
    response: response,
    guests: response === "Sí" ? document.getElementById('guests').value || 1 : 0
  };

  sendPost(data, () => {
    form.style.display = 'none';
    thanksMsg.style.display = 'block';
  });
}

