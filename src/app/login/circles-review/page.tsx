import { HomeCollectionView } from "@/components/home-collection-view";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CircleDirectory,
  type CirclePreview,
} from "@/components/circle-directory";
import {
  CircleDetailView,
  type CircleSection,
} from "@/components/circle-detail-view";
import { LogoMark } from "@/components/ui/logo-mark";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { I18nProvider } from "@/i18n/client";
import { messages } from "@/i18n/messages";
import { DEMO_CIRCLE_ID } from "@/lib/demo";

export default async function CirclesReview({
  searchParams,
}: {
  searchParams: Promise<{
    screen?: string;
    view?: string;
    empty?: string;
    family?: string;
  }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { screen, view, empty, family } = await searchParams;
  const people = [
    {
      id: "sample-anna",
      name: "Anna Martí",
      avatar: null,
      admin: true,
      host: true,
    },
    {
      id: "sample-pau",
      name: "Pau Soler",
      avatar: null,
      admin: false,
      host: true,
    },
    {
      id: "sample-clara",
      name: "Clara Vidal",
      avatar: null,
      admin: false,
      host: false,
    },
    { id: "sample-you", name: "Tú", avatar: null, admin: false, host: false },
  ];
  const circles: CirclePreview[] = [
    {
      id: "sample-friends",
      name: "Amigos de siempre",
      description:
        "Un fin de semana juntos, aunque cada uno viva en un lugar distinto.",
      role: "member",
      memberCount: 4,
      members: people.map((p) => ({
        id: p.id,
        full_name: p.name,
        avatar_url: null,
      })),
      homes: [
        {
          id: "sample-bcn",
          city: "Barcelona",
          country: "España",
          photo: "/demo/barcelona-living.jpg",
        },
        {
          id: "sample-girona",
          city: "Girona",
          country: "España",
          photo: "/demo/girona-exterior.jpg",
        },
      ],
    },
    {
      id: "sample-family",
      name: "La familia",
      description: "Nuestras casas, siempre un poco más cerca.",
      role: "admin",
      memberCount: 3,
      members: people
        .slice(0, 3)
        .map((p) => ({ id: p.id, full_name: p.name, avatar_url: null })),
      homes: [],
    },
  ];
  const homes = [
    {
      id: "sample-bcn",
      title: "Luz y calma junto al mar",
      city: "Barcelona",
      country: "España",
      photo: "/demo/barcelona-living.jpg",
      circles: [{ id: "sample-friends", name: "Amigos de siempre" }],
      ownerId: "sample-anna",
      hostName: "Anna Martí",
      nextDates: { start: "2026-11-01", end: "2026-11-08" },
    },
    {
      id: "sample-girona",
      title: "La casa del jardín",
      city: "Girona",
      country: "España",
      photo: "/demo/girona-exterior.jpg",
      circles: [{ id: "sample-friends", name: "Amigos de siempre" }],
      ownerId: "sample-pau",
      hostName: "Pau Soler",
    },
  ];
  const section: CircleSection =
    view === "homes" ||
    view === "people" ||
    view === "about" ||
    view === "my-homes"
      ? view
      : "people";
  return (
    <I18nProvider locale="es" messages={messages.es}>
      <header className="border-b border-border-subtle bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-4">
          <span className="flex items-center gap-2 font-display text-2xl font-semibold text-accent-700">
            <LogoMark className="h-7 w-7" />
            Kinami
          </span>
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
            <Link href="/login/circles-review">Tus círculos</Link>
            <Link href="/login/circles-review?screen=detail">
              Dentro del círculo
            </Link>
            <Link href="/login/circles-review?screen=homes">Mis casas</Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl px-4 py-8 pb-28 sm:px-6"
      >
        <p className="mb-6 rounded-lg bg-accent-50 px-4 py-3 text-xs text-accent-800">
          REVISIÓN LOCAL · DATOS FICTICIOS · Los controles de compartir no
          modifican datos reales.
        </p>
        {screen === "homes" ? (
          <HomeCollectionView
            locale="es"
            homes={[
              {
                id: "sample-own",
                title: "Mi piso en Barcelona",
                city: "Barcelona",
                country: "España",
                photo: "/demo/barcelona-bedroom.jpg",
                sharedCount: 2,
              },
              {
                id: "sample-other",
                title: "Mi casa de verano",
                city: "Girona",
                country: "España",
                photo: "/demo/girona-garden.jpg",
                sharedCount: 0,
              },
            ]}
          />
        ) : screen === "detail" ? (
          <CircleDetailView
            locale="es"
            section={section}
            example={false}
            basePath={
              family
                ? "/login/circles-review/family"
                : "/login/circles-review/detail"
            }
            circle={{
              id: "sample-friends",
              name: family ? "La familia" : "Amigos de siempre",
              description: circles[family ? 1 : 0].description,
              inviteCode: "EJEMPLO",
              cover: homes[0].photo,
            }}
            homes={empty || family ? [] : homes}
            people={family ? people.slice(0, 3) : people}
            ownedHomes={[
              {
                id: "sample-own",
                title: "Mi piso en Barcelona",
                city: "Barcelona",
                photo: "/demo/barcelona-bedroom.jpg",
                shared: false,
              },
              {
                id: "sample-other",
                title: "Mi casa de verano",
                city: "Girona",
                photo: "/demo/girona-garden.jpg",
                shared: false,
              },
            ]}
            sharingControl={(home) => (
              <div>
                <p className="text-sm text-text-secondary">
                  {home.shared
                    ? "Compartida en este círculo"
                    : "No compartida aquí"}
                </p>
                <button
                  type="button"
                  disabled
                  className="mt-3 min-h-11 rounded-lg border border-border-strong px-4 text-sm opacity-60"
                >
                  {home.shared ? "Retirar de este círculo" : "Compartir aquí"}
                </button>
              </div>
            )}
          />
        ) : (
          <CircleDirectory
            locale="es"
            circles={empty ? [] : circles}
            circleHref={(id) =>
              id === "sample-family"
                ? "/login/circles-review/family"
                : "/login/circles-review/detail"
            }
            exampleId={DEMO_CIRCLE_ID}
          />
        )}
      </main>
      <MobileTabBar />
    </I18nProvider>
  );
}
