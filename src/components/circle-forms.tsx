"use client";

import { useActionState } from "react";
import { createCircle, joinCircle } from "@/lib/actions";
import { Input, TextArea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useI18n } from "@/i18n/client";

export function CreateCircleForm() {
  const { t } = useI18n();
  const [state, formAction] = useActionState(createCircle, null);

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
      <div>
        <h2 className="font-display text-lg font-semibold text-text">{t("circles.createTitle")}</h2>
        <p className="mt-0.5 text-sm text-text-secondary">{t("circles.createBody")}</p>
      </div>

      <Input
        label={t("circles.name")}
        id="new-circle-name"
        name="name"
        required
        placeholder={t("circles.namePlaceholder")}
      />
      <TextArea
        label={t("circles.description")}
        id="new-circle-description"
        name="description"
        rows={2}
        hint={t("common.optional")}
      />

      <div aria-live="polite">
        {state?.error && (
          <p role="alert" className="text-sm font-medium text-danger-700">
            {state.error}
          </p>
        )}
      </div>

      <SubmitButton className="w-full" pendingLabel={t("circles.creating")}>
        {t("circles.create")}
      </SubmitButton>
    </form>
  );
}

export function JoinCircleForm() {
  const { t } = useI18n();
  const [state, formAction] = useActionState(joinCircle, null);

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
      <div>
        <h2 className="font-display text-lg font-semibold text-text">{t("circles.joinTitle")}</h2>
        <p className="mt-0.5 text-sm text-text-secondary">{t("circles.joinBody")}</p>
      </div>

      <Input
        label={t("circles.code")}
        id="join-circle-code"
        name="code"
        required
        placeholder="4F2A91C"
        className="font-mono uppercase tracking-widest"
        autoComplete="off"
        error={state?.error ?? undefined}
      />

      <SubmitButton variant="secondary" pendingLabel={t("circles.joining")} className="w-full">
        {t("circles.join")}
      </SubmitButton>
    </form>
  );
}
