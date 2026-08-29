type HeroIllustrationProps = {
  className?: string;
};

type Node = { x: number; y: number; color: string };

const CENTER = 200;
const RADIUS = 140;

// 5 nodos repartidos cada 72° alrededor del centro — "tu rueda" de casas.
const ANGLES_DEG = [-90, -18, 54, 126, 198];

function nodePosition(angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * Math.cos(rad),
    y: CENTER + RADIUS * Math.sin(rad),
  };
}

const NODES: Node[] = ANGLES_DEG.map((deg, i) => ({
  ...nodePosition(deg),
  color: i % 2 === 0 ? "var(--color-accent-700)" : "var(--color-accent-800)",
}));

function HouseGlyph({ scale = 1 }: { scale?: number }) {
  return (
    <g transform={`scale(${scale})`}>
      <polygon points="-13,-2 0,-15 13,-2" fill="currentColor" />
      <rect x="-10" y="-2" width="20" height="13" rx="1.5" fill="currentColor" />
    </g>
  );
}

/**
 * Ilustración decorativa del hero: una rueda con "tu casa" en el centro y
 * las casas de tu círculo alrededor, unidas por radios — el mismo dibujo
 * que da nombre a la app. Puramente ornamental (aria-hidden), construida
 * en SVG (sin imágenes externas) para que cargue igual en cualquier red.
 */
export function HeroIllustration({ className }: HeroIllustrationProps) {
  return (
    <svg viewBox="0 0 400 400" fill="none" aria-hidden="true" className={className}>
      {/* anillo de contexto */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        stroke="var(--color-accent-100)"
        strokeWidth="1.5"
        strokeDasharray="2 7"
      />
      {/* radios hacia cada nodo */}
      {NODES.map((n, i) => (
        <line
          key={`spoke-${i}`}
          x1={CENTER}
          y1={CENTER}
          x2={n.x}
          y2={n.y}
          stroke="var(--color-border-strong)"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeDasharray="1 6"
          strokeLinecap="round"
        />
      ))}
      {/* casas del círculo */}
      {NODES.map((n, i) => (
        <g key={`node-${i}`} transform={`translate(${n.x} ${n.y})`} style={{ color: n.color }}>
          <circle r="23" fill="var(--color-surface)" stroke="currentColor" strokeWidth="2" />
          <HouseGlyph />
        </g>
      ))}
      {/* tu casa, en el centro */}
      <g transform={`translate(${CENTER} ${CENTER})`} style={{ color: "var(--color-brand-fill)" }}>
        <circle r="34" fill="var(--color-surface)" stroke="currentColor" strokeWidth="3" />
        <HouseGlyph scale={1.25} />
      </g>
    </svg>
  );
}
