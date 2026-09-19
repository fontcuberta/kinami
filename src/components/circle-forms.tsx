"use client";

import { useActionState } from "react";
import { createCircle, joinCircle } from "@/lib/actions";
import { Input, TextArea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { PlusIcon, SparklesIcon, TicketIcon } from "@/components/ui/icons";
import { useI18n } from "@/i18n/client";

export function CreateCircleForm() {
  const { t } = useI18n();
  const [state, formAction] = useActionState(createCircle, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-accent-700">
          <SparklesIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-700">
            {t("circles.createEyebrow")}
          </p>
          <h2 className="mt-0.5 font-display text-xl font-semibold text-text">
            {t("circles.createTitle")}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">
            {t("circles.createBody")}
          </p>
        </div>
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

      <SubmitButton variant="secondary" className="w-full rounded-xl" pendingLabel={t("circles.creating")}>
        <PlusIcon className="h-4 w-4" />
        {t("circles.create")}
      </SubmitButton>
    </form>
  );
}

export function JoinCircleForm() {
  const { t } = useI18n();
  const [state, formAction] = useActionState(joinCircle, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
          <TicketIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-100">
            {t("circles.joinEyebrow")}
          </p>
          <h2 className="mt-0.5 font-display text-xl font-semibold text-white">
            {t("circles.joinTitle")}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-blue-100">{t("circles.joinBody")}</p>
        </div>
      </div>

      <div className="[&_label]:text-white [&_p]:text-blue-100">
        <Input
          label={t("circles.code")}
          id="join-circle-code"
          name="code"
          required
          placeholder="4F2A91C"
          className="border-white/30 bg-white/10 font-mono uppercase tracking-[0.18em] text-white placeholder:text-blue-200 focus:bg-white/15"
          autoComplete="off"
          error={state?.error ?? undefined}
        />
      </div>

      <SubmitButton
        variant="secondary"
        pendingLabel={t("circles.joining")}
        className="w-full rounded-xl border-white bg-white text-[#1e4483] hover:bg-blue-50"
      >
        {t("circles.join")}
      </SubmitButton>
    </form>
  );
}
