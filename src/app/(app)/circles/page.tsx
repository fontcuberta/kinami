import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CreateCircleForm, JoinCircleForm } from "@/components/circle-forms";
import {
  ArrowUpRightIcon,
  CircleGroupIcon,
  KeyHomeIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { getTranslator } from "@/i18n/server";
import type { Circle, Home, Profile } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("circles.title") };
}

function CircleActions({ actionsLabel }: { actionsLabel: string }) {
  return (
    <aside
      aria-labelledby="circle-actions-heading"
      className="flex flex-col gap-4 lg:sticky lg:top-28"
    >
      <h2 id="circle-actions-heading" className="sr-only">
        {actionsLabel}
      </h2>

      <div className="relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(145deg,#2955a6_0%,#173b76_55%,#10284f_100%)] p-6 shadow-[0_18px_50px_rgba(18,40,80,0.2)]">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-16 h-40 w-40 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-white/5 blur-xl"
        />
        <div className="relative">
          <JoinCircleForm />
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-border-subtle bg-surface p-6 shadow-[0_14px_40px_rgba(27,33,48,0.06)]">
        <CreateCircleForm />
      </div>
    </aside>
  );
}

type CircleSummary = Circle & {
  homes: Home[];
  members: Profile[];
};

const fallbackCardStyles = [
  "bg-[linear-gradient(145deg,#173b76_0%,#2955a6_56%,#668bd1_100%)]",
  "bg-[linear-gradient(145deg,#25314f_0%,#445f96_52%,#7593c7_100%)]",
  "bg-[linear-gradient(145deg,#153e48_0%,#286473_52%,#6a98a0_100%)]",
  "bg-[linear-gradient(145deg,#4c315c_0%,#73588a_52%,#a68ab7_100%)]",
] as const;

function initials(name: string | null | undefined) {
  return (name ?? "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function CircleList({
  circles,
  emptyTitle,
  emptyBody,
  inviteCodeLabel,
  circleLabel,
  openCircle,
  homesLabel,
  membersLabel,
}: {
  circles: CircleSummary[];
  emptyTitle: string;
  emptyBody: string;
  inviteCodeLabel: string;
  circleLabel: string;
  openCircle: string;
  homesLabel: (count: number) => string;
  membersLabel: (count: number) => string;
}) {
  if (circles.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[2rem] border border-dashed border-border-strong bg-surface px-7 py-14 sm:px-10">
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-12 h-44 w-44 rounded-full border-[28px] border-accent-50"
        />
        <div className="relative flex max-w-md flex-col items-start">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-50 text-accent-700">
            <CircleGroupIcon className="h-7 w-7" />
          </div>
          <p className="mt-6 font-display text-2xl font-semibold text-text">{emptyTitle}</p>
          <p className="mt-2 leading-relaxed text-text-secondary">{emptyBody}</p>
        </div>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {circles.map((circle, index) => {
        const cover = circle.homes.find((home) => home.photos?.[0])?.photos?.[0];
        return (
        <li key={circle.id}>
          <Link
            href={`/circles/${circle.id}`}
            className={`group relative flex min-h-[270px] overflow-hidden rounded-[1.75rem] p-5 text-white shadow-[0_16px_45px_rgba(20,35,68,0.14)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(20,35,68,0.22)] ${
              fallbackCardStyles[index % fallbackCardStyles.length]
            }`}
          >
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            ) : null}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,38,0.1)_0%,rgba(8,18,38,0.35)_38%,rgba(8,18,38,0.94)_100%)]"
            />
            {!cover ? (
              <div aria-hidden="true" className="absolute inset-0 opacity-40">
                <span className="absolute -right-10 -top-12 h-40 w-40 rounded-full border border-white/30" />
                <span className="absolute right-7 top-9 h-16 w-16 rounded-full border border-white/20" />
                <span className="absolute right-[4.5rem] top-[5.25rem] h-2 w-2 rounded-full bg-white/80" />
              </div>
            ) : null}

            <div className="relative flex w-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.13em] backdrop-blur-md">
                  <ShieldIcon className="h-3.5 w-3.5" />
                  {circleLabel}
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-transform group-hover:rotate-45 group-hover:bg-white group-hover:text-[#1e4483]">
                  <ArrowUpRightIcon className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-auto pt-12">
                <p className="font-display text-2xl font-semibold leading-tight">{circle.name}</p>
                <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-relaxed text-white/75">
                  {circle.description || emptyBody}
                </p>

                <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/20 pt-4">
                  <div className="flex flex-wrap gap-3 text-xs font-semibold text-white/85">
                    <span className="inline-flex items-center gap-1.5">
                      <KeyHomeIcon className="h-4 w-4" />
                      {homesLabel(circle.homes.length)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <UsersIcon className="h-4 w-4" />
                      {membersLabel(circle.members.length)}
                    </span>
                  </div>

                  <div className="flex -space-x-2" aria-label={membersLabel(circle.members.length)}>
                    {circle.members.slice(0, 3).map((member, memberIndex) => (
                      <span
                        key={`${member.id}-${memberIndex}`}
                        title={member.full_name ?? undefined}
                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/70 bg-[#eaf1fd] text-[10px] font-bold text-[#1e4483]"
                      >
                        {initials(member.full_name)}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="sr-only">
                  {inviteCodeLabel}: {circle.invite_code}. {openCircle}
                </span>
              </div>
            </div>
          </Link>
        </li>
        );
      })}
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

  const baseCircles = (memberships ?? [])
    .map((m) => m.circles as unknown as Circle)
    .filter(Boolean);
  const circleIds = baseCircles.map((circle) => circle.id);

  const [memberResult, homeResult] = circleIds.length
    ? await Promise.all([
        supabase
          .from("circle_members")
          .select("circle_id, profiles(*)")
          .in("circle_id", circleIds),
        supabase
          .from("home_circles")
          .select("circle_id, homes(*)")
          .in("circle_id", circleIds),
      ])
    : [{ data: [] }, { data: [] }];

  const memberRows = (memberResult.data ?? []) as unknown as Array<{
    circle_id: string;
    profiles: Profile | null;
  }>;
  const homeRows = (homeResult.data ?? []) as unknown as Array<{
    circle_id: string;
    homes: Home | null;
  }>;

  const circles: CircleSummary[] = baseCircles.map((circle) => ({
    ...circle,
    members: memberRows
      .filter((row) => row.circle_id === circle.id)
      .map((row) => row.profiles)
      .filter((profile): profile is Profile => Boolean(profile)),
    homes: homeRows
      .filter((row) => row.circle_id === circle.id)
      .map((row) => row.homes)
      .filter((home): home is Home => Boolean(home)),
  }));

  return (
    <div className="flex flex-col gap-10">
      <header className="relative overflow-hidden rounded-[2rem] bg-[#14294f] px-6 py-9 text-white shadow-[0_24px_70px_rgba(19,40,79,0.22)] sm:px-10 sm:py-12">
        <div aria-hidden="true" className="absolute inset-0">
          <span className="absolute -right-16 -top-28 h-80 w-80 rounded-full border border-white/10" />
          <span className="absolute right-12 top-10 h-44 w-44 rounded-full border border-white/10" />
          <span className="absolute right-[8.2rem] top-[7.4rem] h-3 w-3 rounded-full bg-blue-300 shadow-[0_0_0_8px_rgba(147,197,253,0.12)]" />
          <span className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-blue-400/10 blur-3xl" />
        </div>
        <div className="relative max-w-2xl">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200">
            <CircleGroupIcon className="h-4 w-4" />
            {t("circles.networkEyebrow")}
          </div>
          <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-[1.05] sm:text-5xl">
            {t("circles.heroTitle")}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-blue-100 sm:text-lg">
            {t("circles.heroBody")}
          </p>
          {circles.length > 0 ? (
            <p className="mt-6 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
            {circles.length === 1
              ? t("circles.countOne", { count: circles.length })
              : t("circles.countMany", { count: circles.length })}
            </p>
          ) : null}
        </div>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-8">
        <section aria-labelledby="my-circles-heading" className="lg:col-span-8">
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-700">
              {t("circles.circleLabel")}
            </p>
            <h2 id="my-circles-heading" className="mt-1 font-display text-3xl font-semibold text-text">
              {t("circles.mine")}
            </h2>
          </div>
          <CircleList
            circles={circles}
            emptyTitle={t("circles.emptyTitle")}
            emptyBody={t("circles.emptyBody")}
            inviteCodeLabel={t("common.inviteCode")}
            circleLabel={t("circles.circleLabel")}
            openCircle={t("circles.openCircle")}
            homesLabel={(count) =>
              count === 1
                ? t("circles.homesShortOne", { count })
                : t("circles.homesShortMany", { count })
            }
            membersLabel={(count) =>
              count === 1
                ? t("circles.membersShortOne", { count })
                : t("circles.membersShortMany", { count })
            }
          />
        </section>

        <div className="lg:col-span-4">
          <CircleActions actionsLabel={t("circles.actions")} />
        </div>
      </div>
    </div>
  );
}
