"use client";

import { useActionState } from "react";
import { createSwapRequest } from "@/lib/actions";
import { Input, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Circle } from "@/lib/types";

export function SwapRequestForm({
  homeId,
  circles,
}: {
  homeId: string;
  circles: Circle[];
}) {
  const [state, formAction] = useActionState(createSwapRequest, null);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-surface p-5 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <input type="hidden" name="home_id" value={homeId} />

      <Select label="Rueda" id="swap-circle" name="circle_id" className="sm:w-48">
        {circles.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <Input label="Desde" id="swap-start" name="start_date" type="date" required className="sm:w-44" />
      <Input label="Hasta" id="swap-end" name="end_date" type="date" required className="sm:w-44" />

      <div aria-live="polite" className="w-full sm:order-last">
        {state?.error && (
          <p role="alert" className="text-sm font-medium text-danger-700">
            {state.error}
          </p>
        )}
      </div>

      <SubmitButton pendingLabel="Enviando…">Solicitar intercambio</SubmitButton>
    </form>
  );
}
