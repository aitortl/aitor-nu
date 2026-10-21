# aitor.nu — reglas del proyecto

Web personal de Aitor Trabanco LLano, Dietista-Nutricionista.
Este archivo lo lees al empezar cada sesión. Respétalo por encima de cualquier
preferencia general.

> **Este repositorio es público.** No escribas aquí ni en ningún archivo del
> repositorio: teléfono, dirección postal, notas internas, borradores privados ni
> las fichas del proyecto. El único dato de contacto publicable es
> `contacto@aitor.nu`. Lo privado va en `CLAUDE.local.md` (ignorado por git).

## Veracidad — regla prioritaria

1. **No inventes nunca** experiencia, cifras, logros, funciones, fechas ni enlaces.
   Si falta un dato, déjalo fuera y pregunta a Aitor. Un hueco es aceptable; un dato
   inventado, no.
2. La fuente de verdad es la **Ficha de datos canónicos**, que no está en este
   repositorio. Si necesitas un dato que no esté ya en los archivos de contenido,
   pregunta; no lo deduzcas del CV ni de internet.
3. **No exageres ni redondees al alza.** La etapa en la Fundación Española de la
   Nutrición fueron varios contratos entre 2018 y 2022: nunca "cuatro años seguidos".
4. Participación en proyectos de investigación: siempre **miembro del equipo**, nunca
   investigador principal ni captación de fondos. **No publiques importes de proyectos.**
5. Todo dato debe ser defendible si alguien cruza la web con el CV, LinkedIn y el CVN.
6. Si detectas una incoherencia entre archivos, **avisa en vez de elegir por tu cuenta**.

## Datos fijos

- Apellido: **LLano**, siempre con doble L mayúscula.
- Titular ancla, idéntico en toda la web: *Dietista-Nutricionista · Clínica e
  investigación con mirada didáctica*.
- Nunca presentarlo como "Docente Universitario". La docencia es una faceta, no el titular.
- Nombres oficiales: **Hospital Universitario de Cabueñes**, **Association RéPPOP
  Aquitaine**, **NutriMed Clinical Nutrition** (antes Adventia Pharma; etapa continua
  desde 2021), **CODiNuPA** (grafía exacta).
- Ubicación temporal: investigación, docencia y divulgación desde 2018; práctica
  clínica desde 2021.
- Correo: `contacto@aitor.nu`. ORCID: `0000-0002-8152-4214`.
- LinkedIn: `linkedin.com/in/aitortl`.

## Estilo de redacción

- Español de España. Evita anglicismos innecesarios.
- Tono profesional y solvente, con cercanía. Ni acartonado ni coloquial.
- En textos de apertura no des una cifra concreta de años de experiencia.
- Frases concretas; nada de relleno genérico ni superlativos vacíos.
- Mayúscula solo al principio de frase: nada de rótulos en MAYÚSCULAS.

## Identidad visual

| Elemento | Valor |
|---|---|
| Petróleo (acento) | `#0E5B62` |
| Petróleo profundo | `#0A4247` |
| Tinte agua | `#E4F0F0` |
| Pizarra (neutro) | `#334247` |
| Papel (fondo) | `#FBFDFD` |
| Tinta (texto) | `#1E2A2C` |
| Tipografía de títulos | Lora |
| Tipografía de texto | Source Sans 3 |

- **Un solo color de acento.** No introduzcas colores nuevos sin preguntar.
- La portada es deliberadamente expresiva; el resto de la web es sobrio.
- El símbolo de marca es la ligadura AT. El definitivo está en `src/assets/marca/`
  (copiado del kit de marca, junto con el favicon y la imagen para redes):
  **no lo redibujes, modifiques ni aproximes**.
- No uses logotipos de terceros (hospital, FINBA, ISPA, universidades, editoriales).

## Reglas de contenido

- Cada publicación indica **posición de firma** y, cuando exista, **enlace a la fuente
  original**. Si no hay fuente pública, la entrada va sin enlace; no inventes uno.
- El Dossier EsNuPI es un **documento divulgativo** de la AEP, nunca un artículo
  indexado.
- Los resúmenes de congreso son **resúmenes**, nunca artículos.
- No menciones la formación informática (Big Data, machine learning, DAM) como
  competencia técnica.
- No publiques nada que identifique a pacientes.
- Inglés no aparece en la web (nivel A2).

## Imágenes y archivos

- `src/img/`: fotos de contenido (retrato, eventos, medios). Es la carpeta de subida de
  Pages CMS. Al construir, la web genera copias reducidas en WebP; el original no se
  publica en la web.
- `src/documentos/`: PDF descargables (CV).
- `src/assets/`: archivos de diseño (estilos, scripts, fuentes y `marca/simbolo.svg`).
- Ningún archivo de contenido en la raíz del proyecto.
- Fotos en JPEG; PNG solo si tienen fondo transparente. Sube siempre la versión de
  mejor calidad, nunca una ya comprimida para web.
- **Los originales quedan visibles en el repositorio público.** Los metadatos (GPS,
  cámara, autor) se borran solos: al hacer commit en local y, para lo subido desde
  Pages CMS, con una acción de GitHub. Esta segunda vía deja el original en el
  historial de git, así que conviene subir fotos sin ubicación.
- Solo fotos propias o con permiso. Ninguna foto de prensa sin autorización del medio
  y ningún paciente identificable.

## Calidad técnica

- Debe funcionar en móvil, con foco visible por teclado y respetando
  `prefers-reduced-motion`.
- Contraste mínimo 4,5:1 en texto.
- El nombre completo debe ser el `<h1>` real de la portada, no solo una imagen.
- Nada de rastreadores ni analítica sin preguntar antes. Única analítica autorizada:
  **GoatCounter**, sin cookies (código en `src/_data/sitio.yml`; solo se activa en la web
  publicada). Si cambia, actualiza también la política de privacidad.
- No añadas dependencias nuevas sin explicar para qué.
