"use client";

import { useActionState } from "react";
import { requestMagicLink } from "@/lib/actions";
import { whatsappSupportUrl } from "@/lib/support";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

export function LoginForm() {
  const [state, formAction] = useActionState(requestMagicLink, null);
  const email = state?.email ?? "";

  return (
    <>
      <div role="status" aria-live="polite">
        {state && "sent" in state && (
          <div className="rounded-lg border border-accent-100 bg-accent-50 p-4 text-accent-800">
            Te enviamos un enlace de acceso a <strong>{state.email}</strong>. Ábrelo
            desde este mismo dispositivo para entrar.
          </div>
        )}
      </div>

      {(!state || !("sent" in state)) && (
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <Input
            label="Correo electrónico"
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="tu@email.com"
            defaultValue={email}
            error={state && "error" in state ? state.error : undefined}
          />
          <SubmitButton pendingLabel="Enviando…">
            Enviarme el enlace de acceso
          </SubmitButton>

          {state && "error" in state && (
            <p className="text-sm text-text-secondary">
              ¿Sigue sin funcionar?{" "}
              <a
                href={whatsappSupportUrl(
                  `Hola, no me llega el enlace de acceso a Kinami (${email || "mi correo"})`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent-700 underline-offset-2 hover:underline"
              >
                Avisa por WhatsApp
              </a>
            </p>
          )}
        </form>
      )}
    </>
  );
}
