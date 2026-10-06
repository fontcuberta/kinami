import Link from "next/link";
import { ArrowUpRightIcon, KeyHomeIcon, ChatIcon } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/button";
import { HomeExplorer, type ExploreHome } from "@/components/home-explorer";
import { homeOwnershipCopy } from "@/i18n/home-ownership";
import { experienceCopy } from "@/i18n/experience";
import type { Locale } from "@/i18n/config";

export function ExploreDashboard({
  locale,
  homes,
  own,
  pending,
}: {
  locale: Locale;
  homes: ExploreHome[];
  own: { id: string; title: string }[];
  pending: number;
}) {
  const c = experienceCopy(locale);
  const hc = homeOwnershipCopy(locale);
  return (
    <div className="space-y-8">
      <header className="dashboard-heading">
        <div>
          <p className="eyebrow">{c.eyebrow}</p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
            {c.welcome}
          </h1>
          <p className="mt-4 max-w-xl leading-relaxed text-text-secondary">
            {c.intro}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <LinkButton href="#explore">
            {c.browse}
            <ArrowUpRightIcon className="h-4 w-4" />
          </LinkButton>
          <LinkButton href="/circles" variant="secondary">
            {c.circles}
          </LinkButton>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/requests"
          className={`action-card ${pending ? "border-accent-700 bg-accent-50" : "bg-surface"}`}
        >
          <span className="action-icon">
            <ChatIcon className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold">
              {pending ? `${pending} ${c.pending}` : c.requests}
            </p>
            <p className="mt-1 hidden text-sm leading-relaxed text-text-secondary sm:block">
              {c.requestsBody}
            </p>
            <span className="mt-3 inline-block text-sm font-semibold text-accent-700">
              {c.viewRequests} →
            </span>
          </div>
        </Link>
        <div className="action-card bg-surface">
          <span className="action-icon">
            <KeyHomeIcon className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold">
              {own.length ? c.manageHome : c.addHome}
            </p>
            <p className="mt-1 hidden text-sm leading-relaxed text-text-secondary sm:block">
              {own.length ? c.manageHomeBody : c.addHomeBody}
            </p>
            {own.length ? (
              own.map((h) => (
                <Link
                  key={h.id}
                  href={`/homes/${h.id}#availability-heading`}
                  className="mt-3 block text-sm font-semibold text-accent-700"
                >
                  {h.title} · {c.dates} →
                </Link>
              ))
            ) : (
              <Link
                href="/homes/new"
                className="mt-3 inline-block text-sm font-semibold text-accent-700"
              >
                {hc.create} →
              </Link>
            )}
          </div>
        </div>
      </div>

      <section
        id="explore"
        className="scroll-mt-28"
        aria-labelledby="explore-heading"
      >
        <p className="eyebrow">{c.homes}</p>
        <h2
          id="explore-heading"
          className="mt-2 font-display text-3xl font-semibold"
        >
          {c.explore}
        </h2>
        <p className="mb-6 mt-2 text-text-secondary">{c.exploreBody}</p>
        {homes.length ? (
          <HomeExplorer homes={homes} />
        ) : (
          <div className="empty-discovery">
            <KeyHomeIcon className="h-10 w-10 text-accent-700" />
            <h3 className="mt-4 font-display text-2xl font-semibold">
              {c.noHomes}
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-text-secondary">
              {c.noHomesBody}
            </p>
            <LinkButton href="/circles?action=join" className="mt-6">
              {c.start}
            </LinkButton>
          </div>
        )}
      </section>
    </div>
  );
}
