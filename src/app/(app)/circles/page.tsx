import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTranslator } from "@/i18n/server";
import { circleCopy } from "@/i18n/circles-experience";
import { isDemoCircle, photosForHome } from "@/lib/demo";
import {
  CircleDirectory,
  type CirclePreview,
} from "@/components/circle-directory";
import type { Circle, Home, Profile } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getTranslator();
  return { title: circleCopy(locale).title };
}
export default async function CirclesPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const { action } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { locale } = await getTranslator();
  const { data, error } = await supabase
    .from("circle_members")
    .select("role, circles(*)")
    .eq("user_id", user.id);
  if (error) throw new Error("Could not load circles");
  const memberships = (data ?? []) as unknown as {
    role: string;
    circles: Circle | null;
  }[];
  const real = memberships.filter(
    (m) => m.circles && !isDemoCircle(m.circles.id),
  );
  const ids = real.map((m) => m.circles!.id);
  const [memberResult, homeResult] = ids.length
    ? await Promise.all([
        supabase
          .from("circle_members")
          .select("circle_id, user_id, profiles(id, full_name, avatar_url)")
          .in("circle_id", ids),
        supabase
          .from("home_circles")
          .select("circle_id, homes(id, city, country, photos)")
          .in("circle_id", ids),
      ])
    : [
        { data: [], error: null },
        { data: [], error: null },
      ];
  if (memberResult.error || homeResult.error)
    throw new Error("Could not load circle details");
  const memberRows = (memberResult.data ?? []) as unknown as {
    circle_id: string;
    profiles: Profile | null;
  }[];
  const homeRows = (homeResult.data ?? []) as unknown as {
    circle_id: string;
    homes: Home | null;
  }[];
  const circles: CirclePreview[] = real
    .map((m) => {
      const circle = m.circles!;
      const members = memberRows.filter((row) => row.circle_id === circle.id);
      return {
        id: circle.id,
        name: circle.name,
        description: circle.description,
        role: m.role,
        memberCount: members.length,
        members: members.flatMap((row) =>
          row.profiles
            ? [
                {
                  id: row.profiles.id,
                  full_name: row.profiles.full_name,
                  avatar_url: row.profiles.avatar_url,
                },
              ]
            : [],
        ),
        homes: homeRows
          .filter((row) => row.circle_id === circle.id)
          .flatMap((row) =>
            row.homes
              ? [
                  {
                    id: row.homes.id,
                    city: row.homes.city,
                    country: row.homes.country,
                    photo: photosForHome(row.homes.id, row.homes.photos)[0],
                  },
                ]
              : [],
          ),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, locale));
  const example = memberships.find(
    (m) => m.circles && isDemoCircle(m.circles.id),
  );
  return (
    <CircleDirectory
      locale={locale}
      circles={circles}
      exampleId={example?.circles?.id}
      initialAction={
        action === "join" || action === "create" ? action : undefined
      }
    />
  );
}
