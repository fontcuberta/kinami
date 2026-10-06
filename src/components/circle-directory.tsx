import Link from "next/link";
import {
  CircleGroupIcon,
  KeyHomeIcon,
  ShieldIcon,
  UsersIcon,
  ArrowUpRightIcon,
} from "@/components/ui/icons";
import { CircleEntryActions } from "@/components/circle-entry-actions";
import { UserAvatar } from "@/components/user-avatar";
import { circleCopy } from "@/i18n/circles-experience";
import type { Locale } from "@/i18n/config";

export type CirclePreview = {
  id: string;
  name: string;
  description: string | null;
  role: string;
  homes: { id: string; city: string; country: string; photo?: string }[];
  members: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  }[];
  memberCount: number;
};

export function CircleDirectory({
  circles,
  exampleId,
  locale,
  initialAction,
  circleHref,
}: {
  circles: CirclePreview[];
  exampleId?: string;
  locale: Locale;
  initialAction?: "join" | "create";
  circleHref?: (id: string) => string;
}) {
  const c = circleCopy(locale);
  return (
    <div className="space-y-8">
      <header className="circle-directory-heading">
        <div>
          <p className="eyebrow">Kinami · {c.private}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
            {c.title}
          </h1>
          <p className="mt-3 text-lg text-text-secondary">{c.intro}</p>
        </div>
        <CircleEntryActions initialAction={initialAction} />
      </header>
      <p className="flex items-start gap-3 text-sm leading-relaxed text-text-secondary">
        <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent-700" />
        {c.explain}
      </p>
      {circles.length ? (
        <ul className="grid gap-6 lg:grid-cols-2">
          {circles.map((circle) => {
            const photos = circle.homes.filter((h) => h.photo).slice(0, 2);
            const destinations = [...new Set(circle.homes.map((h) => h.city))];
            return (
              <li key={circle.id}>
                <Link
                  href={
                    circleHref ? circleHref(circle.id) : `/circles/${circle.id}`
                  }
                  className="circle-preview group"
                >
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <div className="flex items-center justify-between gap-3">
                      <p className="eyebrow">{c.private}</p>
                      {circle.role === "admin" && (
                        <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-medium text-accent-800">
                          {c.admin}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-3 break-words font-display text-3xl font-semibold leading-tight">
                      {circle.name}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                      {circle.description || c.noneDescription}
                    </p>
                    <div
                      className={`circle-preview-cover mt-5 rounded-xl ${photos.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
                    >
                      {photos.length ? (
                        photos.map((home) => (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            key={home.id}
                            src={home.photo}
                            alt=""
                            loading="lazy"
                            className="h-full min-w-0 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ))
                      ) : (
                        <div className="flex items-center justify-center gap-5 text-accent-700">
                          <CircleGroupIcon className="h-16 w-16" />
                          <KeyHomeIcon className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
                      <span className="inline-flex items-center gap-2">
                        <UsersIcon className="h-5 w-5 text-accent-700" />
                        {circle.memberCount}{" "}
                        {circle.memberCount === 1 ? c.personOne : c.personMany}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <KeyHomeIcon className="h-5 w-5 text-accent-700" />
                        {circle.homes.length}{" "}
                        {circle.homes.length === 1 ? c.homeOne : c.homeMany}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                      {destinations.length
                        ? destinations.join(" · ")
                        : c.noHomesBody}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-border-subtle pt-5 pb-1 translate-y-2">
                      <div aria-hidden="true" className="flex -space-x-2">
                        {circle.members.slice(0, 4).map((member) => (
                          <UserAvatar
                            key={member.id}
                            userId={member.id}
                            fullName={member.full_name}
                            avatarUrl={member.avatar_url}
                            ringClassName="border-2 border-surface"
                            size="sm"
                          />
                        ))}
                      </div>
                      <span className="inline-flex min-h-11 items-center gap-2 font-semibold text-accent-700">
                        {c.enter}
                        <ArrowUpRightIcon className="h-5 w-5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <section className="circle-empty">
          <CircleGroupIcon className="h-14 w-14 text-accent-700" />
          <h2 className="mt-5 font-display text-3xl font-semibold">
            {c.emptyTitle}
          </h2>
          <p className="mt-3 max-w-lg text-lg leading-relaxed text-text-secondary">
            {c.emptyBody}
          </p>
        </section>
      )}
      {exampleId && (
        <aside className="flex flex-col justify-between gap-5 rounded-2xl border border-dashed border-border-strong p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold">{c.example}</h2>
            <p className="mt-2 max-w-2xl text-sm text-text-secondary">
              {c.exampleBody}
            </p>
          </div>
          <Link
            href={`/circles/${exampleId}`}
            data-tour="example-circle"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 font-semibold text-accent-700"
          >
            {c.exampleCta} <span aria-hidden="true">→</span>
          </Link>
        </aside>
      )}
      {circles.length > 0 && (
        <Link
          href="/explore"
          className="inline-flex min-h-11 items-center gap-3 font-semibold text-accent-700"
        >
          {c.browseAll} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}
