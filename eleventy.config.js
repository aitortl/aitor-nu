import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

const ENTRADA = "src";

const MESES_CORTOS = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."];
const MESES_LARGOS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

// Las fechas de los datos admiten tres precisiones: "2021", "2021-11" o "2021-11-05".
// Se muestran con la misma precisión con la que están escritas.
function partes(fecha) {
  if (fecha === undefined || fecha === null || fecha === "") return null;
  if (fecha instanceof Date) fecha = fecha.toISOString().slice(0, 10);
  const [a, m, d] = String(fecha).trim().split("-").map(Number);
  if (!a) return null;
  return { a, m: m || null, d: d || null };
}

function fechaCorta(fecha) {
  const p = partes(fecha);
  if (!p) return "";
  if (p.d) return `${p.d} ${MESES_CORTOS[p.m - 1]} ${p.a}`;
  if (p.m) return `${MESES_CORTOS[p.m - 1]} ${p.a}`;
  return String(p.a);
}

// Clave ordenable: "2021" < "2021-03" < "2021-03-15".
function clave(fecha) {
  const p = partes(fecha);
  if (!p) return "";
  const dos = (n) => String(n || 0).padStart(2, "0");
  return `${p.a}-${dos(p.m)}-${dos(p.d)}`;
}

function escapar(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Lo que no tiene fecha de fin sigue en curso y va primero;
// el resto, por fecha de fin y, a igualdad, por fecha de inicio.
function ordenarPeriodos(lista) {
  return [...(lista || [])].sort((x, y) => {
    const fx = x.fin ? clave(x.fin) : "9999";
    const fy = y.fin ? clave(y.fin) : "9999";
    if (fx !== fy) return fx < fy ? 1 : -1;
    const ix = clave(x.inicio), iy = clave(y.inicio);
    return ix === iy ? 0 : ix < iy ? 1 : -1;
  });
}

// Fecha más reciente de una comunicación: la suya o la de su última ocasión.
function fechaComunicacion(c) {
  const fechas = [c.fecha, ...(c.ocasiones || []).map((o) => o.fecha)].map(clave).filter(Boolean);
  return fechas.sort().pop() || "";
}

function existe(ruta) {
  if (!ruta) return false;
  return fs.existsSync(path.join(ENTRADA, decodeURI(String(ruta)).replace(/^\//, "")));
}

// Fotos de eventos pasados y de apariciones en medios, de la más reciente a la más antigua.
// Las entradas sin foto se incluyen igualmente: en su lugar se muestra el símbolo de marca.
function carrusel(eventos, medios) {
  const hoy = hoyEnMadrid();
  const diapositivas = [
    ...(eventos || [])
      .filter((e) => clave(e.fecha) && clave(e.fecha) < hoy)
      .map((e) => ({ fecha: e.fecha, foto: e.foto, alt: e.foto_alt, titulo: e.nombre, secundario: e.lugar })),
    ...(medios || []).map((m) => ({ fecha: m.fecha, foto: m.foto, alt: m.foto_alt, titulo: m.titular, secundario: m.medio })),
  ];
  return diapositivas
    .map((d) => ({ ...d, foto: existe(d.foto) ? d.foto : "" }))
    .sort((x, y) => (clave(x.fecha) < clave(y.fecha) ? 1 : clave(x.fecha) > clave(y.fecha) ? -1 : 0));
}

function hoyEnMadrid() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

export default function (eleventyConfig) {
  eleventyConfig.addDataExtension("yml,yaml", (contenido) => yaml.load(contenido));

  // Las fotos de src/img se reducen y convierten a WebP y JPEG al construir;
  // los originales no se publican. Un PNG con fondo transparente (como el retrato)
  // usa PNG en lugar de JPEG como alternativa, para no perder la transparencia.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp", "jpeg"],
    widths: [480, 960, 1600],
    minimumThreshold: 1, // incluye siempre el tamaño original si es menor de 1600 px
    sharpPngOptions: { palette: true, quality: 85, compressionLevel: 9 },
    urlPath: "/img/",
    outputDir: "./_site/img/",
    defaultAttributes: { loading: "lazy", decoding: "async" },
  });

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/documentos": "documentos" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  // Iconos que los navegadores buscan en la raíz del sitio.
  eleventyConfig.addPassthroughCopy({ "src/assets/marca/favicon.ico": "favicon.ico" });
  eleventyConfig.addPassthroughCopy({ "src/assets/marca/apple-touch-icon.png": "apple-touch-icon.png" });

  // Fechas
  eleventyConfig.addFilter("fecha", fechaCorta);
  eleventyConfig.addFilter("desdeLargo", (inicio) => {
    const p = partes(inicio);
    if (!p) return "";
    return p.m ? `Desde ${MESES_LARGOS[p.m - 1]} de ${p.a}` : `Desde ${p.a}`;
  });
  eleventyConfig.addFilter("periodo", (inicio, fin) => {
    const i = partes(inicio), f = partes(fin);
    if (!f) return i ? `Desde ${fechaCorta(inicio)}` : "";
    if (!i || clave(inicio) === clave(fin)) return fechaCorta(fin);
    if (i.a === f.a) {
      if (i.m && f.m && !i.d && !f.d) return `${MESES_CORTOS[i.m - 1]} – ${MESES_CORTOS[f.m - 1]} ${f.a}`;
      if (!i.m && !f.m) return String(f.a);
    }
    return `${fechaCorta(inicio)} – ${fechaCorta(fin)}`;
  });
  eleventyConfig.addFilter("rangoComunicacion", (c) => {
    if (!c.ocasiones || !c.ocasiones.length) return fechaCorta(c.fecha);
    const anios = c.ocasiones.map((o) => partes(o.fecha)?.a).filter(Boolean);
    const min = Math.min(...anios), max = Math.max(...anios);
    return min === max ? String(max) : `${min} – ${max}`;
  });

  // Orden
  eleventyConfig.addFilter("ordenarPeriodos", ordenarPeriodos);
  eleventyConfig.addFilter("enCurso", (lista) => ordenarPeriodos(lista).filter((x) => !x.fin));
  eleventyConfig.addFilter("terminados", (lista) => ordenarPeriodos(lista).filter((x) => x.fin));
  eleventyConfig.addFilter("ordenarPorFecha", (lista, campo = "fecha") =>
    [...(lista || [])].sort((x, y) => {
      const cx = clave(x[campo]), cy = clave(y[campo]);
      if (!cx || !cy) return cx ? -1 : cy ? 1 : 0; // sin fecha, al final
      return cx === cy ? 0 : cx < cy ? 1 : -1;
    })
  );
  eleventyConfig.addFilter("ordenarComunicaciones", (lista) =>
    [...(lista || [])].sort((x, y) => {
      const cx = fechaComunicacion(x), cy = fechaComunicacion(y);
      return cx === cy ? 0 : cx < cy ? 1 : -1;
    })
  );
  eleventyConfig.addFilter("deTipo", (lista, ...tipos) => (lista || []).filter((x) => tipos.includes(x.tipo)));
  eleventyConfig.addFilter("proximos", (lista) => {
    const hoy = hoyEnMadrid();
    return [...(lista || [])].filter((e) => clave(e.fecha) >= hoy).sort((x, y) => (clave(x.fecha) < clave(y.fecha) ? -1 : 1));
  });
  eleventyConfig.addFilter("pasados", (lista) => {
    const hoy = hoyEnMadrid();
    return [...(lista || [])].filter((e) => clave(e.fecha) < hoy).sort((x, y) => (clave(x.fecha) < clave(y.fecha) ? 1 : -1));
  });

  // Texto
  // Escapa el HTML y convierte *texto* en <cite>texto</cite> (títulos de obras y revistas).
  eleventyConfig.addFilter("texto", (valor) => {
    if (!valor) return "";
    return escapar(valor).replace(/\*([^*]+)\*/g, "<cite>$1</cite>");
  });
  eleventyConfig.addFilter("firma", (n) => {
    n = Number(n);
    if (!n) return "";
    const sufijo = n === 1 || n === 3 ? "<sup>er</sup>" : "º";
    return `${n}.${sufijo} autor`;
  });
  eleventyConfig.addFilter("compactar", (lista) => (lista || []).filter(Boolean));
  // Une fragmentos como frases: ["Universidad X", "Sobresaliente."] → "Universidad X. Sobresaliente."
  eleventyConfig.addFilter("frase", (lista) =>
    (lista || []).filter(Boolean).map((s) => String(s).trim().replace(/\.$/, "")).join(". ") + "."
  );
  eleventyConfig.addFilter("capitalizar", (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : ""));

  // Material que Aitor aún tiene que aportar: si el archivo no está, se muestra el hueco.
  eleventyConfig.addFilter("existe", existe);
  eleventyConfig.addFilter("carrusel", carrusel);

  return {
    dir: { input: ENTRADA, includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
  };
}
