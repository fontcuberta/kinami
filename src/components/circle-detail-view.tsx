import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { homeOwnershipCopy } from "@/i18n/home-ownership";
import { HomeSharingControl } from "@/components/home-sharing-control";
import { circleCopy } from "@/i18n/circles-experience";
import {
  CircleGroupIcon,
  KeyHomeIcon,
  PlusIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { CopyInviteCode } from "@/components/copy-invite-code";
import { HomeExplorer, type ExploreHome } from "@/components/home-explorer";

export type CircleSection = "homes" | "people" | "about" | "my-homes";
export type CirclePerson = {
  id: string;
  name: string | null;
  avatar: string | null;
  admin: boolean;
  host: boolean;
};
export function CircleDetailView({
  circle,
  homes,
  people,
  locale,
  section,
  example,
  leaveControl,
  basePath,
  ownedHomes = [],
  sharingControl,
}: {
  circle: {
    id: string;
    name: string;
    description: string | null;
    inviteCode: string;
    cover?: string;
  };
  homes: ExploreHome[];
  people: CirclePerson[];
  locale: Locale;
  section: CircleSection;
  example: boolean;
  leaveControl?: ReactNode;
  basePath?: string;
  sharingControl?: (home: { id: string; shared: boolean }) => ReactNode;
  ownedHomes?: {
    id: string;
    title: string;
    city: string;
    photo?: string;
    shared: boolean;
  }[];
}) {
  const c = circleCopy(locale);
  const hc = homeOwnershipCopy(locale);
  const path = basePath ?? `/circles/${circle.id}`;
  const sections = [
    { id: "people", label: c.people, count: people.length },
    { id: "homes", label: c.homes, count: homes.length },
    ...(!example ? [{ id: "my-homes", label: hc.newTab }] : []),
    { id: "about", label: c.info },
  ];
  return (
    <div>
      <Link
        href="/circles"
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent-700"
      >
        ← {c.back}
      </Link>
      <header className="circle-detail-heading">
        <div className="min-w-0 flex-1 py-2">
          <p className="eyebrow flex items-center gap-2">
            <ShieldIcon className="h-4 w-4" />
            {c.private}
          </p>
          <h1 className="mt-4 break-words font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {circle.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">
            {circle.description || c.noneDescription}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-accent-700" />
              {people.length} {people.length === 1 ? c.personOne : c.personMany}
            </span>
            <span className="inline-flex items-center gap-2">
              <KeyHomeIcon className="h-5 w-5 text-accent-700" />
              {homes.length} {homes.length === 1 ? c.homeOne : c.homeMany}
            </span>
          </div>
          {!example && (
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton href={`${path}?view=about#invite`}>
                {c.invite}
              </LinkButton>
              <LinkButton href={`${path}?view=my-homes`} variant="secondary">
                <PlusIcon className="h-4 w-4" />
                {hc.circleAction}
              </LinkButton>
            </div>
          )}
        </div>
        <div className="circle-detail-cover" aria-hidden="true">
          {circle.cover /* eslint-disable-next-line @next/next/no-img-element */ ? (
            <img
              src={circle.cover}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <CircleGroupIcon className="h-24 w-24 text-accent-700" />
          )}
        </div>
      </header>
      {example && (
        <p className="mt-5 rounded-xl border border-accent-100 bg-accent-50 p-4 text-sm leading-relaxed text-accent-800">
          {c.sampleNote}
        </p>
      )}
      <nav className="circle-sections" aria-label={c.title}>
        {sections.map((item) => (
          <Link
            key={item.id}
            href={item.id === "people" ? path : `${path}?view=${item.id}`}
            aria-current={section === item.id ? "page" : undefined}
            className={section === item.id ? "is-current" : ""}
          >
            {item.label}
            {item.count !== undefined && <span>{item.count}</span>}
          </Link>
        ))}
      </nav>

      {section === "homes" && (
        <section aria-labelledby="circle-homes-heading" className="pt-8">
          <h2
            id="circle-homes-heading"
            className="font-display text-3xl font-semibold"
          >
            {c.homes}
          </h2>
          <p className="mb-6 mt-2 text-text-secondary">{c.homesIntro}</p>
          {homes.length ? (
            <HomeExplorer homes={homes} />
          ) : (
            <div className="circle-empty">
              <KeyHomeIcon className="h-12 w-12 text-accent-700" />
              <h3 className="mt-4 font-display text-2xl font-semibold">
                {c.noHomes}
              </h3>
              <p className="mt-3 max-w-md text-text-secondary">
                {c.noHomesBody}
              </p>
              {!example && (
                <LinkButton href={`${path}?view=my-homes`} className="mt-6">
                  {hc.circleAction}
                </LinkButton>
              )}
            </div>
          )}
        </section>
      )}

      {section === "my-homes" && !example && (
        <section aria-labelledby="circle-owned-heading" className="pt-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <h2
                id="circle-owned-heading"
                className="font-display text-3xl font-semibold"
              >
                {hc.circleManage}
              </h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-text-secondary">
                {hc.circleManageBody}
              </p>
            </div>
            <LinkButton href="/homes/new" variant="secondary">
              {hc.create}
            </LinkButton>
          </div>
          {ownedHomes.length ? (
            <ul className="grid gap-5 lg:grid-cols-2">
              {ownedHomes.map((home) => (
                <li
                  key={home.id}
                  className="rounded-2xl border border-border-subtle bg-surface p-6"
                >
                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent-50">
                      {home.photo /* eslint-disable-next-line @next/next/no-img-element */ ? (
                        <img
                          src={home.photo}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <KeyHomeIcon className="h-8 w-8 text-accent-700" />
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/homes/${home.id}`}
                        className="font-display text-xl font-semibold hover:underline"
                      >
                        {home.title}
                      </Link>
                      <p className="mt-1 text-sm text-text-secondary">
                        {home.city}
                      </p>
                    </div>
                  </div>
                  {sharingControl ? (
                    sharingControl(home)
                  ) : (
                    <HomeSharingControl
                      homeId={home.id}
                      circleId={circle.id}
                      shared={home.shared}
                    />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="circle-empty">
              <KeyHomeIcon className="h-12 w-12 text-accent-700" />
              <h3 className="mt-4 font-display text-2xl font-semibold">
                {hc.empty}
              </h3>
              <p className="mt-3 max-w-lg text-text-secondary">{hc.choose}</p>
              <LinkButton href="/homes/new" className="mt-6">
                {hc.create}
              </LinkButton>
            </div>
          )}
        </section>
      )}

      {section === "people" && (
        <section aria-labelledby="circle-people-heading" className="pt-8">
          <h2
            id="circle-people-heading"
            className="font-display text-3xl font-semibold"
          >
            {c.people}
          </h2>
          <p className="mb-6 mt-2 text-text-secondary">{c.peopleIntro}</p>
          {people.length ? (
            <ul className="grid items-start gap-6 lg:grid-cols-2">
              {people.map((person) => {
                const sharedHomes = homes.filter(
                  (home) => home.ownerId === person.id,
                );
                return (
                  <li
                    key={person.id}
                    className="overflow-hidden rounded-2xl border border-border-subtle bg-surface"
                  >
                    <div className="flex items-center gap-4 p-6">
                      <UserAvatar
                        userId={person.id}
                        fullName={person.name}
                        avatarUrl={person.avatar}
                        size="lg"
                      />
                      <div className="min-w-0">
                        <h3 className="break-words text-xl font-semibold">
                          {person.name || c.member}
                        </h3>
                        <p className="mt-1 text-sm text-text-secondary">
                          {person.admin ? c.admin : c.member} ·{" "}
                          {sharedHomes.length}{" "}
                          {sharedHomes.length === 1 ? c.homeOne : c.homeMany}
                        </p>
                      </div>
                    </div>
                    {sharedHomes.length ? (
                      <ul className="space-y-3 border-t border-border-subtle p-4 sm:p-6">
                        {sharedHomes.map((home) => (
                          <li key={home.id}>
                            <Link
                              href={`/homes/${home.id}`}
                              className="group flex min-h-24 items-center gap-4 rounded-xl border border-border-subtle p-3 transition-colors hover:bg-accent-50"
                            >
                              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent-50 sm:w-28">
                                {home.photo ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={home.photo}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <KeyHomeIcon className="h-8 w-8 text-accent-700" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="break-words font-semibold group-hover:text-accent-700">
                                  {home.title}
                                </h4>
                                <p className="mt-1 text-sm text-text-secondary">
                                  {home.city}
                                  {home.country ? `, ${home.country}` : ""}
                                </p>
                              </div>
                              <span
                                aria-hidden="true"
                                className="text-accent-700"
                              >
                                →
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="border-t border-border-subtle px-6 py-5 text-sm leading-relaxed text-text-secondary">
                        {c.noSharedHomes}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-text-secondary">{c.peopleEmpty}</p>
          )}
        </section>
      )}

      {section === "about" && (
        <section
          aria-labelledby="circle-about-heading"
          className="space-y-6 pt-8"
        >
          <div>
            <h2
              id="circle-about-heading"
              className="font-display text-3xl font-semibold"
            >
              {c.info}
            </h2>
            <p className="mt-2 text-text-secondary">{c.infoIntro}</p>
          </div>
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border-subtle bg-surface p-6 sm:p-8">
              <ShieldIcon className="h-7 w-7 text-accent-700" />
              <h3 className="mt-4 font-display text-2xl font-semibold">
                {c.about}
              </h3>
              <p className="mt-3 leading-relaxed text-text-secondary">
                {c.privacyBody}
              </p>
            </div>
            {!example && (
              <div
                id="invite"
                className="scroll-mt-28 rounded-2xl border border-accent-100 bg-accent-50 p-6 sm:p-8"
              >
                <h3 className="font-display text-2xl font-semibold">
                  {c.invite}
                </h3>
                <p className="mt-3 text-text-secondary">{c.inviteBody}</p>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-accent-700">
                  {c.code}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <code className="select-all break-all rounded-lg border border-border-strong bg-surface px-4 py-3 font-mono text-xl font-semibold tracking-widest">
                    {circle.inviteCode}
                  </code>
                  <CopyInviteCode code={circle.inviteCode} />
                </div>
                <p className="mt-4 text-xs leading-relaxed text-text-secondary">
                  {c.inviteHelp}
                </p>
              </div>
            )}
          </div>
          {leaveControl && (
            <details className="circle-disclosure">
              <summary>{c.leaveArea}</summary>
              <div className="border-t border-border-subtle p-6">
                {leaveControl}
              </div>
            </details>
          )}
        </section>
      )}
    </div>
  );
}
