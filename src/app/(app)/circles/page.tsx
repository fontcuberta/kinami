import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CreateCircleForm, JoinCircleForm } from "@/components/circle-forms";
import { ChevronRightIcon, CircleGroupIcon } from "@/components/ui/icons";
import { getTranslator } from "@/i18n/server";
import type { Circle } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("circles.title") };
}

function CircleActions({ actionsLabel }: { actionsLabel: string }) {
  return (
    <aside
      aria-labelledby="circle-actions-heading"
      className="flex flex-col gap-6 lg:sticky lg:top-8"
    >
      <h2 id="circle-actions-heading" className="sr-only">
        {actionsLabel}
      </h2>

      <div className="rounded-2xl border border-border-subtle bg-surface p-5">
        <JoinCircleForm />
      </div>

      <div className="rounded-2xl border border-accent-100 bg-accent-50 p-5">
        <CreateCircleForm />
      </div>
    </aside>
  );
}

function CircleList({
  circles,
  emptyTitle,
  emptyBody,
  inviteCodeLabel,
}: {
  circles: Circle[];
  emptyTitle: string;
  emptyBody: string;
  inviteCodeLabel: string;
}) {
  if (circles.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border-strong bg-surface px-6 py-10 sm:px-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
          <CircleGroupIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-xl font-semibold text-text">{emptyTitle}</p>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-text-secondary">{emptyBody}</p>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {circles.map((circle) => (
        <li key={circle.id}>
          <Link
            href={`/circles/${circle.id}`}
            className="group flex items-center gap-4 rounded-xl border border-border-subtle bg-surface px-4 py-4 transition-colors hover:border-accent-700 sm:px-5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-text group-hover:text-accent-700">
                {circle.name}
              </p>
              {circle.description ? (
                <p className="mt-0.5 truncate text-sm text-text-secondary">{circle.description}</p>
              ) : null}
              <p className="mt-2 font-mono text-xs tracking-wide text-text-disabled">
                <span className="sr-only">{inviteCodeLabel}: </span>
                {circle.invite_code}
              </p>
            </div>
            <ChevronRightIcon className="h-4 w-4 shrink-0 text-text-disabled transition-colors group-hover:text-accent-700" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function CirclesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { t } = await getTranslator();

  const { data: memberships } = await supabase
    .from("circle_members")
    .select("circles(*)")
    .eq("user_id", user!.id);

  const circles = (memberships ?? [])
    .map((m) => m.circles as unknown as Circle)
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            {t("circles.title")}
          </h1>
          <p className="mt-1 text-text-secondary">{t("circles.subtitle")}</p>
        </div>
        {circles.length > 0 && (
          <p className="hidden shrink-0 pb-0.5 text-sm tabular-nums text-text-disabled sm:block">
            {circles.length === 1
              ? t("circles.countOne", { count: circles.length })
              : t("circles.countMany", { count: circles.length })}
          </p>
        )}
      </header>

      <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
        <section aria-labelledby="my-circles-heading" className="lg:col-span-7">
          <h2 id="my-circles-heading" className="sr-only">
            {t("circles.mine")}
          </h2>
          <CircleList
            circles={circles}
            emptyTitle={t("circles.emptyTitle")}
            emptyBody={t("circles.emptyBody")}
            inviteCodeLabel={t("common.inviteCode")}
          />
        </section>

        <div className="lg:col-span-5">
          <CircleActions actionsLabel={t("circles.actions")} />
        </div>
      </div>
    </div>
  );
}
