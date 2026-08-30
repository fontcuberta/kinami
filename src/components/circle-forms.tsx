"use client";

import { useActionState } from "react";
import { createCircle, joinCircle } from "@/lib/actions";
import { CircleGroupIcon, TicketIcon } from "@/components/ui/icons";
import { Input, TextArea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

function FormHeader({
  icon: Icon,
  title,
  description,
  accent,
}: {
  icon: typeof CircleGroupIcon;
  title: string;
  description: string;
  accent?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          accent ? "bg-accent-100 text-accent-700" : "bg-neutral-100 text-text-secondary"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 pt-0.5">
        <h2 className="font-display text-xl font-semibold text-text sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">{description}</p>
      </div>
    </div>
  );
}

export function CreateCircleForm() {
  const [state, formAction] = useActionState(createCircle, null);

  return (
    <form
      action={formAction}
      className="flex h-full flex-col gap-6 rounded-2xl border border-accent-100 bg-accent-50 p-6 shadow-sm sm:p-8"
    >
      <FormHeader
        icon={CircleGroupIcon}
        title="Crear una rueda"
        description="Empieza un círculo privado para tu familia, amigos o vecinos."
        accent
      />

      <div className="flex flex-col gap-4">
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
      </div>

      <div aria-live="polite">
        {state?.error && (
          <p role="alert" className="text-sm font-medium text-danger-700">
            {state.error}
          </p>
        )}
      </div>

      <SubmitButton className="w-full sm:w-auto" pendingLabel="Creando…">
        Crear rueda
      </SubmitButton>
    </form>
  );
}

export function JoinCircleForm() {
  const [state, formAction] = useActionState(joinCircle, null);

  return (
    <form
      action={formAction}
      className="flex h-full flex-col gap-6 rounded-2xl border border-border-subtle bg-surface p-6 sm:p-8"
    >
      <FormHeader
        icon={TicketIcon}
        title="Unirme con código"
        description="¿Te han invitado? Pega el código que te pasaron."
      />

      <Input
        label="Código de invitación"
        id="join-circle-code"
        name="code"
        required
        placeholder="Ej. 4F2A91C"
        className="font-mono uppercase tracking-widest"
        autoComplete="off"
        hint="Pídeselo a quien te invitó a su rueda."
        error={state?.error ?? undefined}
      />

      <SubmitButton
        variant="secondary"
        pendingLabel="Uniéndote…"
        className="mt-auto w-full"
      >
        Unirme a la rueda
      </SubmitButton>
    </form>
  );
}
