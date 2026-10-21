# aitor.nu — documento de construcción

Spec para construir la web a partir del prototipo aprobado. Léelo entero antes de
empezar. Las reglas de contenido y marca están en `CLAUDE.md`.

## Qué es esta web

Tarjeta de visita ampliada de un dietista-nutricionista. **No vende servicios.** Su
trabajo es: aparecer al buscar su nombre, respaldar el correo `contacto@aitor.nu`, y
documentar con enlaces comprobables todo lo que figura en su currículum.

Audiencia: reclutadores de hospital, investigación, industria y docencia.

## Punto de partida

`prototipo.html` es el diseño aprobado: un único archivo con la portada y las cuatro
páginas interiores, que conmuta con el hash de la URL. **El diseño visual está
cerrado**; no lo rediseñes. Lo que hay que hacer es convertirlo en un sitio real con
páginas separadas y contenido editable.

## Decisiones ya tomadas

- **Alojamiento:** GitHub Pages, repositorio público, dominio propio `aitor.nu`.
- **Edición de contenido:** Pages CMS (código abierto, gratuito, trabaja sobre el
  repositorio). Aitor añadirá eventos, noticias y publicaciones con formularios, sin
  tocar código.
- **Generador:** usa un generador estático sencillo (Eleventy es la propuesta) que
  construya HTML real a partir de archivos de datos. Motivo: el HTML tiene que existir
  como tal para que los buscadores lo lean; cargar los listados con JavaScript
  perjudicaría al objetivo principal de la web. Si prefieres otro generador
  equivalente, explica por qué antes de cambiarlo.
- **Portada:** variante "retrato" (foto a la derecha, nombre superpuesto) con menú
  superior fijo.

## Estructura

| Página | Ruta | Contenido |
|---|---|---|
| Inicio | `/` | Portada, "Mi historia", "Dónde estoy ahora" |
| Trayectoria | `/trayectoria/` | Ahora, Antes, Formación, Reconocimientos e idiomas |
| Publicaciones | `/publicaciones/` | Capítulo, resumen de ponencia, guías, proyectos, perfiles |
| Actividad | `/actividad/` | Próximos eventos, ponencias, pósteres, en los medios |
| Docencia | `/docencia/` | Actividad docente |
| Aviso legal | `/aviso-legal/` | Pendiente de redactar |
| Privacidad | `/privacidad/` | Pendiente de redactar |

El pie de contacto se repite en todas las páginas.

## Contenido editable

Todo lo que sea una lista va en archivos de datos, no incrustado en el HTML. Campos
mínimos por tipo:

**Publicaciones** — `titulo`, `autores`, `publicacion`, `anio`, `tipo` (capítulo ·
resumen · guía · dossier), `firma` (posición de firma), `enlace`, `enlace_texto`.

**Actividad** — `titulo`, `evento`, `fecha`, `tipo` (ponencia · póster · comunicación),
`firma`, `enlace`, `enlace_texto`.

**Eventos** — `nombre`, `fecha`, `lugar`, `papel`, `enlace`.
Un evento con fecha futura sale en "Próximos eventos"; al pasar la fecha, el propio
sitio lo mueve a la lista de pasados. Si no hay ninguno futuro, el bloque "Próximos
eventos" **no se muestra**: nada de "próximamente" vacío.

**Medios** — `titular`, `medio`, `fecha`, `papel`, `enlace`, `enlace_archivado`.
`papel` existe para poder indicar "en representación del CODiNuPA" cuando hablaba por
el Colegio. `enlace_archivado` apunta a una copia en web.archive.org, porque las
noticias desaparecen.

**Trayectoria y Docencia** — `entidad`, `puesto`, `periodo`, `descripcion`, `detalle`.

Ordena por fecha descendente en todas las listas. Campo vacío = no se muestra; no
pongas "N/D" ni guiones.

## Marcadores del prototipo

Las etiquetas "Año pendiente", "Páginas pendientes" y "Autoría pendiente de comprobar"
son avisos del prototipo. **No deben aparecer en la web publicada.** Mientras el dato
no esté resuelto, omite ese dato concreto y deja el resto de la referencia.

## Huecos que Aitor tiene que rellenar

No inventes sustitutos para nada de esto:

1. ~~Retrato~~ — entregado: `src/img/retrato.png` (PNG con fondo transparente; es el
   original de partida, la web genera sus propias copias en WebP).
2. Segunda foto, en "Mi historia" → `src/img/` (JPEG). Si hay eventos pasados o
   apariciones en medios, ese hueco lo ocupa el carrusel con sus fotos.
3. ~~Símbolo de marca~~ — entregado: kit de marca en `src/assets/marca/` (símbolo,
   favicon, icono de iOS e imagen para redes).
4. CV en PDF → `src/documentos/` — decidir si la versión pública lleva teléfono.
5. Número de colegiado, si el aviso legal lo requiere.

Mientras falten, deja el hueco marcado como en el prototipo. Dónde va cada tipo de
archivo y cómo se tratan las fotos: sección "Imágenes y archivos" de `CLAUDE.md`.

## Tareas, en orden

1. Montar el repositorio y el generador; pasar el prototipo a plantillas y páginas
   separadas, sin cambiar el diseño.
2. Sacar los listados a archivos de datos.
3. Configurar Pages CMS. **Consulta su documentación actual** antes de escribir la
   configuración, en vez de darla por sabida.
4. Comprobar en móvil, con teclado y con contraste.
5. Publicar en GitHub Pages y configurar el dominio. Verificar el dominio en GitHub
   **antes** de tocar el DNS, y no modificar los registros de correo.
6. Redactar aviso legal y privacidad.

## Antes de publicar

- [ ] Ninguna etiqueta "pendiente" visible.
- [ ] Ningún dato que contradiga la ficha canónica.
- [ ] El buzón `contacto@aitor.nu` está activo.
- [ ] No aparece el teléfono en ninguna página ni en el CV descargable.
- [ ] Todos los enlaces externos funcionan.
- [ ] Aviso legal y privacidad publicados.
