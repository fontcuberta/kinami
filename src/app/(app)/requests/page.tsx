import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/status-badge";
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
}: {
  request: SwapRequest;
  perspective: "sent" | "received";
  asks: string;
}) {
  return (
    <Link
      href={`/requests/${request.id}`}
      className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface px-4 py-3 transition-colors hover:border-accent-700"
    >
      <div>
        <p className="font-medium text-text">{request.homes?.title}</p>
        <p className="text-sm text-text-secondary">
          <time dateTime={request.start_date}>{request.start_date}</time>
          {" → "}
          <time dateTime={request.end_date}>{request.end_date}</time>
          {perspective === "received" && request.profiles?.full_name ? asks : ""}
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
  const { t } = await getTranslator();

  const { data: sent } = await supabase
    .from("swap_requests")
    .select("*, homes(*), profiles(*)")
    .eq("requester_id", user!.id)
    .order("created_at", { ascending: false });

  const { data: received } = await supabase
    .from("swap_requests")
    .select("*, homes!inner(*), profiles(*)")
    .eq("homes.owner_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-10">
      <h1 className="font-display text-3xl font-semibold text-text">{t("swap.listTitle")}</h1>

      <section aria-labelledby="received-heading">
        <h2 id="received-heading" className="mb-3 text-xl font-semibold text-text">
          {t("swap.received")}
        </h2>
        {received?.length ? (
          <ul className="flex flex-col gap-2">
            {(received as unknown as SwapRequest[]).map((r) => (
              <li key={r.id}>
                <RequestCard
                  request={r}
                  perspective="received"
                  asks={t("swap.asks", { name: r.profiles?.full_name ?? t("common.member") })}
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
            {(sent as unknown as SwapRequest[]).map((r) => (
              <li key={r.id}>
                <RequestCard request={r} perspective="sent" asks="" />
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
