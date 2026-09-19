import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NavLinks } from "@/components/nav-links";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getTranslator } from "@/i18n/server";

export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { t } = await getTranslator();

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b border-border-subtle bg-surface/95 backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link
            href="/circles"
            className="flex min-h-11 min-w-11 shrink-0 items-center gap-2 font-display text-xl font-semibold text-accent-700 sm:text-2xl"
          >
            <LogoMark className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />
            <span>Kinami</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <nav
              aria-label={t("nav.main")}
              className="mr-1 hidden items-center gap-0.5 md:flex"
            >
              <NavLinks />
            </nav>

            <LanguageSwitcher />
            <ThemeToggle />

            {user && (
              <form action="/auth/signout" method="post" className="hidden sm:block">
                <Button type="submit" variant="ghost" className="min-h-9 px-3 text-sm">
                  {t("nav.signOut")}
                </Button>
              </form>
            )}
          </div>
        </div>
      </header>

      {user && <MobileTabBar />}
    </>
  );
}
