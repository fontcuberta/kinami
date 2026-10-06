import Link from "next/link";
import { homeOwnershipCopy } from "@/i18n/home-ownership";
import { HomeSharingControl } from "@/components/home-sharing-control";
import { experienceCopy } from "@/i18n/experience";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addAvailability, deleteAvailability } from "@/lib/actions";
import { listedAmenities, parseHomeAmenities } from "@/lib/home-amenities";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button, LinkButton } from "@/components/ui/button";
import { AmenityIcon } from "@/components/ui/amenity-icon";
import { SwapRequestForm } from "@/components/swap-request-form";
import { getTranslator } from "@/i18n/server";
import { photosForHome, isDemoCircle } from "@/lib/demo";
import type { Availability, Circle, Home } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { t } = await getTranslator();
  const { data: home } = await supabase
    .from("homes")
    .select("title")
    .eq("id", id)
    .maybeSingle<{ title: string }>();

  return { title: home?.title ?? t("home.fallbackTitle") };
}

export default async function HomeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { t, locale } = await getTranslator();
  const c = experienceCopy(locale);
  const hc = homeOwnershipCopy(locale);
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${value}T12:00:00Z`));

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: home } = await supabase
    .from("homes")
    .select("*, profiles(*)")
    .eq("id", id)
    .maybeSingle<Home>();

  if (!home) notFound();

  const isOwner = home.owner_id === user.id;
  const amenities = listedAmenities(parseHomeAmenities(home.amenities));
  const amenityNotes = amenities.filter((item) => item.notes);
  const photos = photosForHome(home.id, home.photos);
  const [hero, ...restPhotos] = photos;
  const ownerName = home.profiles?.full_name ?? t("common.member");

  const { data: availability } = await supabase
    .from("availability")
    .select("*")
    .eq("home_id", id)
    .order("start_date", { ascending: true });

  const { data: homeCircles, error: homeCirclesError } = await supabase
    .from("home_circles")
    .select("circle_id, circles(*)")
    .eq("home_id", id);

  if (homeCirclesError) throw new Error("Could not load home sharing");
  const sharedCircles = (homeCircles ?? [])
    .map((h) => h.circles as unknown as Circle)
    .filter(Boolean);

  const { data: memberships, error: membershipError } = isOwner
    ? await supabase
        .from("circle_members")
        .select("circles(*)")
        .eq("user_id", user.id)
    : { data: [], error: null };
  if (membershipError) throw new Error("Could not load circle membership");
  const myCircles = (memberships ?? [])
    .map((m) => m.circles as unknown as Circle)
    .filter(
      (circle): circle is Circle => Boolean(circle) && !isDemoCircle(circle.id),
    );
  const sharedIds = new Set((homeCircles ?? []).map((row) => row.circle_id));
  return (
    <div className="flex flex-col gap-8">
      <Link
        href={isOwner ? "/homes" : "/circles"}
        className="w-fit py-2 text-sm font-medium text-accent-700"
      >
        ← {isOwner ? hc.back : c.back}
      </Link>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-700">
            {home.city}, {home.country}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-text">
            {home.title}
          </h1>
          <p className="mt-1 text-text-secondary">
            {t("home.by", { name: ownerName })}
          </p>
        </div>
        {isOwner && (
          <LinkButton
            href={`/homes/${home.id}/edit`}
            variant="secondary"
            className="shrink-0"
          >
            {t("home.edit")}
          </LinkButton>
        )}
      </header>

      {isOwner && (
        <nav
          aria-label={hc.info}
          className="flex flex-wrap gap-5 border-b border-border-subtle text-sm font-semibold"
        >
          <a href="#home-overview" className="min-h-11 py-3 text-accent-700">
            {hc.info}
          </a>
          <a
            href="#availability-heading"
            className="min-h-11 py-3 text-accent-700"
          >
            {hc.available}
          </a>
          <a href="#sharing" className="min-h-11 py-3 text-accent-700">
            {hc.sharing}
          </a>
        </nav>
      )}
      {hero && (
        <section aria-label={t("home.photos")} className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero}
            alt={t("home.hero", { title: home.title, city: home.city })}
            className="h-64 w-full rounded-2xl border border-border-subtle object-cover sm:h-[28rem]"
          />
          {restPhotos.length > 0 && (
            <ul className="grid grid-cols-3 gap-2">
              {restPhotos.map((url, i) => (
                <li key={url}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={t("home.photoN", {
                      n: i + 2,
                      title: home.title,
                      city: home.city,
                    })}
                    className="h-24 w-full rounded-lg border border-border-subtle object-cover sm:h-32"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div
        id="home-overview"
        className="grid scroll-mt-28 items-start gap-10 lg:grid-cols-12"
      >
        <div className="flex flex-col gap-10 lg:col-span-7">
          {home.description && (
            <section aria-labelledby="about-heading">
              <h2
                id="about-heading"
                className="font-display text-xl font-semibold text-text"
              >
                {t("home.about")}
              </h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-text">
                {home.description}
              </p>
            </section>
          )}

          <section aria-labelledby="amenities-heading">
            <h2
              id="amenities-heading"
              className="font-display text-xl font-semibold text-text"
            >
              {t("home.amenities")}
            </h2>
            {amenities.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {amenities.map((item) => (
                  <li
                    key={item.key}
                    className="group inline-flex items-center gap-2 rounded-full border border-accent-100 bg-accent-50 py-1.5 pl-1.5 pr-3.5 text-sm font-semibold text-accent-800 shadow-[0_5px_16px_rgba(41,85,166,0.08)] transition-transform hover:-translate-y-0.5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-accent-700 shadow-sm">
                      <AmenityIcon
                        amenity={item.key}
                        className="h-[18px] w-[18px]"
                      />
                    </span>
                    {t(`amenities.${item.key}.label`)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-text-secondary">
                {isOwner
                  ? t("home.noAmenitiesOwner")
                  : t("home.noAmenitiesGuest")}
              </p>
            )}
          </section>

          {(home.house_manual || amenityNotes.length > 0) && (
            <section aria-labelledby="manual-heading">
              <h2
                id="manual-heading"
                className="font-display text-xl font-semibold text-text"
              >
                {t("home.howItWorks")}
              </h2>
              {home.house_manual && (
                <p className="mt-3 whitespace-pre-line leading-relaxed text-text">
                  {home.house_manual}
                </p>
              )}
              {amenityNotes.length > 0 && (
                <dl className="mt-5 divide-y divide-border-subtle rounded-2xl border border-border-subtle bg-surface">
                  {amenityNotes.map((item) => (
                    <div key={item.key} className="px-4 py-3 sm:px-5">
                      <dt className="flex items-center gap-2 text-sm font-semibold text-text">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
                          <AmenityIcon
                            amenity={item.key}
                            className="h-[18px] w-[18px]"
                          />
                        </span>
                        {t(`amenities.${item.key}.label`)}
                      </dt>
                      <dd className="mt-1 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                        {item.notes}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:col-span-5">
          <section
            aria-labelledby="availability-heading"
            className="rounded-2xl border border-border-subtle bg-surface p-5"
          >
            <h2
              id="availability-heading"
              className="font-display text-xl font-semibold text-text"
            >
              {t("home.availability")}
            </h2>

            {(availability as Availability[] | null)?.length ? (
              <ul className="mt-4 flex flex-col gap-2">
                {(availability as Availability[]).map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle px-3 py-2.5"
                  >
                    <span className="text-sm text-text">
                      <time dateTime={a.start_date}>{date(a.start_date)}</time>
                      {" → "}
                      <time dateTime={a.end_date}>{date(a.end_date)}</time>
                      {a.notes && (
                        <span className="mt-0.5 block text-text-secondary">
                          {a.notes}
                        </span>
                      )}
                    </span>
                    {isOwner && (
                      <form action={deleteAvailability}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="home_id" value={home.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          className="min-h-0 px-2 py-1 text-sm"
                          aria-label={t("home.removeAvailability", {
                            start: a.start_date,
                            end: a.end_date,
                          })}
                        >
                          {t("common.remove")}
                        </Button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-text-secondary">
                {t("home.noAvailability")}
              </p>
            )}

            {isOwner && (
              <form
                action={addAvailability}
                className="mt-4 flex flex-col gap-3"
              >
                <input type="hidden" name="home_id" value={home.id} />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={t("common.from")}
                    id="avail-start"
                    name="start_date"
                    type="date"
                    required
                  />
                  <Input
                    label={t("common.to")}
                    id="avail-end"
                    name="end_date"
                    type="date"
                    required
                  />
                </div>
                <Input
                  label={t("common.note")}
                  id="avail-notes"
                  name="notes"
                  placeholder={t("common.optional")}
                />
                <SubmitButton
                  variant="secondary"
                  pendingLabel={t("home.adding")}
                >
                  {t("home.addDates")}
                </SubmitButton>
              </form>
            )}
          </section>

          {!isOwner && sharedCircles.length > 0 && (
            <section
              aria-labelledby="swap-heading"
              className="rounded-2xl border border-accent-100 bg-accent-50 p-5"
            >
              <h2
                id="swap-heading"
                className="font-display text-xl font-semibold text-text"
              >
                {t("home.requestSwap")}
              </h2>
              <div className="mt-4">
                <SwapRequestForm homeId={home.id} circles={sharedCircles} />
              </div>
            </section>
          )}
        </aside>
      </div>
      {isOwner && (
        <section
          id="sharing"
          aria-labelledby="home-sharing-heading"
          className="scroll-mt-28 border-t border-border-subtle pt-8"
        >
          <h2
            id="home-sharing-heading"
            className="font-display text-3xl font-semibold"
          >
            {hc.sharing}
          </h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-text-secondary">
            {hc.sharingBody}
          </p>
          {!sharedIds.size && (
            <p className="mt-4 rounded-xl bg-accent-50 p-4 text-sm text-accent-800">
              {hc.privateNote}
            </p>
          )}
          {myCircles.length ? (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {myCircles.map((circle) => (
                <li
                  key={circle.id}
                  className="rounded-2xl border border-border-subtle bg-surface p-6"
                >
                  <Link
                    href={`/circles/${circle.id}`}
                    className="mb-4 block font-display text-xl font-semibold hover:underline"
                  >
                    {circle.name}
                  </Link>
                  <HomeSharingControl
                    homeId={home.id}
                    circleId={circle.id}
                    shared={sharedIds.has(circle.id)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-text-secondary">{hc.noCircles}</p>
          )}
          {(homeCircles ?? [])
            .filter((row) => !myCircles.some((c) => c.id === row.circle_id))
            .map((row) => (
              <div
                key={row.circle_id}
                className="mt-4 rounded-2xl border border-border-subtle bg-surface p-6"
              >
                <h3 className="mb-4 font-semibold">
                  {isDemoCircle(row.circle_id)
                    ? t("circles.exampleLabel")
                    : hc.formerCircle}
                </h3>
                <HomeSharingControl
                  homeId={home.id}
                  circleId={row.circle_id}
                  shared
                  allowShare={false}
                />
              </div>
            ))}
          <Link
            href="/circles"
            className="mt-4 inline-flex min-h-11 items-center font-semibold text-accent-700"
          >
            {hc.circles} →
          </Link>
        </section>
      )}
    </div>
  );
}
