import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/circles");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="font-display text-5xl font-semibold text-accent-700">Kinami</h1>
      <p className="mt-4 max-w-md text-lg text-text">
        Tus amigos tienen casas por todo el mundo. Descubre dónde te puedes quedar.
      </p>
      <p className="mt-2 max-w-md text-text-secondary">
        Círculos privados de confianza para intercambiar casa — con la gente
        que ya conoces, estén donde estén.
      </p>
      <Link
        href="/login"
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-accent-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-800"
      >
        Entrar en mi rueda
      </Link>
    </main>
  );
}
