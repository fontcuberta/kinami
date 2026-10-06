"use client";

import { useActionState } from "react";
import { setHomeCircleSharing } from "@/lib/home-sharing-actions";
import { useI18n } from "@/i18n/client";
import { homeOwnershipCopy } from "@/i18n/home-ownership";
import { SubmitButton } from "@/components/ui/submit-button";

export function HomeSharingControl({
  homeId,
  circleId,
  shared: initialShared,
  allowShare = true,
}: {
  homeId: string;
  circleId: string;
  shared: boolean;
  allowShare?: boolean;
}) {
  const { locale } = useI18n();
  const c = homeOwnershipCopy(locale);
  const [state, action] = useActionState(setHomeCircleSharing, null);
  const shared = state?.shared ?? initialShared;
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="home_id" value={homeId} />
      <input type="hidden" name="circle_id" value={circleId} />
      <input
        type="hidden"
        name="operation"
        value={shared ? "remove" : "share"}
      />
      <p
        className={`text-sm font-medium ${shared ? "text-accent-800" : "text-text-secondary"}`}
      >
        {shared ? c.shared : c.hidden}
      </p>
      {(shared || allowShare) && (
        <SubmitButton
          variant={shared ? "secondary" : "primary"}
          pendingLabel={c.saving}
          className="text-sm"
        >
          {shared ? c.remove : c.share}
        </SubmitButton>
      )}
      <div aria-live="polite">
        {state?.error ? (
          <p role="alert" className="text-sm text-danger-700">
            {state.error}
          </p>
        ) : (
          state && (
            <p role="status" className="text-sm text-text-secondary">
              {c.saved}
            </p>
          )
        )}
      </div>
    </form>
  );
}
