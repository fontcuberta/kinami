import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/status-badge";
import { experienceCopy } from "@/i18n/experience";
import type { Locale } from "@/i18n/config";
import { LinkButton } from "@/components/ui/button";
import { getTranslator } from "@/i18n/server";
import type { SwapRequest } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("swap.listTitle") };
}

function RequestCard({
  request,
  perspective,
  asks,
  fallbackTitle,
  locale,
}: {
  request: SwapRequest;
  perspective: "sent" | "received";
  asks: string;
  fallbackTitle: string;
  locale: Locale;
}) {
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${value}T12:00:00Z`));
  return (
    <Link
      href={`/requests/${request.id}`}
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface px-5 py-5 transition-colors hover:border-accent-700"
    >
      <div>
        <p className="font-medium text-text">
          {request.homes?.title ?? fallbackTitle}
        </p>
        <p className="text-sm text-text-secondary">
          <time dateTime={request.start_date}>{date(request.start_date)}</time>
          {" → "}
          <time dateTime={request.end_date}>{date(request.end_date)}</time>
          {perspective === "received" && request.profiles?.full_name
            ? asks
            : ""}
        </p>
      </div>
      <StatusBadge status={request.status} />
    </Link>
  );
}

export default async function RequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { t, locale } = await getTranslator();
  const c = experienceCopy(locale);

  const { data: sent, error: sentError } = await supabase
    .from("swap_requests")
    .select("*, homes(*), profiles(*)")
    .eq("requester_id", user!.id)
    .order("created_at", { ascending: false });

  const { data: received, error: receivedError } = await supabase
    .from("swap_requests")
    .select("*, homes!inner(*), profiles(*)")
    .eq("homes.owner_id", user!.id)
    .order("created_at", { ascending: false });

  if (sentError || receivedError) throw new Error("Could not load exchanges");
  const prioritize = (items: SwapRequest[]) =>
    [...items].sort(
      (a, b) => Number(b.status === "pending") - Number(a.status === "pending"),
    );
  const pending = received?.filter((r) => r.status === "pending").length ?? 0;
  return (
    <div className="flex flex-col gap-10">
      <header className="dashboard-heading">
        <div>
          <p className="eyebrow">{c.requests}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-text">
            {t("swap.listTitle")}
          </h1>
          <p className="mt-3 text-text-secondary">{c.requestIntro}</p>
        </div>
        <LinkButton href="/explore" variant="secondary">
          {c.browse}
        </LinkButton>
      </header>
      {pending > 0 && (
        <a
          href="#received-heading"
          className="rounded-xl border border-accent-100 bg-accent-50 p-4 font-semibold text-accent-800"
        >
          {pending} {c.pending} →
        </a>
      )}
      {!sent?.length && !received?.length && (
        <div className="empty-discovery">
          <p className="font-display text-2xl font-semibold">
            {c.emptyRequests}
          </p>
          <LinkButton href="/explore" className="mt-5">
            {c.browse}
          </LinkButton>
        </div>
      )}

      <section aria-labelledby="received-heading">
        <h2
          id="received-heading"
          className="mb-3 text-xl font-semibold text-text"
        >
          {t("swap.received")}
        </h2>
        {received?.length ? (
          <ul className="flex flex-col gap-2">
            {prioritize(received as unknown as SwapRequest[]).map((r) => (
              <li key={r.id}>
                <RequestCard
                  request={r}
                  fallbackTitle={t("swap.requestFallback")}
                  locale={locale}
                  perspective="received"
                  asks={t("swap.asks", {
                    name: r.profiles?.full_name ?? t("common.member"),
                  })}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-secondary">{t("swap.noneReceived")}</p>
        )}
      </section>

      <section aria-labelledby="sent-heading">
        <h2 id="sent-heading" className="mb-3 text-xl font-semibold text-text">
          {t("swap.sent")}
        </h2>
        {sent?.length ? (
          <ul className="flex flex-col gap-2">
            {prioritize(sent as unknown as SwapRequest[]).map((r) => (
              <li key={r.id}>
                <RequestCard
                  request={r}
                  fallbackTitle={t("swap.requestFallback")}
                  locale={locale}
                  perspective="sent"
                  asks=""
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-secondary">{t("swap.noneSent")}</p>
        )}
      </section>
    </div>
  );
}
