import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CreateCircleForm, JoinCircleForm } from "@/components/circle-forms";
import { ChevronRightIcon } from "@/components/ui/icons";
import type { Circle } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tus ruedas",
};

export default async function CirclesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from("circle_members")
    .select("circles(*)")
    .eq("user_id", user!.id);

  const circles = (memberships ?? [])
    .map((m) => m.circles as unknown as Circle)
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-14 sm:gap-16">
      <header className="max-w-xl">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
          Tus ruedas
        </h1>
        <p className="mt-2 text-base leading-relaxed text-text-secondary">
          Cada rueda es un círculo privado de confianza. Solo se entra por invitación.
        </p>
      </header>

      <section aria-labelledby="circle-actions-heading" className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p
              id="circle-actions-heading"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-700"
            >
              Empezar
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Crea la tuya o únete con un código.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-5 lg:items-stretch lg:gap-6">
          <div className="lg:col-span-3">
            <CreateCircleForm />
          </div>
          <div className="lg:col-span-2">
            <JoinCircleForm />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="my-circles-heading"
        className="border-t border-border-subtle pt-10 sm:pt-12"
      >
        <div className="mb-1 flex items-baseline justify-between gap-4">
          <h2
            id="my-circles-heading"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary"
          >
            Mis ruedas
          </h2>
          {circles.length > 0 && (
            <span className="text-xs tabular-nums text-text-disabled">
              {circles.length}
            </span>
          )}
        </div>

        {circles.length === 0 ? (
          <p className="mt-4 text-sm text-text-secondary">
            Todavía no perteneces a ninguna. Cuando crees una o te unas con un código,
            aparecerá aquí.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border-subtle">
            {circles.map((circle) => (
              <li key={circle.id}>
                <Link
                  href={`/circles/${circle.id}`}
                  className="group -mx-3 flex items-center justify-between gap-4 rounded-lg px-3 py-4 transition-colors hover:bg-neutral-100 sm:-mx-4 sm:px-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-text transition-colors group-hover:text-accent-700">
                      {circle.name}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-text-secondary">
                      {circle.description ? (
                        <>
                          <span>{circle.description}</span>
                          <span aria-hidden="true" className="mx-1.5 text-text-disabled">
                            ·
                          </span>
                        </>
                      ) : null}
                      <span className="font-mono text-xs tracking-wide text-text-disabled">
                        <span className="sr-only">Código: </span>
                        {circle.invite_code}
                      </span>
                    </p>
                  </div>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-text-disabled transition-colors group-hover:text-accent-700" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
