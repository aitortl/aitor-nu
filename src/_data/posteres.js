// Pósteres con página propia (/posteres/<nombre-del-pdf>/), donde se ven en la web sin descargarlos.
// Salen de comunicaciones.yml: el PDF puede estar en la entrada o en una de sus ocasiones.
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

export default function () {
  const { entradas = [] } = yaml.load(fs.readFileSync("src/_data/comunicaciones.yml", "utf8")) || {};
  const posteres = [];
  for (const c of entradas) {
    for (const o of [c, ...(c.ocasiones || [])]) {
      if (!o.poster) continue;
      const archivo = path.join("src", decodeURI(String(o.poster)).replace(/^\//, ""));
      if (!fs.existsSync(archivo)) continue;
      posteres.push({
        slug: path.basename(archivo, ".pdf"),
        pdf: o.poster,
        megas: (fs.statSync(archivo).size / 1048576).toFixed(1).replace(".", ","),
        titulo: c.titulo,
        evento: o.evento,
        fecha: o.fecha,
        firma: c.firma,
      });
    }
  }
  return posteres;
}
