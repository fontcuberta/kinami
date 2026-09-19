import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getTranslator } from "@/i18n/server";
import { NewHomeForm } from "./new-home-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { t } = await getTranslator();
  const { data: circle } = await supabase
    .from("circles")
    .select("name")
    .eq("id", id)
    .maybeSingle<{ name: string }>();

  return {
    title: circle?.name
      ? t("circles.addHomeMeta", { name: circle.name })
      : t("circles.addHomeFallback"),
  };
}

export default async function NewHomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: circleId } = await params;
  const { t } = await getTranslator();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-3xl font-semibold text-text">{t("circles.addHomeTitle")}</h1>
      <p className="mt-1 text-text-secondary">{t("circles.addHomeSubtitle")}</p>
      <NewHomeForm circleId={circleId} />
    </div>
  );
}
