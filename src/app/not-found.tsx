import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { whatsappSupportUrl } from "@/lib/support";
import { getTranslator } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getTranslator();

  return (
    <div className="relative min-h-screen">
      <div className="absolute right-6 top-6 z-10 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <main
        id="main-content"
        className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center"
      >
        <h1 className="font-display text-2xl font-semibold text-text">{t("notFound.title")}</h1>
        <p className="mt-2 text-text-secondary">{t("notFound.body")}</p>
        <LinkButton href="/circles" className="mt-6">
          {t("notFound.back")}
        </LinkButton>
        <p className="mt-4 text-sm text-text-secondary">
          <Link href="/" className="underline-offset-2 hover:underline">
            {t("notFound.home")}
          </Link>
          {" · "}
          <a
            href={whatsappSupportUrl(t("notFound.whatsappBody"))}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline"
          >
            {t("notFound.whatsapp")}
          </a>
        </p>
      </main>
    </div>
  );
}
