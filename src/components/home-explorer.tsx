"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/i18n/client";
import { circleCopy } from "@/i18n/circles-experience";
import { experienceCopy } from "@/i18n/experience";
import { ArrowUpRightIcon, KeyHomeIcon } from "@/components/ui/icons";

export type ExploreHome = {
  id: string;
  title: string;
  city: string;
  country: string;
  photo?: string;
  circles: { id: string; name: string }[];
  nextDates?: { start: string; end: string };
  ownerId?: string;
  hostName?: string;
  isOwn?: boolean;
};

export function HomeExplorer({ homes }: { homes: ExploreHome[] }) {
  const { locale } = useI18n();
  const c = experienceCopy(locale);
  const cc = circleCopy(locale);
  const [query, setQuery] = useState("");
  const [circle, setCircle] = useState("");
  const circles = [
    ...new Map(homes.flatMap((h) => h.circles).map((c) => [c.id, c])).values(),
  ];
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase(locale);
  const visible = homes.filter(
    (h) =>
      normalize(`${h.city} ${h.country} ${h.title}`).includes(
        normalize(query.trim()),
      ) &&
      (!circle || h.circles.some((c) => c.id === circle)),
  );
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${value}T12:00:00Z`));
  return (
    <div>
      <div className="explore-search">
        <div className="flex-1">
          <label
            htmlFor="home-search"
            className="mb-2 block text-sm font-semibold"
          >
            {c.search}
          </label>
          <input
            id="home-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={c.searchPlaceholder}
            className="w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-text"
          />
        </div>
        {circles.length > 1 && (
          <div className="sm:w-52">
            <label
              htmlFor="circle-filter"
              className="mb-2 block text-sm font-semibold"
            >
              {c.circleFilter}
            </label>
            <select
              id="circle-filter"
              value={circle}
              onChange={(e) => setCircle(e.target.value)}
              className="min-h-12 w-full rounded-xl border border-border-strong bg-surface px-3 text-text"
            >
              <option value="">{c.all}</option>
              {circles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <p role="status" className="my-5 text-sm text-text-secondary">
        {visible.length} {c.results}
      </p>
      {visible.length ? (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((home) => (
            <li key={home.id}>
              <Link href={`/homes/${home.id}`} className="home-card group">
                <div className="relative aspect-[4/3] overflow-hidden bg-accent-50">
                  {home.photo /* eslint-disable-next-line @next/next/no-img-element */ ? (
                    <img
                      src={home.photo}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-accent-700">
                      <KeyHomeIcon className="h-14 w-14" />
                    </div>
                  )}
                  <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-text">
                    {home.circles.map((c) => c.name).join(" · ")}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent-700">
                    {home.city}, {home.country}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-text">
                    {home.title}
                  </h3>
                  {(home.hostName || home.isOwn) && (
                    <p className="mt-2 text-sm text-text-secondary">
                      {home.isOwn
                        ? cc.yourHome
                        : `${cc.host}: ${home.hostName}`}
                    </p>
                  )}
                  <div className="mt-5 flex items-end justify-between gap-2 border-t border-border-subtle pt-4">
                    <p className="text-xs leading-relaxed text-text-secondary">
                      {home.nextDates ? (
                        <>
                          <span className="block">{c.available}</span>
                          <span className="font-semibold text-text">
                            {date(home.nextDates.start)} –{" "}
                            {date(home.nextDates.end)}
                          </span>
                        </>
                      ) : (
                        c.noDates
                      )}
                    </p>
                    <ArrowUpRightIcon className="h-5 w-5 shrink-0 text-accent-700" />
                    <span className="sr-only">{c.details}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-border-strong px-6 py-12 text-center">
          <p className="text-text-secondary">{c.noResults}</p>
          <button
            onClick={() => {
              setQuery("");
              setCircle("");
            }}
            className="mt-3 min-h-11 font-semibold text-accent-700 underline underline-offset-4"
          >
            {c.reset}
          </button>
        </div>
      )}
    </div>
  );
}
