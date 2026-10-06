import Link from "next/link";
import { redirect } from "next/navigation";
import { HomeForm } from "@/components/home-form";
import { createClient } from "@/lib/supabase/server";
import { getTranslator } from "@/i18n/server";
import { homeOwnershipCopy } from "@/i18n/home-ownership";
export async function generateMetadata() {
  const { locale } = await getTranslator();
  return { title: homeOwnershipCopy(locale).create };
}
export default async function NewHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { locale } = await getTranslator();
  const c = homeOwnershipCopy(locale);
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/homes"
        className="inline-flex min-h-11 items-center font-semibold text-accent-700"
      >
        ← {c.back}
      </Link>
      <h1 className="mt-4 font-display text-4xl font-semibold">{c.create}</h1>
      <p className="mt-3 text-lg text-text-secondary">{c.createIntro}</p>
      <div className="mt-8 rounded-2xl border border-border-subtle bg-surface p-5 sm:p-8">
        <HomeForm mode="create" />
      </div>
    </div>
  );
}
