document.addEventListener("DOMContentLoaded", () => {
  const btnComenzar = document.getElementById("btnComenzar");
  const music = document.getElementById("bgMusic");
  const contador = document.getElementById("contador");

  // Iniciar música con brillo dorado
  btnComenzar.addEventListener("click", () => {
    btnComenzar.style.transition = "opacity 1s ease";
    btnComenzar.style.opacity = 0;
    setTimeout(() => {
      music.play();
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }, 1000);
  });

  // Contador regresivo
  const fechaEvento = new Date("2025-10-12T13:00:00").getTime();
  setInterval(() => {
    const ahora = new Date().getTime();
    const diferencia = fechaEvento - ahora;
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    contador.textContent = `${dias} Días ${horas} Hrs ${minutos} Min`;
  }, 1000);
});
