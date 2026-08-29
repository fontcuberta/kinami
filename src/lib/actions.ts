"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string } | null;

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
