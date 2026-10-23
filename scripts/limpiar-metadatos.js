// Borra los metadatos de las imágenes de src/img y de los PDF de src/documentos.
// Imágenes (EXIF, XMP, IPTC, comentarios): sin volver a comprimirlas; la imagen queda
// idéntica y se conserva el perfil de color.
// PDF (ficha de propiedades y XMP: autor, programa, fechas…): el contenido no cambia.
//
// Uso:
//   node scripts/limpiar-metadatos.js             → limpia src/img y src/documentos
//   node scripts/limpiar-metadatos.js a.jpg b.pdf → limpia solo esos archivos
// Escribe en la salida los archivos que ha modificado.

import fs from "node:fs";
import path from "node:path";
import { PDFDocument, PDFName, PDFDict, PDFStream } from "pdf-lib";

const CARPETAS = ["src/img", "src/documentos"];

// JPEG: se eliminan APP1 (EXIF/XMP), APP12, APP13 (IPTC/Photoshop) y COM (comentarios).
// Se conservan APP0 (JFIF), APP2 (perfil ICC) y APP14 (Adobe, necesario para los colores).
function limpiarJpeg(d) {
  if (d[0] !== 0xff || d[1] !== 0xd8) return null;
  const partes = [d.subarray(0, 2)];
  let i = 2, cambiado = false;
  while (i + 4 <= d.length) {
    if (d[i] !== 0xff) return null;
    const marcador = d[i + 1];
    if (marcador === 0xda) { partes.push(d.subarray(i)); break; } // inicio de la imagen comprimida
    const longitud = d.readUInt16BE(i + 2);
    const segmento = d.subarray(i, i + 2 + longitud);
    if ([0xe1, 0xec, 0xed, 0xfe].includes(marcador)) cambiado = true;
    else partes.push(segmento);
    i += 2 + longitud;
  }
  return cambiado ? Buffer.concat(partes) : null;
}

// PNG: se eliminan eXIf, tEXt, iTXt, zTXt y tIME.
function limpiarPng(d) {
  const firma = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!d.subarray(0, 8).equals(firma)) return null;
  const partes = [firma];
  let i = 8, cambiado = false;
  while (i + 12 <= d.length) {
    const longitud = d.readUInt32BE(i);
    const tipo = d.toString("latin1", i + 4, i + 8);
    const bloque = d.subarray(i, i + 12 + longitud);
    if (["eXIf", "tEXt", "iTXt", "zTXt", "tIME"].includes(tipo)) cambiado = true;
    else partes.push(bloque);
    i += 12 + longitud;
  }
  return cambiado ? Buffer.concat(partes) : null;
}

// WebP: se eliminan los bloques EXIF y XMP y se actualizan las marcas de VP8X.
function limpiarWebp(d) {
  if (d.toString("latin1", 0, 4) !== "RIFF" || d.toString("latin1", 8, 12) !== "WEBP") return null;
  const bloques = [];
  let i = 12, cambiado = false;
  while (i + 8 <= d.length) {
    const tipo = d.toString("latin1", i, i + 4);
    const longitud = d.readUInt32LE(i + 4);
    const total = 8 + longitud + (longitud & 1);
    if (tipo === "EXIF" || tipo === "XMP ") cambiado = true;
    else bloques.push(Buffer.from(d.subarray(i, i + total)));
    i += total;
  }
  if (!cambiado) return null;
  for (const b of bloques) {
    if (b.toString("latin1", 0, 4) === "VP8X") b[8] &= ~(0x08 | 0x04); // sin EXIF ni XMP
  }
  const cuerpo = Buffer.concat(bloques);
  const cabecera = Buffer.alloc(12);
  cabecera.write("RIFF", 0, "latin1");
  cabecera.writeUInt32LE(4 + cuerpo.length, 4);
  cabecera.write("WEBP", 8, "latin1");
  return Buffer.concat([cabecera, cuerpo]);
}

// PDF: se elimina el diccionario Info del tráiler y todos los flujos XMP (/Type /Metadata).
// Si el PDF ya está limpio, no se reescribe.
async function limpiarPdf(d) {
  const doc = await PDFDocument.load(d, { updateMetadata: false });
  const ctx = doc.context;
  const xmp = [];
  let referencias = false;
  for (const [ref, obj] of ctx.enumerateIndirectObjects()) {
    const dict = obj instanceof PDFDict ? obj : obj instanceof PDFStream ? obj.dict : null;
    if (!dict) continue;
    if (dict.get(PDFName.of("Type")) === PDFName.of("Metadata")) xmp.push(ref);
    else if (dict.has(PDFName.of("Metadata"))) { dict.delete(PDFName.of("Metadata")); referencias = true; }
  }
  const info = ctx.trailerInfo.Info;
  if (!info && !xmp.length && !referencias) return null;
  if (info) { ctx.delete(info); delete ctx.trailerInfo.Info; }
  xmp.forEach((ref) => ctx.delete(ref));
  return Buffer.from(await doc.save({ updateFieldAppearances: false }));
}

const LIMPIADORES = { ".jpg": limpiarJpeg, ".jpeg": limpiarJpeg, ".png": limpiarPng, ".webp": limpiarWebp, ".pdf": limpiarPdf };

function archivosDe(carpeta) {
  if (!fs.existsSync(carpeta)) return [];
  return fs.readdirSync(carpeta, { withFileTypes: true }).flatMap((e) => {
    const ruta = path.join(carpeta, e.name);
    return e.isDirectory() ? archivosDe(ruta) : [ruta];
  });
}

const archivos = process.argv.length > 2 ? process.argv.slice(2) : CARPETAS.flatMap(archivosDe);
for (const archivo of archivos) {
  const limpiar = LIMPIADORES[path.extname(archivo).toLowerCase()];
  if (!limpiar || !fs.existsSync(archivo)) continue;
  const limpio = await limpiar(fs.readFileSync(archivo));
  if (limpio) {
    fs.writeFileSync(archivo, limpio);
    console.log(archivo);
  }
}
