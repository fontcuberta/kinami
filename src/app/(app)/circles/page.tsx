import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CreateCircleForm, JoinCircleForm } from "@/components/circle-forms";
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
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-3xl font-semibold text-text">Tus ruedas</h1>
        <p className="mt-1 text-text-secondary">
          Cada rueda es un círculo privado. Solo se entra por invitación.
        </p>
      </div>

      {circles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-strong bg-surface p-6 text-text-secondary">
          Todavía no perteneces a ninguna rueda. Crea una nueva o únete con un
          código de invitación.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {circles.map((circle) => (
            <li key={circle.id}>
              <Link
                href={`/circles/${circle.id}`}
                className="block rounded-xl border border-border-subtle bg-surface p-5 transition-colors hover:border-accent-700"
              >
                <p className="font-semibold text-text">{circle.name}</p>
                {circle.description && (
                  <p className="mt-1 text-sm text-text-secondary">{circle.description}</p>
                )}
                <p className="mt-3 font-mono text-sm text-text-secondary">
                  <span className="sr-only">Código de invitación: </span>
                  {circle.invite_code}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <CreateCircleForm />
        <JoinCircleForm />
      </div>
    </div>
  );
}
