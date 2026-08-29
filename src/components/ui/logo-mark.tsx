type LogoMarkProps = {
  className?: string;
};

/**
 * Marca de Kinami: una "rueda" (círculo) de confianza con cuatro nodos
 * alrededor, representando a las personas y casas del grupo. Decorativa
 * — se usa siempre junto al texto "Kinami", nunca sola como único
 * identificador (aria-hidden).
 */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle
        cx="24"
        cy="24"
        r="17"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="3 5.5"
        strokeLinecap="round"
      />
      <circle cx="24" cy="7" r="4" fill="currentColor" />
      <circle cx="41" cy="24" r="4" fill="currentColor" />
      <circle cx="24" cy="41" r="4" fill="currentColor" />
      <circle cx="7" cy="24" r="4" fill="currentColor" />
    </svg>
  );
}
