import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CopyInviteCode } from "@/components/copy-invite-code";
import { LinkButton } from "@/components/ui/button";
import {
  ArrowUpRightIcon,
  CircleGroupIcon,
  KeyHomeIcon,
  PlusIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { getTranslator } from "@/i18n/server";
import type { Circle, CircleMember, Home } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { t } = await getTranslator();
  const { data: circle } = await supabase
    .from("circles")
    .select("name")
    .eq("id", id)
    .maybeSingle<{ name: string }>();

  return { title: circle?.name ?? t("circles.fallbackTitle") };
}

function initials(name: string | null | undefined) {
  return (name ?? "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default async function CircleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { t } = await getTranslator();

  const { data: circle } = await supabase
    .from("circles")
    .select("*")
    .eq("id", id)
    .maybeSingle<Circle>();

  if (!circle) notFound();

  const { data: members } = await supabase
    .from("circle_members")
    .select("*, profiles(*)")
    .eq("circle_id", id);

  const { data: homeLinks } = await supabase
    .from("home_circles")
    .select("homes(*, profiles(*))")
    .eq("circle_id", id);

  const homes = (homeLinks ?? [])
    .map((h) => h.homes as unknown as Home)
    .filter(Boolean);
  const circleMembers = ((members ?? []) as unknown as CircleMember[]).sort((a, b) =>
    a.role === b.role ? 0 : a.role === "admin" ? -1 : 1
  );
  const cover = homes.find((home) => home.photos?.[0])?.photos?.[0];

  return (
    <div className="flex flex-col gap-14">
      <header className="relative overflow-hidden rounded-[2rem] bg-[#14294f] text-white shadow-[0_26px_70px_rgba(19,40,79,0.22)]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div aria-hidden="true" className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#14294f_0%,#2955a6_62%,#6d8fce_100%)]" />
            <span className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/15" />
            <span className="absolute right-16 top-14 h-36 w-36 rounded-full border border-white/15" />
            <span className="absolute right-[7.8rem] top-[7.5rem] h-3 w-3 rounded-full bg-white shadow-[0_0_0_10px_rgba(255,255,255,0.1)]" />
          </div>
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(100deg,rgba(7,18,39,0.96)_0%,rgba(7,18,39,0.82)_48%,rgba(7,18,39,0.38)_100%)]"
        />

        <div className="relative px-6 pb-7 pt-6 sm:px-10 sm:pb-9 sm:pt-8">
          <nav aria-label={t("common.breadcrumb")} className="text-sm text-white/70">
            <Link href="/circles" className="underline-offset-4 transition-colors hover:text-white hover:underline">
              {t("circles.breadcrumb")}
            </Link>
            <span className="mx-2 text-white/35">/</span>
            <span className="text-white">{circle.name}</span>
          </nav>

          <div className="mt-10 max-w-2xl sm:mt-14">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200">
              <ShieldIcon className="h-4 w-4" />
              {t("circles.detailEyebrow")}
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
              {circle.name}
            </h1>
            {circle.description ? (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                {circle.description}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-sm font-semibold backdrop-blur-md">
                <KeyHomeIcon className="h-4 w-4 text-blue-200" />
                {homes.length === 1
                  ? t("circles.homesShortOne", { count: homes.length })
                  : t("circles.homesShortMany", { count: homes.length })}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-sm font-semibold backdrop-blur-md">
                <UsersIcon className="h-4 w-4 text-blue-200" />
                {circleMembers.length === 1
                  ? t("circles.membersShortOne", { count: circleMembers.length })
                  : t("circles.membersShortMany", { count: circleMembers.length })}
              </span>
            </div>
          </div>

          <div className="mt-9 flex flex-col justify-between gap-5 rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:p-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-200">
                {t("circles.inviteTitle")}
              </p>
              <p className="mt-1 text-sm text-white/75">{t("circles.inviteBody")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <code className="rounded-xl border border-white/15 bg-black/20 px-4 py-2.5 font-mono text-base font-bold tracking-[0.18em] text-white">
                {circle.invite_code}
              </code>
              <CopyInviteCode code={circle.invite_code} />
            </div>
          </div>
        </div>
      </header>

      <section aria-labelledby="homes-heading">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-700">
              {t("circles.placesEyebrow")}
            </p>
            <h2 id="homes-heading" className="mt-1 font-display text-3xl font-semibold text-text">
              {t("circles.placesTitle")}
            </h2>
          </div>
          <LinkButton href={`/circles/${id}/homes/new`} className="w-fit rounded-full px-5">
            <PlusIcon className="h-4 w-4" />
            {t("circles.addHome")}
          </LinkButton>
        </div>

        {homes.length === 0 ? (
          <div className="relative overflow-hidden rounded-[2rem] border border-dashed border-border-strong bg-surface px-7 py-12 sm:px-10">
            <div
              aria-hidden="true"
              className="absolute -right-12 -top-12 h-48 w-48 rounded-full border-[30px] border-accent-50"
            />
            <div className="relative max-w-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-50 text-accent-700">
                <KeyHomeIcon className="h-7 w-7" />
              </div>
              <h3 className="mt-6 font-display text-2xl font-semibold text-text">
                {t("circles.emptyHomesTitle")}
              </h3>
              <p className="mt-2 leading-relaxed text-text-secondary">
                {t("circles.emptyHomesBody")}
              </p>
              <LinkButton href={`/circles/${id}/homes/new`} className="mt-6 rounded-full">
                <PlusIcon className="h-4 w-4" />
                {t("circles.addHome")}
              </LinkButton>
            </div>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2">
            {homes.map((home, index) => (
              <li key={home.id}>
                <Link
                  href={`/homes/${home.id}`}
                  className="group block h-full overflow-hidden rounded-[1.75rem] border border-border-subtle bg-surface shadow-[0_14px_40px_rgba(27,33,48,0.07)] transition duration-300 hover:-translate-y-1 hover:border-accent-100 hover:shadow-[0_22px_55px_rgba(27,33,48,0.13)]"
                >
                  <div className={`relative overflow-hidden ${index === 0 && homes.length > 2 ? "h-64" : "h-52"}`}>
                  {home.photos?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={home.photos[0]}
                      alt={t("home.photoOf", { title: home.title, city: home.city })}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#eaf1fd,#cfe0fa)] text-accent-700 dark:bg-[linear-gradient(145deg,#16223d,#1c2c4d)]">
                      <KeyHomeIcon className="h-12 w-12 opacity-70" />
                    </div>
                  )}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
                    <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#1e4483] backdrop-blur-sm">
                      {home.city}, {home.country}
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-4 p-5">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-xl font-semibold text-text">
                        {home.title}
                      </h3>
                      <p className="mt-1 truncate text-sm text-text-secondary">
                      {t("home.by", { name: home.profiles?.full_name ?? t("common.member") })}
                      </p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-700 transition-transform group-hover:rotate-45">
                      <ArrowUpRightIcon className="h-5 w-5" />
                      <span className="sr-only">{t("circles.exploreHome")}</span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="members-heading">
        <div className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-700">
            {t("circles.peopleEyebrow")}
          </p>
          <h2 id="members-heading" className="mt-1 font-display text-3xl font-semibold text-text">
            {t("circles.peopleTitle")}
          </h2>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {circleMembers.map((member) => (
            <li
              key={member.user_id}
              className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface p-3.5 shadow-[0_8px_24px_rgba(27,33,48,0.04)]"
            >
              {member.profiles?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.profiles.avatar_url}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-50 text-sm font-bold text-accent-700">
                  {initials(member.profiles?.full_name)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold text-text">
                  {member.profiles?.full_name ?? t("swap.member")}
                </p>
                {member.role === "admin" ? (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-800">
                    <CircleGroupIcon className="h-3 w-3" />
                    {t("circles.admin")}
                  </span>
                ) : (
                  <span className="mt-1 block text-xs text-text-secondary">
                    {t("circles.circleLabel")}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
