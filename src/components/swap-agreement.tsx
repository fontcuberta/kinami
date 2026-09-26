"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveHouseRules, signSwapContract } from "@/lib/actions";
import { TextArea, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { ShieldIcon, CheckCircleIcon, ClockIcon } from "@/components/ui/icons";
import { SignaturePad, type SignaturePadHandle } from "@/components/signature-pad";
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

function SignatureBlock({
  label,
  name,
  when,
  imageUrl,
}: {
  label: string;
  name: string | null | undefined;
  when: string | null;
  imageUrl: string | null;
}) {
  const { t, locale } = useI18n();
  const formatted =
    when &&
    new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(when)
    );

  return (
    <div className="rounded-xl border border-border-subtle bg-neutral-50 p-4 dark:bg-neutral-100/40">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-text-secondary">{label}</p>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={t("contract.signatureOf", { name: name ?? label })}
          className="mt-3 h-20 w-full object-contain object-left"
        />
      ) : null}
      <p className="mt-2 font-semibold text-text">{name}</p>
      {formatted ? <p className="text-xs text-text-secondary">{formatted}</p> : null}
    </div>
  );
}

function SignForm({
  swapRequestId,
  role,
  contractText,
}: {
  swapRequestId: string;
  role: "owner" | "requester";
  contractText: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const padRef = useRef<SignaturePadHandle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;

    startTransition(async () => {
      try {
        const blob = await padRef.current?.toBlob();
        if (!blob) {
          setError(t("contract.needDraw"));
          return;
        }
        const fd = new FormData(form);
        fd.set("signature_image", blob, "signature.png");
        await signSwapContract(fd);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("actions.generic"));
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
      <input type="hidden" name="swap_request_id" value={swapRequestId} />
      <input type="hidden" name="role" value={role} />
      <input type="hidden" name="contract_text" value={contractText} />
      <Input
        label={t("contract.nameLabel")}
        id="signature-name"
        name="signature_name"
        required
        autoComplete="name"
        hint={t("contract.typeName")}
      />
      <SignaturePad padRef={padRef} />
      <label className="flex items-start gap-2 text-sm text-text">
        <input type="checkbox" name="agree" value="on" required className="mt-1" />
        <span>{t("contract.agree")}</span>
      </label>
      {error ? (
        <p role="alert" className="text-sm text-danger-700">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? t("contract.signing") : t("contract.sign")}
      </Button>
    </form>
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
  ownerSignatureUrl,
  requesterSignatureUrl,
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
  ownerSignatureUrl?: string | null;
  requesterSignatureUrl?: string | null;
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
    <section aria-labelledby="agreement-heading" className="flex flex-col gap-4 print:gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <h2 id="agreement-heading" className="text-xl font-semibold text-text">
          {t("contract.title")}
        </h2>
        {bothSigned ? (
          <Button type="button" variant="secondary" className="min-h-10" onClick={() => window.print()}>
            {t("contract.print")}
          </Button>
        ) : null}
      </div>

      <div className="flex gap-3 rounded-xl border border-border-subtle bg-surface p-4 print:hidden">
        <ShieldIcon className="h-5 w-5 flex-none text-neutral-700" />
        <p className="text-sm text-text-secondary">{t("contract.intro")}</p>
      </div>

      {!bothSigned ? (
        <div className="rounded-xl border border-border-subtle bg-surface p-5 print:hidden">
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
      ) : null}

      <div
        className={`rounded-xl border border-border-subtle bg-surface p-5 ${
          bothSigned ? "print:border-0 print:p-0 print:shadow-none" : ""
        }`}
      >
        <h3 className="font-semibold text-text">
          {bothSigned ? t("contract.signedTitle") : t("contract.title")}
        </h3>
        <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-neutral-100 p-4 font-sans text-sm leading-relaxed text-text print:max-h-none print:overflow-visible print:bg-transparent print:p-0">
          {contractText}
        </pre>

        {bothSigned ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <SignatureBlock
              label={t("contract.host")}
              name={agreement?.owner_signed_name}
              when={ownerConfirmed}
              imageUrl={ownerSignatureUrl ?? null}
            />
            <SignatureBlock
              label={t("contract.guest")}
              name={agreement?.requester_signed_name}
              when={requesterConfirmed}
              imageUrl={requesterSignatureUrl ?? null}
            />
          </div>
        ) : null}
      </div>

      {!bothSigned ? (
        <div className="rounded-xl border border-border-subtle bg-surface p-5 print:hidden">
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

          {!myConfirmation && (isOwner || isRequester) ? (
            <SignForm
              swapRequestId={swapRequestId}
              role={isOwner ? "owner" : "requester"}
              contractText={contractText}
            />
          ) : null}
        </div>
      ) : (
        <p className="text-sm font-medium text-success-800 print:hidden">{t("contract.bothSigned")}</p>
      )}
    </section>
  );
}
