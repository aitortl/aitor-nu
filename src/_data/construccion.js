// Datos calculados en cada construcción del sitio.
export default function () {
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  return { hoy, anio: hoy.slice(0, 4) };
}
