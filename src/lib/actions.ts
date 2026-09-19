"use server";

import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { loginAuthErrorMessage } from "@/lib/auth-errors";
import { authRedirectOriginFromHeaders } from "@/lib/https";
import { getTranslator } from "@/i18n/server";
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
async function friendlyError(message: string): Promise<string> {
  const { t } = await getTranslator();
  const lower = message.toLowerCase();
  if (lower.includes("delete_own_account")) return t("actions.missingDeleteRpc");
  if (lower.includes("swap_agreements") || lower.includes("owner_signed_name")) {
    return t("actions.missingAgreements");
  }
  if (lower.includes("invite")) return t("actions.invite");
  if (lower.includes("check constraint")) return t("actions.dateOrder");
  if (lower.includes("row-level security") || lower.includes("policy")) return t("actions.rls");
  return t("actions.generic");
}

export async function requestMagicLink(
  _prevState: MagicLinkState,
  formData: FormData
): Promise<MagicLinkState> {
  const email = String(formData.get("email") ?? "").trim();
  const { t } = await getTranslator();
  if (!email) {
    return { error: t("login.missingEmail"), email: "" };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!supabaseUrl || supabaseUrl.includes("TU-PROYECTO")) {
    return {
      error: await loginAuthErrorMessage(t("authErrors.missingUrl")),
      email,
    };
  }

  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!supabaseKey || supabaseKey.includes("tu-clave")) {
    return {
      error: await loginAuthErrorMessage(t("authErrors.missingKey")),
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
    return { error: await loginAuthErrorMessage(error.message, redirectTo), email };
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
  if (!name) {
    const { t } = await getTranslator();
    return { error: t("actions.nameRequired") };
  }

  const id = randomUUID();
  const { error } = await supabase.from("circles").insert({
    id,
    name,
    description: description || null,
    created_by: user.id,
  });

  if (error) return { error: await friendlyError(error.message) };

  redirect(`/circles/${id}`);
}

export async function joinCircle(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireUser();
  const code = String(formData.get("code") ?? "").trim();
  if (!code) {
    const { t } = await getTranslator();
    return { error: t("actions.codeRequired") };
  }

  const { data, error } = await supabase.rpc("join_circle_by_code", { code });

  if (error) return { error: await friendlyError(error.message) };

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

  if (error) throw new Error(await friendlyError(error.message));

  revalidatePath(`/homes/${homeId}`);
}

export async function deleteAvailability(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id"));
  const homeId = String(formData.get("home_id"));

  const { error } = await supabase.from("availability").delete().eq("id", id);
  if (error) throw new Error(await friendlyError(error.message));

  revalidatePath(`/homes/${homeId}`);
}

export async function shareHomeWithCircle(formData: FormData) {
  const { supabase } = await requireUser();
  const homeId = String(formData.get("home_id"));
  const circleId = String(formData.get("circle_id"));

  const { error } = await supabase
    .from("home_circles")
    .insert({ home_id: homeId, circle_id: circleId });

  if (error) throw new Error(await friendlyError(error.message));

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
    const { t } = await getTranslator();
    return { error: t("actions.datesRequired") };
  }
  if (endDate < startDate) {
    const { t } = await getTranslator();
    return { error: t("actions.dateOrder") };
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

  if (error) return { error: await friendlyError(error.message) };

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

  if (error) throw new Error(await friendlyError(error.message));

  revalidatePath(`/requests/${id}`);
  revalidatePath("/requests");
}

export async function deleteAccount(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireUser();
  const confirmation = String(formData.get("confirmation") ?? "");

  const { t } = await getTranslator();
  const allowed = ["DELETE", "BORRAR", "ESBORRAR"];
  if (!allowed.includes(confirmation.trim().toUpperCase())) {
    return { error: t("actions.deleteConfirm", { word: t("account.deleteWord") }) };
  }

  const { error } = await supabase.rpc("delete_own_account");
  if (error) return { error: await friendlyError(error.message) };

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
    const { t } = await getTranslator();
    throw new Error(t("actions.noPermission"));
  }

  const { error } = await supabase.from("swap_agreements").upsert({
    swap_request_id: swapRequestId,
    house_rules: houseRules || null,
    owner_accepted_at: null,
    requester_accepted_at: null,
    owner_signed_name: null,
    requester_signed_name: null,
    contract_text: null,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(await friendlyError(error.message));

  revalidatePath(`/requests/${swapRequestId}`);
}

export async function signSwapContract(formData: FormData) {
  const { supabase, user } = await requireUser();
  const { t, locale } = await getTranslator();
  const swapRequestId = String(formData.get("swap_request_id"));
  const role = String(formData.get("role"));
  const signatureName = String(formData.get("signature_name") ?? "").trim();
  const agreed = formData.get("agree") === "on";
  const contractText = String(formData.get("contract_text") ?? "").trim();

  if (signatureName.length < 2) {
    throw new Error(t("contract.needName"));
  }
  if (!agreed) {
    throw new Error(t("contract.needAgree"));
  }

  const { data: request } = await supabase
    .from("swap_requests")
    .select("requester_id, homes(owner_id)")
    .eq("id", swapRequestId)
    .maybeSingle<{ requester_id: string; homes: { owner_id: string } | null }>();

  if (!request) throw new Error(t("actions.notFound"));

  const isOwner = request.homes?.owner_id === user.id;
  const isRequester = request.requester_id === user.id;
  if ((role === "owner" && !isOwner) || (role === "requester" && !isRequester)) {
    throw new Error(t("actions.noPermission"));
  }

  const now = new Date().toISOString();
  const payload =
    role === "owner"
      ? { owner_accepted_at: now, owner_signed_name: signatureName }
      : { requester_accepted_at: now, requester_signed_name: signatureName };

  const { error } = await supabase.from("swap_agreements").upsert({
    swap_request_id: swapRequestId,
    contract_text: contractText || null,
    contract_locale: locale,
    updated_at: now,
    ...payload,
  });

  if (error) throw new Error(await friendlyError(error.message));

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

  if (error) throw new Error(await friendlyError(error.message));

  revalidatePath(`/requests/${swapRequestId}`);
}
