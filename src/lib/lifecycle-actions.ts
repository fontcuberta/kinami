"use server";
import { createClient } from "@/lib/supabase/server";
import { getTranslator } from "@/i18n/server";
import { lifecycleCopy } from "@/i18n/lifecycle";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
export async function manageEntity(
  _previous: { error: string } | null,
  form: FormData,
): Promise<{ error: string } | null> {
  const { locale } = await getTranslator();
  const c = lifecycleCopy(locale);
  const operation = String(form.get("operation"));
  const id = String(form.get("id"));
  if (
    !["delete_home", "delete_circle", "leave_circle"].includes(operation) ||
    !/^[0-9a-f-]{36}$/i.test(id)
  )
    return { error: c.error };
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { error: c.error };
  const isHome = operation === "delete_home";
  const { data: entity, error } = await db
    .from(isHome ? "homes" : "circles")
    .select(isHome ? "title" : "name")
    .eq("id", id)
    .maybeSingle();
  if (error || !entity) return { error: c.error };
  const name = isHome
    ? (entity as unknown as { title: string }).title
    : (entity as unknown as { name: string }).name;
  if (operation !== "leave_circle" && form.get("confirmation") !== name)
    return { error: c.nameError };
  const result = await db.rpc("manage_home_or_circle", {
    operation,
    target_id: id,
  });
  if (result.error)
    return {
      error: result.error.message.includes("last_admin")
        ? c.lastAdmin
        : result.error.code === "PGRST202"
          ? c.unavailable
          : c.error,
    };
  revalidatePath("/", "layout");
  redirect(isHome ? "/homes" : "/circles");
}
