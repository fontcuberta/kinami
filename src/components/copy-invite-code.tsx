"use client";

import { useState } from "react";
import { CheckCircleIcon, CopyIcon } from "@/components/ui/icons";
import { circleCopy } from "@/i18n/circles-experience";
import { useI18n } from "@/i18n/client";

export function CopyInviteCode({ code }: { code: string }) {
  const { t, locale } = useI18n();
  const c = circleCopy(locale);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    setError(false);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(true);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={copyCode}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-fill px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
      >
        {copied ? (
          <CheckCircleIcon className="h-4 w-4" />
        ) : (
          <CopyIcon className="h-4 w-4" />
        )}
        <span aria-live="polite">
          {copied ? t("circles.copied") : t("circles.copyCode")}
        </span>
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger-700">
          {c.inviteCopyError}
        </p>
      )}
    </div>
  );
}
