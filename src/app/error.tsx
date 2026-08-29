"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { whatsappSupportUrl } from "@/lib/support";

// Red de seguridad accesible para cualquier error no controlado: en vez de
// la pantalla de error genérica, un mensaje claro (WCAG 3.3.1) con una
// acción de recuperación, anunciado a lectores de pantalla.
export default function RouteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const supportMessage = `Hola, tengo un problema con Kinami: ${
    error.message || "error inesperado"
  }`;

  return (
    <div className="relative min-h-screen">
      <div className="absolute right-6 top-6 z-10">
        <ThemeToggle />
      </div>
      <main
        id="main-content"
        className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center"
      >
        <h1 className="font-display text-2xl font-semibold text-text">Algo ha ido mal</h1>
        <p role="alert" className="mt-2 text-text-secondary">
          {error.message || "Ha ocurrido un error inesperado. Puedes intentarlo de nuevo."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={retry}>Intentar de nuevo</Button>
          <Button
            variant="secondary"
            onClick={() =>
              window.open(whatsappSupportUrl(supportMessage), "_blank", "noopener,noreferrer")
            }
          >
            Avisar por WhatsApp
          </Button>
        </div>
      </main>
    </div>
  );
}
