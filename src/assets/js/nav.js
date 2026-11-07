// Cabecera: fondo sólido al desplazarse y menú en móvil.
const nav = document.getElementById("nav");
const btn = document.getElementById("btnMenu");
const enInicio = document.body.classList.contains("es-inicio");

function actualizarNav() {
  nav.classList.toggle("solida", !enInicio || window.scrollY > 60);
}
function cerrarMenu() {
  nav.classList.remove("abierta");
  btn.setAttribute("aria-expanded", "false");
}

window.addEventListener("scroll", actualizarNav, { passive: true });
btn.addEventListener("click", () => {
  const abierta = nav.classList.toggle("abierta");
  btn.setAttribute("aria-expanded", String(abierta));
});
nav.querySelectorAll(".enlaces a").forEach((a) => a.addEventListener("click", cerrarMenu));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("abierta")) {
    cerrarMenu();
    btn.focus();
  }
});
actualizarNav();
