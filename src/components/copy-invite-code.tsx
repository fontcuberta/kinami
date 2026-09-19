"use client";

import { useState } from "react";
import { CheckCircleIcon, CopyIcon } from "@/components/ui/icons";
import { useI18n } from "@/i18n/client";

export function CopyInviteCode({ code }: { code: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copyCode}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1e4483] shadow-sm transition-transform hover:-translate-y-0.5"
    >
      {copied ? (
        <CheckCircleIcon className="h-4 w-4" />
      ) : (
        <CopyIcon className="h-4 w-4" />
      )}
      <span aria-live="polite">{copied ? t("circles.copied") : t("circles.copyCode")}</span>
    </button>
  );
}
