"use client";

import { useActionState } from "react";
import { requestMagicLink } from "@/lib/actions";
import { whatsappSupportUrl } from "@/lib/support";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useI18n } from "@/i18n/client";

export function LoginForm() {
  const { t } = useI18n();
  const [state, formAction] = useActionState(requestMagicLink, null);
  const email = state?.email ?? "";

  return (
    <>
      <div role="status" aria-live="polite">
        {state && "sent" in state && (
          <div className="rounded-lg border border-accent-100 bg-accent-50 p-4 text-accent-800">
            {t("login.sent", { email: state.email })}
          </div>
        )}
      </div>

      {(!state || !("sent" in state)) && (
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <Input
            label={t("login.email")}
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@email.com"
            defaultValue={email}
            error={state && "error" in state ? state.error : undefined}
          />
          <SubmitButton pendingLabel={t("login.sending")}>{t("login.sendLink")}</SubmitButton>

          {state && "error" in state && (
            <p className="text-sm text-text-secondary">
              {t("login.help")}{" "}
              <a
                href={whatsappSupportUrl(t("login.whatsappBody", { email: email || "email" }))}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent-700 underline-offset-2 hover:underline"
              >
                {t("login.whatsapp")}
              </a>
            </p>
          )}
        </form>
      )}
    </>
  );
}
