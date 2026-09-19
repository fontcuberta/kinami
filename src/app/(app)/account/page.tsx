import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DeleteAccountForm } from "@/components/delete-account-form";
import { Button } from "@/components/ui/button";
import { whatsappSupportUrl } from "@/lib/support";
import { getTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("account.title") };
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { t } = await getTranslator();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-3xl font-semibold text-text">{t("account.title")}</h1>
        <p className="mt-1 text-text-secondary">{user?.email}</p>
      </div>

      <section aria-labelledby="privacy-heading" className="flex flex-col gap-4">
        <div>
          <h2 id="privacy-heading" className="text-xl font-semibold text-text">
            {t("account.privacy")}
          </h2>
          <p className="mt-1 max-w-2xl text-text-secondary">{t("account.privacyBody")}</p>
        </div>
      </section>

      <section aria-labelledby="help-heading" className="flex flex-col gap-2">
        <h2 id="help-heading" className="text-xl font-semibold text-text">
          {t("account.help")}
        </h2>
        <p className="max-w-2xl text-text-secondary">{t("account.helpBody")}</p>
        <a
          href={whatsappSupportUrl(t("account.whatsappBody"))}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit text-sm font-medium text-accent-700 underline-offset-2 hover:underline"
        >
          {t("account.whatsapp")}
        </a>
      </section>

      <section aria-labelledby="session-heading" className="flex flex-col gap-3">
        <h2 id="session-heading" className="text-xl font-semibold text-text">
          {t("account.session")}
        </h2>
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="secondary">
            {t("account.signOut")}
          </Button>
        </form>
      </section>

      <section aria-labelledby="danger-heading" className="flex flex-col gap-4">
        <h2 id="danger-heading" className="text-xl font-semibold text-text">
          {t("account.delete")}
        </h2>
        <DeleteAccountForm />
      </section>
    </div>
  );
}
