import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeroIllustration } from "@/components/hero-illustration";
import { CircleGroupIcon, KeyHomeIcon, ChatIcon, ShieldIcon } from "@/components/ui/icons";

const STEPS = [
  {
    icon: CircleGroupIcon,
    title: "Crea o únete a una rueda",
    body: "Un círculo privado de amigos y familia. Se entra solo con un código de invitación, nunca es público.",
  },
  {
    icon: KeyHomeIcon,
    title: "Comparte tu casa",
    body: "Sube fotos, cuenta cómo es y marca cuándo está disponible para que tu rueda la vea.",
  },
  {
    icon: ChatIcon,
    title: "Pide el intercambio",
    body: "Manda una solicitud, habla los detalles por el chat de la propia app y quedáis en las fechas.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/circles");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <header className="border-b border-border-subtle">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2 text-accent-700">
            <LogoMark className="h-7 w-7" />
            <span className="font-display text-xl font-semibold">Kinami</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LinkButton href="/login" variant="secondary" className="min-h-9 px-4 py-1.5 text-sm">
              Iniciar sesión
            </LinkButton>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {/* Hero, con fondo animado de manchas de color (decorativo, se
            congela con prefers-reduced-motion vía la regla global). */}
        <section className="relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div
              className="animated-blob-a absolute -left-24 -top-32 h-[28rem] w-[28rem] rounded-full opacity-60 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, var(--color-accent-100), transparent 70%)",
              }}
            />
            <div
              className="animated-blob-b absolute -right-32 top-0 h-[24rem] w-[24rem] rounded-full opacity-50 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, var(--color-accent-50), transparent 70%)",
              }}
            />
          </div>

          <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
            <div>
              <span className="inline-flex items-center rounded-full border border-accent-100 bg-accent-50 px-3 py-1 text-sm font-medium text-accent-800">
                Círculos privados, no un mercado abierto
              </span>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-text sm:text-5xl">
                Tus amigos tienen casas por todo el mundo.{" "}
                <span className="text-accent-700">Descubre dónde te puedes quedar.</span>
              </h1>
              <p className="mt-5 max-w-md text-lg text-text-secondary">
                Kinami es para intercambiar casa con la gente que ya conoces: tu
                rueda de amigos y familia, estén donde estén. Nada de perfiles
                públicos ni desconocidos.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <LinkButton href="/login" className="px-6 py-3 text-base">
                  Entrar en mi rueda
                </LinkButton>
                <Link
                  href="/login"
                  className="text-sm font-medium text-text-secondary underline decoration-border-strong underline-offset-4 hover:text-accent-700"
                >
                  ¿Ya tienes una cuenta?
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <HeroIllustration className="animate-float-slow h-72 w-72 sm:h-80 sm:w-80" />
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="border-y border-border-subtle bg-surface">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="font-display text-2xl font-semibold text-text sm:text-3xl">
              Cómo funciona
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <div key={step.title} className="flex flex-col gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-50 text-accent-700">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-text">
                    <span className="mr-2 text-accent-700">{i + 1}.</span>
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-secondary">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Confianza y privacidad */}
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface p-8 shadow-sm sm:flex-row sm:items-start sm:gap-6">
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
              <ShieldIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-text">Solo tu rueda lo ve</h2>
              <p className="mt-2 max-w-2xl text-text-secondary">
                No hay listados públicos ni buscadores externos. Cada casa se
                comparte únicamente con los círculos a los que su dueño decide
                añadirla, y solo se entra a un círculo con un código de
                invitación.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-text">
            <LogoMark className="h-4 w-4 text-accent-700" />
            <span className="font-display font-semibold">Kinami</span>
          </div>
          <p>Home swapping en círculos de confianza.</p>
        </div>
      </footer>
    </div>
  );
}
