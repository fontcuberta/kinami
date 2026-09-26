import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { resetOnboarding } from "@/lib/actions";
import { DeleteAccountForm } from "@/components/delete-account-form";
import { ProfileSettingsForm } from "@/components/profile-settings-form";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { whatsappSupportUrl } from "@/lib/support";
import { getTranslator } from "@/i18n/server";
import type { Profile } from "@/lib/types";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .maybeSingle<Profile>();

  const resolvedProfile: Profile = profile ?? {
    id: user!.id,
    full_name: null,
    avatar_url: null,
    phone: null,
    onboarding_completed_at: null,
    created_at: new Date().toISOString(),
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-12">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-700">
          {t("account.profile")}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-text sm:text-4xl">
          {t("account.title")}
        </h1>
        <p className="mt-2 text-text-secondary">{t("account.subtitle")}</p>
      </header>

      <section
        aria-labelledby="profile-heading"
        className="rounded-[1.75rem] border border-border-subtle bg-surface p-6 shadow-[0_14px_40px_rgba(27,33,48,0.06)] sm:p-8"
      >
        <div className="mb-6">
          <h2 id="profile-heading" className="font-display text-2xl font-semibold text-text">
            {t("account.profile")}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">{t("account.profileBody")}</p>
        </div>
        <ProfileSettingsForm profile={resolvedProfile} email={user?.email ?? ""} />
      </section>

      <section
        aria-labelledby="tour-heading"
        className="rounded-[1.75rem] border border-border-subtle bg-surface p-6"
      >
        <h2 id="tour-heading" className="font-display text-xl font-semibold text-text">
          {t("account.tourTitle")}
        </h2>
        <p className="mt-2 text-sm text-text-secondary">{t("account.tourBody")}</p>
        <form action={resetOnboarding} className="mt-4">
          <SubmitButton variant="secondary" pendingLabel={t("account.tourStarting")}>
            {t("account.tourReplay")}
          </SubmitButton>
        </form>
      </section>

      <section aria-labelledby="privacy-heading" className="flex flex-col gap-2">
        <h2 id="privacy-heading" className="text-xl font-semibold text-text">
          {t("account.privacy")}
        </h2>
        <p className="max-w-2xl text-text-secondary">{t("account.privacyBody")}</p>
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
