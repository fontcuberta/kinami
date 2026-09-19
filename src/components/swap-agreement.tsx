"use client";

import { saveHouseRules, signSwapContract } from "@/lib/actions";
import { TextArea, Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { ShieldIcon, CheckCircleIcon, ClockIcon } from "@/components/ui/icons";
import { useI18n } from "@/i18n/client";
import type { SwapAgreement } from "@/lib/types";

function ConfirmationRow({
  label,
  confirmedAt,
  signedName,
}: {
  label: string;
  confirmedAt: string | null;
  signedName?: string | null;
}) {
  const { t, locale } = useI18n();
  const when =
    confirmedAt &&
    new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(confirmedAt)
    );

  return (
    <li className="flex items-start gap-2 text-sm">
      {confirmedAt ? (
        <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-none text-success-700" />
      ) : (
        <ClockIcon className="mt-0.5 h-4 w-4 flex-none text-text-secondary" />
      )}
      <span className={confirmedAt ? "text-text" : "text-text-secondary"}>
        {confirmedAt && signedName && when
          ? `${label} · ${t("contract.signedBy", { name: signedName, when })}`
          : `${label} · ${confirmedAt ? t("contract.signed") : t("contract.pending")}`}
      </span>
    </li>
  );
}

export function SwapAgreementSection({
  swapRequestId,
  isOwner,
  isRequester,
  agreement,
  homeTitle,
  startDate,
  endDate,
  hostName,
  guestName,
}: {
  swapRequestId: string;
  isOwner: boolean;
  isRequester: boolean;
  agreement: SwapAgreement | null;
  homeTitle: string;
  startDate: string;
  endDate: string;
  hostName: string;
  guestName: string;
}) {
  const { t } = useI18n();
  const ownerConfirmed = agreement?.owner_accepted_at ?? null;
  const requesterConfirmed = agreement?.requester_accepted_at ?? null;
  const myConfirmation = isOwner ? ownerConfirmed : requesterConfirmed;
  const bothSigned = Boolean(ownerConfirmed && requesterConfirmed);

  const contractText =
    agreement?.contract_text ||
    t("contract.body", {
      home: homeTitle,
      start: startDate,
      end: endDate,
      host: hostName,
      guest: guestName,
      rules: agreement?.house_rules || t("contract.defaultRules"),
    });

  return (
    <section aria-labelledby="agreement-heading" className="flex flex-col gap-4">
      <h2 id="agreement-heading" className="text-xl font-semibold text-text">
        {t("contract.title")}
      </h2>

      <div className="flex gap-3 rounded-xl border border-border-subtle bg-surface p-4">
        <ShieldIcon className="h-5 w-5 flex-none text-neutral-700" />
        <p className="text-sm text-text-secondary">{t("contract.intro")}</p>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-5">
        <h3 className="font-semibold text-text">{t("contract.houseRules")}</h3>
        {isOwner ? (
          <form action={saveHouseRules} className="mt-3 flex flex-col gap-3">
            <input type="hidden" name="swap_request_id" value={swapRequestId} />
            <TextArea
              label={t("contract.houseRulesHint")}
              id="house-rules"
              name="house_rules"
              rows={4}
              hint={t("contract.houseRulesPlaceholder")}
              defaultValue={agreement?.house_rules ?? ""}
            />
            <SubmitButton variant="secondary" pendingLabel={t("common.saving")} className="w-fit">
              {t("contract.saveRules")}
            </SubmitButton>
          </form>
        ) : (
          <p className="mt-2 whitespace-pre-wrap text-text-secondary">
            {agreement?.house_rules || t("contract.noRules")}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-5">
        <h3 className="font-semibold text-text">{t("contract.title")}</h3>
        <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-neutral-100 p-4 font-sans text-sm leading-relaxed text-text">
          {contractText}
        </pre>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-5">
        <ul className="flex flex-col gap-2">
          <ConfirmationRow
            label={t("contract.host")}
            confirmedAt={ownerConfirmed}
            signedName={agreement?.owner_signed_name}
          />
          <ConfirmationRow
            label={t("contract.guest")}
            confirmedAt={requesterConfirmed}
            signedName={agreement?.requester_signed_name}
          />
        </ul>

        {bothSigned && (
          <p className="mt-4 text-sm font-medium text-success-800">{t("contract.bothSigned")}</p>
        )}

        {!myConfirmation && (isOwner || isRequester) && (
          <form action={signSwapContract} className="mt-4 flex flex-col gap-3">
            <input type="hidden" name="swap_request_id" value={swapRequestId} />
            <input type="hidden" name="role" value={isOwner ? "owner" : "requester"} />
            <input type="hidden" name="contract_text" value={contractText} />
            <Input
              label={t("contract.nameLabel")}
              id="signature-name"
              name="signature_name"
              required
              autoComplete="name"
              hint={t("contract.typeName")}
            />
            <label className="flex items-start gap-2 text-sm text-text">
              <input type="checkbox" name="agree" value="on" required className="mt-1" />
              <span>{t("contract.agree")}</span>
            </label>
            <SubmitButton pendingLabel={t("contract.signing")}>{t("contract.sign")}</SubmitButton>
          </form>
        )}
      </div>
    </section>
  );
}
