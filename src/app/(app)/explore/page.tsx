import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ExploreHome } from "@/components/home-explorer";
import { experienceCopy } from "@/i18n/experience";
import { getTranslator } from "@/i18n/server";
import { isDemoCircle, photosForHome } from "@/lib/demo";
import { ExploreDashboard } from "@/components/explore-dashboard";
import type { Circle, Home, Availability } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getTranslator();
  return { title: experienceCopy(locale).homeNav };
}

export default async function ExplorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { locale } = await getTranslator();
  const [membershipResult, ownResult, pendingResult] = await Promise.all([
    supabase.from("circle_members").select("circles(*)").eq("user_id", user.id),
    supabase
      .from("homes")
      .select("id, title")
      .eq("owner_id", user.id)
      .order("created_at"),
    supabase
      .from("swap_requests")
      .select("id, homes!inner(owner_id)", { count: "exact", head: true })
      .eq("homes.owner_id", user.id)
      .eq("status", "pending"),
  ]);
  if (membershipResult.error || ownResult.error || pendingResult.error)
    throw new Error("Could not load your circles");
  const circles = (membershipResult.data ?? [])
    .map((m) => m.circles as unknown as Circle)
    .filter(Boolean);
  const real = circles.filter((c) => !isDemoCircle(c.id));
  const { data: links, error: linksError } = real.length
    ? await supabase
        .from("home_circles")
        .select("circle_id, homes(*)")
        .in(
          "circle_id",
          real.map((c) => c.id),
        )
    : { data: [], error: null };
  if (linksError) throw new Error("Could not load homes");
  const rows = (links ?? []) as unknown as {
    circle_id: string;
    homes: Home | null;
  }[];
  const homes = new Map<string, ExploreHome>();
  for (const row of rows) {
    const h = row.homes;
    if (!h || h.owner_id === user.id) continue;
    const circle = real.find((c) => c.id === row.circle_id)!;
    const previous = homes.get(h.id);
    if (previous) previous.circles.push({ id: circle.id, name: circle.name });
    else
      homes.set(h.id, {
        id: h.id,
        title: h.title,
        city: h.city,
        country: h.country,
        photo: photosForHome(h.id, h.photos)[0],
        circles: [{ id: circle.id, name: circle.name }],
      });
  }
  if (homes.size) {
    const today = new Date().toISOString().slice(0, 10);
    const { data: dates, error } = await supabase
      .from("availability")
      .select("home_id, start_date, end_date")
      .in("home_id", [...homes.keys()])
      .gte("end_date", today)
      .order("start_date");
    if (error) throw new Error("Could not load availability");
    for (const d of (dates ?? []) as Availability[]) {
      const home = homes.get(d.home_id)!;
      if (!home.nextDates)
        home.nextDates = {
          start: d.start_date < today ? today : d.start_date,
          end: d.end_date,
        };
    }
  }
  const own = ownResult.data ?? [];
  const pending = pendingResult.count ?? 0;
  return (
    <ExploreDashboard
      locale={locale}
      homes={[...homes.values()]}
      own={own}
      pending={pending}
    />
  );
}
