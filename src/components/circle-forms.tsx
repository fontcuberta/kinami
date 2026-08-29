"use client";

import { useActionState } from "react";
import { createCircle, joinCircle } from "@/lib/actions";
import { Input, TextArea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

export function CreateCircleForm() {
  const [state, formAction] = useActionState(createCircle, null);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-surface p-5">
      <h2 className="font-display text-lg font-semibold text-text">Crear una rueda nueva</h2>

      <Input
        label="Nombre de la rueda"
        id="new-circle-name"
        name="name"
        required
        placeholder="Ej. Los de la promo 2010"
      />
      <TextArea
        label="Descripción"
        id="new-circle-description"
        name="description"
        rows={2}
        hint="Opcional. Ayuda a la gente a reconocer la rueda."
      />

      <div aria-live="polite">
        {state?.error && (
          <p role="alert" className="text-sm font-medium text-danger-700">
            {state.error}
          </p>
        )}
      </div>

      <SubmitButton pendingLabel="Creando…">Crear rueda</SubmitButton>
    </form>
  );
}

export function JoinCircleForm() {
  const [state, formAction] = useActionState(joinCircle, null);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-surface p-5">
      <h2 className="font-display text-lg font-semibold text-text">Unirme con un código</h2>

      <Input
        label="Código de invitación"
        id="join-circle-code"
        name="code"
        required
        placeholder="Ej. 4F2A91C"
        className="uppercase"
        autoComplete="off"
        hint="Pídeselo a quien te invitó a su rueda."
        error={state?.error ?? undefined}
      />

      <SubmitButton variant="secondary" pendingLabel="Uniéndote…" className="mt-auto">
        Unirme a la rueda
      </SubmitButton>
    </form>
  );
}
