"use client";

import { useActionState, useState } from "react";
import { deleteAccount } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";

// Borrado de cuenta en dos pasos: primero hay que pedir confirmación
// explícitamente (evita un clic accidental sobre una acción irreversible),
// y luego escribir "BORRAR" para asegurarnos de que la persona entiende lo
// que va a pasar antes de que se ejecute.
export function DeleteAccountForm() {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction] = useActionState(deleteAccount, null);

  if (!confirming) {
    return (
      <Button variant="danger" onClick={() => setConfirming(true)}>
        Borrar mi cuenta y mis datos
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-danger-700 bg-surface p-5">
      <div role="alert">
        <p className="font-semibold text-text">Esto borra todo, para siempre</p>
        <p className="mt-1 text-sm text-text-secondary">
          Se elimina tu perfil, tus casas y sus fotos, tu sitio en cada rueda a
          la que perteneces, tus solicitudes de intercambio y tus mensajes. No
          hay forma de deshacerlo ni de recuperarlo después.
        </p>
      </div>

      <Input
        label='Escribe "BORRAR" para confirmar'
        id="delete-confirmation"
        name="confirmation"
        required
        autoComplete="off"
        placeholder="BORRAR"
        error={state?.error ?? undefined}
      />

      <div className="flex flex-wrap gap-3">
        <SubmitButton variant="danger" pendingLabel="Borrando…">
          Sí, borrar mi cuenta
        </SubmitButton>
        <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
