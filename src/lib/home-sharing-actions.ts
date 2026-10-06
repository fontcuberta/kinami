"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getTranslator } from "@/i18n/server";
import { canChangeHomeSharing } from "@/lib/home-sharing";

export type HomeSharingState = { error?: string; shared?: boolean } | null;
export async function setHomeCircleSharing(
  _previous: HomeSharingState,
  formData: FormData,
): Promise<HomeSharingState> {
  const fail = (error: string): HomeSharingState => ({
    error,
    ...(_previous?.shared === undefined ? {} : { shared: _previous.shared }),
  });
  const { t } = await getTranslator();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail(t("home.loginRequired"));
  const homeId = String(formData.get("home_id") ?? "");
  const circleId = String(formData.get("circle_id") ?? "");
  const operation = formData.get("operation");
  if (!homeId || !circleId || (operation !== "share" && operation !== "remove"))
    return fail(t("actions.generic"));
  const share = operation === "share";
  const [home, membership] = await Promise.all([
    supabase.from("homes").select("owner_id").eq("id", homeId).maybeSingle(),
    supabase
      .from("circle_members")
      .select("user_id")
      .eq("circle_id", circleId)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  if (home.error || membership.error) return fail(t("actions.generic"));
  if (
    !canChangeHomeSharing({
      userId: user.id,
      ownerId: home.data?.owner_id ?? null,
      circleId,
      isMember: Boolean(membership.data),
      share,
    })
  )
    return fail(t("actions.noPermission"));
  // An idempotent add tolerates double submissions. Both operations retain RLS.
  const result = share
    ? await supabase
        .from("home_circles")
        .upsert(
          { home_id: homeId, circle_id: circleId },
          { onConflict: "home_id,circle_id", ignoreDuplicates: true },
        )
    : await supabase
        .from("home_circles")
        .delete()
        .eq("home_id", homeId)
        .eq("circle_id", circleId);
  if (result.error) return fail(t("actions.generic"));
  for (const path of [
    "/homes",
    `/homes/${homeId}`,
    "/circles",
    `/circles/${circleId}`,
    "/explore",
  ])
    revalidatePath(path);
  return { shared: share };
}
