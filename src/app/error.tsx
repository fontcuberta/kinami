"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

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
        <Button className="mt-6" onClick={retry}>
          Intentar de nuevo
        </Button>
      </main>
    </div>
  );
}
