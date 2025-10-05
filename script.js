const proxy = "https://corsproxy.io/?";
const url = proxy + "https://script.google.com/macros/s/AKfycbzjyES7ZSOrsIyavG8ut7QskCmZorr7L-FkVigZj74lCD80Of95AtyxkGIsnj4o3My0JA/exec";

fetch(url, {
  method: "POST",
  body: JSON.stringify({ name: guestName, validateOnly: true }),
  headers: { "Content-Type": "application/json" }
})
.then(res => res.json())
.then(data => {
  console.log("Respuesta:", data);
})
.catch(err => console.error("Error:", err));
