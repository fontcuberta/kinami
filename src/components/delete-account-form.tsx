"use client";

import { useActionState, useState } from "react";
import { deleteAccount } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";

export function DeleteAccountForm() {
  const { t } = useI18n();
  const [confirming, setConfirming] = useState(false);
  const [state, formAction] = useActionState(deleteAccount, null);
  const word = t("account.deleteWord");

  if (!confirming) {
    return (
      <Button variant="danger" onClick={() => setConfirming(true)}>
        {t("account.deleteCta")}
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-danger-700 bg-surface p-5">
      <div role="alert">
        <p className="font-semibold text-text">{t("account.deleteTitle")}</p>
        <p className="mt-1 text-sm text-text-secondary">{t("account.deleteBody")}</p>
      </div>

      <Input
        label={t("account.deleteType", { word })}
        id="delete-confirmation"
        name="confirmation"
        required
        autoComplete="off"
        placeholder={word}
        error={state?.error ?? undefined}
      />

      <div className="flex flex-wrap gap-3">
        <SubmitButton variant="danger" pendingLabel={t("account.deleting")}>
          {t("account.deleteYes")}
        </SubmitButton>
        <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
