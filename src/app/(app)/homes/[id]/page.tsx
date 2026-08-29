import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addAvailability, deleteAvailability } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { SwapRequestForm } from "@/components/swap-request-form";
import type { Availability, Circle, Home } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: home } = await supabase
    .from("homes")
    .select("title")
    .eq("id", id)
    .maybeSingle<{ title: string }>();

  return { title: home?.title ?? "Casa" };
}

export default async function HomeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: home } = await supabase
    .from("homes")
    .select("*, profiles(*)")
    .eq("id", id)
    .maybeSingle<Home>();

  if (!home) notFound();

  const isOwner = home.owner_id === user!.id;

  const { data: availability } = await supabase
    .from("availability")
    .select("*")
    .eq("home_id", id)
    .order("start_date", { ascending: true });

  // Ruedas donde ambos, el dueño y quien mira, coinciden (para pedir el swap)
  const { data: homeCircles } = await supabase
    .from("home_circles")
    .select("circles(*)")
    .eq("home_id", id);

  const sharedCircles = (homeCircles ?? [])
    .map((h) => h.circles as unknown as Circle)
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-text">{home.title}</h1>
        <p className="text-text-secondary">
          {home.city}, {home.country} · de{" "}
          {home.profiles?.full_name ?? "un miembro de la rueda"}
        </p>
      </div>

      {home.photos?.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {home.photos.map((url, i) => (
            <li key={url}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Foto ${i + 1} de ${home.title}, en ${home.city}`}
                className="h-40 w-full rounded-lg border border-border-subtle object-cover"
              />
            </li>
          ))}
        </ul>
      )}

      {home.description && (
        <p className="whitespace-pre-line text-text">{home.description}</p>
      )}

      <section aria-labelledby="availability-heading">
        <h2 id="availability-heading" className="mb-3 text-xl font-semibold text-text">
          Disponibilidad
        </h2>

        {(availability as Availability[] | null)?.length ? (
          <ul className="flex flex-col gap-2">
            {(availability as Availability[]).map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface px-4 py-3"
              >
                <span className="text-text">
                  <time dateTime={a.start_date}>{a.start_date}</time>
                  {" → "}
                  <time dateTime={a.end_date}>{a.end_date}</time>
                  {a.notes && <span className="ml-2 text-text-secondary">{a.notes}</span>}
                </span>
                {isOwner && (
                  <form action={deleteAvailability}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="home_id" value={home.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      className="min-h-0 px-2 py-1 text-sm"
                      aria-label={`Quitar disponibilidad del ${a.start_date} al ${a.end_date}`}
                    >
                      Quitar
                    </Button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-secondary">
            Todavía no hay fechas de disponibilidad marcadas.
          </p>
        )}

        {isOwner && (
          <form
            action={addAvailability}
            className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-border-subtle bg-surface p-4"
          >
            <input type="hidden" name="home_id" value={home.id} />
            <Input label="Desde" id="avail-start" name="start_date" type="date" required className="w-44" />
            <Input label="Hasta" id="avail-end" name="end_date" type="date" required className="w-44" />
            <Input
              label="Nota"
              id="avail-notes"
              name="notes"
              placeholder="Opcional"
              className="w-56"
            />
            <SubmitButton variant="secondary" pendingLabel="Añadiendo…">
              Añadir
            </SubmitButton>
          </form>
        )}
      </section>

      {!isOwner && sharedCircles.length > 0 && (
        <section aria-labelledby="swap-heading">
          <h2 id="swap-heading" className="mb-3 text-xl font-semibold text-text">
            Pedir intercambio
          </h2>
          <SwapRequestForm homeId={home.id} circles={sharedCircles} />
        </section>
      )}
    </div>
  );
}
