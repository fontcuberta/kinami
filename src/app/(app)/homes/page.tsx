import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslator } from "@/i18n/server";
import { homeOwnershipCopy } from "@/i18n/home-ownership";
import { photosForHome } from "@/lib/demo";
import { HomeCollectionView } from "@/components/home-collection-view";
import type { Home } from "@/lib/types";

export async function generateMetadata() {
  const { locale } = await getTranslator();
  return { title: homeOwnershipCopy(locale).title };
}
export default async function MyHomesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { locale } = await getTranslator();
  const { data, error } = await supabase
    .from("homes")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load your homes");
  const homes = (data ?? []) as Home[];
  const { data: shares, error: sharingError } = homes.length
    ? await supabase
        .from("home_circles")
        .select("home_id, circle_id")
        .in(
          "home_id",
          homes.map((h) => h.id),
        )
    : { data: [], error: null };
  if (sharingError) throw new Error("Could not load home sharing");
  return (
    <HomeCollectionView
      locale={locale}
      homes={homes.map((home) => ({
        id: home.id,
        title: home.title,
        city: home.city,
        country: home.country,
        photo: photosForHome(home.id, home.photos)[0],
        sharedCount: shares?.filter((s) => s.home_id === home.id).length ?? 0,
      }))}
    />
  );
}
