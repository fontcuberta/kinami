import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { HeroIllustration } from "@/components/hero-illustration";
import { CircleGroupIcon, KeyHomeIcon, ChatIcon, ShieldIcon } from "@/components/ui/icons";
import { experienceCopy } from "@/i18n/experience";
import { getTranslator } from "@/i18n/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { t, locale } = await getTranslator();
  const c = experienceCopy(locale);

  if (user) {
    redirect("/circles");
  }

  const steps = [
    { icon: CircleGroupIcon, title: t("landing.step1Title"), body: t("landing.step1Body") },
    { icon: KeyHomeIcon, title: t("landing.step2Title"), body: t("landing.step2Body") },
    { icon: ChatIcon, title: t("landing.step3Title"), body: t("landing.step3Body") },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border-subtle">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2 text-accent-700">
            <LogoMark className="h-7 w-7" />
            <span className="font-display text-xl font-semibold">Kinami</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <LinkButton href="/login" variant="secondary" className="min-h-9 px-4 py-1.5 text-sm">
              {t("landing.login")}
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

          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:py-20">
            <div>
              <span className="inline-flex items-center rounded-full border border-accent-100 bg-accent-50 px-3 py-1 text-sm font-medium text-accent-800">
                {t("landing.badge")}
              </span>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.12] tracking-tight text-text sm:text-5xl lg:text-6xl">
                {t("landing.title")}{" "}
                <span className="text-accent-700">{t("landing.titleAccent")}</span>
              </h1>
              <p className="mt-5 max-w-md text-lg text-text-secondary">{t("landing.body")}</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <LinkButton href="/login" className="px-6 py-3 text-base">
                  {t("landing.cta")}
                </LinkButton>
                <Link
                  href="#how-it-works"
                  className="text-sm font-medium text-text-secondary underline decoration-border-strong underline-offset-4 hover:text-accent-700"
                >
                  {c.how}
                </Link>
              </div>
              <p className="mt-4 max-w-sm text-xs leading-relaxed text-text-secondary">{c.invitation}</p>
            </div>
            <div className="landing-preview">
              <div className="mb-5 flex items-center justify-between"><p className="text-sm font-semibold">{c.preview}</p><ShieldIcon className="h-5 w-5 text-accent-700" /></div>
              <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/demo/barcelona-living.jpg" alt="" className="aspect-[4/3] w-full object-cover" />
                <div className="flex items-center justify-between p-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-accent-700">Barcelona, España</p><p className="mt-1 font-display text-2xl font-semibold">{c.sample}</p></div><KeyHomeIcon className="h-6 w-6 text-accent-700" /></div>
              </div>
              <div className="mt-4 flex items-center gap-4 rounded-2xl border border-border-subtle bg-surface p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/demo/girona-exterior.jpg" alt="" className="h-20 w-24 rounded-xl object-cover" />
                <div className="flex-1"><p className="text-xs font-semibold uppercase tracking-wider text-accent-700">Girona, España</p><p className="mt-1 font-display text-lg font-semibold">{c.sample}</p></div><HeroIllustration className="h-16 w-16" />
              </div>
              <p className="mt-4 text-center text-xs text-text-secondary">{c.previewNote}</p>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="how-it-works" className="scroll-mt-8 border-y border-border-subtle bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-display text-2xl font-semibold text-text sm:text-3xl">
              {c.learn}
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.title} className="flex flex-col gap-3 rounded-2xl border border-border-subtle p-6">
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
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface p-8 shadow-sm sm:flex-row sm:items-start sm:gap-6">
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
              <ShieldIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-text">{t("landing.privacyTitle")}</h2>
              <p className="mt-2 max-w-2xl text-text-secondary">{t("landing.privacyBody")}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-text">
            <LogoMark className="h-4 w-4 text-accent-700" />
            <span className="font-display font-semibold">Kinami</span>
          </div>
          <p>{t("landing.footer")}</p>
        </div>
      </footer>
    </div>
  );
}
