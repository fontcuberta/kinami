"use client";

import type { SwapStatus } from "@/lib/types";
import { useI18n } from "@/i18n/client";

const STATUS_CONFIG: Record<
  SwapStatus,
  { key: "pending" | "accepted" | "declined" | "cancelled"; classes: string; icon: React.ReactNode }
> = {
  pending: {
    key: "pending",
    classes: "bg-neutral-100 text-neutral-700",
    icon: (
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none">
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  accepted: {
    key: "accepted",
    classes: "bg-success-50 text-success-800",
    icon: (
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none">
        <path
          d="M3.5 8.5l2.8 2.8L12.5 5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  declined: {
    key: "declined",
    classes: "bg-danger-50 text-danger-800",
    icon: (
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none">
        <path
          d="M4 4l8 8M12 4l-8 8"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  cancelled: {
    key: "cancelled",
    classes: "bg-neutral-100 text-text-secondary",
    icon: (
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none">
        <path d="M4 8h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
};

export function StatusBadge({ status }: { status: SwapStatus }) {
  const { t } = useI18n();
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${config.classes}`}
    >
      {config.icon}
      {t(`status.${config.key}`)}
    </span>
  );
}
