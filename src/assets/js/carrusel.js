// Carrusel de "Mi historia": botones anterior/siguiente y contador.
// Sin JavaScript sigue funcionando deslizando las fotos. No avanza solo.
document.querySelectorAll(".carrusel").forEach((carrusel) => {
  const pista = carrusel.querySelector(".pasos");
  const total = pista.children.length;
  const anterior = carrusel.querySelector("[data-anterior]");
  const siguiente = carrusel.querySelector("[data-siguiente]");
  const cuenta = carrusel.querySelector(".cuenta");
  if (total < 2 || !anterior) return;

  const actual = () => Math.round(pista.scrollLeft / pista.clientWidth);
  const ir = (i) => pista.scrollTo({ left: Math.max(0, Math.min(total - 1, i)) * pista.clientWidth });
  const actualizar = () => {
    const i = actual();
    cuenta.textContent = `${i + 1} de ${total}`;
    anterior.disabled = i === 0;
    siguiente.disabled = i === total - 1;
  };

  anterior.addEventListener("click", () => ir(actual() - 1));
  siguiente.addEventListener("click", () => ir(actual() + 1));
  let espera;
  pista.addEventListener("scroll", () => {
    clearTimeout(espera);
    espera = setTimeout(actualizar, 80);
  }, { passive: true });
  actualizar();
});
