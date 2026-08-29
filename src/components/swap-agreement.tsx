import { saveHouseRules, confirmAgreement } from "@/lib/actions";
import { TextArea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { ShieldIcon, CheckCircleIcon, ClockIcon } from "@/components/ui/icons";
import type { SwapAgreement } from "@/lib/types";

function ConfirmationRow({
  label,
  confirmedAt,
}: {
  label: string;
  confirmedAt: string | null;
}) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {confirmedAt ? (
        <CheckCircleIcon className="h-4 w-4 flex-none text-success-700" />
      ) : (
        <ClockIcon className="h-4 w-4 flex-none text-text-secondary" />
      )}
      <span className={confirmedAt ? "text-text" : "text-text-secondary"}>
        {label} {confirmedAt ? "· confirmado" : "· pendiente"}
      </span>
    </li>
  );
}

/**
 * Acuerdo de intercambio entre las dos partes: normas de la casa que pone
 * quien la ofrece, y una confirmación de cada lado antes de quedarse
 * tranquilos. No es un contrato legal — el aviso se muestra siempre.
 */
export function SwapAgreementSection({
  swapRequestId,
  isOwner,
  isRequester,
  agreement,
}: {
  swapRequestId: string;
  isOwner: boolean;
  isRequester: boolean;
  agreement: SwapAgreement | null;
}) {
  const ownerConfirmed = agreement?.owner_accepted_at ?? null;
  const requesterConfirmed = agreement?.requester_accepted_at ?? null;
  const myConfirmation = isOwner ? ownerConfirmed : requesterConfirmed;

  return (
    <section aria-labelledby="agreement-heading" className="flex flex-col gap-4">
      <h2 id="agreement-heading" className="text-xl font-semibold text-text">
        Acuerdo de intercambio
      </h2>

      <div className="flex gap-3 rounded-xl border border-border-subtle bg-surface p-4">
        <ShieldIcon className="h-5 w-5 flex-none text-neutral-700" />
        <p className="text-sm text-text-secondary">
          Esto es un acuerdo informal entre vosotros dos, no un contrato
          legal. Os recomendamos comprobar si vuestro seguro de hogar cubre
          intercambios de casa, y hacer fotos del estado de la casa al
          llegar y al salir.
        </p>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-5">
        <h3 className="font-semibold text-text">Normas de la casa</h3>
        {isOwner ? (
          <form action={saveHouseRules} className="mt-3 flex flex-col gap-3">
            <input type="hidden" name="swap_request_id" value={swapRequestId} />
            <TextArea
              label="Cuéntale a quien viene lo que necesita saber"
              id="house-rules"
              name="house_rules"
              rows={4}
              hint="Ej. no fumar dentro, dónde dejar las llaves, cómo funciona la calefacción..."
              defaultValue={agreement?.house_rules ?? ""}
            />
            <SubmitButton variant="secondary" pendingLabel="Guardando…" className="w-fit">
              Guardar normas
            </SubmitButton>
          </form>
        ) : (
          <p className="mt-2 whitespace-pre-wrap text-text-secondary">
            {agreement?.house_rules || "El anfitrión todavía no ha añadido normas para esta casa."}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-5">
        <h3 className="font-semibold text-text">Confirmación</h3>
        <ul className="mt-3 flex flex-col gap-2">
          <ConfirmationRow label="Anfitrión" confirmedAt={ownerConfirmed} />
          <ConfirmationRow label="Quien viene" confirmedAt={requesterConfirmed} />
        </ul>

        {!myConfirmation && (isOwner || isRequester) && (
          <form action={confirmAgreement} className="mt-4">
            <input type="hidden" name="swap_request_id" value={swapRequestId} />
            <input type="hidden" name="role" value={isOwner ? "owner" : "requester"} />
            <SubmitButton pendingLabel="Confirmando…">
              {isOwner
                ? "Confirmo que he explicado las normas y el estado de la casa"
                : "Confirmo que he leído las normas y avisaré si algo se rompe"}
            </SubmitButton>
          </form>
        )}
      </div>
    </section>
  );
}
