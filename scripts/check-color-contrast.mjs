// Verificación programática de contraste WCAG 2.1 AA para la paleta de
// src/app/globals.css (modo claro y modo oscuro). "El contraste se
// calcula, no se estima a ojo." Ejecutar: node scripts/check-color-contrast.mjs
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
  // ---- Modo claro ----
  ["Claro · texto principal / fondo", "#1B2130", "#F7F6F3", 4.5],
  ["Claro · texto secundario / fondo", "#545B70", "#F7F6F3", 4.5],
  ["Claro · texto principal / superficie", "#1B2130", "#FFFFFF", 4.5],
  ["Claro · texto secundario / superficie", "#545B70", "#FFFFFF", 4.5],
  ["Claro · marca (accent-700) / superficie", "#2955A6", "#FFFFFF", 4.5],
  ["Claro · marca hover (accent-800) / superficie", "#1E4483", "#FFFFFF", 4.5],
  ["Claro · texto insignia (accent-800) / accent-50", "#1E4483", "#EAF1FD", 4.5],
  ["Claro · texto blanco / botón primario", "#FFFFFF", "#2955A6", 4.5],
  ["Claro · texto blanco / botón primario (hover)", "#FFFFFF", "#1E4483", 4.5],
  ["Claro · texto blanco / botón peligro", "#FFFFFF", "#B91C1C", 4.5],
  ["Claro · éxito (success-700) / superficie", "#15803D", "#FFFFFF", 4.5],
  ["Claro · texto insignia éxito / success-50", "#166534", "#F0FDF4", 4.5],
  ["Claro · error (danger-700) / superficie", "#B91C1C", "#FFFFFF", 4.5],
  ["Claro · texto insignia error / danger-50", "#991B1B", "#FEF2F2", 4.5],
  ["Claro · texto neutro / neutral-100", "#3A3F4D", "#EFF1F5", 4.5],
  ["Claro · borde fuerte / superficie (no textual)", "#767C8C", "#FFFFFF", 3],
  ["Claro · borde fuerte / fondo (no textual)", "#767C8C", "#F7F6F3", 3],
  ["Claro · halo de foco / superficie (no textual)", "#1D4ED8", "#FFFFFF", 3],
  ["Claro · halo de foco / fondo (no textual)", "#1D4ED8", "#F7F6F3", 3],

  // ---- Modo oscuro ----
  ["Oscuro · texto principal / fondo", "#EEF0F6", "#10141F", 4.5],
  ["Oscuro · texto secundario / fondo", "#A9AFC2", "#10141F", 4.5],
  ["Oscuro · texto principal / superficie", "#EEF0F6", "#182036", 4.5],
  ["Oscuro · texto secundario / superficie", "#A9AFC2", "#182036", 4.5],
  ["Oscuro · marca (accent-700) / fondo", "#8FB4F5", "#10141F", 4.5],
  ["Oscuro · marca (accent-700) / superficie", "#8FB4F5", "#182036", 4.5],
  ["Oscuro · texto insignia (accent-800) / accent-50", "#B7CFF9", "#16223D", 4.5],
  ["Oscuro · texto blanco / botón primario (mismo relleno fijo)", "#FFFFFF", "#2955A6", 4.5],
  ["Oscuro · borde fuerte / fondo (no textual)", "#6E77A6", "#10141F", 3],
  ["Oscuro · borde fuerte / superficie (no textual)", "#6E77A6", "#182036", 3],
  ["Oscuro · halo de foco / fondo (no textual)", "#60A5FA", "#10141F", 3],
  ["Oscuro · halo de foco / superficie (no textual)", "#60A5FA", "#182036", 3],
  ["Oscuro · texto neutro / neutral-100", "#C7CCDA", "#202840", 4.5],
  ["Oscuro · error (danger-700) / fondo", "#FCA5A5", "#10141F", 4.5],
  ["Oscuro · error (danger-700) / superficie", "#FCA5A5", "#182036", 4.5],
  ["Oscuro · texto insignia error / danger-50", "#FFD1D1", "#34161A", 4.5],
  ["Oscuro · texto insignia éxito / success-50", "#7FE0A3", "#0F2A1B", 4.5],
];

let allPass = true;
for (const [label, fg, bg, threshold] of checks) {
  const c = contrast(fg, bg);
  const pass = c >= threshold;
  if (!pass) allPass = false;
  console.log(`${pass ? "PASS" : "FAIL"}  ${c.toFixed(2)}:1  (≥${threshold}:1)  ${label}`);
}

console.log(allPass ? "\nTodo cumple WCAG 2.1 AA (claro y oscuro)." : "\nHay colores que no cumplen AA — revísalos.");
process.exit(allPass ? 0 : 1);
