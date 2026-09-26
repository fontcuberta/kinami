"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { completeOnboarding } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";

const STEP_KEYS = ["welcome", "example", "homes", "swap", "done"] as const;

export function OnboardingTour({ enabled }: { enabled: boolean }) {
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);
  const open = enabled && !dismissed;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const key = STEP_KEYS[step];
  const isLast = step === STEP_KEYS.length - 1;

  function finish() {
    setError(null);
    startTransition(async () => {
      try {
        await completeOnboarding();
        setDismissed(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("actions.generic"));
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(8,18,38,0.55)] p-4 sm:items-center"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        tabIndex={-1}
        className="w-full max-w-md rounded-[1.75rem] border border-border-subtle bg-surface p-6 shadow-[0_24px_70px_rgba(8,18,38,0.35)] outline-none sm:p-8"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-700">
          {t("tour.eyebrow", { current: step + 1, total: STEP_KEYS.length })}
        </p>
        <h2 id="onboarding-title" className="mt-2 font-display text-2xl font-semibold text-text">
          {t(`tour.steps.${key}.title`)}
        </h2>
        <p className="mt-3 leading-relaxed text-text-secondary">
          {t(`tour.steps.${key}.body`)}
        </p>

        <div className="mt-6 flex gap-1.5" aria-hidden="true">
          {STEP_KEYS.map((_, index) => (
            <span
              key={STEP_KEYS[index]}
              className={`h-1.5 flex-1 rounded-full ${
                index <= step ? "bg-accent-700" : "bg-neutral-200"
              }`}
            />
          ))}
        </div>

        {error ? (
          <p role="alert" className="mt-4 text-sm text-danger-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            className="min-h-11"
            disabled={pending}
            onClick={finish}
          >
            {t("tour.skip")}
          </Button>
          <div className="flex gap-2">
            {step > 0 ? (
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={() => setStep((s) => s - 1)}
              >
                {t("tour.back")}
              </Button>
            ) : null}
            {isLast ? (
              <Button type="button" disabled={pending} onClick={finish}>
                {pending ? t("tour.saving") : t("tour.done")}
              </Button>
            ) : (
              <Button type="button" disabled={pending} onClick={() => setStep((s) => s + 1)}>
                {t("tour.next")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
