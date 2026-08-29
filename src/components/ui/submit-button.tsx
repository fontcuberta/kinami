"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./button";

type Variant = "primary" | "secondary" | "danger" | "ghost";

// Botón de envío consciente del estado del formulario: se deshabilita y
// anuncia "procesando" mientras la Server Action está en curso, para que
// lectores de pantalla y usuarios de teclado no disparen un doble envío
// ni se queden sin saber si algo está pasando (WCAG 4.1.3 Mensajes de estado).
export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: Variant;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      disabled={pending}
      aria-busy={pending}
      className={className}
    >
      {pending ? (pendingLabel ?? "Guardando…") : children}
    </Button>
  );
}
