// Datos calculados en cada construcción del sitio.
export default function () {
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  // "build" al publicar; "serve" o "watch" en local.
  const produccion = process.env.ELEVENTY_RUN_MODE === "build";
  return { hoy, anio: hoy.slice(0, 4), produccion };
}
