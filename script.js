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

// Mostrar nombre del invitado
guestNameDisplay.textContent = guestName || 'Invitado';
nameInput.value = guestName;

// Verificar si está en la lista
fetch('https://script.google.com/macros/s/AKfycbx_Ty9mbwv7564q55dLCFcm68QuIbxZv6jaKqa773oqm3QxiO5ip8WLvnYOmI7U4HupTQ/exec', {
  method: 'POST',
  body: JSON.stringify({ name: guestName, validateOnly: true }),
  headers: { 'Content-Type': 'text/plain' }

})
.then(res => res.json())
.then(data => {
  if (data.result === "notFound") {
    confirmSection.innerHTML = `<p style="color:red;">❌ Lo sentimos, no estás en la lista de invitados.</p>`;
  } else if (data.result === "alreadyConfirmed") {
    confirmSection.innerHTML = `<p style="color:green;">✅ Ya has confirmado tu asistencia. ¡Gracias!</p>`;
  } else {
    form.style.display = 'block';
  }
})
.catch(() => {
  confirmSection.innerHTML = `<p style="color:red;">⚠️ Error al verificar tu invitación.</p>`;
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

  fetch('https://script.google.com/macros/s/AKfycbx_Ty9mbwv7564q55dLCFcm68QuIbxZv6jaKqa773oqm3QxiO5ip8WLvnYOmI7U4HupTQ/exec', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'text/plain' } 
  })
  .then(res => res.json())
  .then(() => {
    form.style.display = 'none';
    thanksMsg.style.display = 'block';
  })
  .catch(err => alert('Error al enviar confirmación.'));
}



