import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EntityManagement } from "@/components/entity-management";
import {
  CircleDetailView,
  type CircleSection,
} from "@/components/circle-detail-view";
import { getTranslator } from "@/i18n/server";
import { isDemoCircle, photosForHome } from "@/lib/demo";
import type { Circle, CircleMember, Home, Availability } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { t } = await getTranslator();
  const { data } = await supabase
    .from("circles")
    .select("name")
    .eq("id", id)
    .maybeSingle<{ name: string }>();
  return { title: data?.name ?? t("circles.fallbackTitle") };
}
export default async function CircleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { id } = await params;
  const { view } = await searchParams;
  const section: CircleSection =
    isDemoCircle(id) && view === "my-homes"
      ? "people"
      : view === "homes" ||
          view === "people" ||
          view === "about" ||
          view === "my-homes"
        ? view
        : "people";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { t, locale } = await getTranslator();
  const { data: circle, error } = await supabase
    .from("circles")
    .select("*")
    .eq("id", id)
    .maybeSingle<Circle>();
  if (error) throw new Error("Could not load circle");
  if (!circle) notFound();
  const [memberResult, homeResult] = await Promise.all([
    supabase
      .from("circle_members")
      .select("*, profiles(id, full_name, avatar_url)")
      .eq("circle_id", id),
    supabase
      .from("home_circles")
      .select("homes(*, profiles(full_name))")
      .eq("circle_id", id),
  ]);
  if (memberResult.error || homeResult.error)
    throw new Error("Could not load circle contents");
  const homes = (homeResult.data ?? [])
    .map((h) => h.homes as unknown as Home)
    .filter(Boolean)
    .map((h) => ({ ...h, photos: photosForHome(h.id, h.photos) }));
  const members = ((memberResult.data ?? []) as unknown as CircleMember[]).sort(
    (a, b) => Number(b.role === "admin") - Number(a.role === "admin"),
  );
  const today = new Date().toISOString().slice(0, 10);
  const dates = new Map<string, { start: string; end: string }>();
  if (section === "homes" && homes.length) {
    const { data, error } = await supabase
      .from("availability")
      .select("home_id, start_date, end_date")
      .in(
        "home_id",
        homes.map((h) => h.id),
      )
      .gte("end_date", today)
      .order("start_date");
    if (error) throw new Error("Could not load availability");
    for (const d of (data ?? []) as Availability[])
      if (!dates.has(d.home_id))
        dates.set(d.home_id, {
          start: d.start_date < today ? today : d.start_date,
          end: d.end_date,
        });
  }
  const { data: ownData, error: ownError } =
    section === "my-homes"
      ? await supabase
          .from("homes")
          .select("id, title, city, photos")
          .eq("owner_id", user.id)
          .order("created_at")
      : { data: [], error: null };
  if (ownError) throw new Error("Could not load your homes");
  const example = isDemoCircle(id);
  const canLeave = members.some((m) => m.user_id === user.id);
  return (
    <CircleDetailView
      locale={locale}
      section={section}
      example={example}
      circle={{
        id,
        name: circle.name,
        description: circle.description,
        inviteCode: circle.invite_code,
        cover: homes.find((h) => h.photos[0])?.photos[0],
      }}
      homes={homes.map((h) => ({
        id: h.id,
        title: h.title,
        city: h.city,
        country: h.country,
        photo: h.photos[0],
        circles: [{ id, name: circle.name }],
        nextDates: dates.get(h.id),
        ownerId: h.owner_id,
        hostName: h.profiles?.full_name ?? undefined,
        isOwn: h.owner_id === user.id,
      }))}
      ownedHomes={(ownData ?? []).map((h) => ({
        id: h.id,
        title: h.title,
        city: h.city,
        photo: photosForHome(h.id, h.photos)[0],
        shared: homes.some((shared) => shared.id === h.id),
      }))}
      people={members.map((m) => ({
        id: m.user_id,
        name: m.profiles?.full_name ?? null,
        avatar: m.profiles?.avatar_url ?? null,
        admin: m.role === "admin",
        host: homes.some((h) => h.owner_id === m.user_id),
      }))}
      leaveControl={
        canLeave ? (
          <>
            <h3 className="font-semibold">{t("circles.leaveTitle")}</h3>
            <p className="mt-2 max-w-xl text-sm text-text-secondary">
              {example ? t("circles.leaveExampleBody") : t("circles.leaveBody")}
            </p>
            <EntityManagement
              id={id}
              name={circle.name}
              operation="leave_circle"
            />
            {!example &&
              members.some(
                (m) => m.user_id === user.id && m.role === "admin",
              ) && (
                <EntityManagement
                  id={id}
                  name={circle.name}
                  operation="delete_circle"
                />
              )}
          </>
        ) : undefined
      }
    />
  );
}
