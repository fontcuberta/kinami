import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/button";
import type { Circle, CircleMember, Home } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: circle } = await supabase
    .from("circles")
    .select("name")
    .eq("id", id)
    .maybeSingle<{ name: string }>();

  return { title: circle?.name ?? "Rueda" };
}

export default async function CircleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: circle } = await supabase
    .from("circles")
    .select("*")
    .eq("id", id)
    .maybeSingle<Circle>();

  if (!circle) notFound();

  const { data: members } = await supabase
    .from("circle_members")
    .select("*, profiles(*)")
    .eq("circle_id", id);

  const { data: homeLinks } = await supabase
    .from("home_circles")
    .select("homes(*, profiles(*))")
    .eq("circle_id", id);

  const homes = (homeLinks ?? [])
    .map((h) => h.homes as unknown as Home)
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <nav aria-label="Miga de pan" className="text-sm text-text-secondary">
          <Link href="/circles" className="underline-offset-2 hover:text-accent-700 hover:underline">
            Tus ruedas
          </Link>{" "}
          / {circle.name}
        </nav>
        <h1 className="mt-1 font-display text-3xl font-semibold text-text">{circle.name}</h1>
        {circle.description && <p className="mt-1 text-text-secondary">{circle.description}</p>}
        <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent-50 px-3 py-1.5 text-sm text-accent-800">
          Código de invitación:{" "}
          <span className="font-mono font-semibold tracking-wide">{circle.invite_code}</span>
        </p>
      </div>

      <section aria-labelledby="homes-heading">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 id="homes-heading" className="text-xl font-semibold text-text">
            Casas en esta rueda ({homes.length})
          </h2>
          <LinkButton href={`/circles/${id}/homes/new`}>+ Añadir mi casa</LinkButton>
        </div>

        {homes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-strong bg-surface p-6 text-text-secondary">
            Todavía nadie ha añadido una casa a esta rueda.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {homes.map((home) => (
              <li key={home.id}>
                <Link
                  href={`/homes/${home.id}`}
                  className="block overflow-hidden rounded-xl border border-border-subtle bg-surface transition-colors hover:border-accent-700"
                >
                  {home.photos?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={home.photos[0]}
                      alt={`Foto de ${home.title}, en ${home.city}`}
                      className="h-40 w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    <p className="font-semibold text-text">{home.title}</p>
                    <p className="text-sm text-text-secondary">
                      {home.city}, {home.country}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      de {home.profiles?.full_name ?? "un miembro de la rueda"}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="members-heading">
        <h2 id="members-heading" className="mb-3 text-xl font-semibold text-text">
          Miembros ({members?.length ?? 0})
        </h2>
        <ul className="flex flex-wrap gap-2">
          {(members as CircleMember[] | null)?.map((m) => (
            <li
              key={m.user_id}
              className="rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-sm text-text"
            >
              {m.profiles?.full_name ?? "Miembro"}
              {m.role === "admin" && (
                <span className="ml-1.5 rounded-full bg-accent-50 px-2 py-0.5 text-xs font-semibold text-accent-800">
                  admin
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
