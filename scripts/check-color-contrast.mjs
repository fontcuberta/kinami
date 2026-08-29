// Verificación programática de contraste WCAG 2.1 AA para la paleta de
// src/app/globals.css. "El contraste se calcula, no se estima a ojo."
// Ejecutar: node scripts/check-color-contrast.mjs
function hexToRgb(hex) {
  hex = hex.replace("#", "");
  const bigint = parseInt(hex, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function relLuminance([r, g, b]) {
  const lin = (c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const [rl, gl, bl] = [lin(r), lin(g), lin(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrast(hex1, hex2) {
  const l1 = relLuminance(hexToRgb(hex1));
  const l2 = relLuminance(hexToRgb(hex2));
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

// [etiqueta, primer plano, fondo, umbral requerido]
// 4.5 = texto normal (AA) · 3 = texto grande / componentes no textuales (AA)
const checks = [
  ["Texto principal sobre fondo de página", "#211D19", "#F7F6F3", 4.5],
  ["Texto secundario sobre fondo de página", "#57534A", "#F7F6F3", 4.5],
  ["Texto principal sobre tarjeta blanca", "#211D19", "#FFFFFF", 4.5],
  ["Texto secundario sobre tarjeta blanca", "#57534A", "#FFFFFF", 4.5],
  ["Marca (accent-700) sobre blanco", "#B8410C", "#FFFFFF", 4.5],
  ["Marca hover (accent-800) sobre blanco", "#8A310A", "#FFFFFF", 4.5],
  ["Texto blanco sobre botón primario", "#FFFFFF", "#B8410C", 4.5],
  ["Texto blanco sobre botón primario (hover)", "#FFFFFF", "#8A310A", 4.5],
  ["Texto de insignia sobre accent-50", "#8A310A", "#FFF3EC", 4.5],
  ["Éxito (success-700) sobre blanco", "#15803D", "#FFFFFF", 4.5],
  ["Texto de insignia éxito sobre success-50", "#166534", "#F0FDF4", 4.5],
  ["Error (danger-700) sobre blanco", "#B91C1C", "#FFFFFF", 4.5],
  ["Texto de insignia error sobre danger-50", "#991B1B", "#FEF2F2", 4.5],
  ["Texto neutro sobre insignia neutral-100", "#3F3A34", "#F1EFEA", 4.5],
  ["Borde de input sobre blanco (no textual)", "#8C8478", "#FFFFFF", 3],
  ["Borde de input sobre fondo de página (no textual)", "#8C8478", "#F7F6F3", 3],
  ["Halo de foco (azul) sobre blanco", "#1D4ED8", "#FFFFFF", 3],
  ["Halo de foco (azul) sobre fondo de página", "#1D4ED8", "#F7F6F3", 3],
];

let allPass = true;
for (const [label, fg, bg, threshold] of checks) {
  const c = contrast(fg, bg);
  const pass = c >= threshold;
  if (!pass) allPass = false;
  console.log(`${pass ? "PASS" : "FAIL"}  ${c.toFixed(2)}:1  (≥${threshold}:1)  ${label}`);
}

console.log(allPass ? "\nTodo cumple WCAG 2.1 AA." : "\nHay colores que no cumplen AA — revísalos.");
process.exit(allPass ? 0 : 1);
