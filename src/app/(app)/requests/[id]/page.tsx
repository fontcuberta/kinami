import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendMessage, updateSwapStatus } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { SwapAgreementSection } from "@/components/swap-agreement";
import { getTranslator } from "@/i18n/server";
import type { Message, SwapAgreement, SwapRequest } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { t } = await getTranslator();
  const { data: request } = await supabase
    .from("swap_requests")
    .select("homes(title)")
    .eq("id", id)
    .maybeSingle<{ homes: { title: string } | null }>();

  return {
    title: request?.homes?.title
      ? t("swap.requestTitle", { title: request.homes.title })
      : t("swap.requestFallback"),
  };
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { t } = await getTranslator();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: request } = await supabase
    .from("swap_requests")
    .select("*, homes(*, profiles(*)), profiles(*)")
    .eq("id", id)
    .maybeSingle<SwapRequest>();

  if (!request) notFound();

  const isOwner = request.homes?.owner_id === user!.id;
  const isRequester = request.requester_id === user!.id;
  const hostName = request.homes?.profiles?.full_name ?? t("common.member");
  const guestName = request.profiles?.full_name ?? t("common.member");

  const { data: messages } = await supabase
    .from("messages")
    .select("*, profiles(*)")
    .eq("swap_request_id", id)
    .order("created_at", { ascending: true });

  const { data: agreement } = await supabase
    .from("swap_agreements")
    .select("*")
    .eq("swap_request_id", id)
    .maybeSingle<SwapAgreement>();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-text">{request.homes?.title}</h1>
        <p className="text-text-secondary">
          <time dateTime={request.start_date}>{request.start_date}</time>
          {" → "}
          <time dateTime={request.end_date}>{request.end_date}</time>
        </p>
        <p className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
          {t("swap.requestedBy", { name: guestName })} <StatusBadge status={request.status} />
        </p>
      </div>

      {request.status === "pending" && (isOwner || isRequester) && (
        <div className="flex flex-wrap gap-2">
          {isOwner && (
            <>
              <form action={updateSwapStatus}>
                <input type="hidden" name="id" value={request.id} />
                <input type="hidden" name="status" value="accepted" />
                <SubmitButton pendingLabel={t("swap.accepting")}>{t("swap.accept")}</SubmitButton>
              </form>
              <form action={updateSwapStatus}>
                <input type="hidden" name="id" value={request.id} />
                <input type="hidden" name="status" value="declined" />
                <SubmitButton variant="secondary" pendingLabel={t("swap.declining")}>
                  {t("swap.decline")}
                </SubmitButton>
              </form>
            </>
          )}
          {isRequester && (
            <form action={updateSwapStatus}>
              <input type="hidden" name="id" value={request.id} />
              <input type="hidden" name="status" value="cancelled" />
              <SubmitButton variant="secondary" pendingLabel={t("swap.cancelling")}>
                {t("swap.cancel")}
              </SubmitButton>
            </form>
          )}
        </div>
      )}

      {request.status === "accepted" && (isOwner || isRequester) && (
        <SwapAgreementSection
          swapRequestId={request.id}
          isOwner={isOwner}
          isRequester={isRequester}
          agreement={agreement}
          homeTitle={request.homes?.title ?? t("home.fallbackTitle")}
          startDate={request.start_date}
          endDate={request.end_date}
          hostName={hostName}
          guestName={guestName}
        />
      )}

      <section aria-labelledby="messages-heading" className="flex flex-col gap-3">
        <h2 id="messages-heading" className="text-xl font-semibold text-text">
          {t("swap.messages")}
        </h2>
        <ul className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface p-4">
          {(messages as unknown as Message[] | null)?.length ? (
            (messages as unknown as Message[]).map((m) => (
              <li key={m.id} className="text-text">
                <span className="font-semibold">{m.profiles?.full_name ?? t("swap.member")}: </span>
                {m.body}
              </li>
            ))
          ) : (
            <li className="text-text-secondary">{t("swap.noMessages")}</li>
          )}
        </ul>

        <form action={sendMessage} className="flex flex-col gap-2 sm:flex-row">
          <input type="hidden" name="swap_request_id" value={request.id} />
          <label htmlFor="message-body" className="sr-only">
            {t("swap.write")}
          </label>
          <input
            id="message-body"
            name="body"
            required
            placeholder={t("swap.placeholder")}
            className="min-h-11 flex-1 rounded-lg border border-border-strong bg-surface px-3.5 py-2.5 text-base text-text placeholder:text-text-disabled focus:outline-none"
          />
          <Button type="submit">{t("swap.send")}</Button>
        </form>
      </section>
    </div>
  );
}
