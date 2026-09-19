import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HomeForm } from "@/components/home-form";
import { getTranslator } from "@/i18n/server";
import type { Home } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { t } = await getTranslator();
  const { data: home } = await supabase
    .from("homes")
    .select("title")
    .eq("id", id)
    .maybeSingle<{ title: string }>();

  return { title: home?.title ? t("home.editMeta", { title: home.title }) : t("home.editTitle") };
}

export default async function EditHomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { t } = await getTranslator();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: home } = await supabase
    .from("homes")
    .select("*")
    .eq("id", id)
    .maybeSingle<Home>();

  if (!home) notFound();
  if (!user || home.owner_id !== user.id) redirect(`/homes/${id}`);

  return (
    <div className="mx-auto max-w-lg">
      <nav aria-label={t("common.breadcrumb")} className="text-sm text-text-secondary">
        <Link href={`/homes/${home.id}`} className="underline-offset-2 hover:text-accent-700 hover:underline">
          {home.title}
        </Link>
        {" / "}
        {t("home.breadcrumbEdit")}
      </nav>
      <h1 className="mt-2 font-display text-3xl font-semibold text-text">{t("home.editTitle")}</h1>
      <p className="mt-1 text-text-secondary">{t("home.editIntro")}</p>
      <HomeForm mode="edit" home={home} />
    </div>
  );
}
