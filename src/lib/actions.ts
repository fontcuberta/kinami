"use server";

import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { loginAuthErrorMessage } from "@/lib/auth-errors";
import { authRedirectOriginFromHeaders } from "@/lib/https";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string } | null;
export type MagicLinkState = { error: string; email: string } | { sent: true; email: string } | null;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user: user! };
}

// Traduce los mensajes de error técnicos de Postgres/Supabase a algo que
// una persona pueda entender y corregir (WCAG 3.3.1 Identificación de errores).
function friendlyError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("delete_own_account")) {
    return "Falta la migración de borrado de cuenta en Supabase. Ejecuta supabase/migrations/002_borrar_cuenta.sql en el SQL Editor.";
  }
  if (lower.includes("swap_agreements")) {
    return "Falta la migración de acuerdos de intercambio en Supabase. Ejecuta supabase/migrations/003_acuerdo_intercambio.sql en el SQL Editor.";
  }
  if (message.toLowerCase().includes("invite")) {
    return "Ese código de invitación no es válido. Revisa que lo hayas copiado bien.";
  }
  if (message.toLowerCase().includes("check constraint")) {
    return "La fecha de fin tiene que ser igual o posterior a la de inicio.";
  }
  if (message.toLowerCase().includes("row-level security") || message.toLowerCase().includes("policy")) {
    return "No tienes permiso para hacer esto.";
  }
  return "Algo ha salido mal. Inténtalo de nuevo en unos segundos.";
}

export async function requestMagicLink(
  _prevState: MagicLinkState,
  formData: FormData
): Promise<MagicLinkState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Escribe tu correo electrónico.", email: "" };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!supabaseUrl || supabaseUrl.includes("TU-PROYECTO")) {
    return {
      error: loginAuthErrorMessage(
        "Falta la Project URL de Supabase (https://xxxx.supabase.co) en las variables de entorno."
      ),
      email,
    };
  }

  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!supabaseKey || supabaseKey.includes("tu-clave")) {
    return {
      error: loginAuthErrorMessage(
        "Falta la clave publishable de Supabase en las variables de entorno."
      ),
      email,
    };
  }

  const headerList = await headers();
  const redirectTo = `${authRedirectOriginFromHeaders(headerList)}/auth/callback`;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    return { error: loginAuthErrorMessage(error.message, redirectTo), email };
  }

  return { sent: true, email };
}

export async function createCircle(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) return { error: "Ponle un nombre a la rueda." };

  const id = randomUUID();
  const { error } = await supabase.from("circles").insert({
    id,
    name,
    description: description || null,
    created_by: user.id,
  });

  if (error) return { error: friendlyError(error.message) };

  redirect(`/circles/${id}`);
}

export async function joinCircle(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireUser();
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Escribe el código de invitación." };

  const { data, error } = await supabase.rpc("join_circle_by_code", { code });

  if (error) return { error: friendlyError(error.message) };

  redirect(`/circles/${data}`);
}

export async function addAvailability(formData: FormData) {
  const { supabase } = await requireUser();
  const homeId = String(formData.get("home_id"));
  const startDate = String(formData.get("start_date"));
  const endDate = String(formData.get("end_date"));
  const notes = String(formData.get("notes") ?? "").trim();

  const { error } = await supabase.from("availability").insert({
    home_id: homeId,
    start_date: startDate,
    end_date: endDate,
    notes: notes || null,
  });

  if (error) throw new Error(friendlyError(error.message));

  revalidatePath(`/homes/${homeId}`);
}

export async function deleteAvailability(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id"));
  const homeId = String(formData.get("home_id"));

  const { error } = await supabase.from("availability").delete().eq("id", id);
  if (error) throw new Error(friendlyError(error.message));

  revalidatePath(`/homes/${homeId}`);
}

export async function shareHomeWithCircle(formData: FormData) {
  const { supabase } = await requireUser();
  const homeId = String(formData.get("home_id"));
  const circleId = String(formData.get("circle_id"));

  const { error } = await supabase
    .from("home_circles")
    .insert({ home_id: homeId, circle_id: circleId });

  if (error) throw new Error(friendlyError(error.message));

  revalidatePath(`/homes/${homeId}`);
}

export async function createSwapRequest(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const homeId = String(formData.get("home_id"));
  const circleId = String(formData.get("circle_id"));
  const startDate = String(formData.get("start_date"));
  const endDate = String(formData.get("end_date"));

  if (!startDate || !endDate) {
    return { error: "Indica las fechas de inicio y fin." };
  }
  if (endDate < startDate) {
    return { error: "La fecha de fin tiene que ser igual o posterior a la de inicio." };
  }

  const { data, error } = await supabase
    .from("swap_requests")
    .insert({
      home_id: homeId,
      circle_id: circleId,
      requester_id: user.id,
      start_date: startDate,
      end_date: endDate,
    })
    .select("id")
    .single();

  if (error) return { error: friendlyError(error.message) };

  redirect(`/requests/${data.id}`);
}

export async function updateSwapStatus(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));

  const { error } = await supabase
    .from("swap_requests")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(friendlyError(error.message));

  revalidatePath(`/requests/${id}`);
  revalidatePath("/requests");
}

export async function deleteAccount(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireUser();
  const confirmation = String(formData.get("confirmation") ?? "");

  if (confirmation !== "BORRAR") {
    return { error: 'Escribe "BORRAR" para confirmar. No se ha borrado nada.' };
  }

  const { error } = await supabase.rpc("delete_own_account");
  if (error) return { error: friendlyError(error.message) };

  await supabase.auth.signOut();
  redirect("/login?deleted=1");
}

export async function saveHouseRules(formData: FormData) {
  const { supabase, user } = await requireUser();
  const swapRequestId = String(formData.get("swap_request_id"));
  const houseRules = String(formData.get("house_rules") ?? "").trim();

  const { data: request } = await supabase
    .from("swap_requests")
    .select("homes(owner_id)")
    .eq("id", swapRequestId)
    .maybeSingle<{ homes: { owner_id: string } | null }>();

  if (!request || request.homes?.owner_id !== user.id) {
    throw new Error("No tienes permiso para hacer esto.");
  }

  const { error } = await supabase.from("swap_agreements").upsert({
    swap_request_id: swapRequestId,
    house_rules: houseRules || null,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(friendlyError(error.message));

  revalidatePath(`/requests/${swapRequestId}`);
}

export async function confirmAgreement(formData: FormData) {
  const { supabase, user } = await requireUser();
  const swapRequestId = String(formData.get("swap_request_id"));
  const role = String(formData.get("role"));

  const { data: request } = await supabase
    .from("swap_requests")
    .select("requester_id, homes(owner_id)")
    .eq("id", swapRequestId)
    .maybeSingle<{ requester_id: string; homes: { owner_id: string } | null }>();

  if (!request) throw new Error("Solicitud no encontrada.");

  const isOwner = request.homes?.owner_id === user.id;
  const isRequester = request.requester_id === user.id;
  if ((role === "owner" && !isOwner) || (role === "requester" && !isRequester)) {
    throw new Error("No tienes permiso para hacer esto.");
  }

  const field = role === "owner" ? "owner_accepted_at" : "requester_accepted_at";
  const { error } = await supabase.from("swap_agreements").upsert({
    swap_request_id: swapRequestId,
    [field]: new Date().toISOString(),
  });

  if (error) throw new Error(friendlyError(error.message));

  revalidatePath(`/requests/${swapRequestId}`);
}

export async function sendMessage(formData: FormData) {
  const { supabase, user } = await requireUser();
  const swapRequestId = String(formData.get("swap_request_id"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const { error } = await supabase.from("messages").insert({
    swap_request_id: swapRequestId,
    sender_id: user.id,
    body,
  });

  if (error) throw new Error(friendlyError(error.message));

  revalidatePath(`/requests/${swapRequestId}`);
}
