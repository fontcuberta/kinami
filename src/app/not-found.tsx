import Link from "next/link";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-2xl font-semibold text-text">
        No hemos encontrado esta página
      </h1>
      <p className="mt-2 text-text-secondary">
        Puede que el enlace esté roto o que la casa, rueda o solicitud ya no exista.
      </p>
      <LinkButton href="/circles" className="mt-6">
        Volver a mis ruedas
      </LinkButton>
      <p className="mt-4 text-sm text-text-secondary">
        <Link href="/" className="underline-offset-2 hover:underline">
          Ir al inicio
        </Link>
      </p>
    </main>
  );
}
