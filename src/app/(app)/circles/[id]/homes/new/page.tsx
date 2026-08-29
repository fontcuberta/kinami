import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { NewHomeForm } from "./new-home-form";

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

  return { title: circle?.name ? `Añadir casa a ${circle.name}` : "Añadir casa" };
}

export default async function NewHomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: circleId } = await params;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-3xl font-semibold text-text">
        Añade tu casa a esta rueda
      </h1>
      <p className="mt-1 text-text-secondary">Solo la verán los miembros de esta rueda.</p>
      <NewHomeForm circleId={circleId} />
    </div>
  );
}
