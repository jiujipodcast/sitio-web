// Jiu-ji Podcast · escena 3D: tatami negro, logo animado y recorrido por estaciones.
import * as THREE from "three";
import { alturasTatami, normales } from "./textura.js";

const V3 = THREE.Vector3;
const ease = t => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
const suave = (a, b, x) => { const t = Math.min(Math.max((x - a) / (b - a), 0), 1); return t * t * (3 - 2 * t); };
function caida(t) { // llega, golpea y rebota un poco
  t = Math.min(Math.max(t, 0), 1);
  if (t < .6) { const k = t / .6; return 1 - k * k; }
  const k = (t - .6) / .4; return Math.sin(k * Math.PI) * 0.06 * (1 - k);
}
const ALTO = 0.04;

export async function iniciar({ canvas, secciones, sonido, alListo, alBajo }) {
  await Promise.all([
    document.fonts.load('200px "Archivo Black"'), document.fonts.load('150px "Permanent Marker"'),
    document.fonts.load('80px "Special Elite"'),
  ]);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#141414");
  scene.fog = new THREE.Fog("#141414", 10, 20);
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 120);

  scene.add(new THREE.HemisphereLight("#cfd8ff", "#0a0a0a", 0.09));
  const foco = new THREE.SpotLight("#fff4e6", 340, 34, 0.5, 1, 2);
  foco.castShadow = true;
  foco.shadow.mapSize.set(1024, 1024);
  foco.shadow.bias = -0.0004;
  scene.add(foco, foco.target);

  // ---------- Tatami ----------
  {
    const { S, alto } = alturasTatami(256, 5), n = normales(S, alto, 2.2);
    const c = document.createElement("canvas"); c.width = c.height = S;
    const g = c.getContext("2d"), img = g.createImageData(S, S);
    for (let i = 0; i < S * S; i++) {
      img.data[i*4] = (n[i*3] * .5 + .5) * 255; img.data[i*4+1] = (n[i*3+1] * .5 + .5) * 255;
      img.data[i*4+2] = (n[i*3+2] * .5 + .5) * 255; img.data[i*4+3] = 255;
    }
    g.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    t.repeat.set(150, 150); t.center.set(.5, .5); t.rotation = Math.PI / 4;
    const piso = new THREE.Mesh(new THREE.BoxGeometry(125, ALTO * 2, 125),
      new THREE.MeshStandardMaterial({ color: "#1b1b1b", normalMap: t, normalScale: new THREE.Vector2(1.4, 1.4), roughness: .5 }));
    piso.position.z = -25;
    piso.receiveShadow = true;
    scene.add(piso);
  }

  // ---------- Fábricas de texturas ----------
  const tex = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

  function tiza(texto, alturaMundo) {
    const c = document.createElement("canvas"), g = c.getContext("2d");
    g.font = '430px "Archivo Black"';
    const w = Math.ceil(g.measureText(texto).width) + 200;
    c.width = w; c.height = 560;
    g.font = '430px "Archivo Black"'; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#fff";
    g.fillText(texto, w / 2, 300);
    const im = g.getImageData(0, 0, w, 560), d = im.data;
    for (let i = 3; i < d.length; i += 4) if (d[i]) { const r = Math.random(); d[i] *= r < .3 ? .18 : r < .45 ? .55 : .95; }
    g.putImageData(im, 0, 0);
    for (let k = 0; k < w * 1.3; k++) { g.fillStyle = `rgba(255,255,255,${Math.random() * .25})`; g.fillRect(60 + Math.random() * (w - 120), 60 + Math.random() * 460, 2, 2); }
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { map: { value: tex(c) }, revela: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: `uniform sampler2D map; uniform float revela; varying vec2 vUv;
        float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
        void main(){ vec4 c = texture2D(map, vUv);
          float b = revela + (h(floor(vUv * vec2(400.,90.))) - .5) * .03;
          gl_FragColor = vec4(c.rgb * .93, c.a * (1. - smoothstep(b - .015, b, vUv.x)));
          #include <colorspace_fragment>
        }`
    });
    const alto = alturaMundo, ancho = alto * w / 560;
    return { mesh: new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), mat), mat, ancho };
  }

  // Sticker de hoja de cuaderno con texto en marcador
  function sticker(texto, { alturaMundo = 1.1, punto = false, tam = 170 } = {}) {
    const H = 380, m = document.createElement("canvas").getContext("2d");
    m.font = `${tam}px "Permanent Marker"`;
    const tw = m.measureText(texto).width, W = Math.ceil(tw + 330 + (punto ? 90 : 0));
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d");
    g.beginPath(); g.moveTo(40, 30);
    for (let x = 40; x <= W - 40; x += 60) g.lineTo(x, 30 + (Math.random() - .5) * 4);
    for (let y = 30; y <= H - 30; y += 26) g.lineTo(W - 40 + ((y / 26) % 2 ? 16 : -10), y);
    for (let x = W - 40; x >= 40; x -= 60) g.lineTo(x, H - 30 + (Math.random() - .5) * 4);
    for (let y = H - 30; y >= 30; y -= 26) g.lineTo(40 + ((y / 26) % 2 ? -16 : 10), y);
    g.closePath(); g.fillStyle = "#FFFEFA"; g.fill();
    g.save(); g.clip();
    g.strokeStyle = "#8FB0D3"; g.lineWidth = 3;
    for (let y = 78; y < H; y += 44) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.strokeStyle = "#E07A7A"; g.lineWidth = 4; g.beginPath(); g.moveTo(150, 0); g.lineTo(150, H); g.stroke();
    g.font = `${tam}px "Permanent Marker"`; g.textBaseline = "middle"; g.fillStyle = "#C8102E";
    const x0 = 190; g.fillText(texto, x0, 205);
    g.restore();
    const t = tex(c), ancho = alturaMundo * W / H;
    const geo = new THREE.PlaneGeometry(ancho, alturaMundo, 40, 6), pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i); pos.setZ(i, Math.pow(x / (ancho / 2), 2) * 0.05); }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: t, alphaTest: .5, roughness: .9, side: THREE.DoubleSide }));
    let dot = null;
    if (punto) {
      dot = new THREE.Mesh(new THREE.CircleGeometry(alturaMundo * 0.09, 32), new THREE.MeshBasicMaterial({ color: "#E0141E" }));
      dot.position.set(((x0 + tw + 46) / W - .5) * ancho, -0.05 * alturaMundo, 0.06);
      mesh.add(dot);
    }
    return { mesh, ancho, dot };
  }

  // Hoja de máquina de escribir que se teclea sola
  function hojaMaquina(texto, ancho = 2.1) {
    const W = 900, H = 1160, c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"), t = tex(c);
    g.font = '54px "Special Elite"';
    const palabras = texto.split(" "), lineas = [];
    let l = "";
    for (const p of palabras) { const prueba = l ? l + " " + p : p; if (g.measureText(prueba).width > 740) { lineas.push(l); l = p; } else l = prueba; }
    lineas.push(l);
    function dibuja(n) {
      g.fillStyle = "#FFFEFA"; g.fillRect(0, 0, W, H);
      g.fillStyle = "rgba(0,0,0,.04)"; for (let k = 0; k < 900; k++) g.fillRect(Math.random() * W, Math.random() * H, 2, 2);
      g.font = '54px "Special Elite"'; g.fillStyle = "#1d1d1d"; g.textBaseline = "top";
      let resto = n;
      lineas.forEach((ln, i) => { if (resto <= 0) return; g.fillText(ln.slice(0, resto), 80, 150 + i * 84); resto -= ln.length + 1; });
      t.needsUpdate = true;
    }
    dibuja(0);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(ancho, ancho * H / W), new THREE.MeshStandardMaterial({ map: t, roughness: .95, side: THREE.DoubleSide }));
    mesh.castShadow = true;
    return { mesh, dibuja, total: texto.length };
  }

  // Polaroid con foto pendiente
  // Polaroid grande. Si existe la foto en img/anfitriones/, se pone sola; si no, queda el espacio.
  function polaroid(pie, foto, sub = "", ancho = 2.3) {
    const W = 600, H = 820, c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"), t = tex(c), F = W - 72;
    let imagen = null;
    function dibujar() {
      g.fillStyle = "#FFFEFA"; g.fillRect(0, 0, W, H);
      const gr = g.createLinearGradient(0, 40, W, 560); gr.addColorStop(0, "#2c2c2c"); gr.addColorStop(1, "#141414");
      g.fillStyle = gr; g.fillRect(36, 36, F, F);
      g.textAlign = "center"; g.textBaseline = "middle";
      if (imagen) {
        const k = Math.max(F / imagen.width, F / imagen.height), w = imagen.width * k, h = imagen.height * k;
        g.save(); g.beginPath(); g.rect(36, 36, F, F); g.clip();
        g.drawImage(imagen, 36 + (F - w) / 2, 36 + (F - h) / 2, w, h); g.restore();
      } else { g.fillStyle = "rgba(255,255,255,.08)"; g.font = '120px "Archivo Black"'; g.fillText("?", W / 2, W / 2); }
      if (pie) { g.fillStyle = "#1d1d1d"; g.font = '86px "Permanent Marker"'; g.fillText(pie, W / 2, 648); }
      if (sub) { g.fillStyle = "#C8102E"; g.font = '52px "Special Elite"'; g.fillText(sub, W / 2, 748); }
      t.needsUpdate = true;
    }
    dibujar();
    if (foto) { const img = new Image(); img.onload = () => { imagen = img; dibujar(); }; img.src = foto; }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(ancho, ancho * H / W), new THREE.MeshStandardMaterial({ map: t, roughness: .8, side: THREE.DoubleSide }));
    m.castShadow = true;
    m.userData.ponerSub = nuevo => { sub = nuevo; dibujar(); };
    const cinta = new THREE.Mesh(new THREE.PlaneGeometry(ancho * 0.36, ancho * 0.1), new THREE.MeshStandardMaterial({ color: "#efe6c8", transparent: true, opacity: .8, roughness: 1 }));
    cinta.position.set(0, ancho * H / W / 2 - 0.03, 0.01); cinta.rotation.z = -0.08;
    m.add(cinta);
    return m;
  }

  // Textos de la escena en cada idioma (el eslogan "Fuera del tatami" es de la marca y no se traduce)
  const T3 = {
    es: { aire: "EN EL AIRE", formatos: ["MENCIÓN", "PRODUCTO EN EL SET", "RONDA RÁPIDA", "TEMPORADA"], escribe: "ESCRÍBENOS", anf: "ANFITRIONES", blanco: "cinturón blanco", negro: "cinturón negro" },
    en: { aire: "ON AIR", formatos: ["MENTION", "PRODUCT ON SET", "RAPID ROUND", "SEASON"], escribe: "WRITE TO US", anf: "HOSTS", blanco: "white belt", negro: "black belt" },
  };
  const liberar = o => o.traverse(x => { x.geometry && x.geometry.dispose(); if (x.material) { x.material.map && x.material.map.dispose(); x.material.dispose(); } });

  // Micrófono de podcast
  function microfono() {
    const g = new THREE.Group();
    const metal = new THREE.MeshStandardMaterial({ color: "#2b2b2b", metalness: .85, roughness: .35 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.07, 48), metal); base.position.y = ALTO + 0.035;
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.5, 16), metal); poste.position.y = 0.8;
    const rejilla = (() => {
      const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d");
      x.fillStyle = "#808080"; x.fillRect(0, 0, 128, 128); x.fillStyle = "#2a2a2a";
      for (let i = 0; i < 128; i += 8) for (let j = 0; j < 128; j += 8) { x.beginPath(); x.arc(i + 4, j + 4, 2.4, 0, 7); x.fill(); }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 4); return t;
    })();
    const cabeza = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.5, 8, 32),
      new THREE.MeshStandardMaterial({ color: "#3d3d3d", metalness: .9, roughness: .45, bumpMap: rejilla, bumpScale: 2 }));
    cabeza.position.y = 1.85; cabeza.rotation.x = 0.25;
    const anillo = new THREE.Mesh(new THREE.TorusGeometry(0.275, 0.035, 12, 48), new THREE.MeshStandardMaterial({ color: "#C8102E", roughness: .4 }));
    anillo.rotation.x = Math.PI / 2; anillo.position.y = -0.12; cabeza.add(anillo);
    const rec = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), new THREE.MeshBasicMaterial({ color: "#E0141E" }));
    rec.position.set(0.3, ALTO + 0.1, 0.42);
    const luz = new THREE.PointLight("#ff2030", 0, 2.5, 2); rec.add(luz);
    [base, poste, cabeza].forEach(m => { m.castShadow = true; });
    g.add(base, poste, cabeza, rec);
    return { grupo: g, rec, luz };
  }

  // ---------- Estación 0: logo ----------
  const logo = new THREE.Group();
  logo.position.set(0, 1.55, 0); logo.rotation.x = -0.62;
  scene.add(logo);
  const jiuji = tiza("JIU-JI", 2.08);
  jiuji.mesh.position.set(0, 1.0, 0); logo.add(jiuji.mesh);
  const stLogo = sticker("PODCAST", { alturaMundo: 1.11, punto: true });
  const pivLogo = new THREE.Group(); pivLogo.add(stLogo.mesh);
  pivLogo.rotation.z = THREE.MathUtils.degToRad(7); logo.add(pivLogo);
  const brilloLogo = new THREE.PointLight("#ff2030", 0, 2.2, 2); stLogo.dot.add(brilloLogo); brilloLogo.position.z = .25;
  // eslogan tecleado
  const cEs = document.createElement("canvas"); cEs.width = 1600; cEs.height = 200;
  const gEs = cEs.getContext("2d"), tEs = tex(cEs), ESLOGAN = "Fuera del tatami";
  const escribeEs = n => { gEs.clearRect(0, 0, 1600, 200); gEs.font = '120px "Special Elite"'; gEs.textBaseline = "middle"; gEs.fillStyle = "#FAFAFA";
    gEs.fillText(ESLOGAN.slice(0, n), (1600 - gEs.measureText(ESLOGAN).width) / 2, 105); tEs.needsUpdate = true; };
  escribeEs(0);
  const eslogan = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 0.65), new THREE.MeshBasicMaterial({ map: tEs, transparent: true, depthWrite: false }));
  eslogan.position.set(0, -1.25, 0.01); logo.add(eslogan);

  // ---------- Estaciones del recorrido ----------
  const lados = secciones.map(s => s.dataset.lado || "centro");
  const centros = [new V3(0, 1.2, 0.5), new V3(-6, 0.95, -11), new V3(6, 0.95, -22), new V3(-6, 0.95, -33), new V3(6, 0.95, -44), new V3(-6, 0.95, -55)];
  const grupos = centros.map((c, i) => { const g = new THREE.Group(); if (i) { g.position.set(c.x, 0, c.z); scene.add(g); } return g; });
  const estado = centros.map(() => ({ llegada: -1 }));

  // 1 · Sobre el podcast: solo el tatami; el texto flota al centro.

  // 2 · Anfitriones: dos polaroids
  const pol = [polaroid("Salo", "img/anfitriones/salo.jpg", T3.es.blanco), polaroid("Santi", "img/anfitriones/santi.jpg", T3.es.negro)];
  let tituloAnf = tiza(T3.es.anf, 0.62);
  grupos[2].add(tituloAnf.mesh);
  // En escritorio van lado a lado; en celular Santi arriba un poco a la izquierda y Salo abajo un poco a la derecha.
  function colocarAnfitriones(vertical) {
    const [salo, santi] = pol;
    // Las dos miran de frente a la cámara (misma inclinación que su mirada) y quedan a la misma distancia: igual tamaño.
    const incl = -Math.atan2(0.42, 0.9), arriba = new V3(0, 0.9, -0.42);
    if (vertical) {
      const base = new V3(0, 3.1, 0.25);
      santi.position.copy(base).addScaledVector(arriba, 1.65).add(new V3(-0.4, 0, 0)); santi.rotation.set(incl, 0, 0.04);
      salo.position.copy(base).addScaledVector(arriba, -1.65).add(new V3(0.4, 0, 0)); salo.rotation.set(incl, 0, -0.04);
      tituloAnf.mesh.position.copy(base).addScaledVector(arriba, 3.55);
    } else {
      salo.position.set(-1.3, 1.8, 0); salo.rotation.set(incl, 0, 0.04);
      santi.position.set(1.3, 1.8, 0); santi.rotation.set(incl, 0, -0.04);
      tituloAnf.mesh.position.set(0, 4.15, -0.75);
    }
    tituloAnf.mesh.rotation.x = incl;
    pol.forEach(p => { p.userData.y = p.position.y; });
  }
  pol.forEach(p => grupos[2].add(p));

  // 3 · Episodios: micrófono
  const mic = microfono();
  grupos[3].add(mic.grupo);
  let stEp = null;
  function ponerEp(txt) {
    if (stEp) { grupos[3].remove(stEp.mesh); liberar(stEp.mesh); }
    stEp = sticker(txt, { alturaMundo: 0.7, punto: true });
    stEp.mesh.position.set(0.2, 0.55, 0.8); stEp.mesh.rotation.set(-0.5, 0, -0.08);
    grupos[3].add(stEp.mesh);
  }
  ponerEp(T3.es.aire);

  // 4 · Para marcas: cuatro stickers de formatos
  const formatos = T3.es.formatos.map((t, i) => {
    const piv = new THREE.Group(); piv.add(sticker(t, { alturaMundo: 0.52 }).mesh);
    piv.position.set((i % 2 ? 0.35 : -0.35), 2.0 - i * 0.55, 0.05 * i);
    piv.rotation.set(-0.3, 0, [-0.06, 0.05, -0.03, 0.07][i]);
    grupos[4].add(piv);
    return piv;
  });

  // 5 · Contacto: sticker Escríbenos
  const pivCo = new THREE.Group();
  pivCo.position.set(0, 1.3, 0); pivCo.rotation.set(-0.35, 0, -0.05);
  grupos[5].add(pivCo);
  let stCo = null;
  function ponerCo(txt) {
    if (stCo) { pivCo.remove(stCo.mesh); liberar(stCo.mesh); }
    stCo = sticker(txt, { alturaMundo: 0.95, punto: true }); pivCo.add(stCo.mesh);
  }
  ponerCo(T3.es.escribe);

  // Cambiar el idioma de los textos de la escena
  function idioma(lang) {
    const T = T3[lang] || T3.es;
    ponerEp(T.aire); ponerCo(T.escribe);
    formatos.forEach((piv, i) => { const viejo = piv.children[0]; piv.remove(viejo); liberar(viejo); piv.add(sticker(T.formatos[i], { alturaMundo: 0.52 }).mesh); });
    pol[0].userData.ponerSub(T.blanco); pol[1].userData.ponerSub(T.negro);
    const pos = tituloAnf.mesh.position.clone(), revela = tituloAnf.mat.uniforms.revela.value;
    grupos[2].remove(tituloAnf.mesh); liberar(tituloAnf.mesh);
    tituloAnf = tiza(T.anf, 0.62); tituloAnf.mesh.position.copy(pos); tituloAnf.mesh.rotation.x = -Math.atan2(0.42, 0.9);
    tituloAnf.mat.uniforms.revela.value = revela; grupos[2].add(tituloAnf.mesh);
  }

  // ---------- Polvo de tiza en el aire ----------
  const N = 1400, pg = new THREE.BufferGeometry(), pp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pp[i*3] = (Math.random() - .5) * 26; pp[i*3+1] = Math.random() * 5; pp[i*3+2] = 6 - Math.random() * 66; }
  pg.setAttribute("position", new THREE.BufferAttribute(pp, 3));
  const puntos = new THREE.Points(pg, new THREE.PointsMaterial({ color: "#fff", size: 0.022, transparent: true, opacity: .35, depthWrite: false }));
  scene.add(puntos);

  // ---------- Cámara por estación ----------
  let vertical = false, distHero = 10;
  const camaras = centros.map(() => ({ pos: new V3(), mira: new V3() }));
  function ajustar() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    vertical = camera.aspect < 0.8;
    camera.fov = vertical ? 44 : 35;
    camera.updateProjectionMatrix();
    const t = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    distHero = Math.max(9.5, (vertical ? 7.3 : 8.4 / 0.9) / (t * camera.aspect));
    const dirHero = new V3(0, vertical ? 0.55 : 0.45, vertical ? 0.83 : 0.89).normalize();
    camaras[0].mira.set(0, vertical ? 1.0 : 1.2, 0.5);
    camaras[0].pos.copy(dirHero).multiplyScalar(distHero).add(camaras[0].mira);
    const dir = new V3(0, 0.42, 0.9).normalize();
    for (let i = 1; i < centros.length; i++) {
      const d = vertical ? 10.5 : 9.2, desp = new V3();
      const id = secciones[i].id;
      if (id === "anfitriones") desp.y = vertical ? 1.75 : 1.15; // la cámara mira al centro de las fotos: quedan en la mitad de la pantalla
      else if (lados[i] === "centro" && !vertical) { /* sin desplazamiento: el texto flota al centro */ }
      else if (vertical) desp.y = -d * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 0.42;
      else desp.x = d * (t / 2) * camera.aspect * 0.45 * (lados[i] === "izq" ? -1 : 1);
      camaras[i].mira.copy(centros[i]).add(desp);
      camaras[i].pos.copy(dir).multiplyScalar(d).add(camaras[i].mira);
    }
    grupos[2].scale.setScalar(vertical ? 0.8 : 0.85);
    colocarAnfitriones(vertical);
    medir();
  }
  // centro de cada sección en la página
  let marcas = [];
  function medir() {
    marcas = secciones.map((s, i) => i === 0 ? 0 : s.offsetTop + innerHeight * 0.2); // la cámara llega apenas empieza cada sección
  }
  addEventListener("resize", ajustar); ajustar();
  new ResizeObserver(medir).observe(document.body);

  function progreso() {
    const y = scrollY;
    if (y <= marcas[0]) return 0;
    for (let i = 0; i < marcas.length - 1; i++) {
      if (y < marcas[i + 1]) return i + suave(0.12, 0.88, (y - marcas[i]) / (marcas[i + 1] - marcas[i]));
    }
    return marcas.length - 1;
  }

  const raton = { x: 0, y: 0 };
  addEventListener("pointermove", e => { raton.x = e.clientX / innerWidth - .5; raton.y = e.clientY / innerHeight - .5; }, { passive: true });

  // ---------- Bucle ----------
  // ---------- Calidad según la fluidez real (cuadros por segundo medidos, nunca por núcleos o memoria) ----------
  // 2 = completa, 1 = ligera (sin sombras ni partículas, menos resolución), 0 = versión simple sin 3D.
  // Para probar: ?calidad=alta | media | baja en la dirección.
  const forzada = new URLSearchParams(location.search).get("calidad");
  let nivel = 2, detenido = false, subidas = 0, cuadros = 0, tiempo = 0, fpsAntes = 0, tope = false;
  function ponerNivel(n) {
    nivel = n; document.body.dataset.calidad = n;
    if (n === 0) { detenido = true; alBajo && alBajo(); return; }
    renderer.setPixelRatio(n === 2 ? Math.min(devicePixelRatio, 1.75) : 1);
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.shadowMap.enabled = n === 2; foco.castShadow = n === 2;
    puntos.visible = n === 2;
    scene.traverse(o => { if (o.material) o.material.needsUpdate = true; });
  }
  function medirFluidez(dtReal, t) {
    if (forzada || t < 3 || document.hidden || dtReal > 1) return; // no mide durante la entrada ni con la pestaña oculta
    cuadros++; tiempo += dtReal;
    if (tiempo < 2) return;
    const fps = cuadros / tiempo; cuadros = 0; tiempo = 0;
    if (nivel === 2 && fps < 22) ponerNivel(tope ? 0 : 1);
    else if (nivel === 2 && fps < 40 && !tope) { fpsAntes = fps; ponerNivel(1); }
    else if (nivel === 1 && fpsAntes && fps < fpsAntes * 1.15 && fps >= 26) {
      // bajar la calidad no mejoró nada: es un tope del equipo (por ejemplo, ahorro de batería), no falta de potencia
      tope = true; fpsAntes = 0; ponerNivel(2);
    }
    else if (nivel === 1 && fps < 22) ponerNivel(0);
    else if (nivel === 1 && fps > 57 && subidas < 1) { subidas++; ponerNivel(2); }
    else fpsAntes = 0;
  }
  document.body.dataset.calidad = 2;
  if (forzada === "media") ponerNivel(1);
  if (forzada === "baja") { ponerNivel(0); return { idioma() {} }; }

  const reloj = new THREE.Clock();
  const camPos = new V3(), camMira = new V3(), desPos = new V3(), desMira = new V3();
  let primero = true, escritoEs = -1, punto0 = false, golpe0 = false, listo = false;

  function cuadro() {
    const dtReal = reloj.getDelta(), dt = Math.min(dtReal, 0.5), t = reloj.elapsedTime;
    medirFluidez(dtReal, t);
    if (detenido) return;
    const p = progreso(), i = Math.min(Math.floor(p), centros.length - 2), f = p - i;

    // posición deseada: entre la estación i y la siguiente, con un pequeño vuelo
    desPos.lerpVectors(camaras[i].pos, camaras[i + 1].pos, f);
    desMira.lerpVectors(camaras[i].mira, camaras[i + 1].mira, f);
    desPos.y += Math.sin(f * Math.PI) * 2.2;
    // entrada: la cámara baja sobre el tatami
    const k = ease(t / 2.6), intro = 1 - k;
    if (p < 1 && intro > 0) {
      const off = desPos.clone().sub(desMira).multiplyScalar(1 + 1.1 * intro * (1 - p));
      desPos.copy(desMira).add(off); desPos.x += Math.sin(0.35 * intro) * 3 * (1 - p);
    }
    desPos.x += raton.x * 0.5 * k; desPos.y -= raton.y * 0.25 * k;
    if (primero) { camPos.copy(desPos); camMira.copy(desMira); primero = false; }
    const a = 1 - Math.exp(-dt * (t < 2.6 ? 30 : 4.5));
    camPos.lerp(desPos, a); camMira.lerp(desMira, a);
    camera.position.copy(camPos); camera.lookAt(camMira);
    const dist = camPos.distanceTo(camMira);
    scene.fog.near = dist * 0.95; scene.fog.far = dist * 1.9;
    foco.position.set(camMira.x + 0.5, 9.5, camMira.z + 2.5); foco.target.position.set(camMira.x, 0.4, camMira.z);
    foco.angle = vertical ? 0.62 : 0.5;

    // llegada a cada estación (se anima una sola vez)
    for (let e = 1; e < centros.length; e++) if (estado[e].llegada < 0 && Math.abs(p - e) < 0.35) estado[e].llegada = t;
    const desde = e => estado[e].llegada < 0 ? -1 : t - estado[e].llegada;

    // 0 · logo
    jiuji.mat.uniforms.revela.value = ease((t - 0.7) / 1.8) * 1.05;
    const s0 = caida((t - 2.6) / 0.7);
    pivLogo.position.set(0.95, -0.25 + s0 * 1.5, 0.03 + s0 * 5);
    stLogo.mesh.rotation.z = s0 * 0.6; stLogo.mesh.visible = t > 2.6;
    if (!golpe0 && t > 2.6 + 0.42) { golpe0 = true; sonido.golpe(); }
    const on0 = t > 3.4 && Math.floor((t - 3.4) * 1.6) % 2 === 0;
    if (on0 && !punto0) { punto0 = true; sonido.bip(); }
    stLogo.dot.material.color.set(on0 ? "#E0141E" : "#5a0a0e"); brilloLogo.intensity = on0 ? 1.4 : 0;
    const nEs = Math.max(0, Math.min(ESLOGAN.length, Math.floor((t - 3.6) * 11)));
    if (nEs !== escritoEs) { escribeEs(nEs); if (nEs > escritoEs && nEs > 0 && ESLOGAN[nEs - 1] !== " ") sonido.tecla(); escritoEs = nEs; }
    if (!listo && t > 5) { listo = true; alListo && alListo(); }
    logo.rotation.y = raton.x * 0.10 * k; logo.rotation.x = -0.62 + raton.y * 0.05 * k;

    // 2 · polaroids que caen
    const d2 = desde(2);
    tituloAnf.mat.uniforms.revela.value = d2 < 0 ? 0 : ease(d2 / 1.4) * 1.05;
    pol.forEach((m, j) => { const s = d2 < 0 ? 1 : caida((d2 - j * 0.25) / 0.7); m.position.y = m.userData.y + s * 4; m.visible = d2 >= 0; });

    // 3 · micrófono: el punto rojo titila
    const d3 = desde(3), on3 = d3 > 0.3 && Math.floor(d3 * 1.6) % 2 === 0;
    mic.rec.material.color.set(on3 ? "#E0141E" : "#5a0a0e"); mic.luz.intensity = on3 ? 1.6 : 0;
    stEp.dot.material.color.set(on3 ? "#E0141E" : "#5a0a0e");
    mic.grupo.position.y = d3 < 0 ? -2.2 : -2.2 * (1 - ease(d3 / 0.9));

    // 4 · stickers de formatos: llegan y se pegan uno por uno
    const d4 = desde(4);
    formatos.forEach((pv, j) => {
      const s = d4 < 0 ? 1 : caida((d4 - j * 0.22) / 0.6);
      pv.position.z = 0.05 * j + s * 5; pv.children[0].rotation.z = s * 0.6; pv.visible = d4 >= 0;
      if (d4 >= 0 && !pv.userData.golpe && d4 > j * 0.22 + 0.36) { pv.userData.golpe = true; sonido.golpe(); }
      pv.rotation.y = raton.x * 0.15 * (j % 2 ? 1 : -1);
    });

    // 5 · contacto
    const d5 = desde(5), s5 = d5 < 0 ? 1 : caida(d5 / 0.7);
    pivCo.position.z = s5 * 5; pivCo.visible = d5 >= 0;
    stCo.dot.material.color.set(d5 > 0.8 && Math.floor(d5 * 1.6) % 2 === 0 ? "#E0141E" : "#5a0a0e");

    grupos.forEach((g, e) => { if (e) g.rotation.y = raton.x * 0.08; });

    // polvo
    const arr = pg.attributes.position.array;
    for (let j = 1; j < arr.length; j += 3) { arr[j] += 0.0015; if (arr[j] > 5) arr[j] = 0; }
    pg.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);
  return { idioma };
}
