import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { homeOwnershipCopy } from "@/i18n/home-ownership";
import { LinkButton } from "@/components/ui/button";
import { KeyHomeIcon, PlusIcon } from "@/components/ui/icons";
export function HomeCollectionView({
  locale,
  homes,
}: {
  locale: Locale;
  homes: {
    id: string;
    title: string;
    city: string;
    country: string;
    photo?: string;
    sharedCount: number;
  }[];
}) {
  const c = homeOwnershipCopy(locale);
  return (
    <div className="space-y-8">
      <header className="circle-directory-heading">
        <div>
          <p className="eyebrow">Kinami</p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
            {c.title}
          </h1>
          <p className="mt-3 text-lg text-text-secondary">{c.intro}</p>
        </div>
        <LinkButton href="/homes/new">
          <PlusIcon className="h-4 w-4" />
          {c.create}
        </LinkButton>
      </header>
      {homes.length ? (
        <ul className="grid gap-6 lg:grid-cols-2">
          {homes.map((home) => {
            const photo = home.photo;
            const count = home.sharedCount;
            return (
              <li
                key={home.id}
                className="overflow-hidden rounded-2xl border border-border-subtle bg-surface"
              >
                <div className="h-56 bg-accent-50">
                  {photo /* eslint-disable-next-line @next/next/no-img-element */ ? (
                    <img
                      src={photo}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <KeyHomeIcon className="h-14 w-14 text-accent-700" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <p className="eyebrow">
                    {home.city}, {home.country}
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold">
                    {home.title}
                  </h2>
                  <p className="mt-3 text-sm text-text-secondary">
                    {count ? `${c.sharingCount}: ${count}` : c.unshared}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <LinkButton href={`/homes/${home.id}`}>
                      {c.manage}
                    </LinkButton>
                    <LinkButton
                      href={`/homes/${home.id}#sharing`}
                      variant="secondary"
                    >
                      {c.sharing}
                    </LinkButton>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="circle-empty">
          <KeyHomeIcon className="h-14 w-14 text-accent-700" />
          <h2 className="mt-5 font-display text-3xl font-semibold">
            {c.empty}
          </h2>
          <p className="mt-3 max-w-lg text-text-secondary">{c.emptyBody}</p>
          <Link
            href="/homes/new"
            className="mt-6 inline-flex min-h-11 items-center font-semibold text-accent-700"
          >
            {c.create} →
          </Link>
        </div>
      )}
    </div>
  );
}
