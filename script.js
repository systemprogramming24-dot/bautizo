fetch(url, {
  method: "POST",
  body: JSON.stringify({ name: guestName, validateOnly: true }),
  headers: { "Content-Type": "application/json" }
})
.then(res => res.text())
.then(text => {
  console.log("Texto bruto:", text);
  try {
    const json = JSON.parse(text);
    console.log("JSON parseado:", json);
  } catch (e) {
    console.error("No se pudo parsear como JSON:", e);
  }
})
.catch(err => console.error("Error de red:", err));
