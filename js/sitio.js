// Jiu-ji Podcast · comportamiento de la página
import { fondoSimple } from "./textura.js";
import { aplicarIdioma, MENSAJES } from "./idiomas.js";

let lang = "es", escena = null;
const M = clave => MENSAJES[lang][clave];

const raiz = document.documentElement, cuerpo = document.body;
// ?simple en la dirección muestra la versión con menos movimiento (para revisarla)
const menosMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches || new URLSearchParams(location.search).has("simple");

// ---------- Sonido (apagado por defecto, se genera con código) ----------
const sonido = (() => {
  let ctx = null, activo = false;
  const boton = document.querySelector(".sonido"), etiqueta = boton.querySelector("span");
  function ruido(dur, frec, q, vol, t0 = 0) {
    if (!activo || !ctx) return;
    const n = ctx.sampleRate * dur, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 4);
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = buf; f.type = "bandpass"; f.frequency.value = frec; f.Q.value = q; g.gain.value = vol;
    src.connect(f).connect(g).connect(ctx.destination); src.start(ctx.currentTime + t0);
  }
  function tono(frec, dur, vol) {
    if (!activo || !ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.frequency.value = frec; o.type = "sine";
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur);
  }
  boton.addEventListener("click", () => {
    activo = !activo;
    if (activo && !ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx && ctx.state === "suspended") ctx.resume();
    boton.setAttribute("aria-pressed", activo);
    etiqueta.textContent = activo ? M("sonidoOn") : M("sonidoOff");
    if (activo) api.tecla();
  });
  const api = {
    get activo() { return activo; },
    tecla() { ruido(0.05, 2600 + Math.random() * 900, 1.4, 0.55); ruido(0.03, 180, 0.8, 0.5); },
    golpe() { ruido(0.12, 420, 0.7, 0.9); },
    bip() { tono(1320, 0.18, 0.08); },
  };
  return api;
})();
// los botones y enlaces suenan como una tecla de máquina de escribir
document.addEventListener("pointerdown", e => { if (e.target.closest(".btn, #menu a, .marca")) sonido.tecla(); });

// ---------- Redes sin enlace todavía: no hacen nada al hacer clic ----------
document.querySelectorAll('a.pendiente-enlace[href="#"]').forEach(a => {
  a.title = M("pendiente") + a.dataset.pendiente;
  a.addEventListener("click", e => e.preventDefault());
});

// ---------- Idioma (ES / EN), se recuerda en este navegador ----------
const botonesIdioma = document.querySelectorAll(".idioma button");
function cambiarIdioma(nuevo) {
  lang = nuevo === "en" ? "en" : "es";
  aplicarIdioma(lang);
  botonesIdioma.forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang));
  const sb = document.querySelector(".sonido");
  sb.querySelector("span").textContent = sb.getAttribute("aria-pressed") === "true" ? M("sonidoOn") : M("sonidoOff");
  document.querySelectorAll('a.pendiente-enlace[href="#"]').forEach(a => { a.title = M("pendiente") + a.dataset.pendiente; });
  if (escena) escena.idioma(lang);
  try { localStorage.setItem("jiuji-idioma", lang); } catch (e) {}
}
botonesIdioma.forEach(b => b.addEventListener("click", () => { if (b.dataset.lang !== lang) cambiarIdioma(b.dataset.lang); }));
try { const g = localStorage.getItem("jiuji-idioma"); if (g === "en") cambiarIdioma("en"); } catch (e) {}

// ---------- Reproductores: YouTube carga solo al hacer clic (más rápido y sin cookies antes de tiempo) ----------
document.querySelectorAll('.reproductor[data-tipo="youtube"]').forEach(r => {
  const boton = r.querySelector(".cargar");
  if (!boton || r.dataset.activo !== "si") return;
  boton.hidden = false;
  boton.addEventListener("click", () => {
    const f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/videoseries?list=" + encodeURIComponent(r.dataset.lista);
    f.title = "Episodios de Jiu-ji Podcast en YouTube";
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    f.allowFullscreen = true; f.loading = "lazy";
    r.replaceChildren(f);
  });
});

// ---------- Menú en celular ----------
const menuBtn = document.querySelector(".menu-btn"), menu = document.getElementById("menu");
function cerrarMenu() { menu.classList.remove("abierto"); menuBtn.setAttribute("aria-expanded", "false"); }
menuBtn.addEventListener("click", () => {
  const abierto = menu.classList.toggle("abierto");
  menuBtn.setAttribute("aria-expanded", abierto);
  if (abierto) menu.querySelector("a").focus();
});
menu.addEventListener("click", e => { if (e.target.closest("a")) cerrarMenu(); });
addEventListener("keydown", e => { if (e.key === "Escape" && menu.classList.contains("abierto")) { cerrarMenu(); menuBtn.focus(); } });

// ---------- Fondo de la barra al bajar ----------
const barra = document.querySelector(".barra");
const fondoBarra = () => barra.classList.toggle("con-fondo", scrollY > innerHeight * 0.6);
addEventListener("scroll", fondoBarra, { passive: true }); fondoBarra();

// ---------- Sección actual en el menú ----------
const secciones = [...document.querySelectorAll("main > section")];
const enlaces = new Map([...menu.querySelectorAll("a")].map(a => [a.getAttribute("href").slice(1), a]));
const ioMenu = new IntersectionObserver(entradas => {
  entradas.forEach(en => {
    if (!en.isIntersecting) return;
    enlaces.forEach(a => a.removeAttribute("aria-current"));
    enlaces.get(en.target.id)?.setAttribute("aria-current", "true");
  });
}, { rootMargin: "-45% 0px -45% 0px" });
secciones.forEach(s => ioMenu.observe(s));

// ---------- Paneles que aparecen ----------
const paneles = document.querySelectorAll(".panel");
const ioPaneles = new IntersectionObserver(entradas => entradas.forEach(en => { if (en.isIntersecting) en.target.classList.add("visible"); }), { threshold: 0.15 });
paneles.forEach(p => ioPaneles.observe(p));

// ---------- "Pide el media kit" deja el motivo elegido ----------
document.querySelectorAll("[data-motivo]").forEach(a => a.addEventListener("click", () => {
  document.getElementById("f-motivo").value = a.dataset.motivo;
}));

// ---------- Formulario (se conecta en la siguiente parte) ----------
const form = document.getElementById("formulario"), estadoForm = form.querySelector(".estado");
form.addEventListener("submit", e => {
  e.preventDefault();
  let ok = true;
  form.querySelectorAll("[required]").forEach(c => {
    const valido = c.type === "checkbox" ? c.checked : c.checkValidity() && c.value.trim() !== "";
    c.setAttribute("aria-invalid", !valido); if (!valido && ok) { c.focus(); ok = false; }
  });
  if (!ok) { estadoForm.textContent = M("revisa"); return; }
  const clave = form.querySelector('[name="access_key"]').value;
  if (!clave || clave === "PENDIENTE") { estadoForm.textContent = M("vista"); return; }
  const boton = form.querySelector('[type="submit"]');
  boton.disabled = true; estadoForm.textContent = M("enviando");
  const datos = Object.fromEntries(new FormData(form));
  datos.idioma = lang;
  fetch(form.action, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(datos) })
    .then(r => r.json())
    .then(r => {
      if (r.success) { form.reset(); form.querySelectorAll("[aria-invalid]").forEach(c => c.removeAttribute("aria-invalid")); estadoForm.textContent = M("exito"); }
      else estadoForm.textContent = M("error");
    })
    .catch(() => { estadoForm.textContent = M("error"); })
    .finally(() => { boton.disabled = false; });
});

// ---------- Stickers que se mueven un poco con el mouse ----------
if (!menosMovimiento) {
  addEventListener("pointermove", e => {
    raiz.style.setProperty("--mx", (e.clientX / innerWidth - .5).toFixed(3));
    raiz.style.setProperty("--my", (e.clientY / innerHeight - .5).toFixed(3));
  }, { passive: true });
}

// ---------- Polvo de tiza que deja el cursor ----------
if (!menosMovimiento && matchMedia("(pointer: fine)").matches) {
  const cp = document.getElementById("polvo"), gp = cp.getContext("2d"), motas = [];
  const tam = () => { cp.width = innerWidth * devicePixelRatio; cp.height = innerHeight * devicePixelRatio; gp.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); };
  addEventListener("resize", tam); tam();
  addEventListener("pointermove", e => {
    for (let i = 0; i < 3; i++) motas.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - .5) * .8, vy: Math.random() * .6 + .1, v: 1, r: Math.random() * 1.8 + .4 });
  }, { passive: true });
  (function paso() {
    gp.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = motas.length - 1; i >= 0; i--) {
      const m = motas[i]; m.x += m.vx; m.y += m.vy; m.v -= .018;
      if (m.v <= 0) { motas.splice(i, 1); continue; }
      gp.fillStyle = `rgba(250,250,250,${m.v * .55})`; gp.fillRect(m.x, m.y, m.r, m.r);
    }
    requestAnimationFrame(paso);
  })();
}

// ---------- 3D o versión simple ----------
function versionSimple() {
  cuerpo.classList.remove("tres");
  cuerpo.classList.add("simple");
  // el logo plano solo se descarga en la versión simple
  document.querySelectorAll("picture [data-srcset]").forEach(x => { x.srcset = x.dataset.srcset; });
  document.querySelectorAll("img[data-src]").forEach(x => { x.src = x.dataset.src; });
  try { cuerpo.style.setProperty("--textura", `url(${fondoSimple()})`); } catch (e) {}
  paneles.forEach(p => p.classList.add("visible"));
}
const hayWebGL = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } })();

if (menosMovimiento || !hayWebGL) {
  versionSimple();
} else {
  cuerpo.classList.add("tres");
  import("./escena.js")
    .then(m => m.iniciar({ canvas: document.getElementById("escena"), secciones, sonido, alListo: () => cuerpo.classList.add("listo"), alBajo: versionSimple }))
    .then(api => { escena = api; if (lang !== "es") escena.idioma(lang); })
    .catch(err => { console.error(err); versionSimple(); });
}
