// Jiu-ji Podcast · textos en inglés.
// La clave es el texto en español tal como está en la página; el valor es su traducción.
// Si el valor trae un enlace, se escribe como HTML. El eslogan "Fuera del tatami" es de la marca y no se traduce.
export const EN = {
  "Saltar al contenido": "Skip to content",
  "Menú": "Menu",
  "Sobre el podcast": "About the podcast",
  "Anfitriones": "Hosts",
  "Episodios": "Episodes",
  "Para marcas": "For brands",
  "Contacto": "Contact",
  "Escúchalo en Spotify": "Listen on Spotify",
  "Míralo en YouTube": "Watch on YouTube",
  "baja al tatami ↓": "step onto the mat ↓",

  "el podcast": "the podcast",
  "Una conversación relajada, grabada en el tatami y con kimono. Sin cambios de ropa ni transiciones: nos sentamos a hablar de lo que pasa fuera del tatami.":
    "A laid-back conversation, recorded on the mat and in our gis. No wardrobe changes, no transitions: we sit down to talk about what happens off the mat.",
  "¿Cómo se aplica el jiu-jitsu en tu trabajo y en tu vida?": "How does jiu-jitsu show up in your work and in your life?",
  "Cada invitado nos cuenta qué se llevó del tatami a su trabajo y a su vida. Te esperamos cada 15 días en Spotify y YouTube, y con los mejores momentos en nuestras redes.":
    "Every guest tells us what they took from the mat into their work and their life. New episodes every 15 days on Spotify and YouTube, and the best moments on our socials.",

  "Cinturón blanco": "White belt",
  "Cinturón negro": "Black belt",
  "Foto pendiente": "Photo pending",

  "dale play": "hit play",
  "Escúchalo mientras entrenas, manejas o trabajas, o míralo en video. Cada episodio nuevo aparece aquí.":
    "Listen while you train, drive or work, or watch it on video. Every new episode shows up here.",
  "Reproductor de Spotify del programa: falta el enlace del programa": "Spotify show player: show link pending",
  "Lista de YouTube: falta el enlace del canal o de la lista": "YouTube playlist: channel or playlist link pending",
  "Jiu-ji Podcast en YouTube": "Jiu-ji Podcast on YouTube",
  "Ver el canal": "Visit the channel",
  "Ver los episodios aquí": "Watch the episodes here",
  "Jiu-ji Podcast en Spotify": "Jiu-ji Podcast on Spotify",
  "Abrir en Spotify": "Open in Spotify",
  "Escuchar aquí": "Listen here",

  "para marcas": "for brands",
  "Pon tu marca en el tatami": "Put your brand on the mat",
  "Jiu-ji Podcast habla con gente que entrena jiu-jitsu y lo lleva a su trabajo y a su vida. Si tu marca le habla a esa comunidad, conversemos.":
    "Jiu-ji Podcast talks with people who train jiu-jitsu and carry it into their work and their life. If your brand speaks to that community, let's talk.",
  "A quién llegamos": "Who we reach",
  "Personas que practican jiu-jitsu, dentro y fuera del tatami.": "People who practice jiu-jitsu, on and off the mat.",
  "Formatos de patrocinio": "Sponsorship formats",
  "Mención": "Mention",
  "Tu marca, nombrada por los anfitriones durante el episodio.": "Your brand, mentioned by the hosts during the episode.",
  "Producto en el set": "Product on set",
  "Tu producto a la vista en el tatami mientras conversamos.": "Your product in view on the mat while we talk.",
  "Ronda rápida patrocinada": "Sponsored rapid round",
  "El segmento de preguntas rápidas, presentado por tu marca.": "The rapid-fire questions segment, presented by your brand.",
  "Temporada": "Season",
  "Tu marca acompaña una temporada completa del podcast.": "Your brand joins a full season of the podcast.",
  "Pide el media kit": "Request the media kit",

  "Escríbenos": "Write to us",
  "¿Quieres patrocinar, proponer un invitado o simplemente saludar? Déjanos tu mensaje y te respondemos al correo.":
    "Want to sponsor, suggest a guest or just say hi? Leave us a message and we'll reply by email.",
  "Tu nombre": "Your name",
  "Tu correo": "Your email",
  "Motivo": "Reason",
  "Tu mensaje": "Your message",
  "Patrocinio": "Sponsorship",
  "Quiero el media kit": "I want the media kit",
  "Proponer un invitado": "Suggest a guest",
  "Prensa o alianzas": "Press or partnerships",
  "Otro": "Other",
  "Autorizo a Jiu-ji Podcast a tratar mis datos personales para responder mi mensaje, según la Política de tratamiento de datos.":
    'I authorize Jiu-ji Podcast to process my personal data to reply to my message, under the <a href="politica-de-datos.html">Personal Data Processing Policy</a>.',
  "Enviar mensaje": "Send message",

  "En colaboración con": "In collaboration with",
  "Logo de Gracie Colombia pendiente": "Gracie Colombia logo pending",
  "Política de tratamiento de datos · © 2026 Jiu-ji Podcast": '<a href="politica-de-datos.html">Personal Data Processing Policy</a> · © 2026 Jiu-ji Podcast',
};

// Atributos (etiquetas para lectores de pantalla)
export const EN_ATRIBUTOS = {
  "Jiu-ji Podcast, ir al inicio": "Jiu-ji Podcast, go to home",
  "Principal": "Main",
  "Nuestras redes": "Our socials",
  "Sitio en tamaño celular": "Site at phone size",
};

// Mensajes que escribe el código
export const MENSAJES = {
  es: {
    sonidoOn: "Sonido activado", sonidoOff: "Sonido apagado",
    revisa: "Revisa los campos marcados y la casilla de autorización.",
    vista: "Vista previa: el envío se conecta cuando tengamos el correo del podcast.",
    titulo: "Jiu-ji Podcast · Fuera del tatami",
    pendiente: "Pendiente: ",
    enviando: "Enviando tu mensaje...",
    exito: "¡Listo! Recibimos tu mensaje y te respondemos al correo.",
    error: "No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos a jiujipodcast@gmail.com.",
  },
  en: {
    sonidoOn: "Sound on", sonidoOff: "Sound off",
    revisa: "Check the highlighted fields and the authorization box.",
    vista: "Preview: sending will be connected once we have the podcast email.",
    titulo: "Jiu-ji Podcast · Fuera del tatami",
    pendiente: "Pending: ",
    enviando: "Sending your message...",
    exito: "Done! We got your message and will reply by email.",
    error: "We couldn't send your message. Try again or write to jiujipodcast@gmail.com.",
  },
};

const SELECTOR = ".saltar, #menu a, .menu-btn .txt, .acciones a, .bajar, main h2, main h3, main p, main label, main option, .formatos strong, .formatos span, main .btn, .fachada-titulo, .pendiente, .gracie p, .logo-gracie, .legal";
const limpio = t => t.replace(/\s+/g, " ").trim();
let guardados = null;

export function aplicarIdioma(lang) {
  if (!guardados) {
    guardados = [...document.querySelectorAll(SELECTOR)].map(el => ({ el, html: el.innerHTML, clave: limpio(el.textContent) }));
    document.querySelectorAll("[aria-label]").forEach(el => { el.dataset.ariaEs = el.getAttribute("aria-label"); });
  }
  guardados.forEach(({ el, html, clave }) => {
    if (lang === "en" && EN[clave] !== undefined) {
      const v = EN[clave];
      if (v.includes("<")) el.innerHTML = v; else el.textContent = v;
    } else el.innerHTML = html;
  });
  document.querySelectorAll("[data-aria-es]").forEach(el => {
    const es = el.dataset.ariaEs;
    el.setAttribute("aria-label", lang === "en" && EN_ATRIBUTOS[es] ? EN_ATRIBUTOS[es] : es);
  });
  document.documentElement.lang = lang;
}
