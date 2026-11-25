// Relieve del tatami negro: grupos de ranuras que se alternan (tejido de canasta).
// Se usa en la escena 3D (mapa normal) y en la versión simple (fondo sombreado).
export function alturasTatami(S = 256, R = 5) {
  const C = S / 2, alto = new Float32Array(S * S);
  const ancho = C / R, radio = ancho * 0.36, margen = C * 0.09;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const cx = Math.floor(x / C), cy = Math.floor(y / C);
    let u = x % C, v = y % C;
    if ((cx + cy) % 2) [u, v] = [v, u];
    const i = Math.floor(v / ancho), eje = i * ancho + ancho / 2;
    const ux = Math.min(Math.max(u, margen + radio), C - margen - radio);
    const d = Math.hypot(u - ux, v - eje) / radio;
    alto[y * S + x] = d < 1 ? Math.sqrt(1 - d * d) : 0;
  }
  return { S, alto };
}

export function normales(S, alto, fuerza = 2.2) {
  const H = (x, y) => alto[((y + S) % S) * S + ((x + S) % S)];
  const out = new Float32Array(S * S * 3);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = (H(x + 1, y) - H(x - 1, y)) * fuerza, dy = (H(x, y + 1) - H(x, y - 1)) * fuerza;
    const l = Math.hypot(dx, dy, 1), k = (y * S + x) * 3;
    out[k] = -dx / l; out[k + 1] = dy / l; out[k + 2] = 1 / l;
  }
  return out;
}

// Fondo para la versión simple: el mismo relieve iluminado desde arriba a la izquierda.
export function fondoSimple() {
  const { S, alto } = alturasTatami(128, 5);
  const n = normales(S, alto, 1.6);
  const c = document.createElement("canvas"); c.width = c.height = S;
  const g = c.getContext("2d"), img = g.createImageData(S, S);
  const L = [-0.45, 0.55, 0.7], ll = Math.hypot(...L);
  for (let i = 0; i < S * S; i++) {
    const luz = Math.max(0, (n[i*3] * L[0] + n[i*3+1] * L[1] + n[i*3+2] * L[2]) / ll);
    const v = 14 + luz * 22 + alto[i] * 6;
    img.data[i*4] = img.data[i*4+1] = img.data[i*4+2] = v; img.data[i*4+3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c.toDataURL("image/png");
}
