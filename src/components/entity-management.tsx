"use client";
import { useActionState, useId, useState } from "react";
import { manageEntity } from "@/lib/lifecycle-actions";
import { lifecycleCopy } from "@/i18n/lifecycle";
import { useI18n } from "@/i18n/client";
import { Button } from "@/components/ui/button";
export function EntityManagement({
  id,
  name,
  operation,
}: {
  id: string;
  name: string;
  operation: "delete_home" | "delete_circle" | "leave_circle";
}) {
  const { locale } = useI18n();
  const c = lifecycleCopy(locale);
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(manageEntity, null);
  const inputId = useId();
  return (
    <div className="mt-4">
      {!open ? (
        <Button
          variant={operation === "leave_circle" ? "secondary" : "danger"}
          onClick={() => setOpen(true)}
        >
          {c[operation]}
        </Button>
      ) : (
        <form
          action={action}
          className="space-y-4 rounded-xl border border-border-strong bg-surface p-5"
        >
          <h3 className="text-lg font-semibold">
            {c[operation]}: {name}
          </h3>
          <p className="max-w-xl text-sm text-text-secondary">
            {c[`${operation}Body`]}
          </p>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="operation" value={operation} />
          {operation !== "leave_circle" && (
            <div>
              <label htmlFor={inputId} className="block text-sm font-medium">
                {c.label}: {name}
              </label>
              <input
                id={inputId}
                name="confirmation"
                required
                autoComplete="off"
                className="mt-2 w-full rounded-lg border border-border-strong bg-surface p-3"
              />
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="danger" disabled={pending}>
              {pending ? c.pending : c.confirm}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              {c.cancel}
            </Button>
          </div>
          {state?.error && (
            <p role="alert" className="text-sm text-danger-700">
              {state.error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
