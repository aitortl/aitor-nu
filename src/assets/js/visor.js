// Visor de pósteres: muestra el PDF en la propia página con PDF.js, con el texto seleccionable
// y legible por lectores de pantalla, y botones para ampliar. Sin JavaScript, o si el PDF no
// carga, queda el aviso con el enlace al PDF.
import * as pdfjs from "/assets/pdfjs/pdf.min.mjs";

pdfjs.GlobalWorkerOptions.workerSrc = "/assets/pdfjs/pdf.worker.min.mjs";

const NIVELES = [1, 1.5, 2, 3]; // 1 = ajustado al ancho disponible
const MAX_PIXELES = 16e6; // límite de tamaño de lienzo en Safari para iPhone

document.querySelectorAll(".visor").forEach(iniciar);

// "Volver": si se llegó desde esta misma web, vuelve a la página anterior en el mismo punto;
// si no (enlace directo), el enlace lleva a las comunicaciones de Actividad.
document.querySelectorAll("[data-atras]").forEach((enlace) => {
  enlace.addEventListener("click", (e) => {
    if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) {
      e.preventDefault();
      history.back();
    }
  });
});

async function iniciar(visor) {
  const lienzo = visor.querySelector(".visor-lienzo");
  const botones = visor.querySelector(".visor-zoom");
  let doc;
  try {
    doc = await pdfjs.getDocument({
      url: visor.dataset.pdf,
      standardFontDataUrl: "/assets/pdfjs/standard_fonts/",
      wasmUrl: "/assets/pdfjs/wasm/",
    }).promise;
  } catch {
    return;
  }
  const paginas = [];
  for (let i = 1; i <= doc.numPages; i++) paginas.push(await doc.getPage(i));

  let nivel = 0;
  let tarea = 0;

  async function pintar() {
    const esta = ++tarea;
    const ancho = lienzo.clientWidth * NIVELES[nivel];
    const proporcion = lienzo.scrollWidth > lienzo.clientWidth ? lienzo.scrollLeft / lienzo.scrollWidth : 0;
    const nuevas = [];
    for (const pagina of paginas) {
      const base = pagina.getViewport({ scale: 1 });
      const escala = ancho / base.width;
      const vista = pagina.getViewport({ scale: escala });
      const densidad = Math.min(window.devicePixelRatio || 1, Math.sqrt(MAX_PIXELES / (vista.width * vista.height)));

      const caja = document.createElement("div");
      caja.className = "visor-pagina";
      caja.style.setProperty("--scale-factor", escala);
      caja.style.setProperty("--user-unit", 1);
      caja.style.setProperty("--total-scale-factor", escala);
      caja.style.setProperty("--scale-round-x", "1px");
      caja.style.setProperty("--scale-round-y", "1px");
      caja.style.width = `${Math.floor(vista.width)}px`;
      caja.style.height = `${Math.floor(vista.height)}px`;

      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(vista.width * densidad);
      canvas.height = Math.floor(vista.height * densidad);
      canvas.setAttribute("aria-hidden", "true");
      const texto = document.createElement("div");
      texto.className = "textLayer";
      caja.append(canvas, texto);

      await pagina.render({
        canvas,
        canvasContext: canvas.getContext("2d"),
        viewport: vista,
        transform: densidad === 1 ? null : [densidad, 0, 0, densidad, 0, 0],
      }).promise;
      await new pdfjs.TextLayer({ textContentSource: pagina.streamTextContent(), container: texto, viewport: vista }).render();
      if (esta !== tarea) return; // otra orden de ampliar llegó mientras tanto
      nuevas.push(caja);
    }
    lienzo.replaceChildren(...nuevas);
    lienzo.scrollLeft = proporcion * lienzo.scrollWidth;
    botones.querySelector('[data-zoom="-1"]').disabled = nivel === 0;
    botones.querySelector('[data-zoom="1"]').disabled = nivel === NIVELES.length - 1;
    botones.querySelector('[data-zoom="0"]').disabled = nivel === 0;
  }

  botones.addEventListener("click", (e) => {
    const boton = e.target.closest("[data-zoom]");
    if (!boton) return;
    const paso = Number(boton.dataset.zoom);
    nivel = paso === 0 ? 0 : Math.max(0, Math.min(NIVELES.length - 1, nivel + paso));
    pintar();
  });

  // Al cambiar el ancho de la ventana (o girar el móvil), se vuelve a ajustar.
  let ultimoAncho = lienzo.clientWidth;
  let espera;
  new ResizeObserver(() => {
    if (lienzo.clientWidth === ultimoAncho) return;
    ultimoAncho = lienzo.clientWidth;
    clearTimeout(espera);
    espera = setTimeout(pintar, 200);
  }).observe(lienzo);

  await pintar();
  botones.hidden = false;
}
